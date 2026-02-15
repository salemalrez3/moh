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
