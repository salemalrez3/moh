import { useEffect, useState } from "react";

function OtherDisplayer({ attachments = [] }) {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    // filter out images and videos — leave only other files
    const nonMediaFiles = attachments.filter((f) => {
      const isImage = /\.(jpg|jpeg|png|gif)$/i.test(f.fileName);
      const isVideo = /\.(mp4|webm|ogg)$/i.test(f.fileName);
      return !isImage && !isVideo;
    });
    setFiles(nonMediaFiles);
  }, [attachments]);

  if (!files.length) return null;

  const renderFile = (file) => {
    const url = `http://localhost:4000/${file.path}`;
    const ext = file.fileName.split(".").pop().toLowerCase();

 
    return (
      <div
        key={file.id}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "8px",
          border: "1px solid #ddd",
          borderRadius: "6px",
          marginBottom: "6px",
          background: "#fafafa",
        }}
      >
       
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none", color: "#0077cc", fontWeight: "500" }}
        >
          {file.originalName || file.fileName}
        </a>
      </div>
    );
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      {files.map((file) => renderFile(file))}
    </div>
  );
}

export default OtherDisplayer;
