import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  getResponsesRequest,
  createResponseRequest,
} from "../services/responses";


// export function useGetResponses(surveyId, enabled) {
//   return useQuery({
//     queryKey: ["responses", surveyId],
//     queryFn: () => getResponsesRequest(surveyId),
//     enabled: !!surveyId && enabled,
//     retry: 2,
//   });
// }

export function useCreateResponse(surveyId) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (newResponse) => createResponseRequest(surveyId, newResponse),
    onSuccess: () => {
     // qc.invalidateQueries({ queryKey: ["responses", surveyId] });
     
    },
  });
}
export function useGetResponses(surveyId, enabled = true) {
  return useInfiniteQuery({
    queryKey: ["responses", surveyId],
    queryFn: ({ pageParam = 1 }) =>
      getResponsesRequest({ surveyId, pageParam }),
    getNextPageParam: (lastPage) => {
      return lastPage?.pagination?.hasMore
        ? lastPage.pagination.page + 1
        : undefined;
    },
    enabled: !!surveyId && enabled,
    refetchOnWindowFocus: false,
  });
}
