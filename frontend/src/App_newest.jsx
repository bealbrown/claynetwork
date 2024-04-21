import React, { useState, useEffect, useRef } from "react";
import { ForceGraph3D } from "react-force-graph";

import citizenshipColorMap from "./citizenshipColorMap";

import DetailsView from "./detailsView";
import Fuse from "fuse.js"; // Import Fuse.js
import {
    CSS2DRenderer,
    CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";

const Graph3DVisualization = () => {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    // const [nodeSize, setNodeSize] = useState(10); // Default node size
    // const [showNames, setShowNames] = useState(true); // Toggle between names and dots
    const [selectedNode, setSelectedNode] = useState(null); // For the data popup
    const [showDetailsView, setShowDetailsView] = useState(false); // Toggle details display
    const [currentView, setCurrentView] = useState("PotteryView");
    // const graphContainerRef = useRef(null);
    const [highlightNodes, setHighlightNodes] = useState(new Set());
    const [highlightLinks, setHighlightLinks] = useState(new Set());

    const [settingsButtonRef, setSettingsButtonRef] = useState(false);
    const [showModal, setShowModal] = useState(true);

    const [showSettingsModal, setShowSettingsModal] = useState(false); // State to control the visibility of the settings modal
    const [mainWidth, setMainWidth] = useState(400); // State to hold the mainWidth value, adjust the initial value as needed

    // const [hoverNode, setHoverNode] = useState(null);
    const [searchInput, setSearchInput] = useState(""); // For the search input
    const [filteredNodes, setFilteredNodes] = useState([]); // For the search autofill results
    const searchInputRef = useRef(null);
    const dropdownRef = useRef(null);

    const fgRef = useRef();

    // useEffect(() => {
    //     if (fgRef.current) {
    //         // Directly modify the 'link' force to adjust the distance
    //         fgRef.current.d3Force("link").distance(100);

    //         // Optionally, if you need to reheat (restart) the simulation
    //         // This step may vary depending on the react-force-graph version and your specific needs
    //         // fgRef.current.d3ReheatSimulation?.();
    //     }
    // }, [fgRef.current]); // Depend on fgRef.current to ensure this runs once it's initialized

    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                const response = await fetch("/ceramics_data.json");
                const { nodes, edges } = await response.json();

                const formattedNodes = nodes.map((node) => ({
                    id: node.wikibase_item,
                    name: node.canonical_title,
                    wikipedia_url: node.wikipedia_url,
                    sex_or_gender: node.sex_or_gender,
                    citizenship: node.citizenship,
                    birthdate: node.birthdate,
                    birthplace: node.birthplace,
                    deathdate: node.deathdate,
                    // Add other node properties you wish to visualize
                }));

                const formattedEdges = edges.map((edge) => ({
                    source: edge.source,
                    target: edge.target,
                    article_context: edge.article_context,
                    // Add other edge properties you wish to visualize
                }));

                const nodeMap = formattedNodes.reduce((map, node) => {
                    map[node.id] = node;
                    return map;
                }, {});

                formattedEdges.forEach((link) => {
                    const a = nodeMap[link.source];
                    const b = nodeMap[link.target];

                    if (!a || !b) {
                        // If either node is not found by ID, skip this link
                        console.warn(
                            "Skipping link with unknown node(s):",
                            link,
                        );
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

    const nodeColor = (node) => {
        // Check if there are highlighted nodes and the current node is not one of them
        if (node == selectedNode) {
            return "rgba(255, 111, 111, 1)";
        } else if (highlightNodes.size > 0 && !highlightNodes.has(node)) {
            return "rgba(255, 255, 255, 0.1)"; // Dimmed color for non-highlighted nodes
        } else if (highlightNodes.has(node)) {
            return "rgba(255, 255, 255, 1)"; // Highlight color
        }

        // Use the citizenship value of the node to get the corresponding color
        const color =
            citizenshipColorMap[node.citizenship] || "rgba(255, 255, 255, 0.1)"; // Fallback color
        return color;
    };

    const linkColor = (link) =>
        highlightLinks.has(link)
            ? "rgba(255, 255, 255, 2)"
            : "rgba(255, 255, 255, 0.2)";

    const updateHighlight = () => {
        setHighlightNodes(highlightNodes);
        setHighlightLinks(highlightLinks);
    };

    // const highlightAllNodes = () => {

    //     highlightNodes.clear();
    //     highlightLinks.clear();
    //     graphData.nodes.forEach(node => highlightNodes.add(node));
    //     graphData.links.forEach(link => highlightLinks.add(link));
    //     updateHighlight()
    // };

    const unhighlightAllNodes = () => {
        console.log(graphData);

        highlightNodes.clear();
        highlightLinks.clear();

        console.log("unhighlightAllNodes");

        // graphData.nodes.forEach(node => highlightNodes.add(node));
        // graphData.links.forEach(link => highlightLinks.add(link));
        updateHighlight();
    };

    const highlightOnlySelectedNodeGroup = (node) => {
        highlightNodes.clear();
        highlightLinks.clear();
        highlightNodes.add(node);
        node.neighbors.forEach((neighbor) => highlightNodes.add(neighbor));
        node.links.forEach((link) => highlightLinks.add(link));

        updateHighlight();
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
            const distance = Math.sqrt(
                Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2),
            );

            // If the distance is less than the threshold, consider it a click, not a drag/swipe

            try {
                if (distance < threshold) {
                    if (
                        showDetailsView &&
                        !event.target.closest(".details-view-container") &&
                        !searchInputRef.current.contains(event.target)
                    ) {
                        setShowDetailsView(false);
                        setSelectedNode(null); // Deselect

                        console.log("click outside");
                        // Additional check to see if the click is outside the nodes/graph

                        // Resetting view to default if click is outside the graph nodes
                        setShowDetailsView(false);
                        // Clearing highlights
                        // highlightAllNodes()
                        unhighlightAllNodes();
                    }
                }
            } catch (e) {
                console.log(e);
            }
        };

        // Add event listeners for both mousedown and click
        document.addEventListener("mousedown", handleMouseDown);
        document.addEventListener("click", handleClickOutside);

        // Cleanup
        return () => {
            document.removeEventListener("mousedown", handleMouseDown);
            document.removeEventListener("click", handleClickOutside);
        };
    }, [showDetailsView]); // Dependency on showIframe only

    // useEffect(() => {
    //     const handleClickOutside = (event) => {
    //         if (
    //             showIframe &&
    //             !event.target.closest(".details-view-container") &&
    //             !searchInputRef.current.contains(event.target) &&
    //             !dropdownRef.current.contains(event.target)
    //         ) {
    //             setShowDetailsView(false);
    //         }
    //     };

    //     window.addEventListener("click", handleClickOutside);
    //     return () => {
    //         window.removeEventListener("click", handleClickOutside);
    //     };
    // }, [showIframe]);

    const handleNodeClick = (node) => {
        // Check if the node is in the highlightNodes set
        console.log("highlightNodes is", highlightNodes);
        // if (!highlightNodes.has(node) && highlightNodes.size > 0) {
        //     // If the node is not highlighted and there are highlighted nodes, exit the function
        //     console.log("Unclickable node clicked");
        //     return; // This node is dimmed/unclickable, do nothing
        // }
        try {
            // Toggle selection if the same node is clicked again
            if (selectedNode && selectedNode.id === node.id) {
                setSelectedNode(null); // Deselect
                setShowDetailsView(false);
                console.log("Same node clicked again");
            } else {
                console.log("node clicked ", node);
                setSelectedNode(node);
                setShowDetailsView(true);

                // Update highlights based on the selected node
                highlightOnlySelectedNodeGroup(node);
            }
        } catch (e) {
            console.error("Error handling node click:", e);
        }
    };

    // Function to simulate a node click based on the search input
    const simulateNodeClick = (nodeName) => {
        console.log("node simulatedly clicked");
        const node = graphData.nodes.find(
            (n) => n.name.toLowerCase() === nodeName.toLowerCase(),
        );

        console.log("node found", node);
        if (node) {
            handleNodeClick(node);
            setSearchInput("");
            setFilteredNodes([]);
            setShowDetailsView(true);
        }
    };

    // Search functionality
    useEffect(() => {
        if (searchInput.length > 2) {
            const fuseOptions = {
                includeScore: true,
                keys: ["name"],
            };
            const fuse = new Fuse(graphData.nodes, fuseOptions);

            const result = fuse.search(searchInput).map(({ item }) => item);
            setFilteredNodes(result);
        } else {
            setFilteredNodes([]);
        }
    }, [searchInput, graphData.nodes]);

    const renderSettingsModal = () => {
        if (!showSettingsModal) return null; // Don't render the modal if not needed

        return (
            <div
                style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "white",
                    padding: "20px",
                    zIndex: 1000,
                    maxWidth: "80%",
                    borderRadius: "10px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
            >
                <h2>Settings</h2>
                <label htmlFor="mainWidth">Main Width:</label>
                <input
                    id="mainWidth"
                    type="number"
                    value={mainWidth}
                    onChange={(e) => setMainWidth(e.target.value)} // Update the mainWidth state
                    style={{ marginLeft: "10px" }}
                />
                <button
                    onClick={() => setShowSettingsModal(false)} // Hide the modal
                    style={{
                        marginLeft: "10px",
                        padding: "10px 20px",
                        cursor: "pointer",
                        border: "none",
                        borderRadius: "5px",
                        backgroundColor: "#007bff",
                        color: "white",
                    }}
                >
                    Close
                </button>
            </div>
        );
    };

    // // Listen for clicks to close the iframe if clicking outside
    // useEffect(() => {
    //     const handleClickOutside = event => {
    //         if (showIframe && !event.target.closest('.details-view-container')) {
    //             setShowDetailsView(false);
    //         }
    //     };

    //     window.addEventListener('click', handleClickOutside);
    //     return () => {
    //         window.removeEventListener('click', handleClickOutside);
    //     };
    // }, [showIframe]);

    // const connectedEdges = selectedNode ? graphData.links.filter(link => link.source === selectedNode.id || link.target === selectedNode.id) : [];

    // const connectionsDisplay = connectedEdges.map((link, index) => (
    //     <div key={index}>
    //   <p>Connection {index + 1}: {link.article_context}</p>
    // </div>
    // ));

    const onDropdownItemClick = (node, event) => {
        event.stopPropagation(); // Prevent click event from propagating to window
        simulateNodeClick(node.name);
    };

    return (
        <div>
            <div
                style={{
                    position: "absolute",
                    right: "234px",
                    top: "10px",
                    zIndex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                }}
            >
                <button
                    onClick={() => setShowSettingsModal(true)}
                    style={{
                        padding: "6px 15px",
                        cursor: "pointer",
                        border: "none",
                        borderRadius: "5px",
                        backgroundColor: "#007bff",
                        color: "white",
                    }}
                >
                    ☰
                </button>
            </div>
            {renderSettingsModal()}
            <div
                ref={searchInputRef}
                style={{
                    position: "absolute",
                    right: "10px",
                    top: "10px",
                    zIndex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                }}
            >
                <input
                    type="text"
                    placeholder="Search nodes..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && filteredNodes.length === 1) {
                            simulateNodeClick(filteredNodes[0].name);
                        }
                    }}
                    style={{ padding: "5px", width: "200px" }} // Fixed width for the input
                />
                {searchInput && (
                    <div
                        ref={dropdownRef}
                        style={{
                            background: "white",
                            padding: "10px",
                            border: "1px solid #ddd",
                            maxHeight: "200px",
                            overflowY: "auto",
                            marginTop: "5px",
                            width: "100%",
                        }}
                    >
                        {filteredNodes.map((node) => (
                            <div
                                key={node.id}
                                onClick={(e) => onDropdownItemClick(node, e)}
                                style={{ cursor: "pointer", padding: "5px" }}
                            >
                                {node.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <ForceGraph3D
                ref={fgRef}
                graphData={graphData}
                nodeAutoColorBy="citizenship"
                enableNodeDrag={false}
                backgroundColor="#222"
                // nodeLabel = { showNames ? 'name' : '' }
                nodeRelSize={9}
                onNodeClick={handleNodeClick}
                linkWidth={(link) => (highlightLinks.has(link) ? 2.5 : 1)}
                nodeThreeObject={(node, ctx, globalScale) => {
                    // Check if the node is highlighted
                    if (highlightNodes.has(node)) {
                        // Create and return a custom label or object for highlighted nodes

                        const nodeEl = document.createElement("div");
                        nodeEl.textContent = node.name;
                        nodeEl.style.color = "#ddd";
                        nodeEl.style.fontSize = "12px";
                        node.transparent = "false";
                        nodeEl.style.textShadow =
                            "2px 2px 3px rgba(0, 0, 0, 1)";
                        nodeEl.className = "node-label";
                        return new CSS2DObject(nodeEl);
                    }
                }}
                nodeThreeObjectExtend={true}
                extraRenderers={[new CSS2DRenderer()]}
                // onNodeHover={handleNodeHover}
                // onLinkHover={handleLinkHover}
                linkColor={linkColor}
                nodeColor={nodeColor}
            />
            {showDetailsView && (
                <DetailsView
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                    selectedNode={selectedNode}
                    mainWidth={mainWidth}
                />
            )}
            {showModal && (
                <div
                    style={{
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: "white",
                        padding: "20px",
                        zIndex: 1000,
                        maxWidth: "80%",
                        borderRadius: "10px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <h2>Welcome to a beta preview of Clay.Network!</h2>
                    <p>
                        This project visualizes the connections among potters
                        and ceramicists who have pages on Wikipedia. The dots
                        (also called nodes) are individual people, and the lines
                        between them represent relationships, which may be
                        teacher/student or merely acquaintance.
                    </p>
                    <p>
                        To explore the data, you can click a dot/node, and it
                        will open a detailed view for that person, which you can
                        toggle between showing their pottery, or their Wikipedia
                        page, as well as show you their immediate relationships.
                        Also, you can search for people using the search bar in
                        the top right!
                    </p>
                    <p>
                        You can see the camera controls on the bottom: left
                        click to rotate, mouse wheel to zoom, and right click to
                        pan.
                    </p>
                    <p>
                        I'm working on improving this dataset, which will
                        include a more complete scrape of Wikipedia (all
                        languages!), as well as including other sources of
                        information linking potters and ceramicists together.
                    </p>
                    <button
                        onClick={() => setShowModal(false)}
                        style={{
                            padding: "10px 20px",
                            cursor: "pointer",
                            border: "none",
                            borderRadius: "5px",
                            backgroundColor: "#007bff",
                            color: "white",
                        }}
                    >
                        Ok!
                    </button>
                </div>
            )}
        </div>
    );
};

export default Graph3DVisualization;
