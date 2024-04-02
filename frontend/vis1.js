import React, { useState, useEffect } from 'react';
import { ForceGraph3D } from 'react-force-graph';
import axios from 'axios';

const Graph3DVisualization = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        // Assuming you have an endpoint '/api/network' that returns your nodes and edges
        const response = await axios.get('/api/network');
        const { nodes, edges } = response.data;

        const formattedNodes = nodes.map(node => ({
          id: node.wikibase_item,
          name: node.canonical_title,
          // Add other node properties you wish to visualize
        }));

        const formattedEdges = edges.map(edge => ({
          source: edge.source,
          target: edge.target,
          article_context: edge.article_context,
          // Add other edge properties you wish to visualize
        }));

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

  return (
    <ForceGraph3D
      graphData={graphData}
      nodeLabel="name"
      nodeAutoColorBy="group"
      linkDirectionalParticles="value"
      linkDirectionalParticleSpeed={d => d.value * 0.001}
    />
  );
};

export default Graph3DVisualization;