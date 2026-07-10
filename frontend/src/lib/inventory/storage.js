// Thin persistence layer over localStorage.
// Swap the body of each function for real HTTP calls when a backend exists —
// callers already treat every export here as async.
const PREFIX = 'mv:'

export function loadCollection(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function saveCollection(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value))
}

export function clearAll() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => localStorage.removeItem(k))
}
