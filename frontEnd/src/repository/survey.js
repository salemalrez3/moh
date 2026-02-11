import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createSurveyRequest, getSurveysRequest } from "../services/survey";

export function useCreateSurvey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (newSurvey) => createSurveyRequest(newSurvey),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["surveys"] });
    },
  });
}

export function useGetSurveys(audience) {
  return useInfiniteQuery({
    queryKey: ["surveys", audience],
    queryFn: ({ pageParam = 1 }) => getSurveysRequest({ audience, pageParam }),
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasMore
        ? lastPage.pagination.page + 1
        : undefined;
    },
  });
}
