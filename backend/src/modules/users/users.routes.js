import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/requireAuth.js";
import { getMe, listUsers } from "./users.controller.js";

const router = Router();

router.get("/me", requireAuth, getMe);
router.get("/", requireAuth, requireRole("admin", "staff"), listUsers);

export default router;
