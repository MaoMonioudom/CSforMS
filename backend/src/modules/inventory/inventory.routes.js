import { Router } from "express";
import multer from "multer";
import { createCrudRouter } from "../../shared/crudRouter.js";
import { requireAuth, requireRole } from "../../middleware/requireAuth.js";
import * as ctrl from "./inventory.controller.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();
// Backend roles are lowercase ('admin'/'staff') — see users.role CHECK constraint.
const STAFF = requireRole("admin", "staff");

// Items, filaments, categories, locations — public reads, authed writes.
// This schema has per-table PK names, so pkColumn must be set explicitly.
// Newest first — every items/filaments list (browse, catalog, manage stock)
// shows the most recently created entries at the top.
router.use("/items", createCrudRouter("inventory_items", { pkColumn: "item_id", orderBy: { column: "created_at", ascending: false } }));
router.use("/filaments", createCrudRouter("filaments", { pkColumn: "filament_id", orderBy: { column: "created_at", ascending: false } }));
router.use("/categories", createCrudRouter("categories", { pkColumn: "category_id" }));
router.use("/locations", createCrudRouter("location_items", { pkColumn: "location_id" }));

// Item photo upload — staff only, multipart field "image", returns { url }.
router.post("/items/upload-image", requireAuth, STAFF, upload.single("image"), ctrl.uploadItemImage);

// Maintenance — report damage / mark repaired (staff).
router.post("/items/:id/report-maintenance", requireAuth, STAFF, ctrl.reportMaintenance);
router.post("/items/:id/maintenance-complete", requireAuth, STAFF, ctrl.completeMaintenance);

// Borrows — students see their own, staff see all.
router.get("/borrows", requireAuth, ctrl.listBorrows);
router.post("/borrows/:id/return", requireAuth, STAFF, ctrl.returnBorrow);
router.post("/borrows/deduct-credits", requireAuth, STAFF, ctrl.deductCredits);

// Requests — students submit their own; staff list/approve/deny all.
router.get("/requests", requireAuth, ctrl.listRequests);
router.post("/requests", requireAuth, ctrl.createRequest);
router.post("/requests/approve-borrow", requireAuth, STAFF, ctrl.approveBorrowGroup);
router.post("/requests/deny", requireAuth, STAFF, ctrl.denyRequestGroup);
router.post("/requests/:id/approve-topup", requireAuth, STAFF, ctrl.approveTopUp);
router.post("/requests/:id/approve-printing", requireAuth, STAFF, ctrl.approvePrinting);
router.post("/requests/:id/confirm-3d-weight", requireAuth, STAFF, ctrl.confirm3DWeight);

// Payments — flattened invoice history for the admin Payments page.
router.get("/payments", requireAuth, STAFF, ctrl.listPayments);

// Student directory (name/membership/credits) for the counter UIs.
router.get("/users", requireAuth, STAFF, ctrl.listInventoryUsers);

// Lab Services counter + Browse Items counter — staff-only, instant charge.
router.post("/services/print", requireAuth, STAFF, ctrl.chargePrintingNow);
router.post("/services/3d-print", requireAuth, STAFF, ctrl.charge3DNow);
router.post("/sale", requireAuth, STAFF, ctrl.staffSale);
router.post("/topup-counter", requireAuth, STAFF, ctrl.topUpCounter);

// Self-serve consumable purchase from the student cart (own credits).
router.post("/purchase", requireAuth, ctrl.selfPurchase);

// Notifications — strictly the caller's own. Due-date/overdue alerts are
// generated lazily right before the list is read (see controller).
router.get("/notifications", requireAuth, ctrl.listNotifications);
router.post("/notifications/read-all", requireAuth, ctrl.markAllNotificationsRead);
router.post("/notifications/:id/read", requireAuth, ctrl.markNotificationRead);

export default router;
