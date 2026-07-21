import { api } from "./api/client";

// Real desks/rooms + bookings now — the `workspaces`/`workspace_bookings`
// tables were already defined in the DB schema but never wired up; this
// used to be a localStorage-only mock until this rewrite.

// Fixed 3-hour blocks, matching what was previously hardcoded — stored as
// literal UTC-labeled timestamps (no real timezone conversion), same
// convention events already use (see events-data.js's toIso/formatEventDate
// with timeZone: "UTC").
export const TIME_SLOTS = [
  { label: "9:00 AM – 12:00 PM", startHour: 9,  endHour: 12 },
  { label: "12:00 PM – 3:00 PM", startHour: 12, endHour: 15 },
  { label: "3:00 PM – 6:00 PM",  startHour: 15, endHour: 18 },
];

const DAY_LABEL = { weekday: "short", month: "short", day: "numeric" };

// Next 5 days (today included) as { key: "2026-07-09", label: "Thu, Jul 9" }.
export function getUpcomingDates(count = 5) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return { key: d.toISOString().slice(0, 10), label: d.toLocaleDateString("en-US", DAY_LABEL) };
  });
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function slotToRange(dateKey, slot) {
  return {
    start_time: `${dateKey}T${pad(slot.startHour)}:00:00Z`,
    end_time: `${dateKey}T${pad(slot.endHour)}:00:00Z`,
  };
}

// Bare-timestamp columns can come back with slightly different string
// formatting (fractional seconds, etc.) than what was sent — compare actual
// instants, not raw strings.
function sameInstant(a, b) {
  return new Date(a).getTime() === new Date(b).getTime();
}

function slotForStartTime(iso) {
  const hour = new Date(iso).getUTCHours();
  return TIME_SLOTS.find((s) => s.startHour === hour) ?? null;
}

// Zone shown to members prefers the linked location's real zone_name
// (location_items — shared with inventory's storage locations) over the
// desk's own workspace_type, falling back to workspace_type only when no
// location is linked yet.
function mapWorkspace(row) {
  return {
    id: row.workspace_id,
    label: row.workspace_name,
    zone: row.location?.zone_name || row.workspace_type || "",
    capacity: row.capacity || 1,
  };
}

// rejected -> denied keeps the existing UI's status labels/styling
// (STATUS_STYLE keys) unchanged across this rewrite.
function mapMyBooking(row) {
  return {
    id: row.booking_id,
    workspaceId: row.workspace_id,
    seatLabel: row.workspace?.workspace_name ?? "",
    date: row.start_time.slice(0, 10),
    slot: slotForStartTime(row.start_time)?.label ?? "",
    status: row.status === "rejected" ? "denied" : row.status,
    requestedAt: row.created_at,
  };
}

function mapAdminBooking(row) {
  return {
    id: row.booking_id,
    workspaceId: row.workspace_id,
    userName: row.user?.full_name ?? "Unknown",
    userEmail: row.user?.email ?? "",
    seatLabel: row.workspace?.workspace_name ?? "",
    capacity: row.workspace?.capacity || 1,
    date: row.start_time.slice(0, 10),
    slot: slotForStartTime(row.start_time)?.label ?? "",
    status: row.status === "rejected" ? "denied" : row.status,
    requestedAt: row.created_at,
  };
}

export async function fetchWorkspaces() {
  const { data } = await api.get("/api/workspace/workspaces");
  return data.map(mapWorkspace);
}

// { workspace_id, start_time, end_time } only — no identity — used just to
// gray out already-taken slots on the member's availability grid.
export async function fetchTakenSlots(dateKey) {
  const { data } = await api.get(`/api/workspace/bookings/taken?date=${dateKey}`);
  return data;
}

// { count, capacity, full } for one (workspace, slot) — count is how many
// pending/approved bookings already exist for it, so a multi-person space
// (capacity > 1) stays bookable until it's actually full instead of the
// first request locking everyone else out.
export function getSlotOccupancy(takenSlots, workspaceId, dateKey, slot, capacity) {
  const { start_time } = slotToRange(dateKey, slot);
  const count = takenSlots.filter((t) => t.workspace_id === workspaceId && sameInstant(t.start_time, start_time)).length;
  return { count, capacity, full: count >= capacity };
}

export async function fetchMyBookings() {
  const { data } = await api.get("/api/workspace/bookings/me");
  return data.map(mapMyBooking);
}

export async function createBooking({ workspaceId, dateKey, slot }) {
  const { start_time, end_time } = slotToRange(dateKey, slot);
  const { data } = await api.post("/api/workspace/bookings", { workspace_id: workspaceId, start_time, end_time });
  return mapMyBooking(data);
}

// Self-service — only works on your own still-pending requests (the
// backend enforces both), frees up your PENDING_CAP quota and the slot
// itself for others.
export async function cancelBooking(id) {
  await api.post(`/api/workspace/bookings/${id}/cancel`);
}

// Admin/staff only.
export async function fetchAllBookings() {
  const { data } = await api.get("/api/workspace/bookings");
  return data.map(mapAdminBooking);
}

export async function approveBooking(id) {
  await api.post(`/api/workspace/bookings/${id}/approve`);
}

export async function rejectBooking(id) {
  await api.post(`/api/workspace/bookings/${id}/reject`);
}

function mapAdminWorkspace(row) {
  return {
    id: row.workspace_id,
    label: row.workspace_name,
    type: row.workspace_type,
    capacity: row.capacity,
    status: row.status,
    locationId: row.location?.location_id ?? null,
    locationLabel: row.location ? `${row.location.location_name}${row.location.zone_name ? " — " + row.location.zone_name : ""}` : "",
  };
}

// Admin/staff only — every desk regardless of status, for the "Manage
// Desks" panel (fetchWorkspaces above only returns 'available' ones).
export async function fetchAllWorkspacesAdmin() {
  const { data } = await api.get("/api/workspace/workspaces/all");
  return data.map(mapAdminWorkspace);
}

// location_id links to the same location_items table inventory's storage
// spots use — optional, since not every desk needs a tracked location yet.
export async function createWorkspace({ name, type, locationId, capacity }) {
  const { data } = await api.post("/api/workspace/workspaces", {
    workspace_name: name,
    workspace_type: type,
    location_id: locationId || null,
    capacity,
  });
  return mapAdminWorkspace(data);
}

export async function setWorkspaceStatus(id, status) {
  await api.patch(`/api/workspace/workspaces/${id}/status`, { status });
}

// Shared with inventory — the same physical storage/room list, reused here
// per System_Full_DB.sql's comment rather than inventing a second location
// concept just for desks.
export async function fetchLocations() {
  const { data } = await api.get("/api/inventory/locations");
  return data.map((row) => ({
    id: row.location_id,
    label: row.zone_name ? `${row.location_name} — ${row.zone_name}` : row.location_name,
  }));
}
