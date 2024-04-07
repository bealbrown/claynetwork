import React, { useState, useEffect } from "react";

// Assuming this component now accepts a prop called `potter_name`
const WikipediaView = ({ wikipedia_url }) => {
    // useEffect(() => {
    //     // Dummy logic to simulate fetching images
    //     // In real scenario, you might fetch image URLs from a server
    //     const fetchedImages = [];
    //     for (let i = 1; i <= 10; i++) {
    //         // Assuming there are 10 images for each potter
    //         fetchedImages.push(`${baseLink}/image${i}.jpg`); // Assuming a naming pattern
    //     }
    //     setImages(fetchedImages);
    // }, [potter_name, baseLink]);
    console.log("wikipediaview is livvveee", wikipedia_url);
    return (
        <div style={{ height: "100%" }}>
            <iframe
                src={wikipedia_url}
                style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                }}
                title="Wikipedia"
            ></iframe>
        </div>
    );
};

export default WikipediaView;
