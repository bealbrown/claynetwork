import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

import App from "./App_newest.jsx";
import "./index.css";

import FooterWithModals from "./footerWithModals";

const RootComponent = () => {
  return (
    <React.StrictMode>
      <App />
      <FooterWithModals />
    </React.StrictMode>
  );
};

// Use ReactDOM to render the RootComponent instead of App directly
ReactDOM.createRoot(document.getElementById("root")).render(<RootComponent />);
