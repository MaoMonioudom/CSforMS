/**
 * Returns the first two initials from a full name.
 * e.g. "Dr. Sarah Chen" → "SC"
 */
export function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(-2)        // take last two words (skip titles like "Dr.")
    .join("");
}

/**
 * Maps a lesson type string to its CSS modifier class.
 */
export const LESSON_TYPE_CLASS = {
  video:   "lesson-type--video",
  reading: "lesson-type--reading",
  lab:     "lesson-type--lab",
  project: "lesson-type--project",
};

/**
 * Format a large number with locale separators.
 * e.g. 1240 → "1,240"
 */
export function formatNumber(n) {
  return Number(n).toLocaleString();
}

/**
 * Strips HTML tags from a lesson body and truncates it for card previews.
 * e.g. "<p>Python is <b>great</b></p>" → "Python is great"
 */
export function stripHtmlPreview(html = "", maxLength = 90) {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text;
}

/**
 * Splits a lesson body into an intro paragraph and a list of steps
 * (its <li> bullets), for the Step-by-Step path's checklist view.
 * e.g. "<p>Intro</p><ul><li>Do X</li><li>Do Y</li></ul>"
 *   → { intro: "Intro", items: ["Do X", "Do Y"] }
 */
export function parseBodySteps(html = "") {
  const stripTags = (s) => s.replace(/<[^>]+>/g, "").trim();
  const intro = stripTags(html.match(/<p>([\s\S]*?)<\/p>/)?.[1] ?? "");
  const items = Array.from(html.matchAll(/<li>([\s\S]*?)<\/li>/g)).map((m) =>
    stripTags(m[1])
  );
  return { intro, items };
}
