import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useGetResponses } from "../repository/response";
import CommentCard from "../components/commentPage/comment";
import { useEffect, useRef } from "react";
import CommentInput from "../components/commentPage/commentsInput";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Icon, IconButton } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
function CommentsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
const navigate = useNavigate();
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetResponses(id, true);

  const loadMoreRef = useRef(null);
  const comments = data?.pages.flatMap((page) => page.results ?? []) ?? [];

  useEffect(() => {
    if (!hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
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
  }, [hasNextPage, fetchNextPage]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading comments</div>;

  const handleNewComment = (newComment) => {
    queryClient.setQueryData(["responses", id], (old) => {
      if (!old) return old;

      return {
        ...old,
        pages: old.pages.map((page, i) =>
          i === 0
            ? {
                ...page,
                results: [newComment, ...page.results],
                pagination: {
                  ...page.pagination,
                  total: page.pagination.total + 1,
                },
              }
            : page
        ),
      };
    });
  };

  return (
    <div>
      <IconButton  onClick={() => navigate(-1)}>
   <ArrowBackIcon />
      </IconButton>
      <Button sx={{fontSize:"30px"}}></Button>
      {comments.map((comment) => (
        <CommentCard key={comment.id} comment={comment} />
      ))}

      <div ref={loadMoreRef} style={{ height: "20px" }}>
        {isFetchingNextPage && <p>Loading more...</p>}
      </div>

      <CommentInput surveyId={id} onSubmit={handleNewComment} />
      <Outlet />
    </div>
  );
}

export default CommentsPage;
