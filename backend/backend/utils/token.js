// backend/backend/utils/token.js
import crypto from "crypto";

export function generateInviteToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashInviteToken(token);
  return { token, tokenHash };
}

export function hashInviteToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
