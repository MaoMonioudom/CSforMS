import { api } from "./api/client";

// Fire-and-forget — a missed pageview beacon shouldn't ever surface an
// error to a real visitor, so failures are swallowed silently here.
export function recordPageView(path) {
  api.post("/api/analytics/pageview", { path }).catch(() => {});
}

// { date: "2026-07-20", count: 12 } per day, oldest first — raw timestamps
// come back from the backend and get bucketed here, same "fetch raw,
// aggregate client-side" pattern the rest of AdminDashboard's charts use.
export async function fetchDailyPageViews(days = 30) {
  const { data } = await api.get(`/api/analytics/pageviews?days=${days}`);

  const counts = new Map();
  for (const row of data) {
    const day = row.viewed_at.slice(0, 10);
    counts.set(day, (counts.get(day) || 0) + 1);
  }

  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    series.push({ date: key, count: counts.get(key) || 0 });
  }
  return series;
}
