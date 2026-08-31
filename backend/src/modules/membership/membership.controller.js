import { supabaseAdmin, assertSupabaseConfigured } from "../../config/supabaseClient.js";
import { adjustCredits, getMembershipByUserId, CreditsError } from "../../shared/credits.js";

// Membership is deliberately not staff-actioned through a request/approval
// queue: payment always happens in person at the front desk (cash/QR), so
// the staff member entering it IS the approval. No pending state to model.
function toPublicMembership(row) {
  if (!row) {
    return { membershipStatus: "inactive", isMember: false, credits: 0, startDate: null, expiredDate: null };
  }
  return {
    membershipStatus: row.membership_status,
    isMember: row.membership_status === "active",
    credits: row.credits,
    startDate: row.start_date,
    expiredDate: row.expired_date,
  };
}

export async function getMyMembership(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const { data, error } = await supabaseAdmin
      .from("memberships")
      .select("*")
      .eq("user_id", req.user.user_id)
      .maybeSingle();
    if (error) throw error;
    res.json({ data: toPublicMembership(data) });
  } catch (err) {
    next(err);
  }
}

// Admin/Staff only. Looks up any user's membership by id; powers the
// admin "search a student, see their balance" panel.
export async function getMembershipForUser(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const userId = Number(req.params.userId);
    const { data, error } = await supabaseAdmin
      .from("memberships")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    res.json({ data: toPublicMembership(data) });
  } catch (err) {
    next(err);
  }
}

// Admin/Staff only. Recent credit_transactions rows for one student's
// membership — every earn/spend already gets logged here by adjustCredits()
// regardless of which module triggered it (membership top-up, bulk upload,
// inventory spend, ...); this just reads that existing ledger back out, it
// doesn't need to write anything new.
export async function getCreditHistoryForUser(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const userId = Number(req.params.userId);
    const membership = await getMembershipByUserId(userId);
    if (!membership) return res.json({ data: [] });

    const { data, error } = await supabaseAdmin
      .from("credit_transactions")
      .select("transaction_id, transaction_type, source_type, amount, description, created_at")
      .eq("membership_id", membership.membership_id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

// Admin/Staff only. Activates or renews a membership for the given user;
// upserts the one membership row per user (creates it on first activation).
export async function activateMembership(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const userId = Number(req.params.userId);

    const { data: existing, error: lookupError } = await supabaseAdmin
      .from("memberships")
      .select("membership_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (lookupError) throw lookupError;

    const start = new Date();
    const expired = new Date(start);
    expired.setFullYear(expired.getFullYear() + 1);

    const payload = {
      user_id: userId,
      membership_status: "active",
      start_date: start.toISOString().slice(0, 10),
      expired_date: expired.toISOString().slice(0, 10),
      approved_by: req.user.user_id,
    };

    const { data, error } = existing
      ? await supabaseAdmin.from("memberships").update(payload).eq("membership_id", existing.membership_id).select().single()
      : await supabaseAdmin.from("memberships").insert({ ...payload, credits: 0 }).select().single();
    if (error) throw error;

    res.json({ data: toPublicMembership(data) });
  } catch (err) {
    next(err);
  }
}

const MAX_BULK_ROWS = 500;

// Admin only (tighter than the single top-up above: a typo'd amount column
// here can hit dozens of accounts in one request, so the blast radius is
// much bigger than one click). Takes rows already parsed client-side from a
// CSV upload — { student_id, amount }[] — and applies each one independently
// through the same adjustCredits() ledger the single top-up uses. One bad
// row (unknown student, bad amount, not a member yet) doesn't stop the rest;
// every row's outcome comes back so the admin can see exactly what happened.
export async function bulkTopUpCredits(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const rows = Array.isArray(req.body.rows) ? req.body.rows : [];
    if (rows.length === 0) return res.status(400).json({ error: "No rows provided" });
    if (rows.length > MAX_BULK_ROWS) {
      return res.status(400).json({ error: `Too many rows (max ${MAX_BULK_ROWS} per upload)` });
    }

    const results = [];
    for (const row of rows) {
      const studentId = String(row.student_id ?? "").trim();
      const amount = Number(row.amount);

      if (!studentId) {
        results.push({ student_id: row.student_id ?? "", status: "error", message: "Missing student ID" });
        continue;
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        results.push({ student_id: studentId, status: "error", message: "Amount must be a positive number" });
        continue;
      }

      const { data: user, error: lookupError } = await supabaseAdmin
        .from("users")
        .select("user_id, full_name, student_id")
        .eq("student_id", studentId)
        .maybeSingle();
      if (lookupError) throw lookupError;
      if (!user) {
        results.push({ student_id: studentId, status: "error", message: "No student found with this ID" });
        continue;
      }

      try {
        const updated = await adjustCredits(user.user_id, amount, {
          sourceType: "membership",
          description: "Bulk credit top-up (CSV upload)",
        });
        results.push({ student_id: studentId, name: user.full_name, status: "success", credits: updated.credits });
      } catch (err) {
        if (err instanceof CreditsError) {
          results.push({ student_id: studentId, name: user.full_name, status: "error", message: err.message });
        } else {
          throw err;
        }
      }
    }

    res.json({ data: results });
  } catch (err) {
    next(err);
  }
}

// Admin/Staff only. Adds credits to a member's balance and logs the change
// in credit_transactions: the ledger that lets a student's balance stay
// auditable no matter which module spent or granted it.
export async function topUpCredits(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const userId = Number(req.params.userId);
    const { credits, description } = req.body;
    if (!Number.isFinite(credits) || credits <= 0) {
      return res.status(400).json({ error: "credits must be a positive number" });
    }

    const updated = await adjustCredits(userId, credits, {
      sourceType: "membership",
      description: description || "Credit top-up at front desk",
    });

    res.json({ data: toPublicMembership(updated) });
  } catch (err) {
    if (err instanceof CreditsError) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}
