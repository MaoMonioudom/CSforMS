import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/requireAuth.js";
import { optionalAuth } from "../../middleware/optionalAuth.js";
import { recordPageView, listRecentPageViews } from "./analytics.controller.js";

const router = Router();

router.post("/pageview", optionalAuth, recordPageView);
router.get("/pageviews", requireAuth, requireRole("admin", "staff"), listRecentPageViews);

export default router;
