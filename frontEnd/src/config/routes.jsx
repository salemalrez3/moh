// src/config/routes.js
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import ToolBar from "../components/shared/toolBar";
import FactCheckPage from "../pages/factCheckPage";
import StatisticsPage from "../pages/statisticsPage";

function AppLayout() {
  return (
    <>
      <ToolBar />
      <Outlet />
    </>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/fact-check" replace />,
      },
      {
        path: "fact-check",
        element: <FactCheckPage />,
      },
      {
        path: "statistics",
        element: <StatisticsPage />,
      },
    ],
  },

  {
    path: "*",
    element: <div className="not-found">Page Not Found</div>,
  },
]);
