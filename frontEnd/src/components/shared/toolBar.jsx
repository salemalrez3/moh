import {
  Tabs,
  Tab,
  Box,
  Button,
  Typography,
  useMediaQuery,
  Stack,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";
import { DarkMode, LightMode } from "@mui/icons-material";
import { ThemeModeContext } from "../../config/themeConfig";
export default function ToolBar({  }) {
  const { pathname } = useLocation();
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
      { label: t("surveys"), path: "/surveys" },
      { label: t("funFact"), path: "/fun-fact" },
      { label: t("news"), path: "/news" },
      { label: t("surveyCreator"), path: "/surveyCreator" },
      { label: t("newsCreator"), path: "/newsCreator" },
      { label: t("expertPage"), path: "/expertsPage" },
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
        boxShadow: "0 3px 14px rgba(0,0,0,0.18)",
        px: { xs: 2, sm: 4 },
        py: { xs: 1, sm: 1.25 },
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        {/* Left: Brand */}
        <Typography
          variant={isSm ? "subtitle1" : "h6"}
          sx={{ fontWeight: 700, color: gold, letterSpacing: 0.4 }}
          aria-label="app-name"
        >
          {t("damascusVision")}
        </Typography>

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
        <Stack direction="row" spacing={1.5} alignItems="center">
          {/* Language Button */}
          <Button
            onClick={toggleLang}
            variant="contained"
            size="small"
            sx={{
              backgroundColor: gold,
              color: darkGreen,
              fontWeight: 700,
              textTransform: "none",
              borderRadius: 2,
              px: 2,
              boxShadow: "none",
              "&:hover": { backgroundColor: "#e2b22e" },
            }}
            aria-label="toggle-language"
          >
            {i18n.language === "en" ? t("arabic") : t("english")}
          </Button>

          {/* Dark/Light Mode Button */}
          <Button
            onClick={toggleColorMode}
            variant="outlined"
            size="small"
            sx={{
              color: gold,
              borderColor: gold,
              borderRadius: 2,
              px: 2,
              "&:hover": { borderColor: gold, bgcolor: "rgba(212,175,55,0.15)" },
            }}
            aria-label="toggle-theme"
          >
            {theme.palette.mode === "light" ? (
              <>
                <DarkMode sx={{ fontSize: 18, mr: 0.5 }} />
                {t("dark")}
              </>
            ) : (
              <>
                <LightMode sx={{ fontSize: 18, mr: 0.5 }} />
                {t("light")}
              </>
            )}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
