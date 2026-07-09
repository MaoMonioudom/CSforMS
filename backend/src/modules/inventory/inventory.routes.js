import { Router } from "express";
import { createCrudRouter } from "../../shared/crudRouter.js";

const router = Router();

router.use("/items", createCrudRouter("inventory_items"));

export default router;
