import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/requireAuth.js";
import { getMyMembership, getMembershipForUser, activateMembership, topUpCredits } from "./membership.controller.js";

const router = Router();

router.get("/me", requireAuth, getMyMembership);
router.get("/:userId", requireAuth, requireRole("admin", "staff"), getMembershipForUser);
router.post("/:userId/activate", requireAuth, requireRole("admin", "staff"), activateMembership);
router.post("/:userId/topup", requireAuth, requireRole("admin", "staff"), topUpCredits);

export default router;
