import { Router } from "express";
import multer from "multer";
import { createCrudRouter } from "../../shared/crudRouter.js";
import { supabaseAdmin, assertSupabaseConfigured } from "../../config/supabaseClient.js";
import { requireAuth, requireRole } from "../../middleware/requireAuth.js";
import eventRegistrationsRoutes from "./eventRegistrations.routes.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

// Registration routes first — action-based, own their own auth per route.
// Mounting order doesn't strictly matter (every path here is 2+ segments
// past /events, the generic router below only owns single-segment /:id),
// but this keeps the more specific routes visually in front.
router.use("/events", eventRegistrationsRoutes);

// Event photo upload — admin/staff only, multipart field "image", returns
// { url }. Same shape as inventory's item-image upload (see
// inventory.controller.js's uploadItemImage): multer buffers it in memory,
// we push it straight to Supabase Storage, no local disk involved.
router.post("/events/upload-image", requireAuth, requireRole("admin", "staff"), upload.single("image"), async (req, res, next) => {
  if (!assertSupabaseConfigured(res)) return;
  try {
    if (!req.file) return res.status(400).json({ error: "No image file provided (field name: image)" });
    const ext = (req.file.originalname.match(/\.\w+$/) || [".jpg"])[0].toLowerCase();
    const path = `events/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

    const { error: upErr } = await supabaseAdmin.storage
      .from("event-images")
      .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
    if (upErr) throw upErr;

    const { data } = supabaseAdmin.storage.from("event-images").getPublicUrl(path);
    res.status(201).json({ data: { url: data.publicUrl } });
  } catch (err) {
    next(err);
  }
});
// Events are admin/staff-owned — everyone else (including logged-in
// students) gets read-only access; writes require the admin panel.
router.use("/events", createCrudRouter("events", { pkColumn: "event_id", ownerField: "created_by", writeRoles: ["admin", "staff"] }));
// Both are feeds, not catalogs — newest first, like any social feed.
router.use("/collaborations", createCrudRouter("collaboration_posts", { pkColumn: "collab_id", ownerField: "user_id", embedAuthor: true, orderBy: { column: "created_at", ascending: false } }));
router.use("/posts", createCrudRouter("community_posts", { pkColumn: "post_id", ownerField: "user_id", embedAuthor: true, orderBy: { column: "created_at", ascending: false } }));

export default router;
