// src/config/routes.js
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import ToolBar from "../components/shared/toolBar";

import LoginPage from "../pages/loginPage";
import SurveyPage from "../pages/surveyPage";
import SurveyCreator from "../pages/surveyCreator";
import ExpertsPage from "../pages/expertsPage";
import CommentsPage from "../pages/commentsPage";
import NewsCreator from "../pages/newsCreator";
import NewsFeed from "../pages/newsPage";
import NewsPage from "../pages/newsPage";

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
