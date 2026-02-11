import { useEffect, useState } from "react";

function ImageVidDisplayer({ attachments = [] }) {
  const [images, setImages] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    setImages(attachments);
  }, [attachments]);

  const openModal = (index) => setExpandedIndex(index);
  const closeModal = () => setExpandedIndex(null);

  const prev = () => {
    setExpandedIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const next = () => {
    setExpandedIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // ✅ Helper to fix inconsistent path formats
  const normalizePath = (path) => {
    if (!path) return "";
    console.log(path);
    
    path = path.replace(/\\/g, "/"); // fix Windows-style slashes
    if (path.startsWith("/")) path = path.slice(1);
    if (!path.startsWith("uploads/")) path = `uploads/${path}`;
    return path;
  };

  const renderMedia = (im, index, overlay = false) => {
    const url = `http://localhost:4000/uploads/${encodeURIComponent(im.fileName)}`;

    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(im.fileName);
    const isVideo = /\.(mp4|webm|ogg)$/i.test(im.fileName);

    const mediaElement = isImage ? (
      <img
        src={url}
        alt={im.originalName}
        style={{
          width: "100%",
          height: "320px",
          objectFit: "cover",
          borderRadius: "12px",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        }}
        onClick={() => openModal(index)}
      />
    ) : isVideo ? (
      <div onClick={() => openModal(index)} style={{ cursor: "pointer" }}>
        <video
          src={url}
          style={{
            width: "100%",
            height: "220px",
            objectFit: "cover",
            borderRadius: "12px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          }}
          controls
          onClick={(e) => e.preventDefault()}
        />
      </div>
    ) : null;

    if (overlay) {
      return (
        <div key={im.id} style={{ position: "relative" }}>
          {mediaElement}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "20px",
              fontWeight: "bold",
              borderRadius: "12px",
            }}
          >
            +{images.length - 4}
          </div>
        </div>
      );
    }

    return <div key={im.id}>{mediaElement}</div>;
  };

  return (
    <>
      {/* Grid Preview */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "12px",
        }}
      >
        {images &&
          images.slice(0, 4).map((im, index) =>
            index === 3 && images.length > 4
              ? renderMedia(im, index, true)
              : renderMedia(im, index)
          )}
      </div>

      {/* Modal / Lightbox */}
      {expandedIndex !== null && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            backdropFilter: "blur(4px)",
          }}
        >
          {/* Close */}
          <button
            onClick={closeModal}
            style={{
              position: "absolute",
              top: 20,
              right: 30,
              fontSize: "26px",
              color: "#fff",
              background: "rgba(0,0,0,0.5)",
              border: "none",
              borderRadius: "50%",
              cursor: "pointer",
              padding: "6px 12px",
            }}
          >
            ✕
          </button>

          {/* Prev */}
          <button
            onClick={prev}
            style={{
              position: "absolute",
              left: 20,
              fontSize: "36px",
              color: "#fff",
              background: "rgba(0,0,0,0.5)",
              border: "none",
              borderRadius: "50%",
              cursor: "pointer",
              padding: "4px 12px",
            }}
          >
            ‹
          </button>

          {/* Next */}
          <button
            onClick={next}
            style={{
              position: "absolute",
              right: 20,
              fontSize: "36px",
              color: "#fff",
              background: "rgba(0,0,0,0.5)",
              border: "none",
              borderRadius: "50%",
              cursor: "pointer",
              padding: "4px 12px",
            }}
          >
            ›
          </button>

          {images[expandedIndex] &&
            (images[expandedIndex].mimeType.startsWith("image/") ? (
              <img
                src={`http://localhost:4000/${normalizePath(
                  images[expandedIndex].path
                )}`}
                style={{
                  maxHeight: "85vh",
                  maxWidth: "90vw",
                  borderRadius: "12px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
                }}
                alt={images[expandedIndex].originalName}
              />
            ) : (
              <video
                src={`http://localhost:4000/${normalizePath(
                  images[expandedIndex].path
                )}`}
                controls
                style={{
                  maxHeight: "85vh",
                  maxWidth: "90vw",
                  borderRadius: "12px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
                }}
              />
            ))}
        </div>
      )}
    </>
  );
}

export default ImageVidDisplayer;
