import { supabaseAdmin, assertSupabaseConfigured } from "../../config/supabaseClient.js";

// Membership is deliberately not staff-actioned through a request/approval
// queue — payment always happens in person at the front desk (cash/QR), so
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

// Admin/Staff only. Looks up any user's membership by id — powers the
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

// Admin/Staff only. Activates or renews a membership for the given user —
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

// Admin/Staff only. Adds credits to a member's balance and logs the change
// in credit_transactions — the ledger that lets a student's balance stay
// auditable no matter which module spent or granted it.
export async function topUpCredits(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const userId = Number(req.params.userId);
    const { credits, description } = req.body;
    if (!Number.isFinite(credits) || credits <= 0) {
      return res.status(400).json({ error: "credits must be a positive number" });
    }

    const { data: membership, error: lookupError } = await supabaseAdmin
      .from("memberships")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (!membership) {
      return res.status(400).json({ error: "This user is not a member yet — activate membership first" });
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("memberships")
      .update({ credits: membership.credits + credits })
      .eq("membership_id", membership.membership_id)
      .select()
      .single();
    if (updateError) throw updateError;

    const { error: txnError } = await supabaseAdmin.from("credit_transactions").insert({
      membership_id: membership.membership_id,
      transaction_type: "earn",
      source_type: "membership",
      amount: credits,
      description: description || "Credit top-up at front desk",
    });
    if (txnError) throw txnError;

    res.json({ data: toPublicMembership(updated) });
  } catch (err) {
    next(err);
  }
}
