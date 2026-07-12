import { Router } from "express";
import { createCrudRouter } from "../../shared/crudRouter.js";

const router = Router();

router.use("/events", createCrudRouter("events"));
router.use("/collaborations", createCrudRouter("collaboration_posts"));
router.use("/posts", createCrudRouter("community_posts"));

export default router;
