import {
  Tabs,
  Tab,
  Box,
  Button,
  Typography,
  useMediaQuery,
  Stack,
  IconButton,
  Tooltip,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";
import { DarkMode, LightMode, VerifiedUser, Language, FactCheck, BarChart } from "@mui/icons-material";
import { ThemeModeContext } from "../../config/themeConfig";
export default function ToolBar({  }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
const { mode, toggleColorMode } = useContext(ThemeModeContext);
  const darkGreen = theme?.palette?.primary?.main ?? "#0e6432";
  const gold = theme?.palette?.secondary?.main ?? "#D4AF37";
  const textOnDark = theme?.palette?.getContrastText
    ? theme.palette.getContrastText(darkGreen)
    : "#fff";

  const toggleLang = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
  };

  const tabs = useMemo(
    () => [
      { label: t("factChecker"), path: "/fact-check", icon: <FactCheck /> },
      { label: t("statistics"), path: "/statistics", icon: <BarChart /> },
    ],
    [t]
  );

  const currentTab = tabs.findIndex(
    (tab) => pathname === tab.path || pathname.startsWith(tab.path + "/")
  );
  const value = currentTab === -1 ? false : currentTab;

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1400,
        bgcolor: darkGreen,
        color: textOnDark,
        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
        px: { xs: 2, sm: 4 },
        py: { xs: 1.5, sm: 1.5 },
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        {/* Left: Brand */}
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <VerifiedUser sx={{ fontSize: 22, color: gold }} />
          </Box>
          <Typography
            variant={isSm ? "subtitle1" : "h6"}
            sx={{ fontWeight: 700, color: "white", letterSpacing: 0.3 }}
            aria-label="app-name"
          >
            {t("appName")}
          </Typography>
        </Box>

        {/* Center: Tabs */}
        {!isSm ? (
          <Tabs
            value={value}
            aria-label="navigation tabs"
            textColor="inherit"
            TabIndicatorProps={{
              style: {
                backgroundColor: gold,
                height: 4,
                borderRadius: 2,
              },
            }}
            sx={{
              minHeight: 48,
              "& .MuiTab-root": {
                color: textOnDark,
                fontWeight: 600,
                textTransform: "none",
                px: 1.5,
                "&.Mui-selected": { color: gold },
                "&:hover": { color: gold, opacity: 0.95 },
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab key={index} label={tab.label} component={Link} to={tab.path} />
            ))}
          </Tabs>
        ) : (
          <Box sx={{ flex: 1 }} />
        )}

        {/* Right: Controls (Lang + Theme toggle) */}
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Language Button */}
          <Tooltip title={i18n.language === "en" ? "العربية" : "English"}>
            <IconButton
              onClick={toggleLang}
              sx={{
                color: "white",
                bgcolor: "rgba(255,255,255,0.1)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
              }}
              aria-label="toggle-language"
            >
              <Language />
            </IconButton>
          </Tooltip>

          {/* Dark/Light Mode Button */}
          <Tooltip title={theme.palette.mode === "light" ? t("dark") : t("light")}>
            <IconButton
              onClick={toggleColorMode}
              sx={{
                color: "white",
                bgcolor: "rgba(255,255,255,0.1)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
              }}
              aria-label="toggle-theme"
            >
              {theme.palette.mode === "light" ? <DarkMode /> : <LightMode />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Mobile Bottom Navigation */}
      {isSm && (
        <Paper
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1300,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
          elevation={8}
        >
          <BottomNavigation
            value={value}
            onChange={(event, newValue) => {
              navigate(tabs[newValue].path);
            }}
            showLabels
            sx={{
              bgcolor: "background.paper",
              "& .MuiBottomNavigationAction-root": {
                color: "text.secondary",
                "&.Mui-selected": {
                  color: "primary.main",
                },
              },
            }}
          >
            {tabs.map((tab, index) => (
              <BottomNavigationAction
                key={index}
                label={tab.label}
                icon={tab.icon}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
