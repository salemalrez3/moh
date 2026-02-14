// src/config/routes.js
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import ProtectedRoute from "../components/shared/protectedRoutes";
import ToolBar from "../components/shared/toolBar";

import LoginPage from "../pages/loginPage";
import SurveyPage from "../pages/surveyPage";
import SurveyCreator from "../pages/surveyCreator";
import ExpertsPage from "../pages/expertsPage";
import CommentsPage from "../pages/commentsPage";
import NewsCreator from "../pages/newsCreator";
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
    element: <div></div>,
  },

  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <LoginPage mode="register" />,
  },

  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/comments/:id",
        element: <CommentsPage />,
      },
      {
        path: "/surveys",
        element: <SurveyPage />,
      },
      {
        path: "/surveyCreator",
        element: <SurveyCreator />,
      },
      {
        path: "/expertsPage",
        element: <ExpertsPage />,
      },
      {
        path: "/news",
        element: <NewsPage />,
      },
      {
        path: "/newsCreator",
        element: <NewsCreator></NewsCreator>
      }
    ],
  },

  {
    path: "*",
    element: <div className="not-found">Page Not Found</div>,
  },
]);
