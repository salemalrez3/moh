import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Link,
  Fade,
  Grow,
  IconButton,
  Tooltip,
  LinearProgress,
  Avatar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Search,
  CheckCircle,
  Cancel,
  HelpOutline,
  OpenInNew,
  VerifiedUser,
  ContentCopy,
  Refresh,
  School,
  Science,
  Psychology,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useVerifyClaim, useHealth } from "../repository/factCheck";

const verdictConfig = {
  true: {
    color: "success",
    icon: <CheckCircle sx={{ fontSize: { xs: 24, sm: 32 } }} />,
    gradient: "linear-gradient(135deg, #43a047 0%, #66bb6a 100%)",
    bgColor: "rgba(67, 160, 71, 0.08)",
    label: "Verified True",
  },
  false: {
    color: "error",
    icon: <Cancel sx={{ fontSize: { xs: 24, sm: 32 } }} />,
    gradient: "linear-gradient(135deg, #e53935 0%, #ef5350 100%)",
    bgColor: "rgba(229, 57, 53, 0.08)",
    label: "Verified False",
  },
  mixed: {
    color: "warning",
    icon: <HelpOutline sx={{ fontSize: { xs: 24, sm: 32 } }} />,
    gradient: "linear-gradient(135deg, #fb8c00 0%, #ffa726 100%)",
    bgColor: "rgba(251, 140, 0, 0.08)",
    label: "Partially True",
  },
  unverified: {
    color: "default",
    icon: <HelpOutline sx={{ fontSize: { xs: 24, sm: 32 } }} />,
    gradient: "linear-gradient(135deg, #757575 0%, #9e9e9e 100%)",
    bgColor: "rgba(117, 117, 117, 0.08)",
    label: "Unverified",
  },
};

const stanceConfig = {
  support: {
    color: "success",
    label: "Supports",
    icon: <CheckCircle sx={{ fontSize: 16 }} />,
  },
  contradict: {
    color: "error",
    label: "Contradicts",
    icon: <Cancel sx={{ fontSize: 16 }} />,
  },
  neutral: {
    color: "default",
    label: "Neutral",
    icon: <HelpOutline sx={{ fontSize: 16 }} />,
  },
};

function SourceCard({ source, index, t }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const stance = stanceConfig[source.stance?.toLowerCase()] || stanceConfig.neutral;
  const similarityPercent = Math.round((source.similarity_score || 0) * 100);

  const getDomainFromUrl = (url) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  const getBorderColor = () => {
    switch (source.stance?.toLowerCase()) {
      case "support": return "success.main";
      case "contradict": return "error.main";
      default: return "divider";
    }
  };

  return (
    <Grow in timeout={300 + index * 100}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: 2,
          border: "1px solid",
          borderLeft: 4,
          borderColor: "divider",
          borderLeftColor: getBorderColor(),
          borderRadius: 2,
          transition: "all 0.2s ease",
          "&:hover": {
            transform: { xs: "none", sm: "translateX(4px)" },
            boxShadow: theme.shadows[2],
          },
        }}
      >
        <Box display="flex" gap={{ xs: 1.5, sm: 2 }} alignItems="flex-start">
          {!isMobile && (
            <Avatar
              sx={{
                bgcolor: "primary.main",
                width: 36,
                height: 36,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {index + 1}
            </Avatar>
          )}
          <Box flex={1} minWidth={0}>
            <Typography 
              variant={isMobile ? "body2" : "subtitle1"} 
              fontWeight={600} 
              gutterBottom
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {isMobile && `${index + 1}. `}{source.title || getDomainFromUrl(source.url)}
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
              <Chip
                label={getDomainFromUrl(source.url)}
                size="small"
                variant="outlined"
                sx={{ fontSize: { xs: 10, sm: 11 }, height: { xs: 22, sm: 24 } }}
              />
              <Chip
                icon={stance.icon}
                label={t(source.stance?.toLowerCase()) || stance.label}
                size="small"
                color={stance.color}
                sx={{ fontWeight: 600, fontSize: { xs: 10, sm: 11 }, height: { xs: 22, sm: 24 } }}
              />
              <Chip
                label={`${similarityPercent}%`}
                size="small"
                variant="outlined"
                color={similarityPercent > 50 ? "primary" : "default"}
                sx={{ fontSize: { xs: 10, sm: 11 }, height: { xs: 22, sm: 24 } }}
              />
            </Box>
            {/* Similarity bar */}
            <Box sx={{ mt: 1 }}>
              <LinearProgress
                variant="determinate"
                value={similarityPercent}
                sx={{
                  height: { xs: 4, sm: 6 },
                  borderRadius: 3,
                  bgcolor: "action.hover",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 3,
                    bgcolor: similarityPercent > 50 ? "primary.main" : "text.disabled",
                  },
                }}
              />
            </Box>
          </Box>
          <Tooltip title={t("openSource")}>
            <IconButton
              size="small"
              component={Link}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ bgcolor: "action.hover", flexShrink: 0 }}
            >
              <OpenInNew fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
    </Grow>
  );
}

function VerdictDisplay({ verdict, claim, confidence, t }) {
  const config = verdictConfig[verdict?.toLowerCase()] || verdictConfig.unverified;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Fade in timeout={500}>
      <Card
        elevation={0}
        sx={{
          mb: { xs: 3, sm: 4 },
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: { xs: 2, sm: 3 },
        }}
      >
        {/* Verdict Header */}
        <Box
          sx={{
            background: config.gradient,
            p: { xs: 2, sm: 3 },
            color: "white",
          }}
        >
          <Box display="flex" alignItems="center" gap={{ xs: 1.5, sm: 2 }}>
            {config.icon}
            <Box>
              <Typography 
                variant="overline" 
                sx={{ opacity: 0.9, letterSpacing: 1.5, fontSize: { xs: 10, sm: 12 } }}
              >
                {t("verdict")}
              </Typography>
              <Typography variant={isMobile ? "h5" : "h4"} fontWeight={700}>
                {t(verdict?.toLowerCase()) || config.label}
              </Typography>
            </Box>
          </Box>
        </Box>

        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Claim */}
          <Box mb={{ xs: 2, sm: 3 }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ letterSpacing: 1.2, fontSize: { xs: 10, sm: 12 } }}
            >
              {t("claimChecked")}
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2 },
                mt: 1,
                bgcolor: "action.hover",
                borderRadius: 2,
                borderLeft: 4,
                borderColor: "primary.main",
              }}
            >
              <Typography
                variant={isMobile ? "body2" : "body1"}
                sx={{ fontStyle: "italic", lineHeight: 1.7 }}
              >
                "{claim}"
              </Typography>
            </Paper>
          </Box>

          {/* Confidence Score */}
          {confidence && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {t("confidence")}
                </Typography>
                <Typography variant={isMobile ? "body1" : "h6"} fontWeight={700} color="primary">
                  {Math.round(confidence * 100)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={confidence * 100}
                sx={{
                  height: { xs: 6, sm: 8 },
                  borderRadius: 4,
                  bgcolor: "action.hover",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                    background: config.gradient,
                  },
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Fade>
  );
}

function FeatureCard({ icon, title, description }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        textAlign: "center",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: "primary.main",
          transform: { xs: "none", sm: "translateY(-4px)" },
        },
      }}
    >
      <Box
        sx={{
          width: { xs: 44, sm: 56 },
          height: { xs: 44, sm: 56 },
          borderRadius: 2,
          bgcolor: "primary.main",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: { xs: 1.5, sm: 2 },
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: isMobile ? 22 : 28 } })}
      </Box>
      <Typography variant={isMobile ? "body1" : "subtitle1"} fontWeight={600} gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Paper>
  );
}

export default function FactCheckPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [claim, setClaim] = useState("");
  const [result, setResult] = useState(null);

  const { mutate: verifyClaim, isPending, isError, error, reset } = useVerifyClaim();
  const { data: health } = useHealth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!claim.trim()) return;

    verifyClaim(claim, {
      onSuccess: (data) => {
        setResult({ ...data, claim });
      },
    });
  };

  const handleClear = () => {
    setClaim("");
    setResult(null);
    reset();
  };

  const handleCopyResult = () => {
    if (result) {
      const text = `Claim: ${result.claim}\nVerdict: ${result.verdict}\nConfidence: ${Math.round((result.confidence || 0) * 100)}%`;
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", pb: { xs: 10, md: 8 } }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark || theme.palette.primary.main} 100%)`,
          color: "white",
          py: { xs: 4, sm: 6, md: 8 },
          mb: { xs: 3, md: 4 },
        }}
      >
        <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box textAlign="center">
            <Box
              sx={{
                width: { xs: 60, sm: 80 },
                height: { xs: 60, sm: 80 },
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: { xs: 2, sm: 3 },
              }}
            >
              <VerifiedUser sx={{ fontSize: { xs: 32, sm: 44 } }} />
            </Box>
            <Typography
              variant={isMobile ? "h4" : "h3"}
              fontWeight={800}
              gutterBottom
              sx={{ letterSpacing: -0.5 }}
            >
              {t("factChecker")}
            </Typography>
            <Typography
              variant={isMobile ? "body1" : "h6"}
              sx={{ opacity: 0.9, maxWidth: 500, mx: "auto", fontWeight: 400, px: { xs: 1, sm: 0 } }}
            >
              {t("factCheckerSubtitle")}
            </Typography>
            {health && (
              <Chip
                icon={<Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: health.status === "healthy" ? "#4caf50" : "#ff9800", ml: 1 }} />}
                label={`API ${health.status === "healthy" ? "Online" : "Offline"}`}
                sx={{
                  mt: { xs: 2, sm: 3 },
                  bgcolor: "rgba(255,255,255,0.15)",
                  color: "white",
                  fontWeight: 500,
                }}
              />
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Search Form */}
        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            mb: { xs: 3, md: 4 },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: { xs: 2, md: 3 },
          }}
        >
          <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={600} gutterBottom>
            {t("enterClaim")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("claimInputHelper")}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={isMobile ? 3 : 4}
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            placeholder={t("claimPlaceholder")}
            variant="outlined"
            sx={{
              mb: { xs: 2, sm: 3 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                fontSize: { xs: "0.95rem", sm: "1rem" },
              },
            }}
            disabled={isPending}
          />
          <Box 
            display="flex" 
            flexDirection={{ xs: "column", sm: "row" }}
            gap={{ xs: 1.5, sm: 2 }}
          >
            <Button
              type="submit"
              variant="contained"
              size={isMobile ? "medium" : "large"}
              fullWidth={isMobile}
              startIcon={
                isPending ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Search />
                )
              }
              disabled={!claim.trim() || isPending}
              sx={{
                flex: { sm: 1 },
                py: { xs: 1.25, sm: 1.5 },
                borderRadius: 2,
                fontWeight: 600,
                fontSize: { xs: 14, sm: 16 },
              }}
            >
              {isPending ? t("checking") : t("checkClaim")}
            </Button>
            <Button
              variant="outlined"
              size={isMobile ? "medium" : "large"}
              fullWidth={isMobile}
              onClick={handleClear}
              disabled={isPending}
              startIcon={<Refresh />}
              sx={{ borderRadius: 2, px: { sm: 3 } }}
            >
              {t("clear")}
            </Button>
          </Box>
        </Paper>

        {/* Error Alert */}
        {isError && (
          <Fade in>
            <Alert
              severity="error"
              sx={{ mb: 4, borderRadius: 2 }}
              onClose={() => reset()}
            >
              {error?.response?.data?.message || t("errorChecking")}
            </Alert>
          </Fade>
        )}

        {/* Results */}
        {result && (
          <Box>
            <Box 
              display="flex" 
              flexDirection={{ xs: "column", sm: "row" }}
              justifyContent="space-between" 
              alignItems={{ xs: "flex-start", sm: "center" }} 
              mb={2}
              gap={1}
            >
              <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
                {t("analysisResults")}
              </Typography>
              <Tooltip title={t("copyResult")}>
                <IconButton onClick={handleCopyResult} size={isMobile ? "small" : "medium"}>
                  <ContentCopy />
                </IconButton>
              </Tooltip>
            </Box>

            <VerdictDisplay
              verdict={result.verdict}
              claim={result.claim}
              confidence={result.confidence}
              t={t}
            />

            {/* Analysis Summary */}
            {result.analysis_summary && (
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  mb: { xs: 3, md: 4 },
                  bgcolor: "action.hover",
                  borderRadius: 2,
                  borderLeft: 4,
                  borderColor: "primary.main",
                }}
              >
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  {t("analysisSummary")}
                </Typography>
                <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary">
                  {result.analysis_summary}
                </Typography>
              </Paper>
            )}

            {/* Sources */}
            {result.sources && result.sources.length > 0 && (
              <Box mb={{ xs: 3, md: 4 }}>
                <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={600} gutterBottom>
                  {t("sources")} ({result.sources.length})
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t("sourcesDescription")}
                </Typography>
                {result.sources.map((source, index) => (
                  <SourceCard key={index} source={source} index={index} t={t} />
                ))}
              </Box>
            )}

            {/* Metadata */}
            {result.checkedAt && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: "action.hover",
                  borderRadius: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {t("checkedAt")}
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {new Date(result.checkedAt).toLocaleString()}
                </Typography>
              </Paper>
            )}
          </Box>
        )}

        {/* Features Section - Show when no result */}
        {!result && (
          <Fade in timeout={800}>
            <Box>
              <Typography
                variant="h5"
                fontWeight={700}
                textAlign="center"
                gutterBottom
                sx={{ mb: 4 }}
              >
                {t("howItWorks")}
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                  gap: 3,
                }}
              >
                <FeatureCard
                  icon={<Psychology />}
                  title={t("aiAnalysis")}
                  description={t("aiAnalysisDesc")}
                />
                <FeatureCard
                  icon={<Science />}
                  title={t("sourceVerification")}
                  description={t("sourceVerificationDesc")}
                />
                <FeatureCard
                  icon={<School />}
                  title={t("academicRigor")}
                  description={t("academicRigorDesc")}
                />
              </Box>

              {/* Academic Disclaimer */}
              <Paper
                elevation={0}
                sx={{
                  mt: 6,
                  p: 3,
                  bgcolor: "action.hover",
                  borderRadius: 2,
                  textAlign: "center",
                }}
              >
                <School sx={{ fontSize: 32, color: "primary.main", mb: 1 }} />
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  {t("academicProject")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("academicDisclaimer")}
                </Typography>
              </Paper>
            </Box>
          </Fade>
        )}
      </Container>
    </Box>
  );
}
