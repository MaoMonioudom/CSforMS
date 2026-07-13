import { useCallback, useState } from "react";
import * as courseStore from "../../data/courseStore";

/**
 * Reactive wrapper around courseStore for dashboard list pages that
 * create/edit/delete courses inline and need the list to update
 * immediately (without a full route remount).
 */
export function useCourses() {
  const [courses, setCourses] = useState(() => courseStore.getAllCourses());

  const refresh = useCallback(() => setCourses(courseStore.getAllCourses()), []);

  const saveCourse = useCallback(
    (course) => {
      const saved = courseStore.saveCourse(course);
      refresh();
      return saved;
    },
    [refresh]
  );

  const createCourse = useCallback(
    (partial) => {
      const created = courseStore.createCourse(partial);
      refresh();
      return created;
    },
    [refresh]
  );

  const deleteCourse = useCallback(
    (id) => {
      courseStore.deleteCourse(id);
      refresh();
    },
    [refresh]
  );

  return { courses, saveCourse, createCourse, deleteCourse, refresh };
}
