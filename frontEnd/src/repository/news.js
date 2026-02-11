import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createNewsRequest, getNewsRequest } from "../services/news";


export function useGetNews(limit = 10) {
  return useInfiniteQuery({
    queryKey: ["news", limit],
    queryFn: ({ pageParam = undefined }) =>
      getNewsRequest({ pageParam, limit }),
    getNextPageParam: (lastPage) => {
      return lastPage?.nextCursor ?? undefined;
    },

    // optional sensible defaults:
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });
}
export function useCreateNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNewsRequest,
    // onSuccess: (newNews) => {
    //   queryClient.setQueryData(["news"], (old) => {
    //     if (!old) return old;
    //     return {
    //       ...old,
    //       pages: [
    //         {
    //           ...old.pages[0],
    //           results: [newNews, ...old.pages[0].results],
    //         },
    //         ...old.pages.slice(1),
    //       ],
    //     };
    //   });
    // },
  });
}
