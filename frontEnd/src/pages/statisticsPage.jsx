import React, { useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Fade,
  Grow,
  useTheme,
  useMediaQuery,
  Avatar,
  Tooltip,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  HelpOutline,
  Assessment,
  TrendingUp,
  History,
  Analytics,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline,
  Speed,
  People,
  Gavel,
  CalendarMonth,
  ViewWeek,
  DateRange,
  ArrowUpward,
  ArrowDownward,
  Refresh,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import {
  useStatistics,
  useRecentChecks,
  useTopSources,
  useTrends,
} from "../repository/factCheck";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
} from "recharts";

/* ─── helpers ────────────────────────────────── */
const alpha = (hex, a) => {
  // simple hex to rgba
  if (!hex) return `rgba(0,0,0,${a})`;
  if (hex.startsWith("rgba") || hex.startsWith("rgb")) {
    return hex.replace(/[\d.]+\)$/, `${a})`);
  }
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (isNaN(r)) return `rgba(0,0,0,${a})`;
  return `rgba(${r},${g},${b},${a})`;
};

/* ═══════════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════════ */
function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    if (value == null) return;
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) {
      setDisplay(value);
      return;
    }
    let start = 0;
    const step = num / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= num) {
        setDisplay(num);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  if (typeof value === "string" && isNaN(parseFloat(value))) return value;
  return typeof display === "number" ? display.toLocaleString() : display;
}

/* ═══════════════════════════════════════════════
   STAT CARD – glassmorphism + pulse ring
   ═══════════════════════════════════════════════ */
function StatCard({ title, value, icon, color, subtitle, delay = 0 }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const c = theme.palette[color]?.main || color;

  return (
    <Grow in timeout={600 + delay}>
      <Card
        elevation={0}
        sx={{
          position: "relative",
          overflow: "visible",
          height: "100%",
          border: "1px solid",
          borderColor: alpha(c, 0.25),
          borderRadius: 4,
          background: `linear-gradient(135deg, ${alpha(c, 0.05)} 0%, ${theme.palette.background.paper} 100%)`,
          transition: "all 0.35s cubic-bezier(.4,0,.2,1)",
          "&:hover": {
            borderColor: c,
            transform: "translateY(-6px)",
            boxShadow: `0 12px 40px ${alpha(c, 0.18)}`,
          },
        }}
      >
        <Box
          sx={{
            height: 0,
            borderRadius: "0 0 0 0",
            background: `linear-gradient(90deg, ${c} 0%, ${theme.palette[color]?.light || c} 100%)`,
          }}
        />
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box display="flex" alignItems="flex-start" justifyContent="space-between">
            <Box flex={1}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ letterSpacing: 1.5, fontSize: { xs: 10, sm: 11 }, fontWeight: 600 }}
              >
                {title}
              </Typography>
              <Typography
                variant={isMobile ? "h4" : "h3"}
                fontWeight={900}
                sx={{ color: c, my: 0.5, lineHeight: 1.1 }}
              >
                <AnimatedNumber value={value} />
              </Typography>
              {subtitle && (
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: 11, sm: 12 } }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Box sx={{ position: "relative" }}>
              <Box
                sx={{
                  position: "absolute",
                  top: -4,
                  left: -4,
                  right: -4,
                  bottom: -4,
                  borderRadius: "50%",
                  border: `2px solid ${alpha(c, 0.15)}`,
                  animation: "pulseRing 2s ease-out infinite",
                  "@keyframes pulseRing": {
                    "0%": { transform: "scale(1)", opacity: 1 },
                    "100%": { transform: "scale(1.5)", opacity: 0 },
                  },
                }}
              />
              <Avatar
                sx={{
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  bgcolor: alpha(c, 0.12),
                  color: c,
                }}
              >
                {React.cloneElement(icon, { sx: { fontSize: isMobile ? 20 : 26 } })}
              </Avatar>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Grow>
  );
}

/* ═══════════════════════════════════════════════
   CUSTOM TOOLTIP (shared by all charts)
   ═══════════════════════════════════════════════ */
function ChartTooltip({ active, payload, label }) {
  const theme = useTheme();
  if (!active || !payload?.length) return null;
  return (
    <Paper
      elevation={8}
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.background.paper, 0.96),
        border: `1px solid ${theme.palette.divider}`,
        minWidth: 130,
      }}
    >
      {label && (
        <Typography variant="caption" fontWeight={700} color="text.primary">
          {label}
        </Typography>
      )}
      {payload.map((entry, i) => (
        <Box key={i} display="flex" alignItems="center" gap={1} mt={0.5}>
          <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: entry.color }} />
          <Typography variant="caption" color="text.secondary">
            {entry.name}: <strong>{entry.value}</strong>
          </Typography>
        </Box>
      ))}
    </Paper>
  );
}

/* ═══════════════════════════════════════════════
   DONUT CHART – Verdict Distribution
   ═══════════════════════════════════════════════ */
function VerdictDonutChart({ distribution }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const byVerdict = distribution?.byVerdict || [];
  const total = byVerdict.reduce((sum, v) => sum + v.count, 0) || 0;

  const verdictMeta = {
    true: { label: t("trueClaims"), color: theme.palette.success.main },
    false: { label: t("falseClaims"), color: theme.palette.error.main },
    mixed: { label: t("mixedClaims"), color: theme.palette.warning.main },
  };

  const chartData = byVerdict.map((v) => {
    const meta = verdictMeta[v.verdict?.toLowerCase()] || verdictMeta.mixed;
    return { name: meta.label, value: v.count, color: meta.color };
  });

  return (
    <Card elevation={0} sx={{ height: "100%", border: "1px solid", borderColor: "divider", borderRadius: 4 }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <PieChartIcon color="primary" />
          <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={700}>
            {t("verdictDistribution")}
          </Typography>
        </Box>
        {total === 0 ? (
          <Box textAlign="center" py={4}>
            <PieChartIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
            <Typography color="text.secondary">No data yet</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ width: "100%", height: isMobile ? 230 : 290, position: "relative" }}>
              {/* Center label overlay */}
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              >
                <Typography
                  variant={isMobile ? "h4" : "h3"}
                  fontWeight={900}
                  color="text.primary"
                  sx={{ lineHeight: 1 }}
                >
                  {total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t("totalChecks")}
                </Typography>
              </Box>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 55 : 78}
                    outerRadius={isMobile ? 88 : 115}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                    animationBegin={200}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  >
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box display="flex" flexWrap="wrap" justifyContent="center" gap={1} mt={1}>
              {chartData.map((item, i) => (
                <Chip
                  key={i}
                  size="small"
                  label={`${item.name}: ${item.value} (${Math.round((item.value / total) * 100)}%)`}
                  sx={{
                    fontWeight: 600, fontSize: 11,
                    bgcolor: alpha(item.color, 0.12),
                    color: item.color,
                    border: `1px solid ${alpha(item.color, 0.3)}`,
                  }}
                />
              ))}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════
   CONFIDENCE GAUGE (Radial Bar)
   ═══════════════════════════════════════════════ */
function ConfidenceGauge({ confidence }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const pct = confidence != null ? Math.round(confidence * 100) : 0;

  const gaugeColor =
    pct >= 75 ? theme.palette.success.main : pct >= 50 ? theme.palette.warning.main : theme.palette.error.main;

  const data = [{ name: "confidence", value: pct, fill: gaugeColor }];

  return (
    <Card elevation={0} sx={{ height: "100%", border: "1px solid", borderColor: "divider", borderRadius: 4 }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 }, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Box display="flex" alignItems="center" gap={1} mb={2} width="100%">
          <Speed color="primary" />
          <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={700}>
            {t("averageConfidence")}
          </Typography>
        </Box>
        <Box sx={{ width: "100%", height: isMobile ? 180 : 220, position: "relative" }}>
          <ResponsiveContainer>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="90%"
              barSize={isMobile ? 18 : 24}
              data={data}
              startAngle={210}
              endAngle={-30}
            >
              <RadialBar
                background={{ fill: alpha(theme.palette.text.primary, 0.06) }}
                clockWise
                dataKey="value"
                cornerRadius={12}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}
          >
            <Typography variant={isMobile ? "h4" : "h3"} fontWeight={900} sx={{ color: gaugeColor, lineHeight: 1 }}>
              {pct}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("confidence")}
            </Typography>
          </Box>
        </Box>
        <Chip
          label={pct >= 75 ? "Excellent" : pct >= 50 ? "Good" : "Low"}
          size="small"
          sx={{
            mt: 1,
            fontWeight: 700,
            bgcolor: alpha(gaugeColor, 0.12),
            color: gaugeColor,
            border: `1px solid ${alpha(gaugeColor, 0.3)}`,
          }}
        />
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════
   AREA CHART – Verification Trends Over Time
   ═══════════════════════════════════════════════ */
function TrendsAreaChart() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [groupBy, setGroupBy] = useState("day");
  const { data: trends, isLoading, refetch } = useTrends({ groupBy });

  const verdictColors = {
    True: theme.palette.success.main,
    False: theme.palette.error.main,
    Mixed: theme.palette.warning.main,
    true: theme.palette.success.main,
    false: theme.palette.error.main,
    mixed: theme.palette.warning.main,
  };

  const chartData = useMemo(() => {
    if (!trends?.length) return [];
    return trends.map((entry) => {
      const row = { period: entry.period, total: entry.total };
      Object.entries(entry.verdicts || {}).forEach(([key, val]) => {
        row[key] = val;
      });
      return row;
    });
  }, [trends]);

  const verdictKeys = useMemo(() => {
    const keys = new Set();
    chartData.forEach((row) => {
      Object.keys(row).forEach((k) => {
        if (k !== "period" && k !== "total") keys.add(k);
      });
    });
    return Array.from(keys);
  }, [chartData]);

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 4 }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Timeline color="primary" />
            <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={700}>
              {t("trends")}
            </Typography>
          </Box>
          <Box display="flex" gap={1} alignItems="center">
            <ToggleButtonGroup
              value={groupBy}
              exclusive
              onChange={(_, v) => v && setGroupBy(v)}
              size="small"
              sx={{
                "& .MuiToggleButton-root": {
                  px: { xs: 1, sm: 1.5 },
                  py: 0.3,
                  fontSize: { xs: 10, sm: 12 },
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: "8px !important",
                  border: "1px solid",
                  borderColor: "divider",
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": { bgcolor: "primary.dark" },
                  },
                },
              }}
            >
              <ToggleButton value="day">
                <CalendarMonth sx={{ fontSize: 14, mr: 0.5 }} /> Day
              </ToggleButton>
              <ToggleButton value="week">
                <ViewWeek sx={{ fontSize: 14, mr: 0.5 }} /> Week
              </ToggleButton>
              <ToggleButton value="month">
                <DateRange sx={{ fontSize: 14, mr: 0.5 }} /> Month
              </ToggleButton>
            </ToggleButtonGroup>
            <IconButton size="small" onClick={() => refetch()}>
              <Refresh sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={36} />
          </Box>
        ) : !chartData.length ? (
          <Box textAlign="center" py={4}>
            <Timeline sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
            <Typography color="text.secondary">{t("noTrendsYet")}</Typography>
          </Box>
        ) : (
          <Box sx={{ width: "100%", height: isMobile ? 260 : 340 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {verdictKeys.map((key) => (
                    <linearGradient key={key} id={`areaGrad-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={verdictColors[key] || theme.palette.grey[500]} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={verdictColors[key] || theme.palette.grey[500]} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: isMobile ? 10 : 12, fill: theme.palette.text.secondary }}
                  tickLine={false}
                  axisLine={{ stroke: theme.palette.divider }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <RechartsTooltip content={<ChartTooltip />} />
                {verdictKeys.map((key) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={t(key) || key}
                    stroke={verdictColors[key] || theme.palette.grey[500]}
                    strokeWidth={2.5}
                    fill={`url(#areaGrad-${key})`}
                    animationDuration={1200}
                    animationEasing="ease-out"
                    dot={{ r: 3, strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        )}

        {chartData.length > 0 && (
          <Box display="flex" flexWrap="wrap" justifyContent="center" gap={1.5} mt={2}>
            {verdictKeys.map((key) => (
              <Box key={key} display="flex" alignItems="center" gap={0.5}>
                <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: verdictColors[key] || theme.palette.grey[500] }} />
                <Typography variant="caption" fontWeight={600} sx={{ fontSize: { xs: 11, sm: 12 } }}>
                  {t(key) || key}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════
   HORIZONTAL BAR CHART – Top Sources
   ═══════════════════════════════════════════════ */
function TopSourcesBarChart() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { data: topSources, isLoading } = useTopSources(8);

  const chartData = useMemo(() => {
    if (!topSources?.length) return [];
    return topSources.slice(0, 8).map((src) => {
      let domain;
      try {
        domain = new URL(src.url).hostname.replace("www.", "");
      } catch {
        domain = src.title || src.url;
      }
      return {
        name: domain?.length > 22 ? domain.slice(0, 20) + "…" : domain,
        fullName: src.title || src.url,
        mentions: src.mentions,
        similarity: Math.round((src.avgSimilarity || 0) * 100),
        stance: src.exampleStance,
      };
    });
  }, [topSources]);

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 4 }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <BarChartIcon color="primary" />
          <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={700}>
            {t("topSources")}
          </Typography>
        </Box>

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={36} />
          </Box>
        ) : !chartData.length ? (
          <Box textAlign="center" py={4}>
            <BarChartIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
            <Typography color="text.secondary">{t("noTopSources")}</Typography>
          </Box>
        ) : (
          <Box sx={{ width: "100%", height: isMobile ? 280 : 350 }}>
            <ResponsiveContainer>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: isMobile ? 70 : 110, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={theme.palette.secondary.main} stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.4)} horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: isMobile ? 10 : 12, fill: theme.palette.text.secondary }}
                  tickLine={false}
                  axisLine={false}
                  width={isMobile ? 70 : 110}
                />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <Paper elevation={6} sx={{ p: 1.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="caption" fontWeight={700}>
                          {d.fullName}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {t("mentions")}: {d.mentions} &bull; Similarity: {d.similarity}%
                        </Typography>
                      </Paper>
                    );
                  }}
                />
                <Bar
                  dataKey="mentions"
                  fill="url(#barGrad)"
                  radius={[0, 8, 8, 0]}
                  animationDuration={1000}
                  animationEasing="ease-out"
                  barSize={isMobile ? 16 : 22}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════
   SOURCE STANCE PIE
   ═══════════════════════════════════════════════ */
function SourceStancePie({ distribution }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const byStance = distribution?.bySourceStance || [];

  const stanceMeta = {
    support: { label: t("support"), color: theme.palette.success.main },
    contradict: { label: t("contradict"), color: theme.palette.error.main },
    neutral: { label: t("neutral"), color: theme.palette.grey[500] },
  };

  const chartData = byStance.map((s) => {
    const meta = stanceMeta[s.stance?.toLowerCase()] || { label: s.stance, color: theme.palette.grey[400] };
    return { name: meta.label, value: s.count, color: meta.color };
  });

  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <Card elevation={0} sx={{ height: "100%", border: "1px solid", borderColor: "divider", borderRadius: 4 }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <TrendingUp color="primary" />
          <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={700}>
            {t("topTopics")}
          </Typography>
        </Box>
        {total === 0 ? (
          <Box textAlign="center" py={4}>
            <TrendingUp sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
            <Typography color="text.secondary">{t("noTopicsYet")}</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ width: "100%", height: isMobile ? 200 : 240 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={isMobile ? 70 : 90}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                    animationBegin={400}
                    animationDuration={1000}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box display="flex" flexWrap="wrap" justifyContent="center" gap={1} mt={1}>
              {chartData.map((item, i) => (
                <Chip
                  key={i}
                  size="small"
                  label={`${item.name}: ${item.value}`}
                  sx={{
                    fontWeight: 600,
                    fontSize: 11,
                    bgcolor: alpha(item.color, 0.12),
                    color: item.color,
                    border: `1px solid ${alpha(item.color, 0.3)}`,
                  }}
                />
              ))}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════
   RECENT CHECKS TABLE
   ═══════════════════════════════════════════════ */
function RecentChecksTable({ checks }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const getVerdictChip = (verdict) => {
    const config = {
      true: { color: "success", icon: <CheckCircle sx={{ fontSize: 14 }} />, label: t("true") },
      false: { color: "error", icon: <Cancel sx={{ fontSize: 14 }} />, label: t("false") },
      mixed: { color: "warning", icon: <HelpOutline sx={{ fontSize: 14 }} />, label: t("mixed") },
    };
    const c = config[verdict?.toLowerCase()] || config.mixed;
    return (
      <Chip label={c.label} color={c.color} size="small" icon={c.icon} sx={{ fontWeight: 600, minWidth: 90, fontSize: 12 }} />
    );
  };

  if (isMobile) {
    return (
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 4 }}>
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
            {checks.map((check, index) => (
              <Fade in timeout={300 + index * 100} key={check.id || index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                    transition: "all 0.2s ease",
                    "&:hover": { borderColor: "primary.main" },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: 11, bgcolor: "primary.main" }}>
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
            <Typography variant="body2" color="text.secondary">
              {t("noRecentChecks")}
            </Typography>
          </Box>
        )}
      </Card>
    );
  }

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 4, overflow: "hidden" }}>
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
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
              <TableCell sx={{ fontWeight: 700, py: 2 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 2 }}>{t("claim")}</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 2 }}>{t("verdict")}</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 2 }}>{t("confidence")}</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 2 }}>{t("checkedAt")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {checks?.map((check, index) => (
              <Fade in timeout={300 + index * 100} key={check.id || index}>
                <TableRow
                  hover
                  sx={{
                    transition: "background-color 0.2s ease",
                    "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                  }}
                >
                  <TableCell>
                    <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: "primary.main" }}>
                      {index + 1}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={check.claim} arrow>
                      <Typography
                        variant="body2"
                        sx={{ maxWidth: 350, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {check.claim}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{getVerdictChip(check.verdict)}</TableCell>
                  <TableCell>
                    {check.confidence != null ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 40,
                            height: 6,
                            borderRadius: 3,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              width: `${Math.round(check.confidence * 100)}%`,
                              height: "100%",
                              borderRadius: 3,
                              bgcolor:
                                check.confidence >= 0.75
                                  ? "success.main"
                                  : check.confidence >= 0.5
                                  ? "warning.main"
                                  : "error.main",
                            }}
                          />
                        </Box>
                        <Typography variant="caption" fontWeight={600}>
                          {Math.round(check.confidence * 100)}%
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>
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

/* ═══════════════════════════════════════════════
   HERO SPARKLINE
   ═══════════════════════════════════════════════ */
function ActivitySparkline() {
  const { data: trends } = useTrends({ groupBy: "day" });

  const data = useMemo(() => {
    if (!trends?.length) return [];
    return trends.slice(-14).map((t) => ({ p: t.period, v: t.total }));
  }, [trends]);

  if (!data.length) return null;

  return (
    <Box sx={{ width: 200, height: 60, opacity: 0.85 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#fff" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke="#fff" strokeWidth={2} fill="url(#sparkGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   ★  MAIN PAGE
   ═══════════════════════════════════════════════ */
export default function StatisticsPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { data: stats, isLoading: statsLoading, isError: statsError } = useStatistics();
  const { data: recentChecks, isLoading: recentLoading } = useRecentChecks();

  /* ── Loading skeleton ── */
  if (statsLoading) {
    return (
      <Box sx={{ minHeight: "100vh" }}>
        <Skeleton variant="rectangular" height={isMobile ? 120 : 180} />
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, mt: 3 }}>
          <Box display="grid" gridTemplateColumns={{ xs: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={2} mb={3}>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="rounded" height={140} sx={{ borderRadius: 4 }} />
            ))}
          </Box>
          <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 0.7fr 1fr" }} gap={2} mb={3}>
            <Skeleton variant="rounded" height={340} sx={{ borderRadius: 4 }} />
            <Skeleton variant="rounded" height={340} sx={{ borderRadius: 4 }} />
            <Skeleton variant="rounded" height={340} sx={{ borderRadius: 4 }} />
          </Box>
          <Skeleton variant="rounded" height={360} sx={{ borderRadius: 4, mb: 3 }} />
          <Skeleton variant="rounded" height={300} sx={{ borderRadius: 4 }} />
        </Container>
      </Box>
    );
  }

  if (statsError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {t("errorLoadingStatistics")}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", pb: { xs: 10, md: 8 } }}>
      {/* ═══ HERO ═══ */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(135deg, ${theme.palette.primary.dark || theme.palette.primary.main} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.secondary.main} 180%)`,
          color: "white",
          py: { xs: 3, sm: 4, md: 6 },
          mb: { xs: 2, md: 4 },
        }}
      >
        {/* decorative circles */}
        <Box
          sx={{
            position: "absolute",
            top: -80,
            right: -60,
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -50,
            left: "25%",
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, position: "relative", zIndex: 1 }}>
          <Box
            display="flex"
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            flexDirection={{ xs: "column", sm: "row" }}
            gap={2}
          >
            <Box>
              <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }} mb={1}>
                <Analytics sx={{ fontSize: { xs: 28, sm: 40 } }} />
                <Typography variant={isMobile ? "h5" : "h4"} fontWeight={900} sx={{ letterSpacing: -0.5 }}>
                  {t("statistics")}
                </Typography>
              </Box>
              <Typography variant={isMobile ? "body2" : "body1"} sx={{ opacity: 0.85, maxWidth: 500 }}>
                {t("statisticsSubtitle")}
              </Typography>
            </Box>
            {!isMobile && <ActivitySparkline />}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* ═══ STAT CARDS ═══ */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
            gap: { xs: 1.5, sm: 2, md: 3 },
            mb: { xs: 3, md: 4 },
          }}
        >
          <StatCard
            title={t("totalChecks")}
            value={stats?.mainStats?.totalChecks || 0}
            icon={<Assessment />}
            color="primary"
            subtitle={t("allTimeTotal")}
            delay={0}
          />
          <StatCard
            title={t("totalUsers")}
            value={stats?.mainStats?.totalUsers || 0}
            icon={<People />}
            color="success"
            subtitle={t("verifiedTrue")}
            delay={100}
          />
          <StatCard
            title={t("averageConfidence")}
            value={
              stats?.mainStats?.averageConfidence != null
                ? `${Math.round(stats.mainStats.averageConfidence * 100)}%`
                : "N/A"
            }
            icon={<Speed />}
            color="warning"
            subtitle={t("confidence")}
            delay={200}
          />
          <StatCard
            title={t("mostCommonVerdict")}
            value={stats?.mainStats?.mostCommonVerdict || "N/A"}
            icon={<Gavel />}
            color="error"
            subtitle={t("partiallyTrue")}
            delay={300}
          />
        </Box>

        {/* ═══ CHARTS ROW 1: Donut + Gauge + Stance Pie ═══ */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 0.7fr 1fr" },
            gap: { xs: 1.5, sm: 2, md: 3 },
            mb: { xs: 3, md: 4 },
          }}
        >
          <VerdictDonutChart distribution={stats?.distribution} />
          <ConfidenceGauge confidence={stats?.mainStats?.averageConfidence} />
          <SourceStancePie distribution={stats?.distribution} />
        </Box>

        {/* ═══ TRENDS AREA CHART (full width) ═══ */}
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <TrendsAreaChart />
        </Box>

        {/* ═══ TOP SOURCES BAR CHART ═══ */}
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <TopSourcesBarChart />
        </Box>

        {/* ═══ RECENT CHECKS ═══ */}
        {recentLoading ? (
          <Skeleton variant="rounded" height={300} sx={{ borderRadius: 4 }} />
        ) : (
          <RecentChecksTable checks={recentChecks} />
        )}

        {/* ═══ FOOTER ═══ */}
        <Paper
          elevation={0}
          sx={{
            mt: { xs: 3, md: 4 },
            p: { xs: 2, sm: 3 },
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.secondary.main, 0.04)} 100%)`,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 4,
            textAlign: "center",
          }}
        >
          <Timeline sx={{ fontSize: { xs: 28, sm: 36 }, color: "primary.main", mb: 1 }} />
          <Typography variant={isMobile ? "body2" : "subtitle2"} fontWeight={700} gutterBottom>
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
