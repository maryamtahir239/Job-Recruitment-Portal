import { toast } from "react-toastify";

export function safeToastError(message, options) {
  // Normalize error message for comparison
  const msg = (typeof message === "string" ? message : (message?.error || message?.message || "")).toLowerCase();
  if (
    msg.includes("invalid credentials") ||
    msg.includes("unauthorized") ||
    msg.includes("not authenticated") ||
    msg.includes("token expired")
  ) {
    // Don't show toast for these auth errors
    return;
  }
  toast.error(message, options);
}