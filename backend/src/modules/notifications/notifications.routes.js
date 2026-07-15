import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { listMyNotifications, markNotificationRead } from "./notifications.controller.js";

const router = Router();

router.get("/", requireAuth, listMyNotifications);
router.patch("/:id/read", requireAuth, markNotificationRead);

export default router;
