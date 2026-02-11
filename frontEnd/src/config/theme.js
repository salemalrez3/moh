// src/config/theme.js
import { createTheme } from "@mui/material/styles";

const getAppTheme = (mode) => {
  const isDark = mode === "dark";

  // Brand colors
  const darkGreen = "#0e6432";
  const darkerGreen = "#0a3e22";
  const midGreen = "#145a32";
  const gold = "#D4AF37";
  const goldBright = "#e3c95b";

  // Backgrounds tuned for readability
  const bgDark = "#0d1b13"; // lighter greenish black
  const bgPaperDark = "#16281e"; // card/paper background
  const bgLight = "beige";
  const bgPaperLight = "#ffffff";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? midGreen : darkGreen,
      },
      secondary: {
        main: gold,
      },
      background: {
        default: isDark ? bgDark : bgLight,
        paper: isDark ? bgPaperDark : bgPaperLight,
      },
      text: {
        primary: isDark ? "#f8f8f8" : "#1a1a1a", // brighter in dark
        secondary: isDark ? "#d1d1d1" : "#555555",
      },
      divider: isDark ? "rgba(212,175,55,0.25)" : "rgba(14,100,50,0.25)",
    },

    typography: {
      fontFamily: "'Poppins', 'Roboto', sans-serif",
      fontSize: 15,
      button: {
        fontWeight: 600,
        textTransform: "none",
      },
    },

    shape: { borderRadius: 10 },
    shadows: Array(25).fill("none"),

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? bgDark : bgLight,
            color: isDark ? "#f8f8f8" : "#1a1a1a",
            transition: "background-color 0.3s ease, color 0.3s ease",
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
            textTransform: "none",
            transition: "all 0.25s ease",
          },
          containedPrimary: {
            backgroundColor: isDark ? midGreen : darkGreen,
            color: "#fff",
            "&:hover": {
              backgroundColor: isDark ? darkerGreen : "#0b532a",
              transform: "translateY(-1px)",
            },
          },
          containedSecondary: {
            backgroundColor: gold,
            color: darkGreen,
            "&:hover": { backgroundColor: goldBright },
          },
          outlined: {
            borderWidth: 2,
            color: isDark ? goldBright : darkGreen,
            borderColor: isDark ? goldBright : darkGreen,
            "&:hover": {
              borderColor: gold,
              backgroundColor: isDark
                ? "rgba(212,175,55,0.15)"
                : "rgba(14,100,50,0.1)",
            },
          },
        },
        defaultProps: { disableRipple: true },
      },

      MuiAppBar: {
        styleOverrides: {
          colorPrimary: {
            backgroundColor: isDark ? darkerGreen : darkGreen,
            color: "#fff",
          },
        },
      },

      MuiTabs: {
        styleOverrides: {
          root: { minHeight: 48 },
          indicator: {
            backgroundColor: gold,
            height: 4,
            borderRadius: 2,
          },
        },
      },

      MuiTab: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            color: "#fff",
            "&.Mui-selected": { color: goldBright },
            "&:hover": { color: goldBright },
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            transition: "background-color 0.3s ease, color 0.3s ease",
          },
        },
      },
    },
  });
};

export default getAppTheme;
