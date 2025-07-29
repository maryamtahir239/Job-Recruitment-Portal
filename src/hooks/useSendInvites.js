import axios from "axios";

/**
 * Simple function (no React Query)
 * payload: { candidateIds:[], expiryDays?, expiryDate?, message? }
 */
export async function sendInvites(payload) {
  try {
    const { data } = await axios.post("/api/invites/bulk", payload);
    return data;
  } catch (error) {
    throw error;
  }
}
