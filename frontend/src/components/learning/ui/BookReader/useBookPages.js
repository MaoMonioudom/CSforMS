/**
 * Converts a course object into an ordered flat array of page descriptors.
 *
 * Page types:
 *   { type: 'cover'  }
 *   { type: 'toc'    }
 *   { type: 'lesson', lesson: {...}, num: N }
 *   { type: 'enroll' }
 *
 * Pages are displayed in two-page spreads (left + right).
 * Spread index = Math.floor(pageIndex / 2)
 */
export function buildPages(course) {
  if (!course) return [];
  return [
    { type: "cover" },
    { type: "toc" },
    ...course.lessons.map((lesson, i) => ({
      type: "lesson",
      lesson,
      num: i + 1,
    })),
    { type: "enroll" },
  ];
}

export function totalSpreads(pages) {
  return Math.ceil(pages.length / 2);
}

export function spreadPages(pages, spreadIndex) {
  const li = spreadIndex * 2;
  return { left: pages[li] ?? null, right: pages[li + 1] ?? null };
}

export function spreadLabel(pages, spreadIndex) {
  const { left, right } = spreadPages(pages, spreadIndex);
  const name = (p) => {
    if (!p) return "";
    if (p.type === "cover") return "Cover";
    if (p.type === "toc") return "Contents";
    if (p.type === "lesson") return `Lesson ${p.num}`;
    return "Enroll";
  };
  const l = name(left);
  const r = name(right);
  return r ? `${l}  ·  ${r}` : l;
}

/** Returns the spread index that contains a given lesson (0-based lesson index) */
export function spreadForLesson(lessonIndex) {
  const pageIndex = 2 + lessonIndex; // 0=cover, 1=toc, 2+=lessons
  return Math.floor(pageIndex / 2);
}
