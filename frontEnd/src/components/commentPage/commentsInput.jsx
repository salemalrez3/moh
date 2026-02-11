import { useState } from "react";
import { Box, TextField, Button } from "@mui/material";
import { useCreateResponse } from "../../repository/response";

function CommentInput({ surveyId, onSubmit }) {
  const [responses, setResponses] = useState("");
  const createResponse = useCreateResponse(surveyId);

  const handleSubmit = () => {
    if (!responses.trim()) return;

    createResponse.mutate(
      { data: { "0-0": responses } },
      {
        onSuccess: (newComment) => {
          setResponses("");
          onSubmit(newComment); 
        },
      }
    );
  };

  return (
    <Box
      sx={{
        position: "sticky",
        bottom: 0,
        bgcolor: "white",
        borderTop: "1px solid #ddd",
        p: 1,
        display: "flex",
        gap: 1,
      }}
    >
      <TextField
        fullWidth
        size="small"
        placeholder="Write a comment..."
        value={responses}
        onChange={(e) => setResponses(e.target.value)}
      />
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={createResponse.isLoading}
      >
        Send
      </Button>
    </Box>
  );
}

export default CommentInput;
