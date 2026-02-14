import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  verifyClaimRequest,
  getStatisticsRequest,
  getHealthRequest,
  getRecentChecksRequest,
} from "../services/factCheck";

// Set to true to use mock data for testing
const USE_MOCK_DATA = true;

// ============ MOCK DATA FOR TESTING ============
const mockStatistics = {
  totalChecks: 1247,
  trueCount: 523,
  falseCount: 412,
  mixedCount: 312,
  topTopics: [
    { name: "Health", count: 234 },
    { name: "Politics", count: 189 },
    { name: "Science", count: 156 },
    { name: "Technology", count: 134 },
    { name: "Economy", count: 98 },
    { name: "Environment", count: 87 },
  ],
};

const mockHealth = {
  status: "healthy",
  uptime: 99.98,
  lastUpdated: new Date().toISOString(),
};

const mockRecentChecks = [
  {
    id: "1",
    claim: "Drinking 8 glasses of water daily is necessary for good health",
    verdict: "mixed",
    checkedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "2",
    claim: "The Great Wall of China is visible from space with the naked eye",
    verdict: "false",
    checkedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "3",
    claim: "Honey never spoils and can last thousands of years",
    verdict: "true",
    checkedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "4",
    claim: "Humans only use 10% of their brain capacity",
    verdict: "false",
    checkedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: "5",
    claim: "Lightning never strikes the same place twice",
    verdict: "false",
    checkedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: "6",
    claim: "Vitamin C prevents the common cold",
    verdict: "mixed",
    checkedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "7",
    claim: "Coffee stunts your growth",
    verdict: "false",
    checkedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    id: "8",
    claim: "Reading in dim light damages your eyesight permanently",
    verdict: "false",
    checkedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "9",
    claim: "Exercise releases endorphins that improve mood",
    verdict: "true",
    checkedAt: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(),
  },
  {
    id: "10",
    claim: "Sugar causes hyperactivity in children",
    verdict: "false",
    checkedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

const mockVerifyResponse = (claim) => {
  const verdicts = ["true", "false", "mixed", "Unverified"];
  const stances = ["support", "contradict", "neutral"];
  
  return {
    verdict: verdicts[Math.floor(Math.random() * verdicts.length)],
    confidence: 0.3 + Math.random() * 0.6,
    analysis_summary: `${Math.floor(Math.random() * 3)} sources show strong similarity to the claim.`,
    sources: [
      {
        title: "The latest COVID vaccines come with new FDA limits",
        url: "https://www.npr.org/sections/shots-health-news/2025/08/27/nx-s1-5515503/fda-covid-vaccines-restricted",
        stance: stances[Math.floor(Math.random() * stances.length)],
        similarity_score: 0.4 + Math.random() * 0.5,
      },
      {
        title: "Under RFK Jr., COVID shots will only be available to people 65+",
        url: "https://arstechnica.com/health/2025/05/under-anti-vaccine-advocate-rfk-jr-fda-to-limit-access-to-covid-19-shots/",
        stance: stances[Math.floor(Math.random() * stances.length)],
        similarity_score: 0.2 + Math.random() * 0.4,
      },
      {
        title: "FDA restricts access to COVID vaccines for healthy adults and kids",
        url: "https://nypost.com/2025/08/27/us-news/fda-restricts-access-to-covid-vaccines-for-healthy-adults-and-kids/",
        stance: stances[Math.floor(Math.random() * stances.length)],
        similarity_score: 0.3 + Math.random() * 0.4,
      },
      {
        title: "Expert Explains FDA's New COVID Vaccine Rules in The US",
        url: "https://www.sciencealert.com/expert-explains-fdas-new-covid-vaccine-rules-in-the-us",
        stance: stances[Math.floor(Math.random() * stances.length)],
        similarity_score: 0.2 + Math.random() * 0.3,
      },
    ],
    checkedAt: new Date().toISOString(),
  };
};

// Helper to simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ============ END MOCK DATA ============

/**
 * Hook to verify a claim
 */
export function useVerifyClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (claim) => {
      if (USE_MOCK_DATA) {
        await delay(1500); // Simulate API delay
        return mockVerifyResponse(claim);
      }
      return verifyClaimRequest(claim);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["factCheck", "statistics"] });
      queryClient.invalidateQueries({ queryKey: ["factCheck", "recent"] });
    },
  });
}

/**
 * Hook to get fact-checking statistics
 */
export function useStatistics() {
  return useQuery({
    queryKey: ["factCheck", "statistics"],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await delay(800);
        return mockStatistics;
      }
      return getStatisticsRequest();
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get service health status
 */
export function useHealth() {
  return useQuery({
    queryKey: ["factCheck", "health"],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await delay(300);
        return mockHealth;
      }
      return getHealthRequest();
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
}

/**
 * Hook to get recent fact checks
 */
export function useRecentChecks(limit = 10) {
  return useQuery({
    queryKey: ["factCheck", "recent", limit],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await delay(600);
        return mockRecentChecks.slice(0, limit);
      }
      return getRecentChecksRequest(limit);
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });
}
