import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/requireAuth.js";
import { listMyNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification, previewOverdueReminders } from "./notifications.controller.js";

const router = Router();
const STAFF = requireRole("admin", "staff");

// Preview only; see <overdueEmailReminders.js> for why this doesn't send yet.
router.get("/overdue-reminders/preview", requireAuth, STAFF, previewOverdueReminders);

router.get("/", requireAuth, listMyNotifications);
router.post("/read-all", requireAuth, markAllNotificationsRead);
router.patch("/:id/read", requireAuth, markNotificationRead);
router.delete("/:id", requireAuth, deleteNotification);

export default router;
