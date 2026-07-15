import { api } from "./api/client";

// Presentation (icon/color/title) is a frontend concern and lives in
// NotificationsPage.jsx, keyed off `type` — this file only shapes the raw
// row into something UI-agnostic.
function mapNotification(row) {
  return {
    id: row.notification_id,
    type: row.notification_type,
    message: row.message,
    read: row.is_read,
    postedAt: row.created_at,
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
