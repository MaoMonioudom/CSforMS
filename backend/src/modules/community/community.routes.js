import { Router } from "express";
import { createCrudRouter } from "../../shared/crudRouter.js";

const router = Router();

router.use("/events", createCrudRouter("events", { pkColumn: "event_id", ownerField: "created_by" }));
router.use("/collaborations", createCrudRouter("collaboration_posts", { pkColumn: "collab_id", ownerField: "user_id" }));
router.use("/posts", createCrudRouter("community_posts", { pkColumn: "post_id", ownerField: "user_id" }));

export default router;
