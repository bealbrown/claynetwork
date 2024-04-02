import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ForceGraph2D, ForceGraph3D } from 'react-force-graph';
import axios from 'axios';
import SpriteText from 'three-spritetext';
import citizenshipColorMap from './citizenshipColorMap';
import Fuse from 'fuse.js'; // Import Fuse.js


const Graph3DVisualization = () => {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [nodeSize, setNodeSize] = useState(3); // Default node size
    const [showNames, setShowNames] = useState(true); // Toggle between names and dots
    const [selectedNode, setSelectedNode] = useState(null); // For the data popup
    const [iframeUrl, setIframeUrl] = useState(''); // For the Wikipedia iframe
    const [showIframe, setShowIframe] = useState(false); // Toggle iframe display
    const graphContainerRef = useRef(null);
    const [highlightNodes, setHighlightNodes] = useState(new Set());
    const [highlightLinks, setHighlightLinks] = useState(new Set());

    const [hoverNode, setHoverNode] = useState(null);
    const [searchInput, setSearchInput] = useState(''); // For the search input
    const [filteredNodes, setFilteredNodes] = useState([]); // For the search autofill results
    const searchInputRef = useRef(null);
    const dropdownRef = useRef(null);

    const linkColor = link => highlightLinks.has(link) ? 'rgba(255, 255, 255, 2)' : 'rgba(255, 255, 255, 0.2)';

    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                const response = await axios.get('http://192.168.2.54:5000/api/network');
                const { nodes, edges } = response.data;

                const formattedNodes = nodes.map(node => ({
                    id: node.wikibase_item,
                    name: node.canonical_title,
                    wikipedia_url: node.wikipedia_url,
                    sex_or_gender: node.sex_or_gender,
                    citizenship: node.citizenship,
                    birthdate: node.birthdate,
                    birthplace: node.birthplace,
                    deathdate: node.deathdate
                    // Add other node properties you wish to visualize
                }));

                const formattedEdges = edges.map(edge => ({
                    source: edge.source,
                    target: edge.target,
                    article_context: edge.article_context,
                    // Add other edge properties you wish to visualize
                }));

                const nodeMap = formattedNodes.reduce((map, node) => {
                    map[node.id] = node;
                    return map;
                }, {});

                formattedEdges.forEach(link => {
                    const a = nodeMap[link.source];
                    const b = nodeMap[link.target];

                    if (!a || !b) {
                        // If either node is not found by ID, skip this link
                        console.warn('Skipping link with unknown node(s):', link);
                        return;
                    }

                    if (!a.neighbors) a.neighbors = [];
                    if (!b.neighbors) b.neighbors = [];
                    a.neighbors.push(b);
                    b.neighbors.push(a);

                    if (!a.links) a.links = [];
                    if (!b.links) b.links = [];
                    a.links.push(link);
                    b.links.push(link);
                });


                setGraphData({
                    nodes: formattedNodes,
                    links: formattedEdges,
                });


            } catch (error) {
                console.error("Failed to fetch graph data: ", error);
            }
        };

        fetchGraphData();
    }, []);



    const nodeColor = node => {
        // Check if there are highlighted nodes and the current node is not one of them
        if (highlightNodes.size > 0 && !highlightNodes.has(node)) {
            return 'rgba(255, 255, 255, 0.1)'; // Dimmed color for non-highlighted nodes
        } else if (highlightNodes.has(node)) {
            return 'rgba(255, 255, 255, 1)'; // Highlight color
        }

        // Use the citizenship value of the node to get the corresponding color
        const color = citizenshipColorMap[node.citizenship] || 'rgba(255, 255, 255, 0.1)'; // Fallback color
        return color;
    };

    const updateHighlight = () => {
        setHighlightNodes(highlightNodes);
        setHighlightLinks(highlightLinks);
    };

    const highlightAllNodes = () => {

        highlightNodes.clear();
        highlightLinks.clear();
        // Add all nodes and links back to their respective highlight sets if you want them all visible
        graphData.nodes.forEach(node => highlightNodes.add(node));
        graphData.links.forEach(link => highlightLinks.add(link));
        updateHighlight()
    };

    const unhighlightAllNodes = () => {

        console.log(graphData)

        highlightNodes.clear();
        highlightLinks.clear();

        console.log("unhighlightAllNodes")

        // // Add all nodes and links back to their respective highlight sets if you want them all visible
        // graphData.nodes.forEach(node => highlightNodes.add(node));
        // graphData.links.forEach(link => highlightLinks.add(link));
        updateHighlight()
    };

    const highlightOnlySelectedNodeGroup = (node) => {
        highlightNodes.clear();
        highlightLinks.clear();
        highlightNodes.add(node);
        node.neighbors.forEach(neighbor => highlightNodes.add(neighbor));
        node.links.forEach(link => highlightLinks.add(link));

        updateHighlight();
    }



    const nodeCanvasObject = (node, ctx, globalScale) => {
        const label = node.name;
        const fontSize = 12 / globalScale;
        // Ensure full opacity by default
        const alpha = 1;
        ctx.globalAlpha = alpha; // Apply full opacity
        ctx.font = `${fontSize}px Sans-Serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 1)'; // Node fill color
        ctx.fillText(label, node.x, node.y);
    };

    useEffect(() => {
        let startX = 0; // Track start X position of mouse down
        let startY = 0; // Track start Y position of mouse down
        const threshold = 10; // Minimum distance to consider action as a drag/swipe

        const handleMouseDown = (event) => {
            startX = event.pageX;
            startY = event.pageY;
        };

        const handleClickOutside = (event) => {
            const endX = event.pageX;
            const endY = event.pageY;

            // Calculate the distance between start and end positions
            const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));

            // If the distance is less than the threshold, consider it a click, not a drag/swipe

            try {

                if (distance < threshold) {

                    if (showIframe && !event.target.closest('.iframe-container') && !searchInputRef.current.contains(event.target)) {
                        setShowIframe(false);
                        setSelectedNode(null); // Deselect

                        console.log("click outside");
                        // Additional check to see if the click is outside the nodes/graph

                        // Resetting view to default if click is outside the graph nodes
                        setShowIframe(false);
                        // Clearing highlights
                        // highlightAllNodes()
                        unhighlightAllNodes()
                    }

                }

            } catch (e) {
                console.log(e)
            }
        };

        // Add event listeners for both mousedown and click
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('click', handleClickOutside);

        // Cleanup
        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showIframe]); // Dependency on showIframe only


    // useEffect(() => {
    //     const handleClickOutside = event => {
    //         if (showIframe && !event.target.closest('.iframe-container') && !searchInputRef.current.contains(event.target) && !dropdownRef.current.contains(event.target)) {
    //             setShowIframe(false);
    //         }
    //     };

    //     window.addEventListener('click', handleClickOutside);
    //     return () => {
    //         window.removeEventListener('click', handleClickOutside);
    //     };
    // }, [showIframe]);

    const handleNodeClick = node => {
        // Check if the node is in the highlightNodes set
        console.log("highlightNodes is", highlightNodes)
        if (!highlightNodes.has(node) && highlightNodes.size > 0) {
            // If the node is not highlighted and there are highlighted nodes, exit the function
            console.log("Unclickable node clicked");
            return; // This node is dimmed/unclickable, do nothing
        }
        try {
            // Toggle selection if the same node is clicked again
            if (selectedNode && selectedNode.id === node.id) {
                setSelectedNode(null); // Deselect
                setShowIframe(false);
                console.log("SAME NODE CLICKED AGAIN");
                // Optionally call unhighlightAllNodes() here if you want to reset highlights on deselecting
            } else {
                console.log("node clicked ", node);
                setSelectedNode(node);
                setShowIframe(true);
                setIframeUrl(node.wikipedia_url);

                // Update highlights based on the selected node
                highlightOnlySelectedNodeGroup(node);
            }
        } catch (e) {
            console.error("Error handling node click:", e);
        }
    };

    // Function to simulate a node click based on the search input
    const simulateNodeClick = nodeName => {
        console.log("node simulatedly clicked");
        const node = graphData.nodes.find(n => n.name.toLowerCase() === nodeName.toLowerCase());

        console.log("node found", node);
        if (node) {
            handleNodeClick(node);
            setSearchInput('');
            setFilteredNodes([]);
            setShowIframe(true);
            setIframeUrl(node.wikipedia_url);
            console.log("showed the iframe")
        }

    };


    useEffect(() => {
        if (searchInput.length > 2) {
            const fuseOptions = {
                includeScore: true,
                keys: ['name']
            };
            const fuse = new Fuse(graphData.nodes, fuseOptions);

            const result = fuse.search(searchInput).map(({ item }) => item);
            setFilteredNodes(result);
        } else {
            setFilteredNodes([]);
        }
    }, [searchInput, graphData.nodes]);




    // // Listen for clicks to close the iframe if clicking outside
    // useEffect(() => {
    //     const handleClickOutside = event => {
    //         if (showIframe && !event.target.closest('.iframe-container')) {
    //             setShowIframe(false);
    //         }
    //     };

    //     window.addEventListener('click', handleClickOutside);
    //     return () => {
    //         window.removeEventListener('click', handleClickOutside);
    //     };
    // }, [showIframe]);

    const connectedEdges = selectedNode ? graphData.links.filter(link => link.source === selectedNode.id || link.target === selectedNode.id) : [];

    const connectionsDisplay = connectedEdges.map((link, index) => (
        <div key={index}>
      <p>Connection {index + 1}: {link.article_context}</p>
    </div>
    ));

    const onDropdownItemClick = (node, event) => {
        event.stopPropagation(); // Prevent click event from propagating to window
        simulateNodeClick(node.name);
    };


    return (
        <div>
        <div ref={searchInputRef} style={{ position: 'absolute', right: '10px', top: '10px', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && filteredNodes.length === 1) {
                simulateNodeClick(filteredNodes[0].name);
              }
            }}
            style={{ padding: '5px', width: '200px' }} // Fixed width for the input
          />
          {searchInput && (
            <div ref={dropdownRef} style={{ background: 'white', padding: '10px', border: '1px solid #ddd', maxHeight: '200px', overflowY: 'auto', marginTop: '5px', width: '100%' }}>
              {filteredNodes.map((node) => (
                <div
                  key={node.id}
                  onClick={(e) => onDropdownItemClick(node,e)}
                  style={{ cursor: 'pointer', padding: '5px' }}
                >
                  {node.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <
        ForceGraph3D graphData = { graphData } nodeAutoColorBy = "citizenship"
        enableNodeDrag={false}
        backgroundColor = "#222"
        nodeLabel = { showNames ? 'name' : '' } nodeRelSize = { 10 } onNodeClick = { handleNodeClick } linkWidth = { link => highlightLinks.has(link) ? 2.5 : 1 } nodeCanvasObjectMode = { node => highlightNodes.has(node) ? 'before' : undefined } nodeCanvasObject = { nodeCanvasObject }
        // onNodeHover={handleNodeHover}
        // onLinkHover={handleLinkHover}
        linkColor = { linkColor } nodeColor = { nodeColor }
        />

        {
            showIframe && (
                <div 
            className="iframe-container" 
            style={{ 
              position: 'absolute', 
              left: '10px',
              top: '10px',
              width: '30%', 
              height: '100%', 
              zIndex: 10000,
            }}>
            <iframe 
              src={iframeUrl} 
              style={{ 
                width: '100%', 
                height: '100%', 
                border: 'none'
              }} 
              title="Wikipedia">
            </iframe>
          </div>
            )
        } <
        /div>
    );
};

export default Graph3DVisualization;



/*        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillText(label, node.x, node.y);
        }}*/