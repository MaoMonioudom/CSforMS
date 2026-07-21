import { assertSupabaseConfigured } from "../../config/supabaseClient.js";
import { getUserActionCounts, getRecentActivity } from "../../shared/userActivityCounts.js";

// Real per-user counts + a merged recent-activity feed for the Profile
// page — same counts the achievement award-check uses, so the stat cards
// and the badges never disagree with each other.
export async function getProfileSummary(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const userId = req.user.user_id;
    const [counts, activity] = await Promise.all([
      getUserActionCounts(userId),
      getRecentActivity(userId, 8),
    ]);
    res.json({ data: { counts, activity } });
  } catch (err) {
    next(err);
  }
}
