import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { getProfileSummary } from "./profile.controller.js";

const router = Router();

router.get("/summary", requireAuth, getProfileSummary);

export default router;
