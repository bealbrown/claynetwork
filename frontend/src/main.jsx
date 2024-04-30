import React from "react";
import ReactDOM from "react-dom/client";
import { isDesktop, isTablet } from "react-device-detect";

import App from "./App_newest.jsx";
import "./index.css";
import FooterWithModals from "./footerWithModals";

const RootComponent = () => {
  // Check if the device is not a desktop or tablet
  if (!isDesktop && !isTablet) {
    return (
      <div
        style={{
          color: "black",
          padding: "5%",
          textAlign: "center",
          marginTop: "50px",
        }}
      >
        {/* Display the message */}
        <h1> Clay.Network </h1>
        <div style={{ padding: "2%" }}>
          <p>
            Hello, this website only works on tablet or desktop, since there is
            a large amount information to display.
          </p>{" "}
          <p>
            It is a database of the works and connections between potters and
            people in the field of ceramics, aimed at making it easier to
            understand the history of various styles and lineages.
          </p>
          {/* Display the image */}
        </div>
        <img
          src="/preview.png"
          alt="Preview"
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>
    );
  }

  return (
    <React.StrictMode>
      <App />
      <FooterWithModals />
    </React.StrictMode>
  );
};

// Use ReactDOM to render the RootComponent instead of App directly
ReactDOM.createRoot(document.getElementById("root")).render(<RootComponent />);
