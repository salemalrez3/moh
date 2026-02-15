import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { verifyClaimRequest, getStatsRequest } from "../services/factCheck";

/**
 * Hook to verify a claim via POST /verify
 */
export function useVerifyClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (claim) => verifyClaimRequest(claim),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
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
