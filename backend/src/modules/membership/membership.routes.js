import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/requireAuth.js";
import { getMyMembership, getMembershipForUser, activateMembership, topUpCredits, bulkTopUpCredits, getCreditHistoryForUser } from "./membership.controller.js";

const router = Router();

router.get("/me", requireAuth, getMyMembership);
// Registered ahead of the /:userId routes below purely for readability;
// "bulk-topup" doesn't collide with them since none of those are a bare
// POST /:userId.
router.post("/bulk-topup", requireAuth, requireRole("admin"), bulkTopUpCredits);
router.get("/:userId", requireAuth, requireRole("admin", "staff"), getMembershipForUser);
router.get("/:userId/transactions", requireAuth, requireRole("admin", "staff"), getCreditHistoryForUser);
router.post("/:userId/activate", requireAuth, requireRole("admin", "staff"), activateMembership);
router.post("/:userId/topup", requireAuth, requireRole("admin", "staff"), topUpCredits);

export default router;
