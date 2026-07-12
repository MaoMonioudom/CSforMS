import { Router } from "express";
import { supabasePublic, assertSupabaseConfigured } from "../config/supabaseClient.js";
import { requireAuth } from "../middleware/requireAuth.js";

// Generic REST router for a single Supabase table. Reads go through the
// public (anon-key) client so RLS "select" policies apply to anonymous
// callers; writes go through the caller's own token (req.supabase, set by
// requireAuth) so RLS write policies are enforced as that user.
export function createCrudRouter(table) {
  const router = Router();

  router.get("/", async (req, res, next) => {
    if (!assertSupabaseConfigured(res)) return;
    try {
      const { data, error } = await supabasePublic.from(table).select("*");
      if (error) throw error;
      res.json({ data });
    } catch (err) {
      next(err);
    }
  });

  router.get("/:id", async (req, res, next) => {
    if (!assertSupabaseConfigured(res)) return;
    try {
      const { data, error } = await supabasePublic.from(table).select("*").eq("id", req.params.id).single();
      if (error) throw error;
      res.json({ data });
    } catch (err) {
      next(err);
    }
  });

  router.post("/", requireAuth, async (req, res, next) => {
    try {
      const { data, error } = await req.supabase.from(table).insert(req.body).select().single();
      if (error) throw error;
      res.status(201).json({ data });
    } catch (err) {
      next(err);
    }
  });

  router.put("/:id", requireAuth, async (req, res, next) => {
    try {
      const { data, error } = await req.supabase.from(table).update(req.body).eq("id", req.params.id).select().single();
      if (error) throw error;
      res.json({ data });
    } catch (err) {
      next(err);
    }
  });

  router.delete("/:id", requireAuth, async (req, res, next) => {
    try {
      const { error } = await req.supabase.from(table).delete().eq("id", req.params.id);
      if (error) throw error;
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
