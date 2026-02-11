import { Outlet } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useGetSurveys } from "../repository/survey";
import { useGetNews } from "../repository/news";
import Survey from "../components/shared/survey";
import NewsCard from "../components/newsPage/newsCard";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

function SurveyPage() {
  const { t } = useTranslation();

  // 🔹 Fetch surveys for USER
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetSurveys("USER");

  // 🔹 Fetch only 1 latest news item
  const { data: latestNewsData, isLoading: latestLoading } = useGetNews(1);

  const loadMoreRef = useRef(null);

  // 🔹 Flatten all survey pages
  const surveys = data?.pages.flatMap((page) => page.surveys) ?? [];

  // 🔹 Extract latest news safely
  const latestNews = latestNewsData?.pages?.[0]?.news?.[0] || null;

  // 🔹 Infinite scroll observer
  useEffect(() => {
    if (!hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchNextPage();
      },
      { threshold: 1 }
    );

    const el = loadMoreRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasNextPage, fetchNextPage]);

  if (isLoading) return <p className="loading-message">{t("loading")}</p>;
  if (error) return <p className="error-message">{t("loadError")}</p>;

  // ✅ Same layout as ExpertsPage
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "250px",
        padding: "24px 16px",
      }}
    >
      {/* 🔹 News Section (Sticky Left) */}
      <div
        style={{
          width: "40%",
          position: "sticky",
          top: "24px",
          alignSelf: "flex-start",
          height: "85%",
        }}
      >
        <Typography color="primary" fontSize={20}>
          News
        </Typography>

        {latestLoading ? (
          <p>Loading latest news...</p>
        ) : latestNews ? (
          <NewsCard news={latestNews} />
        ) : (
          <p>No news available</p>
        )}
      </div>

      {/* 🔹 Surveys Section (Right) */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "600px",
          }}
        >
          <div className="survey-list-container">
            {surveys.map((survey, i) => (
              <Survey key={survey.id} survey={survey} i={i} />
            ))}
          </div>

          <div ref={loadMoreRef} style={{ height: "20px" }}>
            {isFetchingNextPage && <p>{t("loading")}</p>}
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default SurveyPage;
