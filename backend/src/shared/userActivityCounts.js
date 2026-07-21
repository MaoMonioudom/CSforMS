import { supabaseAdmin } from "../config/supabaseClient.js";

// One real count per achievement requirement_type (see achievements.
// controller.js's REQUIREMENT_TYPES) — shared by achievement award-checking
// and the profile page's stat cards, so both always read the exact same
// numbers, computed fresh on every call rather than cached anywhere.
export async function getUserActionCounts(userId) {
  const [events, courses, borrows, bookings, posts, collabs] = await Promise.all([
    supabaseAdmin.from("event_registrations").select("*", { count: "exact", head: true })
      .eq("user_id", userId).eq("participant_status", "registered"),
    supabaseAdmin.from("course_enrollments").select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    // Real table is borrow_transactions, not borrows (that name only
    // exists in an older, superseded schema doc) — "borrows" here is just
    // our own internal requirement_type label, not the table name.
    supabaseAdmin.from("borrow_transactions").select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabaseAdmin.from("workspace_bookings").select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabaseAdmin.from("community_posts").select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabaseAdmin.from("collaboration_posts").select("*", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);
  for (const r of [events, courses, borrows, bookings, posts, collabs]) if (r.error) throw r.error;

  return {
    event_registrations: events.count ?? 0,
    course_enrollments: courses.count ?? 0,
    borrows: borrows.count ?? 0,
    workspace_bookings: bookings.count ?? 0,
    community_posts: posts.count ?? 0,
    collaboration_posts: collabs.count ?? 0,
  };
}

// Recent timestamped rows across every module, merged and sorted newest
// first — queries each table directly rather than needing changes to the
// existing per-module "my X" endpoints (several of those only return bare
// IDs today, not timestamps).
export async function getRecentActivity(userId, limit = 8) {
  const [events, courses, borrows, bookings] = await Promise.all([
    supabaseAdmin.from("event_registrations")
      .select("registration_date, event:events(title)")
      .eq("user_id", userId).eq("participant_status", "registered")
      .order("registration_date", { ascending: false }).limit(limit),
    supabaseAdmin.from("course_enrollments")
      .select("enrolled_at, course:courses(title)")
      .eq("user_id", userId)
      .order("enrolled_at", { ascending: false }).limit(limit),
    supabaseAdmin.from("borrow_transactions")
      .select("borrow_date, status, inventory_items(item_name)")
      .eq("user_id", userId)
      .order("borrow_date", { ascending: false }).limit(limit),
    supabaseAdmin.from("workspace_bookings")
      .select("created_at, status, workspace:workspaces(workspace_name)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }).limit(limit),
  ]);
  for (const r of [events, courses, borrows, bookings]) if (r.error) throw r.error;

  const items = [
    ...events.data.map((r) => ({ type: "event", label: `Registered for ${r.event?.title ?? "an event"}`, date: r.registration_date })),
    ...courses.data.map((r) => ({ type: "course", label: `Enrolled in ${r.course?.title ?? "a course"}`, date: r.enrolled_at })),
    ...borrows.data.map((r) => ({ type: "borrow", label: `${r.status === "returned" ? "Returned" : "Borrowed"} ${r.inventory_items?.item_name ?? "an item"}`, date: r.borrow_date })),
    ...bookings.data.map((r) => ({ type: "workspace", label: `Workspace request for ${r.workspace?.workspace_name ?? "a desk"} (${r.status})`, date: r.created_at })),
  ];

  return items
    .filter((i) => i.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}
