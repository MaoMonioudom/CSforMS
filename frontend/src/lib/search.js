// Simple relevance scorer — good enough for local/demo search, not a real index.
function textScore(text, q) {
  if (!text) return 0;
  const t = text.toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 70;
  if (t.includes(q)) return 40;
  return 0;
}

function arrayScore(arr, q) {
  if (!arr || arr.length === 0) return 0;
  return Math.max(0, ...arr.map((item) => textScore(String(item), q)));
}

// Small nudge for upcoming/recent items so the freshest stuff floats up among ties.
function recencyBonus(dateStr) {
  if (!dateStr) return 0;
  const days = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
  if (days < 0) return 6; // upcoming
  if (days < 3) return 5;
  if (days < 14) return 2;
  return 0;
}

export function resultKey(r) {
  return `${r.type}-${r.item.id}`;
}

// Searches Events, Find Team (collab), and Connect (community) posts together,
// matching the query against each item's title only, and returns one
// relevance-sorted list (recency used just to break ties, not to match).
// Data is passed in (rather than imported) so callers' React state stays the
// single source of truth — a useMemo keyed on these args recomputes as soon
// as a fetch resolves, instead of ever reading a stale snapshot.
export function searchCommunity(query, { events, collabPosts, communityPosts }) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results = [];

  for (const ev of events) {
    const s = textScore(ev.title, q);
    if (s > 0) results.push({ type: "event", item: ev, score: s + recencyBonus(ev.date) });
  }

  for (const post of collabPosts) {
    const s = textScore(post.projectTitle, q);
    if (s > 0) results.push({ type: "collab", item: post, score: s + recencyBonus(post.postedAt) });
  }

  for (const post of communityPosts) {
    const s = textScore(post.title, q);
    if (s > 0) results.push({ type: "community", item: post, score: s + recencyBonus(post.postedAt) });
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

// Broader fallback used only to fill "You might also like" when the strict
// title search above comes back sparse — matches tags/body/skills/etc, never
// mixed into the primary relevance-ranked results themselves.
export function suggestRelated(query, { events, collabPosts, communityPosts }, excludeKeys = [], limit = 8) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const exclude = new Set(excludeKeys);
  const results = [];

  for (const ev of events) {
    if (exclude.has(`event-${ev.id}`)) continue;
    const s =
      textScore(ev.title, q) +
      arrayScore(ev.tags, q) +
      textScore(ev.location, q) * 0.6 +
      textScore(ev.shortDescription, q) * 0.6 +
      textScore(ev.description, q) * 0.4;
    if (s > 0) results.push({ type: "event", item: ev, score: s + recencyBonus(ev.date) });
  }

  for (const post of collabPosts) {
    if (exclude.has(`collab-${post.id}`)) continue;
    const s =
      textScore(post.projectTitle, q) +
      arrayScore(post.rolesNeeded, q) * 0.9 +
      arrayScore(post.skills, q) * 0.8 +
      textScore(post.category, q) * 0.6 +
      textScore(post.shortPitch, q) * 0.6 +
      textScore(post.description, q) * 0.4;
    if (s > 0) results.push({ type: "collab", item: post, score: s + recencyBonus(post.postedAt) });
  }

  for (const post of communityPosts) {
    if (exclude.has(`community-${post.id}`)) continue;
    const s =
      textScore(post.title, q) +
      textScore(post.body, q) * 0.6 +
      arrayScore(post.tags, q) +
      textScore(post.category, q) * 0.6 +
      textScore(post.author?.name, q) * 0.5;
    if (s > 0) results.push({ type: "community", item: post, score: s + recencyBonus(post.postedAt) });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}
