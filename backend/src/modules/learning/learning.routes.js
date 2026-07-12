import { Router } from "express";
import { createCrudRouter } from "../../shared/crudRouter.js";

const router = Router();

router.use("/courses", createCrudRouter("courses"));

export default router;
