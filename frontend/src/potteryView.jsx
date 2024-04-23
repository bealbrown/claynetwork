import React, { useState, useEffect } from "react";

const PotteryView = ({ potter_name, detailsWidth }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");

    const handleImageClick = async (index) => {
        const txtUrl = images[index].src.replace(".jpeg", ".txt");
        try {
            const response = await fetch(txtUrl);
            const largeImageUrl = await response.text();
            setSelectedImage(largeImageUrl.trim());
            setModalOpen(true);
        } catch (error) {
            console.error("Failed to fetch large image URL:", error);
        }
    };
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
        <div style={{ height: "100%", overflow: "auto" }}>
            {modalOpen && (
                <div
                    style={{
                        position: "fixed",
                        top: "10%",
                        left: "30%",
                        width: "40%",
                        height: "80%",
                        backgroundColor: "rgba(0, 0, 0, 0.4)",
                        borderRadius: "10px",
                        zIndex: 10001,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    onClick={() => setModalOpen(false)} // Close modal on background click
                >
                    <div
                        style={{
                            width: "95%",
                            height: "95%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 10001,
                            padding: "10px",
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setModalOpen(false);
                        }}
                    >
                        <img
                            src={selectedImage}
                            alt="Selected Pottery"
                            style={{
                                maxWidth: "100%",
                                maxHeight: "90%",
                                width: "auto",
                                height: "auto",
                                zIndex: 10001,
                            }}
                        />
                        <p style={{ color: "red", marginTop: "10px" }}>
                            <a
                                href={selectedImage}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Original Image Source
                            </a>
                        </p>
                    </div>
                </div>
            )}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(auto-fill, minmax(${detailsWidth / 3}px, 1fr))`,
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
                                    onClick={() => handleImageClick(index)}
                                    src={image.src}
                                    className="image-hover-darken"
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
        </div>
    );
};

export default PotteryView;
