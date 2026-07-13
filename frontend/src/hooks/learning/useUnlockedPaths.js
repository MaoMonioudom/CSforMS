import { useCallback, useState } from "react";

const STORAGE_KEY = "makerspace_unlocked_interactive";

function readUnlocked() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Tracks which courses' Interactive path the learner has "purchased".
 * Persisted to localStorage — this device/browser only, no accounts.
 */
export function useUnlockedPaths() {
  const [unlocked, setUnlocked] = useState(readUnlocked);

  const isUnlocked = useCallback(
    (courseId) => unlocked.includes(Number(courseId)),
    [unlocked]
  );

  const unlock = useCallback((courseId) => {
    const id = Number(courseId);
    setUnlocked((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* localStorage unavailable — unlock still works for this session */
      }
      return next;
    });
  }, []);

  return { isUnlocked, unlock };
}
