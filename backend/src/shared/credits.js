import { supabaseAdmin } from "../config/supabaseClient.js";

// Credits live on `memberships` and every change must leave a row in
// `credit_transactions` — one shared implementation so the membership and
// inventory modules can't drift on the rules (no overdrafts, always logged).

export class CreditsError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function getMembershipByUserId(userId) {
  const { data, error } = await supabaseAdmin
    .from("memberships")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Positive delta = earn, negative = spend. Rejects (rather than clamps)
// spends that exceed the balance, and requires an existing membership row —
// same rule membership.controller's topUpCredits enforces.
export async function adjustCredits(userId, delta, { sourceType = "inventory", sourceId = null, description } = {}) {
  if (!Number.isFinite(delta) || delta === 0) {
    throw new CreditsError("Credit change must be a non-zero number");
  }

  const membership = await getMembershipByUserId(userId);
  if (!membership) {
    throw new CreditsError("This user is not a member yet — activate membership first");
  }

  const nextCredits = membership.credits + delta;
  if (nextCredits < 0) {
    throw new CreditsError(`Insufficient credits: needs ${-delta}, has ${membership.credits}`);
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("memberships")
    .update({ credits: nextCredits })
    .eq("membership_id", membership.membership_id)
    .select()
    .single();
  if (updateError) throw updateError;

  const { error: txnError } = await supabaseAdmin.from("credit_transactions").insert({
    membership_id: membership.membership_id,
    transaction_type: delta > 0 ? "earn" : "spend",
    source_type: sourceType,
    source_id: sourceId,
    amount: Math.abs(delta),
    description,
  });
  if (txnError) throw txnError;

  return updated;
}
