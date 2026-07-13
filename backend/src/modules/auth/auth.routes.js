import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { signup, login } from "./auth.controller.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);

// Confirms the bearer token is valid and returns the current user row.
router.get("/session", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
