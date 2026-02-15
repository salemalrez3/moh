import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  verifyClaimRequest,
  getStatsRequest,
  getHistoryRequest,
  getTopSourcesRequest,
  getTrendsRequest,
} from "../services/factCheck";

/**
 * Hook to verify a claim via POST /verify
 */
export function useVerifyClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (claim) => verifyClaimRequest(claim),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["trends"] });
      queryClient.invalidateQueries({ queryKey: ["topSources"] });
    },
  });
}

/**
 * Hook to get statistics + recent checks from GET /stats
 * Returns { mainStats, distribution, recentChecks }
 */
export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: getStatsRequest,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}

// Convenience aliases used by pages
export function useStatistics() {
  const query = useStats();
  return {
    ...query,
    data: query.data ?? null,
  };
}

export function useRecentChecks() {
  const query = useStats();
  return {
    ...query,
    data: query.data?.recentChecks ?? [],
  };
}

/**
 * Hook to get paginated user history from GET /history
 * @param {{ page?: number, limit?: number, verdict?: string, from?: string, to?: string, search?: string }} params
 */
export function useHistory(params = {}) {
  return useQuery({
    queryKey: ["history", params],
    queryFn: () => getHistoryRequest(params),
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
}

/**
 * Hook to get top sources from GET /top
 * @param {number} limit
 */
export function useTopSources(limit = 20) {
  return useQuery({
    queryKey: ["topSources", limit],
    queryFn: () => getTopSourcesRequest(limit),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get verdict trends from GET /trends
 * @param {{ groupBy?: string, from?: string, to?: string }} params
 */
export function useTrends(params = {}) {
  return useQuery({
    queryKey: ["trends", params],
    queryFn: () => getTrendsRequest(params),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}
