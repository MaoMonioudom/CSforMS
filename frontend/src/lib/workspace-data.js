// Mock personal-workspace booking store. Requests persist to localStorage so
// the member-facing request page and the admin approval page (same app, same
// browser) stay in sync until this is backed by a real Supabase table.

export const SEATS = [
  { id: "Q1", label: "Quiet Desk 1",    zone: "Quiet Zone" },
  { id: "Q2", label: "Quiet Desk 2",    zone: "Quiet Zone" },
  { id: "C1", label: "Collab Bench 1",  zone: "Collaboration Zone" },
  { id: "C2", label: "Collab Bench 2",  zone: "Collaboration Zone" },
  { id: "S1", label: "Standing Desk 1", zone: "Standing Zone" },
];

export const TIME_SLOTS = ["9:00 AM – 12:00 PM", "12:00 PM – 3:00 PM", "3:00 PM – 6:00 PM"];

const DAY_LABEL = { weekday: "short", month: "short", day: "numeric" };

// Next 5 days (today included) as { key: "2026-07-09", label: "Thu, Jul 9" }.
export function getUpcomingDates(count = 5) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return { key: d.toISOString().slice(0, 10), label: d.toLocaleDateString("en-US", DAY_LABEL) };
  });
}

const STORAGE_KEY = "cadt_workspace_requests";

export function getRequests() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function saveRequests(requests) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

// request: { userEmail, userName, seatId, seatLabel, date, slot }
export function addRequest(request) {
  const requests = getRequests();
  const next = [
    ...requests,
    { id: crypto.randomUUID(), status: "pending", requestedAt: new Date().toISOString(), ...request },
  ];
  saveRequests(next);
  return next;
}

export function setRequestStatus(id, status) {
  const requests = getRequests().map(r => (r.id === id ? { ...r, status } : r));
  saveRequests(requests);
  return requests;
}

// A seat/date/slot is taken if there's a pending or approved request for it —
// denied requests free the slot back up.
export function isSlotTaken(requests, seatId, date, slot) {
  return requests.some(r => r.seatId === seatId && r.date === date && r.slot === slot && r.status !== "denied");
}
