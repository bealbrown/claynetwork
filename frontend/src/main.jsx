import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

import App from "./App_newest.jsx";
import "./index.css";

import preview1 from "./assets/preview.jpg";
import preview2 from "./assets/preview2.jpg";

const RootComponent = () => {
  // const [isPhone, setIsPhone] = useState(false);

  // useEffect(() => {
  //   // Function to update the state based on device width
  //   const handleResize = () => {
  //     if (window.innerWidth <= 800) {
  //       setIsPhone(true);
  //     } else {
  //       setIsPhone(false);
  //     }
  //   };

  //   // Call the function on component mount
  //   handleResize();

  //   // Add event listener for resize
  //   window.addEventListener("resize", handleResize);

  //   // Cleanup function to remove the event listener
  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

  // if (isPhone) {
  //   return (
  //     <div style={{ padding: "20px", textAlign: "center" }}>
  //       <h2>Hello!</h2>
  //       <img
  //         src={preview2}
  //         alt="preview2"
  //         style={{ maxWidth: "100%", height: "auto" }}
  //       />
  //       <img
  //         src={preview1}
  //         alt="preview"
  //         style={{ maxWidth: "100%", height: "auto" }}
  //       />{" "}
  //       <p>
  //         {" "}
  //         This application displays a lot of data, and would not really be
  //         usable on a phone. <b> Please use a desktop or tablet! </b>
  //       </p>
  //       <p>
  //         Welcome to the beta preview of clay.network, a project that explores
  //         the relationships between famous potters and ceramicists (for now,
  //         famous means they have an English Wikipedia page, but I'm working on
  //         adding other languages and sources!){" "}
  //       </p>
  //     </div>
  //   );
  // }

  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Use ReactDOM to render the RootComponent instead of App directly
ReactDOM.createRoot(document.getElementById("root")).render(<RootComponent />);
