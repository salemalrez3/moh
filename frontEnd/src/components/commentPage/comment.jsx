function CommentCard({ comment }) {
  const text = Object.values(comment.data)[0];
  console.log(comment);
  
  return (
    <div style={{ 
      margin: "1rem auto", 
      padding: "1rem", 
      border: "1px solid #ccc",
      borderRadius: "8px", 
      width: "80%",
      backgroundColor: "#f9f9f9",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
        <div style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          backgroundColor: "#4a6cf7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
          marginRight: "0.8rem",
          fontSize: "16px"
        }}>
          {comment.user?.userName ? comment.user.userName.charAt(0).toUpperCase() : "U"}
        </div>
        <p style={{ margin: 0, fontWeight: "bold", color: "#333" }}>
          {comment.user?.userName}
        </p>
      </div>
      <p style={{ 
        margin: "0.5rem 0", 
        lineHeight: "1.5",
        color: "#555"
      }}>
        {text}
      </p>
      <small style={{ 
        color: "#777",
        fontSize: "0.85rem"
      }}>
        {new Date(comment.createdAt).toLocaleString()}
      </small>
    </div>
  );
}

export default CommentCard;