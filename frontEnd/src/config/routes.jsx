// src/config/routes.js
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import ToolBar from "../components/shared/toolBar";
import ProtectedRoute from "../components/shared/protectedRoutes";
import FactCheckPage from "../pages/factCheckPage";
import StatisticsPage from "../pages/statisticsPage";
import HistoryPage from "../pages/historyPage";
import LoginPage from "../pages/loginPage";
import RegisterPage from "../pages/registerPage";

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
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
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
      {
        path: "history",
        element: <HistoryPage />,
      },
    ],
  },

  {
    path: "*",
    element: <div className="not-found">Page Not Found</div>,
  },
]);
