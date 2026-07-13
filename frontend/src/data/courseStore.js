import { courses as SEED_COURSES } from "./courses";

const STORAGE_KEY = "makerspace_course_overrides";

function readOverlay() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object"
      ? {
          edited: parsed.edited || {},
          created: parsed.created || [],
          deletedIds: parsed.deletedIds || [],
        }
      : { edited: {}, created: [], deletedIds: [] };
  } catch {
    return { edited: {}, created: [], deletedIds: [] };
  }
}

function writeOverlay(overlay) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overlay));
  } catch {
    /* localStorage unavailable — edits won't persist this session */
  }
}

export function getAllCourses() {
  const overlay = readOverlay();
  const seedMerged = SEED_COURSES.filter((c) => !overlay.deletedIds.includes(c.id)).map(
    (c) => (overlay.edited[c.id] ? { ...c, ...overlay.edited[c.id] } : c)
  );
  return [...seedMerged, ...overlay.created];
}

export function getCourseById(id) {
  const numId = Number(id);
  return getAllCourses().find((c) => c.id === numId) ?? null;
}

export function getCoursesByInstructor(instructorId) {
  return getAllCourses().filter((c) => c.instructorId === instructorId);
}

function nextCourseId() {
  const overlay = readOverlay();
  const all = [...SEED_COURSES, ...overlay.created];
  return all.reduce((max, c) => Math.max(max, c.id), 0) + 1;
}

export function createCourse(partialCourse) {
  const course = {
    students: 0,
    rating: 0,
    tags: [],
    lessons: [],
    paths: ["basic"],
    ...partialCourse,
    id: nextCourseId(),
  };
  const overlay = readOverlay();
  overlay.created.push(course);
  writeOverlay(overlay);
  return course;
}

export function saveCourse(course) {
  const overlay = readOverlay();
  const isSeed = SEED_COURSES.some((c) => c.id === course.id);
  if (isSeed) {
    overlay.edited[course.id] = course;
  } else {
    const idx = overlay.created.findIndex((c) => c.id === course.id);
    if (idx >= 0) overlay.created[idx] = course;
    else overlay.created.push(course);
  }
  writeOverlay(overlay);
  return course;
}

export function deleteCourse(id) {
  const numId = Number(id);
  const overlay = readOverlay();
  if (SEED_COURSES.some((c) => c.id === numId)) {
    if (!overlay.deletedIds.includes(numId)) overlay.deletedIds.push(numId);
  } else {
    overlay.created = overlay.created.filter((c) => c.id !== numId);
  }
  delete overlay.edited[numId];
  writeOverlay(overlay);
}
