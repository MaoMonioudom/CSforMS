import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { getMe, listUsers } from "./users.controller.js";

const router = Router();

router.get("/me", requireAuth, getMe);
router.get("/", listUsers);

export default router;
