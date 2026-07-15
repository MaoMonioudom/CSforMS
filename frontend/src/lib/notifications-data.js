import { api } from "./api/client";

// Presentation (icon/color/title) is a frontend concern and lives in
// NotificationsPage.jsx, keyed off `type` — this file only shapes the raw
// row into something UI-agnostic. `date` keeps the full timestamp (not
// truncated to YYYY-MM-DD) — the merged feed sorts by it, so same-day
// notifications need real precision to land in the right order, and the
// page displays the time alongside the date.
function mapNotification(row) {
  return {
    id: row.notification_id,
    type: row.notification_type,
    message: row.message,
    read: row.is_read,
    date: row.created_at,
  };
}

export async function fetchNotifications() {
  const { data } = await api.get("/api/notifications");
  return data.map(mapNotification);
}

export async function markNotificationRead(id) {
  const { data } = await api.patch(`/api/notifications/${id}/read`);
  return mapNotification(data);
}

export async function markAllNotificationsRead() {
  await api.post("/api/notifications/read-all");
}
