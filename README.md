# Network visualizer application


This is an application which visualizes and provides a UI for exploring the network created by a separate project, currently called "lineager"

Lineager crawls wikipedia to find networks of individuals who are connected with other humans, and share a common occupation or interest, using regex and LLM classification. This helps to achieve transitive closure on the graph without exploding into the whole list of wikipedia articles about people (early tests were quick to include Jesus, Abraham Lincoln, Mozart, etc etc.)

This is a simple react app which has the dataset from the lineager bundled as a static JSON, to make it simple to serve via a static server such as cloudflare.

