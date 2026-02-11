import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Stack,
  Card,
  CardContent,
  Divider,
  useTheme,
} from "@mui/material";
import { AttachFile, Delete } from "@mui/icons-material";
import { useCreateNews } from "../repository/news";
import { useTranslation } from "react-i18next";

export default function NewsCreator() {
  const theme = useTheme();
  const createNews = useCreateNews();
  const { i18n, t } = useTranslation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    files.forEach((file) => formData.append("attachments", file));

    createNews.mutate(formData, {
      onSuccess: () => {
        setTitle("");
        setContent("");
        setFiles([]);
      },
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        py: 5,
        px: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 720,
          borderRadius: 3,
          boxShadow: 4,
          p: { xs: 2.5, sm: 3.5 },
          backgroundColor: theme.palette.background.paper,
          borderLeft: `6px solid ${theme.palette.secondary.main}`,
        
        }}
      >
        <CardContent>
          {/* 🔹 Header */}
          <Typography
            variant="h5"
            fontWeight={700}
            color="primary"
            gutterBottom
            sx={{ lineHeight: 1.3 }}
          >
            {t("createNews")}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            {t("fillInFields")}
          </Typography>

          {/* 🔹 Form Fields */}
          <Stack spacing={3}>
            <TextField
              label={t("title")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              label={t("content")}
              multiline
              minRows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            {/* 🔹 File Upload */}
            <Box>
              <Button
                component="label"
                variant="outlined"
                color="primary"
                startIcon={<AttachFile />}
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: "none",
                }}
              >
                {t("addAttachments")}
                <input type="file" hidden multiple onChange={handleFileChange} />
              </Button>

              {files.length > 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {t("filesSelected", { count: files.length })}
                </Typography>
              )}
            </Box>

            {/* 🔹 File List */}
            {files.length > 0 && (
              <Box
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  bgcolor: theme.palette.action.hover,
                  p: 1.5,
                  mt: -1,
                }}
              >
                {files.map((file, index) => (
                  <React.Fragment key={index}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ py: 0.5 }}
                    >
                      <Typography variant="body2">{file.name}</Typography>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => removeFile(index)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                    {index < files.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </Box>
            )}

            {/* 🔹 Submit Button */}
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={createNews.isLoading}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: `0 3px 10px ${theme.palette.primary.main}40`,
                }}
              >
                {createNews.isLoading ? t("posting") : t("postNews")}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
