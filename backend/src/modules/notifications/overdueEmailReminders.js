import cron from "node-cron";
import { supabaseAdmin } from "../../config/supabaseClient.js";

// Same rate inventory.controller.js quotes in its in-app overdue message,
// duplicated here (not imported) since it's a UI-facing constant, not a
// charge that's actually applied anywhere yet.
const OVERDUE_RATE = 5;
const SENDER_MAILBOX = process.env.OVERDUE_EMAIL_SENDER || "makerspace.team@cadt.edu.kh";

function daysOverdue(dueDate, now = new Date()) {
  const due = new Date(dueDate);
  return Math.floor((now - due) / 86400000);
}

// One email per student, listing every overdue item together. A student
// with 3 overdue items gets 1 email, not 3.
function buildEmail({ studentName, items }) {
  const totalCredits = items.reduce((sum, i) => sum + i.creditsAccrued, 0);
  const lines = items
    .map((i) => `  • "${i.itemName}": due ${i.dueDay}, ${i.overdueDays} day${i.overdueDays === 1 ? "" : "s"} overdue (${i.creditsAccrued} credits so far)`)
    .join("\n");
  const plural = items.length > 1;
  return {
    subject: plural ? `Overdue: ${items.length} items need to come back to the Makerspace` : `Overdue: "${items[0].itemName}" needs to come back to the Makerspace`,
    body:
      `Hi ${studentName},\n\n` +
      `You have ${items.length} item${plural ? "s" : ""} overdue at the Makerspace:\n\n${lines}\n\n` +
      `Late returns are charged ${OVERDUE_RATE} credits per day per item (${totalCredits} credits total so far); this keeps growing until each item is returned.\n\n` +
      `Please bring ${plural ? "them" : "it"} back to the Makerspace as soon as you can.\n\n` +
      `- CADT Makerspace team`,
  };
}

// Everything overdue right now, grouped by student. This is the shared
// query behind both the admin preview endpoint and the daily send job, so
// what you see in the preview is exactly what would go out.
export async function getOverdueReminderCandidates() {
  const { data: borrows, error } = await supabaseAdmin
    .from("borrow_transactions")
    .select("borrow_id, user_id, due_date, users!borrow_transactions_user_id_fkey(full_name, email), inventory_items(item_name)")
    .eq("status", "borrowed")
    .not("due_date", "is", null)
    .lt("due_date", new Date().toISOString());
  if (error) throw error;

  const byUser = new Map();
  for (const b of borrows) {
    const overdueDays = daysOverdue(b.due_date);
    if (overdueDays < 1) continue; // just crossed the line today; first email goes out tomorrow
    const userId = b.user_id;
    if (!byUser.has(userId)) {
      byUser.set(userId, {
        userId,
        toEmail: b.users?.email || null,
        studentName: b.users?.full_name || "there",
        items: [],
      });
    }
    byUser.get(userId).items.push({
      borrowId: b.borrow_id,
      itemName: b.inventory_items?.item_name || "your item",
      dueDay: (b.due_date || "").slice(0, 10),
      overdueDays,
      creditsAccrued: overdueDays * OVERDUE_RATE,
    });
  }

  return [...byUser.values()].map((u) => ({
    ...u,
    from: SENDER_MAILBOX,
    ...buildEmail(u),
  }));
}

// Dry-run only for now; logs what would be sent instead of calling
// Microsoft Graph. Flip this over to a real sendMail call once the Azure
// app registration has Mail.Send (application permission + admin consent).
export async function runOverdueReminderJob() {
  const candidates = await getOverdueReminderCandidates();
  for (const c of candidates) {
    if (!c.toEmail) {
      console.warn(`[overdue-reminder] skipped user ${c.userId}: no email on file`);
      continue;
    }
    console.log(`[overdue-reminder][DRY RUN] to=${c.toEmail} from=${c.from} items=${c.items.length} subject="${c.subject}"`);
  }
  return { checked: candidates.length, candidates };
}

// Daily at 08:00 Phnom Penh time; dry-run only until Mail.Send is granted
// on the Azure app registration (see runOverdueReminderJob above). Once
// that's live, this same schedule starts sending real email with no other
// changes needed.
export function startOverdueReminderScheduler() {
  cron.schedule(
    "0 8 * * *",
    async () => {
      try {
        const { checked } = await runOverdueReminderJob();
        console.log(`[overdue-reminder] daily run complete: ${checked} overdue borrow(s) checked`);
      } catch (err) {
        console.error("[overdue-reminder] daily run failed:", err);
      }
    },
    { timezone: "Asia/Phnom_Penh" }
  );
}
