  import { Outlet } from "react-router-dom";
  import { useEffect, useRef } from "react";
  import { useGetSurveys } from "../repository/survey";
  import { useGetNews } from "../repository/news";
  import Survey from "../components/shared/survey";
  import Post from "../components/expertsPage/post";
  import NewsCard from "../components/newsPage/newsCard";
import { Typography } from "@mui/material";

  function ExpertsPage() {
    // 🔹 Fetch surveys
    const {
      data,
      isLoading,
      error,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
    } = useGetSurveys("EXPERT");

    const { data: latestNewsData, isLoading: latestLoading } = useGetNews(1);

    const loadMoreRef = useRef(null);

    const surveys = data?.pages.flatMap((page) => page.surveys) ?? [];

    const latestNews = latestNewsData?.pages[0].news[0] || null;
    console.log(latestNews);
    
    useEffect(() => {
      if (!hasNextPage) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            fetchNextPage();
          }
        },
        { threshold: 1 }
      );

      const el = loadMoreRef.current;
      if (el) observer.observe(el);

      return () => {
        if (el) observer.unobserve(el);
      };
    }, [hasNextPage, fetchNextPage]);

 return (
  <div style={{ display: 'flex', flexDirection: 'row', gap: '250px', padding: '24px 16px' }}>
    {/* NewsCard - Always on top on mobile, left on desktop */}
    <div style={{ 
      width: '40%', 
      position: 'sticky',
      top: '24px',
      alignSelf: 'flex-start',
      height:"85%"
    }}>
      <Typography color="primary" fontSize={20}>News</Typography>
      {latestLoading ? (
        <p>Loading latest news...</p>
      ) : latestNews ? (
        <NewsCard news={latestNews} />
      ) : (
        <p>No news available</p>
      )}
    </div>
    
    {/* Posts and Surveys - Centered */}
    <div style={{ 
      width: '100%', 
      display: 'flex', 
      justifyContent: '' 
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '600px'  // Control post width here
      }}>
        <div className="survey-list-container">
          {surveys.map((survey, i) => {
            if (survey.contentType === "SURVEY") {
              return (
                <Survey
                  key={survey.id}
                  survey={survey}
                  isLoading={isLoading}
                  error={error}
                  i={i}
                />
              );
            } else if (survey.contentType === "POST") {
              return (
                <Post
                  key={survey.id}
                  survey={survey}
                  isLoading={isLoading}
                  error={error}
                  i={i}
                />
              );
            }
            return null;
          })}
        </div>

        <div ref={loadMoreRef} style={{ height: "20px" }}>
          {isFetchingNextPage && <p>Loading more...</p>}
        </div>

        <Outlet />
      </div>
    </div>
  </div>
);
  };
  export default ExpertsPage;
