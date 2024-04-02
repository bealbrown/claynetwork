import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import axios from 'axios';
import SpriteText from 'three-spritetext';

const Graph2DVisualization = () => {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [nodeSize, setNodeSize] = useState(5); // Default node size
    const [showNames, setShowNames] = useState(true); // Toggle between names and dots
    const [selectedNode, setSelectedNode] = useState(null); // For the data popup
    const [iframeUrl, setIframeUrl] = useState(''); // For the Wikipedia iframe
    const [showIframe, setShowIframe] = useState(false); // Toggle iframe display
    const graphContainerRef = useRef(null);
    const NODE_R = 8;
    const [highlightNodes, setHighlightNodes] = useState(new Set());
    const [highlightLinks, setHighlightLinks] = useState(new Set());
    const [hoverNode, setHoverNode] = useState(null);

    const linkColor = link => highlightLinks.has(link) ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.1)';
    const nodeColor = node => highlightNodes.has(node) ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.1)';

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


    const updateHighlight = () => {
        setHighlightNodes(highlightNodes);
        setHighlightLinks(highlightLinks);
    };

    const handleNodeHover = node => {
        highlightNodes.clear();
        highlightLinks.clear();
        if (node) {
            highlightNodes.add(node);
            node.neighbors.forEach(neighbor => highlightNodes.add(neighbor));
            node.links.forEach(link => highlightLinks.add(link));
        }

        setHoverNode(node || null);
        updateHighlight();
    };

    const handleLinkHover = link => {
        highlightNodes.clear();
        highlightLinks.clear();

        if (link) {
            highlightLinks.add(link);
            highlightNodes.add(link.source);
            highlightNodes.add(link.target);
        }

        updateHighlight();
    };

    const paintRing = useCallback((node, ctx) => {
        // add ring just for highlighted nodes
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_R * 1.4, 0, 2 * Math.PI, false);
        ctx.fillStyle = node === hoverNode ? 'red' : 'orange';
        ctx.fill();
    }, [hoverNode]);


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
            if (distance < threshold) {
                console.log("click outside");
                if (graphContainerRef.current && graphContainerRef.current.contains(event.target)) {
                    // If the click is outside the graph container, close the iframe
                    setShowIframe(false);
                }
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

    const handleNodeClick = node => {
        // Toggle selection if the same node is clicked again
        if (selectedNode && selectedNode.id === node.id) {
            setSelectedNode(null); // Deselect
            setShowIframe(false);
        } else {
            console.log("node clicked ", node);
            setSelectedNode(node);
            setShowIframe(true);
            setIframeUrl(node.wikipedia_url);
        }
    };
    // Open Wikipedia link in iframe
    const handleWikipediaLinkClick = (e, url) => {
        e.preventDefault(); // Prevent the default link behavior
        setIframeUrl(url); // Set the URL for the iframe
        setShowIframe(true); // Display the iframe
    };

    // Listen for clicks to close the iframe if clicking outside
    useEffect(() => {
        const handleClickOutside = event => {
            if (showIframe && !event.target.closest('.iframe-container')) {
                setShowIframe(false);
            }
        };

        window.addEventListener('click', handleClickOutside);
        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, [showIframe]);

    // Find all links connected to the selected node
    const connectedEdges = selectedNode ? graphData.links.filter(link => link.source === selectedNode.id || link.target === selectedNode.id) : [];

    // Display these connections
    const connectionsDisplay = connectedEdges.map((link, index) => (
        <div key={index}>
      <p>Connection {index + 1}: {link.article_context}</p>
    </div>
    ));

    return (
        <div>
      <div style={{ position: 'absolute', right: '10px', top: '10px', zIndex: 1 }}>
        <label>
          Node Size:
          <input
            type="range"
            min="1"
            max="20"
            value={nodeSize}
            onChange={e => setNodeSize(e.target.value)}
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={showNames}
            onChange={() => setShowNames(!showNames)}
          />
          Show Names
        </label>
      </div>
      <ForceGraph2D
        graphData={graphData}
        nodeAutoColorBy="citizenship"
        backgroundColor="#464646"
        nodeLabel={showNames ? 'name' : ''}
        nodeRelSize={10}
        onNodeClick={handleNodeClick}
        linkWidth={link => highlightLinks.has(link) ? 5 : 1}
        linkDirectionalParticles={0}
        linkDirectionalParticleWidth={link => highlightLinks.has(link) ? 4 : 0}
        nodeCanvasObjectMode={node => highlightNodes.has(node) ? 'before' : undefined}
        nodeCanvasObject={nodeCanvasObject}
        onNodeHover={handleNodeHover}
        onLinkHover={handleLinkHover}
        linkColor={linkColor}
        nodeColor={nodeColor}
      />
      
      {showIframe && (
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
        )}
    </div>
    );
};

export default Graph2DVisualization;



/*        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillText(label, node.x, node.y);
        }}*/