import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Fade,
  Grow,
  useTheme,
  useMediaQuery,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  HelpOutline,
  Assessment,
  TrendingUp,
  History,
  Analytics,
  BarChart,
  PieChart,
  Timeline,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useStatistics, useRecentChecks } from "../repository/factCheck";

function StatCard({ title, value, icon, color, subtitle, delay = 0 }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  return (
    <Grow in timeout={500 + delay}>
      <Card
        elevation={0}
        sx={{
          height: "100%",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: { xs: 2, md: 3 },
          overflow: "hidden",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: `${color}.main`,
            transform: { xs: "none", sm: "translateY(-4px)" },
          },
        }}
      >
        <Box
          sx={{
            height: 4,
            background: `linear-gradient(90deg, ${theme.palette[color]?.main || color} 0%, ${theme.palette[color]?.light || color} 100%)`,
          }}
        />
        <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Box display="flex" alignItems="flex-start" justifyContent="space-between">
            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ letterSpacing: 1.2, fontSize: { xs: 10, sm: 11 } }}
              >
                {title}
              </Typography>
              <Typography
                variant={isMobile ? "h4" : "h3"}
                fontWeight={800}
                color={`${color}.main`}
                sx={{ my: { xs: 0.5, sm: 1 } }}
              >
                {value?.toLocaleString() || 0}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: 12, sm: 14 } }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                p: { xs: 1, sm: 1.5 },
                bgcolor: `${color}.main`,
                borderRadius: 2,
                color: "white",
                display: "flex",
              }}
            >
              {React.cloneElement(icon, { sx: { fontSize: isMobile ? 20 : 24 } })}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Grow>
  );
}

function VerdictDistribution({ distribution }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const byVerdict = distribution?.byVerdict || [];
  const total = byVerdict.reduce((sum, v) => sum + v.count, 0) || 1;

  const verdictStyles = {
    true: { label: t("trueClaims"), color: "success", icon: <CheckCircle fontSize="small" />, gradient: "linear-gradient(90deg, #43a047 0%, #66bb6a 100%)" },
    false: { label: t("falseClaims"), color: "error", icon: <Cancel fontSize="small" />, gradient: "linear-gradient(90deg, #e53935 0%, #ef5350 100%)" },
    mixed: { label: t("mixedClaims"), color: "warning", icon: <HelpOutline fontSize="small" />, gradient: "linear-gradient(90deg, #fb8c00 0%, #ffa726 100%)" },
  };

  const items = byVerdict.map((v) => {
    const style = verdictStyles[v.verdict?.toLowerCase()] || verdictStyles.mixed;
    return { ...style, value: v.count };
  });

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: { xs: 2, md: 3 },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Box display="flex" alignItems="center" gap={1} mb={{ xs: 2, sm: 3 }}>
          <PieChart color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
          <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={700}>
            {t("verdictDistribution")}
          </Typography>
        </Box>
        {items.map((item, index) => (
          <Grow in timeout={600 + index * 150} key={item.label}>
            <Box mb={{ xs: 2, sm: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 1.5 }}>
                  <Avatar
                    sx={{
                      width: { xs: 22, sm: 28 },
                      height: { xs: 22, sm: 28 },
                      bgcolor: `${item.color}.main`,
                    }}
                  >
                    {React.cloneElement(item.icon, { sx: { fontSize: isMobile ? 12 : 16 } })}
                  </Avatar>
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: 12, sm: 14 } }}>
                    {item.label}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant={isMobile ? "body2" : "body1"} fontWeight={700}>
                    {item.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {Math.round((item.value / total) * 100)}%
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(item.value / total) * 100}
                sx={{
                  height: { xs: 6, sm: 10 },
                  borderRadius: 5,
                  bgcolor: "action.hover",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 5,
                    background: item.gradient,
                  },
                }}
              />
            </Box>
          </Grow>
        ))}
      </CardContent>
    </Card>
  );
}

function RecentChecksTable({ checks }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const getVerdictChip = (verdict) => {
    const config = {
      true: { color: "success", icon: <CheckCircle sx={{ fontSize: isMobile ? 14 : 16 }} />, label: t("true") },
      false: { color: "error", icon: <Cancel sx={{ fontSize: isMobile ? 14 : 16 }} />, label: t("false") },
      mixed: { color: "warning", icon: <HelpOutline sx={{ fontSize: isMobile ? 14 : 16 }} />, label: t("mixed") },
    };
    const c = config[verdict?.toLowerCase()] || config.mixed;
    return (
      <Chip
        label={c.label}
        color={c.color}
        size="small"
        icon={c.icon}
        sx={{ fontWeight: 600, minWidth: { xs: 70, sm: 90 }, fontSize: { xs: 11, sm: 13 } }}
      />
    );
  };

  // Mobile card-based layout
  if (isMobile) {
    return (
      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <History color="primary" sx={{ fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight={700}>
              {t("recentChecks")}
            </Typography>
          </Box>
        </Box>
        {checks?.length > 0 ? (
          <Box sx={{ px: 2, pb: 2 }}>
            {checks?.map((check, index) => (
              <Fade in timeout={300 + index * 100} key={check.id || index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    "&:last-child": { mb: 0 },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                    <Avatar
                      sx={{
                        width: 24,
                        height: 24,
                        fontSize: 11,
                        bgcolor: "primary.main",
                      }}
                    >
                      {index + 1}
                    </Avatar>
                    {getVerdictChip(check.verdict)}
                    <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
                      {new Date(check.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {check.claim}
                  </Typography>
                </Paper>
              </Fade>
            ))}
          </Box>
        ) : (
          <Box textAlign="center" py={4}>
            <History sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
            <Typography variant="body2" color="text.secondary">{t("noRecentChecks")}</Typography>
          </Box>
        )}
      </Card>
    );
  }

  // Desktop table layout
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 3, pb: 0 }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <History color="primary" />
          <Typography variant="h6" fontWeight={700}>
            {t("recentChecks")}
          </Typography>
        </Box>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "action.hover" }}>
              <TableCell sx={{ fontWeight: 700, py: 2 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 2 }}>{t("claim")}</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 2 }}>{t("verdict")}</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 2 }}>{t("checkedAt")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {checks?.map((check, index) => (
              <Fade in timeout={300 + index * 100} key={check.id || index}>
                <TableRow
                  hover
                  sx={{
                    "&:hover": { bgcolor: "action.hover" },
                    transition: "background-color 0.2s ease",
                  }}
                >
                  <TableCell>
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        fontSize: 12,
                        bgcolor: "primary.main",
                      }}
                    >
                      {index + 1}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={check.claim}>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 350,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {check.claim}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{getVerdictChip(check.verdict)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(check.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              </Fade>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {(!checks || checks.length === 0) && (
        <Box textAlign="center" py={6}>
          <History sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
          <Typography color="text.secondary">{t("noRecentChecks")}</Typography>
        </Box>
      )}
    </Card>
  );
}

function TopTopics({ topics }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!topics || topics.length === 0) {
    return (
      <Card
        elevation={0}
        sx={{
          height: "100%",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: { xs: 2, md: 3 },
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <TrendingUp color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
            <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={700}>
              {t("topTopics")}
            </Typography>
          </Box>
          <Box textAlign="center" py={{ xs: 2, sm: 4 }}>
            <TrendingUp sx={{ fontSize: { xs: 36, sm: 48 }, color: "text.disabled", mb: { xs: 1, sm: 2 } }} />
            <Typography color="text.secondary" variant={isMobile ? "body2" : "body1"}>{t("noTopicsYet")}</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: { xs: 2, md: 3 },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Box display="flex" alignItems="center" gap={1} mb={{ xs: 2, sm: 3 }}>
          <TrendingUp color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
          <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={700}>
            {t("topTopics")}
          </Typography>
        </Box>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {topics.map((topic, index) => (
            <Grow in timeout={400 + index * 100} key={index}>
              <Chip
                label={`${topic.stance || topic.name} (${topic.count})`}
                size={isMobile ? "small" : "medium"}
                sx={{
                  fontWeight: 500,
                  bgcolor: "primary.main",
                  color: "white",
                  fontSize: { xs: 11, sm: 13 },
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              />
            </Grow>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

export default function StatisticsPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { data: stats, isLoading: statsLoading, isError: statsError } = useStatistics();
  const { data: recentChecks, isLoading: recentLoading } = useRecentChecks();

  if (statsLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        gap={2}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography color="text.secondary">{t("loadingStatistics")}</Typography>
      </Box>
    );
  }

  if (statsError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {t("errorLoadingStatistics")}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", pb: { xs: 10, md: 8 } }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark || theme.palette.primary.main} 100%)`,
          color: "white",
          py: { xs: 3, sm: 4, md: 6 },
          mb: { xs: 2, md: 4 },
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box 
            display="flex" 
            alignItems={{ xs: "flex-start", sm: "center" }} 
            justifyContent="space-between" 
            flexDirection={{ xs: "column", sm: "row" }}
            gap={2}
          >
            <Box>
              <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }} mb={1}>
                <Analytics sx={{ fontSize: { xs: 24, sm: 36 } }} />
                <Typography variant={isMobile ? "h5" : "h4"} fontWeight={800}>
                  {t("statistics")}
                </Typography>
              </Box>
              <Typography variant={isMobile ? "body2" : "body1"} sx={{ opacity: 0.9 }}>
                {t("statisticsSubtitle")}
              </Typography>
            </Box>

          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Main Stats Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
            gap: { xs: 1.5, sm: 2, md: 3 },
            mb: { xs: 2, md: 4 },
          }}
        >
          <StatCard
            title={t("totalChecks")}
            value={stats?.mainStats?.totalChecks}
            icon={<Assessment />}
            color="primary"
            subtitle={t("allTimeTotal")}
            delay={0}
          />
          <StatCard
            title={t("totalUsers")}
            value={stats?.mainStats?.totalUsers}
            icon={<CheckCircle />}
            color="success"
            subtitle={t("verifiedTrue")}
            delay={100}
          />
          <StatCard
            title={t("confidence")}
            value={stats?.mainStats?.averageConfidence != null ? `${Math.round(stats.mainStats.averageConfidence * 100)}%` : "N/A"}
            icon={<Cancel />}
            color="error"
            subtitle={t("averageConfidence") || "Average confidence"}
            delay={200}
          />
          <StatCard
            title={t("mostCommonVerdict") || "Most Common"}
            value={stats?.mainStats?.mostCommonVerdict || "N/A"}
            icon={<HelpOutline />}
            color="warning"
            subtitle={t("partiallyTrue")}
            delay={300}
          />
        </Box>

        {/* Distribution & Topics */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: { xs: 1.5, sm: 2, md: 3 },
            mb: { xs: 2, md: 4 },
          }}
        >
          <VerdictDistribution distribution={stats?.distribution} />
          <TopTopics topics={stats?.distribution?.bySourceStance} />
        </Box>

        {/* Recent Checks */}
        {recentLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <RecentChecksTable checks={recentChecks} />
        )}

        {/* Footer Note */}
        <Paper
          elevation={0}
          sx={{
            mt: { xs: 2, md: 4 },
            p: { xs: 2, sm: 3 },
            bgcolor: "action.hover",
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <Timeline sx={{ fontSize: { xs: 24, sm: 32 }, color: "primary.main", mb: 1 }} />
          <Typography variant={isMobile ? "body2" : "subtitle2"} fontWeight={600} gutterBottom>
            {t("dataUpdates")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: 12, sm: 14 } }}>
            {t("dataUpdatesDesc")}
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
