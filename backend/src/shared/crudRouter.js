import { Router } from "express";
import { supabasePublic, supabaseAdmin, assertSupabaseConfigured } from "../config/supabaseClient.js";
import { requireAuth } from "../middleware/requireAuth.js";

// Generic REST router for a single table. Reads go through the anon-key
// client (no RLS is defined on these tables, so this is just a plain
// read); writes go through the service-role client, gated by our own
// requireAuth — there's no per-user Supabase session to scope them to.
//
// pkColumn: this schema doesn't use a uniform "id" column (events use
// event_id, posts use post_id, etc.), so callers must say which one applies.
// ownerField: if set, that column is stamped with req.user.user_id on
// create, overriding anything the caller sent (e.g. "user_id" on
// community_posts, which is NOT NULL).
export function createCrudRouter(table, { pkColumn = "id", ownerField } = {}) {
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
      const { data, error } = await supabasePublic.from(table).select("*").eq(pkColumn, req.params.id).single();
      if (error) throw error;
      res.json({ data });
    } catch (err) {
      next(err);
    }
  });

  router.post("/", requireAuth, async (req, res, next) => {
    try {
      const payload = ownerField ? { ...req.body, [ownerField]: req.user.user_id } : req.body;
      const { data, error } = await supabaseAdmin.from(table).insert(payload).select().single();
      if (error) throw error;
      res.status(201).json({ data });
    } catch (err) {
      next(err);
    }
  });

  router.put("/:id", requireAuth, async (req, res, next) => {
    try {
      const { data, error } = await supabaseAdmin.from(table).update(req.body).eq(pkColumn, req.params.id).select().single();
      if (error) throw error;
      res.json({ data });
    } catch (err) {
      next(err);
    }
  });

  router.delete("/:id", requireAuth, async (req, res, next) => {
    try {
      const { error } = await supabaseAdmin.from(table).delete().eq(pkColumn, req.params.id);
      if (error) throw error;
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
