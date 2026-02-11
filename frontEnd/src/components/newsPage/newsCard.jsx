import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Chip,
  useTheme,
} from "@mui/material";
import OtherDisplayer from "../shared/otherDisplayer";
import ImageVidDisplayer from "../shared/imageVidDisplay";
import { useGetNewsAttachments } from "../../repository/newsAttachments";

export default function NewsCard({ news }) {
  const { data: attachments = [], isLoading } = useGetNewsAttachments(news.id);
  const theme = useTheme();

  return (
    <Card
      sx={{
        maxWidth: 800,
        mx: "auto",
        my: 5,
        borderRadius: 3,
        boxShadow: 4,
        bgcolor: theme.palette.background.paper,
        borderLeft: `6px solid ${theme.palette.secondary.main}`,
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        {/* 🔹 Category Chip */}
        {news.category && (
          <Chip
            label={news.category}
            color="primary"
            size="small"
            sx={{
              mb: 2,
              fontWeight: 600,
              bgcolor: theme.palette.primary.main,
              color: theme.palette.common.white,
            }}
          />
        )}

        {/* 🔹 Attachments */}
        {isLoading ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Loading attachments...
          </Typography>
        ) : (
          attachments.length > 0 && (
            <Box
              sx={{
                mt: 1,
                mb: 3,
                borderRadius: 2,
                overflow: "hidden",
                "& img, & video": {
                  borderRadius: 2,
                  width: "100%",
                  height: "auto",
                  mb: 1.5,
                },
              }}
            >
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
          )
        )}

        {/* 🔹 Title */}
        <Typography
          variant="h5"
          color="primary.main"
          fontWeight={700}
          sx={{ mb: 1.5, lineHeight: 1.3 }}
        >
          {news.title}
        </Typography>

        {/* 🔹 Date */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            mb: 2,
            display: "block",
            fontStyle: "italic",
            letterSpacing: 0.5,
          }}
        >
          {new Date(news.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </Typography>

        <Divider
          sx={{
            my: 2,
            borderColor: theme.palette.secondary.main,
            opacity: 0.6,
          }}
        />

        {/* 🔹 Content */}
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            lineHeight: 1.9,
            whiteSpace: "pre-line",
            fontSize: { xs: "0.95rem", sm: "1rem" },
          }}
        >
          {news.content}
        </Typography>
      </CardContent>
    </Card>
  );
}
