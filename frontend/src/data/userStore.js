import { SEED_USERS } from "./users";

const STORAGE_KEY = "makerspace_user_overrides";

function readOverlay() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object"
      ? { edited: parsed.edited || {}, created: parsed.created || [] }
      : { edited: {}, created: [] };
  } catch {
    return { edited: {}, created: [] };
  }
}

function writeOverlay(overlay) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overlay));
  } catch {
    /* localStorage unavailable — edits won't persist this session */
  }
}

export function getAllUsers() {
  const overlay = readOverlay();
  const seedMerged = SEED_USERS.map((u) =>
    overlay.edited[u.id] ? { ...u, ...overlay.edited[u.id] } : u
  );
  return [...seedMerged, ...overlay.created];
}

export function getUserById(id) {
  return getAllUsers().find((u) => u.id === id) ?? null;
}

export function getUserByEmail(email) {
  const target = email.trim().toLowerCase();
  return getAllUsers().find((u) => u.email.toLowerCase() === target) ?? null;
}

export function getLecturers() {
  return getAllUsers().filter((u) => u.role === "lecturer");
}

export function createLecturer({ name, email, password }) {
  const user = {
    id: `lect-${Date.now()}`,
    name,
    email,
    password,
    role: "lecturer",
    active: true,
  };
  const overlay = readOverlay();
  overlay.created.push(user);
  writeOverlay(overlay);
  return user;
}

export function upsertUser(patch) {
  const overlay = readOverlay();
  const isSeed = SEED_USERS.some((u) => u.id === patch.id);
  if (isSeed) {
    overlay.edited[patch.id] = { ...overlay.edited[patch.id], ...patch };
  } else {
    const idx = overlay.created.findIndex((u) => u.id === patch.id);
    if (idx >= 0) overlay.created[idx] = { ...overlay.created[idx], ...patch };
  }
  writeOverlay(overlay);
}

export function setUserActive(id, active) {
  upsertUser({ id, active });
}
