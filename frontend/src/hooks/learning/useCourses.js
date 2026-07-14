import { useCallback, useEffect, useState } from "react";
import { learningApi } from "../../lib/api/learning";

/**
 * Course list backed by the API (replaces the old localStorage courseStore).
 * Mutations require a signed-in admin/staff/lecturer token and resolve after
 * the list has been refreshed.
 */
export function useCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setCourses(await learningApi.listCourses());
      setError("");
    } catch (err) {
      setError(err.message || "Could not load courses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createCourse = useCallback(
    async (partial) => {
      const created = await learningApi.createCourse(partial);
      await refresh();
      return created;
    },
    [refresh]
  );

  const saveCourse = useCallback(
    async (course) => {
      const saved = await learningApi.updateCourse(course.id, course);
      await refresh();
      return saved;
    },
    [refresh]
  );

  const deleteCourse = useCallback(
    async (id) => {
      await learningApi.deleteCourse(id);
      await refresh();
    },
    [refresh]
  );

  return { courses, loading, error, refresh, createCourse, saveCourse, deleteCourse };
}

/** Single course with its lessons. `id` may be undefined (e.g. "new course"
 *  editor route) — then nothing is fetched and course stays null. */
export function useCourse(id) {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setCourse(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    learningApi
      .getCourse(id)
      .then((data) => {
        if (!cancelled) setCourse(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setCourse(null);
          setError(err.message || "Could not load course");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { course, loading, error };
}
