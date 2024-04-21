import React, { useState, useEffect } from "react";

const PotteryView = ({ potter_name, mainWidth }) => {
    const [images, setImages] = useState([]);

    const formattedName = potter_name.replace(/\s/g, "_");
    const baseLink = `https://239s.xyz/images/${formattedName}`;

    useEffect(() => {
        const initialImages = [];
        for (let i = 1; i <= 30; i++) {
            // Include an additional property to track loading status
            initialImages.push({ src: `${baseLink}/${i}.jpeg`, isValid: true });
        }
        setImages(initialImages);
    }, [potter_name, baseLink]);

    const handleImageError = (index) => {
        // Update the image's isValid property to false upon error
        setImages((images) =>
            images.map((img, i) =>
                i === index ? { ...img, isValid: false } : img,
            ),
        );
    };

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(auto-fill, minmax(${mainWidth / 3}px, 1fr))`,
                gap: "4px",
                backgroundColor: "#222",
                height: "100%",
                overflow: "auto",
            }}
        >
            {images.map(
                (image, index) =>
                    image.isValid && ( // Render only if image isValid is true
                        <div
                            key={index}
                            style={{
                                width: "100%",
                                paddingBottom: "100%",
                                position: "relative",
                            }}
                        >
                            <img
                                src={image.src}
                                alt={`Pottery ${index + 1}`}
                                style={{
                                    position: "absolute",
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                                onError={() => handleImageError(index)} // Handle loading error
                            />
                        </div>
                    ),
            )}
        </div>
    );
};

export default PotteryView;
