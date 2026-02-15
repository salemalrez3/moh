import React from "react";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useTranslation } from "react-i18next";
import { RouterProvider } from "react-router-dom";
import { router } from "./config/routes";
import ThemeContextProvider from "./config/themeConfig";
export default function App() {
  const { i18n } = useTranslation();
  const direction = i18n.language === "ar" ? "rtl" : "ltr";

  const cacheRtl = React.useMemo(
    () =>
      createCache({
        key: direction === "rtl" ? "mui-rtl" : "mui",
        stylisPlugins: direction === "rtl" ? [rtlPlugin] : [],
      }),
    [direction]
  );

  React.useEffect(() => {
    document.documentElement.dir = direction;
  }, [direction]);

  return (
    <CacheProvider value={cacheRtl}>
      <ThemeContextProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <RouterProvider router={router} />
        </LocalizationProvider>
      </ThemeContextProvider>
    </CacheProvider>
  );
}
