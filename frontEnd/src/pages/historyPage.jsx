import React, { useState, useMemo } from "react";
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
  TextField,
  MenuItem,
  Pagination,
  InputAdornment,
  Fade,
  Grow,
  useTheme,
  useMediaQuery,
  Avatar,
  Tooltip,
  Stack,
  IconButton,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  HelpOutline,
  History,
  Search,
  FilterList,
  CalendarMonth,
  Clear,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useHistory } from "../repository/factCheck";

export default function HistoryPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Filter state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [verdict, setVerdict] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Build params, excluding empty values
  const params = useMemo(() => {
    const p = { page, limit };
    if (verdict) p.verdict = verdict;
    if (search) p.search = search;
    if (fromDate) p.from = fromDate;
    if (toDate) p.to = toDate;
    return p;
  }, [page, limit, verdict, search, fromDate, toDate]);

  const { data, isLoading, isError } = useHistory(params);

  const checks = data?.checks ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const clearFilters = () => {
    setVerdict("");
    setSearch("");
    setSearchInput("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const getVerdictChip = (v) => {
    const config = {
      true: { color: "success", icon: <CheckCircle sx={{ fontSize: isMobile ? 14 : 16 }} />, label: t("true") },
      false: { color: "error", icon: <Cancel sx={{ fontSize: isMobile ? 14 : 16 }} />, label: t("false") },
      mixed: { color: "warning", icon: <HelpOutline sx={{ fontSize: isMobile ? 14 : 16 }} />, label: t("mixed") },
    };
    const c = config[v?.toLowerCase()] || config.mixed;
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

  const hasFilters = verdict || search || fromDate || toDate;

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
          <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }} mb={1}>
            <History sx={{ fontSize: { xs: 24, sm: 36 } }} />
            <Typography variant={isMobile ? "h5" : "h4"} fontWeight={800}>
              {t("history")}
            </Typography>
          </Box>
          <Typography variant={isMobile ? "body2" : "body1"} sx={{ opacity: 0.9 }}>
            {t("historySubtitle")}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Filters */}
        <Card
          elevation={0}
          sx={{
            mb: { xs: 2, md: 3 },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: { xs: 2, md: 3 },
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <FilterList color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
              <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={700}>
                {t("filters")}
              </Typography>
              {hasFilters && (
                <Tooltip title={t("clearFilters")}>
                  <IconButton size="small" onClick={clearFilters} sx={{ ml: "auto" }}>
                    <Clear fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              flexWrap="wrap"
              useFlexGap
            >
              {/* Search */}
              <TextField
                size="small"
                placeholder={t("searchClaims")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: { xs: "100%", sm: 220 }, flex: { sm: 1 } }}
              />

              {/* Verdict filter */}
              <TextField
                select
                size="small"
                label={t("verdict")}
                value={verdict}
                onChange={(e) => { setVerdict(e.target.value); setPage(1); }}
                sx={{ minWidth: { xs: "100%", sm: 140 } }}
              >
                <MenuItem value="">{t("allVerdicts")}</MenuItem>
                <MenuItem value="true">{t("true")}</MenuItem>
                <MenuItem value="false">{t("false")}</MenuItem>
                <MenuItem value="mixed">{t("mixed")}</MenuItem>
                <MenuItem value="unverified">{t("unverified")}</MenuItem>
              </TextField>

              {/* Date from */}
              <TextField
                size="small"
                type="date"
                label={t("dateFrom")}
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: { xs: "100%", sm: 160 } }}
              />

              {/* Date to */}
              <TextField
                size="small"
                type="date"
                label={t("dateTo")}
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: { xs: "100%", sm: 160 } }}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Results count */}
        {!isLoading && !isError && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("showingResults", { count: total })}
          </Typography>
        )}

        {/* Loading */}
        {isLoading && (
          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="30vh" gap={2}>
            <CircularProgress size={48} thickness={4} />
            <Typography color="text.secondary">{t("loading")}</Typography>
          </Box>
        )}

        {/* Error */}
        {isError && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {t("errorLoadingHistory")}
          </Alert>
        )}

        {/* Results */}
        {!isLoading && !isError && (
          <>
            {isMobile ? (
              /* Mobile card layout */
              <Box>
                {checks.length > 0 ? (
                  checks.map((check, index) => (
                    <Fade in timeout={300 + index * 80} key={check.id}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          mb: 1.5,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 2,
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                          <Avatar
                            sx={{ width: 24, height: 24, fontSize: 11, bgcolor: "primary.main" }}
                          >
                            {(page - 1) * limit + index + 1}
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
                            mb: 1,
                          }}
                        >
                          {check.claim}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Typography variant="caption" color="text.secondary">
                            {t("confidence")}: {check.confidence != null ? `${Math.round(check.confidence * 100)}%` : "N/A"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t("sources")}: {check.sourceCount ?? 0}
                          </Typography>
                        </Box>
                      </Paper>
                    </Fade>
                  ))
                ) : (
                  <Box textAlign="center" py={6}>
                    <History sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
                    <Typography color="text.secondary">{t("noHistory")}</Typography>
                  </Box>
                )}
              </Box>
            ) : (
              /* Desktop table layout */
              <Card
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "action.hover" }}>
                        <TableCell sx={{ fontWeight: 700, py: 2, width: 50 }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 2 }}>{t("claim")}</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 2 }}>{t("verdict")}</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 2 }}>{t("confidence")}</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 2 }}>{t("sources")}</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 2 }}>{t("checkedAt")}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {checks.length > 0 ? (
                        checks.map((check, index) => (
                          <Fade in timeout={300 + index * 80} key={check.id}>
                            <TableRow hover sx={{ transition: "background-color 0.2s ease" }}>
                              <TableCell>
                                <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: "primary.main" }}>
                                  {(page - 1) * limit + index + 1}
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
                                <Typography variant="body2">
                                  {check.confidence != null ? `${Math.round(check.confidence * 100)}%` : "N/A"}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{check.sourceCount ?? 0}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {new Date(check.createdAt).toLocaleDateString()}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          </Fade>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <Box textAlign="center" py={6}>
                              <History sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
                              <Typography color="text.secondary">{t("noHistory")}</Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, v) => setPage(v)}
                  color="primary"
                  size={isMobile ? "small" : "medium"}
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
