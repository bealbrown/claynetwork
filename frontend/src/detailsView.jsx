import React from "react";
import PotteryView from "./potteryView";
import WikipediaView from "./wikipediaView";

const DetailsView = ({
  currentView,
  setCurrentView,
  selectedNode,
  mainWidth,
}) => {
  // Define a custom style for the active view button
  const activeButtonStyle = {
    backgroundColor: "#333",
    color: "white",
    cursor: "pointer",
    padding: "5px",
    textAlign: "center",
    width: "50%",
    fontWeight: "bold",
  };

  // Define a custom style for the inactive view button
  const inactiveButtonStyle = {
    backgroundColor: "#555",
    color: "black",
    cursor: "pointer",
    padding: "5px",
    textAlign: "center",
    width: "50%",
    margin: "0px",
  };

  // Define styles for hidden and visible views
  const hiddenStyle = {
    display: "none", // Hide the component
    height: "100%",
  };

  const visibleStyle = {
    display: "block", // Show the component
    height: "100%",
  };

  return (
    <div
      className="details-view-container"
      style={{
        position: "absolute",
        left: "2px",
        top: "2px",
        width: `${mainWidth}px`,
        minWidth: "300px",
        height: "100%",
        maxHeight: "100%",
        zIndex: 10000,
      }}
    >
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={
            currentView === "WikipediaView"
              ? activeButtonStyle
              : inactiveButtonStyle
          }
          onClick={() => setCurrentView("WikipediaView")}
        >
          Wikipedia View
        </div>
        <div
          style={
            currentView === "PotteryView"
              ? activeButtonStyle
              : inactiveButtonStyle
          }
          onClick={() => setCurrentView("PotteryView")}
        >
          Pottery View
        </div>
      </div>
      <div style={currentView === "PotteryView" ? visibleStyle : hiddenStyle}>
        <PotteryView
          potter_name={selectedNode.name.replace(/\s*\(.*?\)/, "").trim()}
        />
      </div>
      <div style={currentView === "WikipediaView" ? visibleStyle : hiddenStyle}>
        <WikipediaView wikipedia_url={selectedNode.wikipedia_url} />
      </div>
    </div>
  );
};

export default DetailsView;
