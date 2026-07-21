import { api } from "./api/client";

// Real per-user counts + a merged recent-activity feed — see
// backend/src/modules/profile/profile.controller.js.
export async function fetchProfileSummary() {
  const { data } = await api.get("/api/profile/summary");
  return data;
}

export function formatActivityDate(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
