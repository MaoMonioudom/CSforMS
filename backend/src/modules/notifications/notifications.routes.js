import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/requireAuth.js";
import { listMyNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification, previewOverdueReminders, sendOverdueRemindersNow } from "./notifications.controller.js";

const router = Router();
const STAFF = requireRole("admin", "staff");

// Preview only, never sends. See overdueEmailReminders.js.
router.get("/overdue-reminders/preview", requireAuth, STAFF, previewOverdueReminders);
// Sends for real right now, instead of waiting for the 8am cron.
router.post("/overdue-reminders/send-now", requireAuth, STAFF, sendOverdueRemindersNow);

router.get("/", requireAuth, listMyNotifications);
router.post("/read-all", requireAuth, markAllNotificationsRead);
router.patch("/:id/read", requireAuth, markNotificationRead);
router.delete("/:id", requireAuth, deleteNotification);

export default router;
