import { useState, useMemo } from "react";
import { useCourses } from "./useCourses";

/**
 * Encapsulates category-filter logic for the courses page.
 * Returns the active category, a setter, and the filtered list.
 */
export function useCourseFilter(initialCategory = "All") {
  const [active, setActive] = useState(initialCategory);
  const { courses, loading } = useCourses();

  const filtered = useMemo(
    () =>
      active === "All"
        ? courses
        : courses.filter((c) => c.category === active),
    [active, courses]
  );

  return { active, setActive, filtered, loading };
}
