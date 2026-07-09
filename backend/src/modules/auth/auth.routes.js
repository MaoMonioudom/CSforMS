import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";

const router = Router();

// Confirms the access token issued by Supabase Auth (obtained by the
// frontend directly via supabase-js) is valid — doesn't depend on any
// custom table existing yet, so it's a good first smoke test.
router.get("/session", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
