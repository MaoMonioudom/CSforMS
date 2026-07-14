import { useCallback, useEffect, useState } from "react";
import { getToken } from "../../lib/api/client";
import { learningApi } from "../../lib/api/learning";

const STORAGE_KEY = "makerspace_unlocked_interactive";

function readLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* localStorage unavailable — unlock still works for this session */
  }
}

/**
 * Tracks which courses' Interactive path the learner has purchased.
 * Signed-in users: persisted server-side (course_unlocks) so it follows the
 * account. Guests: localStorage fallback, this device/browser only.
 */
export function useUnlockedPaths() {
  const [unlocked, setUnlocked] = useState(readLocal);

  useEffect(() => {
    if (!getToken()) return;
    learningApi
      .myLearning()
      .then(({ unlockedCourseIds }) => setUnlocked(unlockedCourseIds))
      .catch(() => {
        /* token invalid or backend down — keep the local list */
      });
  }, []);

  const isUnlocked = useCallback(
    (courseId) => unlocked.includes(Number(courseId)),
    [unlocked]
  );

  const unlock = useCallback((courseId) => {
    const id = Number(courseId);
    if (getToken()) {
      // Optimistic: the checkout modal already "succeeded", record it.
      learningApi.unlock(id).catch(() => {});
      setUnlocked((prev) => (prev.includes(id) ? prev : [...prev, id]));
      return;
    }
    setUnlocked((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      writeLocal(next);
      return next;
    });
  }, []);

  return { isUnlocked, unlock };
}
