import React, { useEffect, useRef } from "react";

import { useGetNews } from "../repository/news";
import NewsCard from "../components/newsPage/newsCard";
export default function NewsPage() {
  const limit = 10;
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetNews(limit);
  const items = data?.pages.flatMap((page) => page.news) ?? [];

  const loadMoreRef = useRef(null);

  useEffect(() => {
    if (!hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    const el = loadMoreRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
      observer.disconnect();
    };
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

  if (isLoading) return <div>Loading news…</div>;
  if (isError) return <div>Failed to load news</div>;

  return (
    <div>
      {items.map((n) => (
        <NewsCard key={n.id} news={n} />
      ))}

      <div ref={loadMoreRef} style={{ height: 1 }} />

      {isFetchingNextPage && <div>Loading more…</div>}
      {!hasNextPage && <div style={{ textAlign: "center", padding: 8 }}>No more news</div>}
    </div>
  );
}
