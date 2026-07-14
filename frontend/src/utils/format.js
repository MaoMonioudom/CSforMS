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
  const text = normalizeLessonBody(html).replace(/\s+/g, " ").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text;
}

/**
 * Normalizes a lesson body into plain text so editors and readers do not
 * need to deal with HTML markup.
 */
export function normalizeLessonBody(body = "") {
  const text = String(body)
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|ul|ol)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  return text.replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Splits a lesson body into an intro line and a list of steps for the
 * Step-by-Step path. The first non-empty line becomes the intro and the
 * remaining lines become checklist items.
 */
export function parseBodySteps(body = "") {
  const lines = normalizeLessonBody(body)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  return {
    intro: lines[0] || "",
    items: lines.slice(1),
  };
}
