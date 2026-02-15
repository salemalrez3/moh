import api from "../config/api";

/**
 * Verify a claim against the backend /verify endpoint
 * @param {string} claim - The claim text to verify
 * @returns {Promise<{id, verdict, confidence, analysis_summary, sources[]}>}
 */
export async function verifyClaimRequest(claim) {
  const res = await api.post("/verify", { claim });
  return res.data;
}

/**
 * Get statistics + recent checks from the backend /stats endpoint
 * @returns {Promise<{mainStats, distribution, recentChecks[]}>}
 */
export async function getStatsRequest() {
  const res = await api.get("/stats");
  return res.data;
}

/**
 * Get paginated claim check history for the current user
 * @param {{ page?: number, limit?: number, verdict?: string, from?: string, to?: string, search?: string }} params
 * @returns {Promise<{ page, limit, total, checks: Array<{ id, claim, verdict, confidence, sourceCount, createdAt }> }>}
 */
export async function getHistoryRequest(params = {}) {
  const res = await api.get("/verify/history", { params });
  return res.data;
}

/**
 * Get top sources across all verified claims
 * @param {number} limit
 * @returns {Promise<Array<{ title, url, mentions, avgSimilarity, exampleStance }>>}
 */
export async function getTopSourcesRequest(limit = 20) {
  const res = await api.get("/verify/top", { params: { limit } });
  return res.data;
}

/**
 * Get verdict trends over time for the current user
 * @param {{ groupBy?: 'day'|'week'|'month', from?: string, to?: string }} params
 * @returns {Promise<Array<{ period, total, verdicts: Record<string, number> }>>}
 */
export async function getTrendsRequest(params = {}) {
  const res = await api.get("/verify/trends", { params });
  return res.data;
}
