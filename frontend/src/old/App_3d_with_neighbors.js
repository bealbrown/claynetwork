  import React, { useState, useEffect, useRef } from 'react';
  import { ForceGraph3D } from 'react-force-graph';
  import axios from 'axios';
  import Fuse from 'fuse.js'; // Import Fuse.js
  import { extend, useThree } from '@react-three/fiber';
  import { useEffectfulState } from '@react-three/drei';
  import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
  import * as THREE from 'three';

  const Graph3DVisualization = () => {
      const [graphData, setGraphData] = useState({ nodes: [], links: [] });
      const [nodeSize, setNodeSize] = useState(8); // Default node size
      const [showNames, setShowNames] = useState(true); // Toggle between names and dots
      const [selectedNode, setSelectedNode] = useState(null); // For the data popup
      const [iframeUrl, setIframeUrl] = useState(''); // For the Wikipedia iframe
      const [showIframe, setShowIframe] = useState(false); // Toggle iframe display
      const [searchInput, setSearchInput] = useState(''); // For the search input
      const [filteredNodes, setFilteredNodes] = useState([]); // For the search autofill results
      const graphContainerRef = useRef(null);
      const [cooldownTicks, setCooldownTicks] = useState(Infinity);

      const extraRenderers = [new CSS2DRenderer()];


      const sizeOptions = [3, 5, 8, 12, 18]; // Predefined size options for node text

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
                  }));

                  const formattedEdges = edges.map(edge => ({
                      source: edge.source,
                      target: edge.target,
                      article_context: edge.article_context,
                  }));

                  const connectedNodeIds = new Set(formattedEdges.flatMap(edge => [edge.source, edge.target]));
                  // const connectedNodes = formattedNodes.filter(node => connectedNodeIds.has(node.id));

                  // don't filter nodes without connections for now
                  const connectedNodes = formattedNodes

                  setGraphData({
                      nodes: connectedNodes,
                      links: formattedEdges,
                  });
              } catch (error) {
                  console.error("Failed to fetch graph data: ", error);
              }
          };

          fetchGraphData();
      }, []);

      // useEffect(() => {
      //     // After 3 seconds, set cooldownTicks to 0 to stop the simulation
      //     const timer = setTimeout(() => {
      //         setCooldownTicks(0);
      //     }, 3000);

      //     return () => clearTimeout(timer);
      // }, []); // Empty dependency array to run this effect once on mount


      /*      const findNodesWithinNJumps = (startNodeId, n) => {
                let visited = new Set([startNodeId]);
                let queue = [
                    [startNodeId, 0]
                ]; // Node and depth pair

                while (queue.length > 0) {
                    let [currentNodeId, depth] = queue.shift(); // Dequeue

                    if (depth === n) break; // Stop if reached desired depth

                    const currentNode = graphData.nodes.find(node => node.id === currentNodeId);
                    const neighborLinks = graphData.links.filter(link => link.source === currentNodeId || link.target === currentNodeId);
                    const neighborNodeIds = neighborLinks.map(link => link.source === currentNodeId ? link.target : link.source);

                    neighborNodeIds.forEach(neighborNodeId => {
                        if (!visited.has(neighborNodeId)) {
                            visited.add(neighborNodeId);
                            queue.push([neighborNodeId, depth + 1]); // Enqueue with incremented depth
                        }
                    });
                }

                return Array.from(visited); // Convert Set to Array
            };
      */

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
                      // resetAllNodes();
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

      // Function to simulate a node click based on the search input
      const simulateNodeClick = nodeName => {
          console.log("node simulatedly clicked");
          const node = graphData.nodes.find(n => n.name.toLowerCase() === nodeName.toLowerCase());

          console.log("node found", node);
          if (node) {
              handleNodeClick(node);
              setSearchInput('');
              setFilteredNodes([]);
          }

      };

      useEffect(() => {
          // Code here will run whenever `selectedNode` changes.
          console.log('Selected node changed:', selectedNode);


      }, [selectedNode]); // Dependency array includes `selectedNode` to listen for its changes.

      const resetAllNodes = () => {
          // Deep clone graphData to avoid mutating the state directly
          let newGraphData = {
              nodes: graphData.nodes.map(n => ({ ...n, dimmed: 0 })), // Use false instead of 0 if dimmed is a boolean
              links: graphData.links.map(l => ({ ...l, dimmed: 0 }))
          };

          setGraphData(newGraphData); 
          console.log("nodes reset in resetallnodes")
      }


      const handleNodeClick = node => {
          let newGraphData = { ...graphData }; // Clone the current graph data for immutability

          // If clicking the same node again, deselect it
          if (selectedNode && selectedNode.id === node.id) {
              setSelectedNode(null); // Deselect
              setShowIframe(false);
              // Reset dimmed state for all nodes and links
              newGraphData.nodes.forEach(n => n.dimmed = false);
              newGraphData.links.forEach(l => l.dimmed = false);
          } else {
              console.log("node clicked ", node);
              setSelectedNode(node);
              setShowIframe(true);
              setIframeUrl(node.wikipedia_url);

              // Update the dimmed state for nodes
              newGraphData.nodes.forEach(n => {
                  n.dimmed = (n.id !== node.id);
              });

              // Update the dimmed state for links
              newGraphData.links.forEach(l => {
                  l.dimmed = !(l.source.id === node.id || l.target.id === node.id);
              });
          }

          setGraphData(newGraphData); // Update the graph data state to trigger re-render
      };

      // const createNodeLabel = (node) => {
      //     // Create a div element for the label
      //     const div = document.createElement('div');
      //     div.className = 'node-label';
      //     div.style.color = node.color; // Use node's color
      //     div.textContent = node.name; // Use node's name as text
      //     const label = new CSS2DObject(div);
      //     label.position.set(0, nodeSize + 1, 0); // Adjust label position
      //     return label;
      // };

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


      useEffect(() => {
          const style = document.createElement('style');
          style.textContent = `
              .node-label {
                  font-size: 12px;
                  padding: 1px 4px;
                  border-radius: 4px;
                  background-color: rgba(0,0,0,0.5);
                  user-select: none;
              }
          `;
          document.head.append(style);

          // Cleanup function to remove the style when the component unmounts
          return () => document.head.removeChild(style);
      }, []);

      return (
          <div>
        <div style={{ position: 'absolute', right: '10px', top: '10px', zIndex: 1 }}>
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
            style={{ padding: '5px' }}
          />
          {searchInput && (
            <div style={{ background: 'white', padding: '10px', border: '1px solid #ddd', maxHeight: '200px', overflowY: 'auto' }}>
              {filteredNodes.map((node) => (
                <div
                  key={node.id}
                  onClick={() => simulateNodeClick(node.name)}
                  style={{ cursor: 'pointer', padding: '5px' }}
                >
                  {node.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ position: 'absolute', right: '200px', top: '10px', zIndex: 1 }}>
          Node Size:
          {sizeOptions.map((size, index) => (
            <label key={index} style={{ marginLeft: "10px" }}>
              <input
                type="radio"
                name="nodeSize"
                value={size}
                checked={nodeSize === size}
                onChange={() => setNodeSize(size)}
              />
              {size}
            </label>
          ))}
         {/* <label style={{ marginLeft: "10px" }}>
            <input
              type="checkbox"
              checked={showNames}
              onChange={() => setShowNames(!showNames)}
            />
            Show Names
          </label>*/}
        </div>
        <div ref={graphContainerRef} style={{ position: 'relative', height: '100vh' }}>


        <ForceGraph3D
          extraRenderers={extraRenderers}
          graphData={graphData}
          nodeAutoColorBy="citizenship"
          nodeThreeObject={node => {
            // Create a sphere geometry and material for the node
            const geometry = new THREE.SphereGeometry(nodeSize, 16, 16);
            // Use a different color or transparency if the node is dimmed
            const materialColor = node.dimmed ? 'rgba(100, 100, 100, 0.5)' : (node.color || 'gray');
            // Convert color string to THREE.Color, handling potential rgba values for dimmed nodes
            let finalColor = materialColor.startsWith('rgba') ? new THREE.Color(0x808080) : new THREE.Color(materialColor);
            const material = new THREE.MeshBasicMaterial({
              color: finalColor,
              transparent: true,
              opacity: node.dimmed ? 0.1 : 1.0 // Adjust opacity based on dimmed state
            });
            const mesh = new THREE.Mesh(geometry, material);
            return mesh;
          }}
          nodeThreeObjectExtend={true}
          onNodeClick={handleNodeClick}
          backgroundColor="#464646"
          linkColor={link => link.dimmed ? '#d3d3d3' : 'rgba(255,255,255,0.5)'}
          linkWidth={link => link.dimmed ? 0.5 : 1} // Optional: Adjust link width based on dimmed state
          // Additional properties and event handlers...
        />

        </div>
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

  export default Graph3DVisualization;





  /*       nodeThreeObject={node => {
            const nodeEl = document.createElement('div');
            nodeEl.textContent = node.name;
            nodeEl.style.color = node.color;
            nodeEl.className = 'node-label';
            return new CSS2DObject(nodeEl);
          }}



          // cooldownTicks={cooldownTicks}

  */