import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/requireAuth.js";
import {
  listWorkspaces, listTakenSlots, listMyBookings, createBooking, cancelBooking,
  listAllBookings, approveBooking, rejectBooking,
  listAllWorkspaces, createWorkspace, setWorkspaceStatus,
} from "./workspace.controller.js";

const router = Router();

router.get("/workspaces", requireAuth, listWorkspaces);
router.get("/bookings/taken", requireAuth, listTakenSlots);
router.get("/bookings/me", requireAuth, listMyBookings);
router.post("/bookings", requireAuth, createBooking);
router.post("/bookings/:id/cancel", requireAuth, cancelBooking);

router.get("/bookings", requireAuth, requireRole("admin", "staff"), listAllBookings);
router.post("/bookings/:id/approve", requireAuth, requireRole("admin", "staff"), approveBooking);
router.post("/bookings/:id/reject", requireAuth, requireRole("admin", "staff"), rejectBooking);

router.get("/workspaces/all", requireAuth, requireRole("admin", "staff"), listAllWorkspaces);
router.post("/workspaces", requireAuth, requireRole("admin", "staff"), createWorkspace);
router.patch("/workspaces/:id/status", requireAuth, requireRole("admin", "staff"), setWorkspaceStatus);

export default router;
