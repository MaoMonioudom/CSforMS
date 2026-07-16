import { supabaseAdmin } from "../config/supabaseClient.js";

// Shared by every post type that tags via the `tags` dictionary + a junction
// table (collaboration_skills, post_tags, event_tags all point here) —
// originally written for collaboration_skills, now reused by post_tags too.
//
// normalizeTagName only folds mechanical variance (case, stray whitespace,
// a trailing period) — it deliberately doesn't try to merge "react" with
// "react.js"/"reactjs". That's what the /tags search endpoint + frontend
// typeahead are for: surfacing the existing tag so a person picks it
// themselves, instead of guessing string similarity server-side and
// risking wrong merges (e.g. "Go" vs "Godot").
export function normalizeTagName(raw) {
  return raw.trim().toLowerCase().replace(/\s+/g, " ").replace(/\.+$/, "");
}

// Batched into 2 round trips total (find existing, insert whatever's
// missing) rather than 2 round trips per tag — a post with 5 new tags would
// otherwise mean up to 10 sequential queries before it even finishes
// creating.
//
// Note: if two requests introduce the same brand-new tag at the same
// instant, both can decide it's missing and both insert it — a rare
// duplicate tag row, not a broken create. Only worth guarding against with
// a DB-level unique constraint + upsert, which needs confirming against the
// live schema first.
export async function resolveTagIds(rawNames) {
  const names = [...new Set(rawNames.map(normalizeTagName).filter(Boolean))];
  if (!names.length) return [];

  const { data: existing, error: findErr } = await supabaseAdmin
    .from("tags").select("tag_id, tag_name").in("tag_name", names);
  if (findErr) throw findErr;

  const idByName = new Map(existing.map(t => [t.tag_name, t.tag_id]));
  const missing = names.filter(n => !idByName.has(n));

  if (missing.length) {
    const { data: created, error: createErr } = await supabaseAdmin
      .from("tags").insert(missing.map(tag_name => ({ tag_name }))).select("tag_id, tag_name");
    if (createErr) throw createErr;
    for (const t of created) idByName.set(t.tag_name, t.tag_id);
  }

  return names.map(n => idByName.get(n));
}
