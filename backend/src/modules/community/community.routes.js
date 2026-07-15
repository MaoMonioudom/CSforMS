import { Router } from "express";
import { createCrudRouter } from "../../shared/crudRouter.js";
import eventRegistrationsRoutes from "./eventRegistrations.routes.js";

const router = Router();

// Registration routes first — action-based, own their own auth per route.
// Mounting order doesn't strictly matter (every path here is 2+ segments
// past /events, the generic router below only owns single-segment /:id),
// but this keeps the more specific routes visually in front.
router.use("/events", eventRegistrationsRoutes);
// Events are admin/staff-owned — everyone else (including logged-in
// students) gets read-only access; writes require the admin panel.
router.use("/events", createCrudRouter("events", { pkColumn: "event_id", ownerField: "created_by", writeRoles: ["admin", "staff"] }));
// Both are feeds, not catalogs — newest first, like any social feed.
router.use("/collaborations", createCrudRouter("collaboration_posts", { pkColumn: "collab_id", ownerField: "user_id", embedAuthor: true, orderBy: { column: "created_at", ascending: false } }));
router.use("/posts", createCrudRouter("community_posts", { pkColumn: "post_id", ownerField: "user_id", embedAuthor: true, orderBy: { column: "created_at", ascending: false } }));

export default router;
