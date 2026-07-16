import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { listMyNotifications, markNotificationRead, markAllNotificationsRead } from "./notifications.controller.js";

const router = Router();

router.get("/", requireAuth, listMyNotifications);
router.post("/read-all", requireAuth, markAllNotificationsRead);
router.patch("/:id/read", requireAuth, markNotificationRead);

export default router;
