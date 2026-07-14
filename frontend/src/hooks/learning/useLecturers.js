import { useCallback, useEffect, useState } from "react";
import { learningApi } from "../../lib/api/learning";

/**
 * Lecturer accounts (users with role 'lecturer') from the API, shaped as
 * { id, name, email, active }. Requires an admin/staff/lecturer session.
 */
export function useLecturers() {
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setLecturers(await learningApi.listLecturers());
      setError("");
    } catch (err) {
      setError(err.message || "Could not load lecturers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createLecturer = useCallback(
    async (payload) => {
      const created = await learningApi.createLecturer(payload);
      await refresh();
      return created;
    },
    [refresh]
  );

  const setActive = useCallback(
    async (id, active) => {
      await learningApi.setLecturerActive(id, active);
      await refresh();
    },
    [refresh]
  );

  return { lecturers, loading, error, refresh, createLecturer, setActive };
}
