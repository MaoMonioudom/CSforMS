import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { signup, login, resetPassword, forgotPasswordCheck } from "./auth.controller.js";
import { microsoftLogin, microsoftCallback, microsoftCompleteSignup } from "./microsoft.controller.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password/check", forgotPasswordCheck);
router.post("/reset-password", resetPassword);

router.get("/microsoft/login", microsoftLogin);
router.get("/microsoft/callback", microsoftCallback);
router.post("/microsoft/complete-signup", microsoftCompleteSignup);

// Confirms the bearer token is valid and returns the current user row.
router.get("/session", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
