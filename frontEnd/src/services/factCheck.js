import api from "../config/api";

/**
 * Verify a claim against the fact-checking API
 * @param {string} claim - The claim text to verify
 * @returns {Promise<{verdict: string, sources: Array<{url: string, title: string, snippet: string}>}>}
 */
export async function verifyClaimRequest(claim) {
  const res = await api.post("/fact-check/verify", { claim });
  return res.data;
}

/**
 * Get statistics from the fact-checking service
 * @returns {Promise<{totalChecks: number, trueCount: number, falseCount: number, mixedCount: number, topTopics: Array}>}
 */
export async function getStatisticsRequest() {
  const res = await api.get("/fact-check/statistics");
  return res.data;
}

/**
 * Get health status of the fact-checking service
 * @returns {Promise<{status: string, uptime: number, lastUpdated: string}>}
 */
export async function getHealthRequest() {
  const res = await api.get("/fact-check/health");
  return res.data;
}

/**
 * Get recent fact checks history
 * @param {number} limit - Number of recent checks to retrieve
 * @returns {Promise<Array<{id: string, claim: string, verdict: string, checkedAt: string}>>}
 */
export async function getRecentChecksRequest(limit = 10) {
  const res = await api.get("/fact-check/recent", { params: { limit } });
  return res.data;
}
