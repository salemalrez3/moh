import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCreateResponse } from "../../repository/response";
import {
  Card,
  Typography,
  Box,
  Button,
  TextField,
  IconButton,
  useTheme,
} from "@mui/material";
import CommentIcon from "@mui/icons-material/Comment";
import { useNavigate } from "react-router-dom";
import { useGetAttachments } from "../../repository/attachment";
import ImageVidDisplayer from "../shared/imageVidDisplay";
import OtherDisplayer from "../shared/otherDisplayer";

function Post({ survey, isLoading, error }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const theme = useTheme(); // Access your dark green/gold theme

  const dir = i18n.language === "ar" ? "rtl" : "ltr";
  const createResponse = useCreateResponse(survey?.id);
  const closeDate = new Date(survey?.closedAt || null);
  const [responses, setResponses] = useState("");

  const { data: attachments = [], isLoading: isLoadingAtt } = useGetAttachments(
    survey?.id
  );

  if (isLoading) return <Typography>{t("loading")}</Typography>;
  if (error) return <Typography color="error">{t("loadError")}</Typography>;

  const handleTextChange = (event) => setResponses(event.target.value);

  const isFormValid = () => responses.trim() !== "";

  const handleSubmit = () => {
    if (!survey?.id || !isFormValid()) {
      alert(t("pleaseFillRequired", { field: "" }));
      return;
    }

    createResponse.mutate(
      { data: { "0-0": responses } },
      { onSuccess: () => setResponses("") }
    );
  };

  const closeDateStr = closeDate.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Box dir={dir} sx={{ p: 2,}}>
      <Card
        sx={{
          p: 3,
          mb: 3,
          borderRadius:"30px 0px 30px 0px" ,
          boxShadow: 4,
          bgcolor: theme.palette.background.paper,
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: 6,
            transform: "translateY(-2px)",
          },
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          color="primary.main"
          sx={{ fontWeight: 700 }}
        >
          {survey.title}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            mb: 2,
            fontWeight: 600,
            color:
              closeDate.getTime() > Date.now()
                ? theme.palette.success.main
                : theme.palette.error.main,
          }}
        >
          {t("closesOn")}: {closeDateStr}
        </Typography>

        {attachments.length > 0 && (
          <Box sx={{ mt: 2, mb: 3 }}>
            <ImageVidDisplayer
              attachments={attachments.filter(
                (a) =>
                  a.mimeType?.startsWith("image/") ||
                  a.mimeType?.startsWith("video/")
              )}
            />
            <OtherDisplayer
              attachments={attachments.filter(
                (a) =>
                  !a.mimeType?.startsWith("image/") &&
                  !a.mimeType?.startsWith("video/")
              )}
            />
          </Box>
        )}

        <TextField
          fullWidth
          variant="outlined"
          //placeholder={t("writeSomething")}
          value={responses}
          onChange={handleTextChange}
          disabled={closeDate.getTime() <= Date.now()}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              bgcolor: theme.palette.background.default,
            },
          }}
        />

        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={createResponse.isLoading || !isFormValid()}
            sx={{
              px: 4,
              py: 1,
              fontWeight: 600,
              borderRadius: 2,
            }}
          >
            {createResponse.isLoading ? t("submitting") : t("submit")}
          </Button>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <IconButton
            onClick={() => navigate(`/comments/${survey.id}`)}
            sx={{
              bgcolor: theme.palette.secondary.main,
              color: "white",
              width: 40,
              height: 40,
              "&:hover": {
                bgcolor: theme.palette.secondary.dark,
              },
            }}
          >
            <CommentIcon />
          </IconButton>
        </Box>
      </Card>
    </Box>
  );
}

export default Post;
