import cron from "node-cron";
import { supabaseAdmin } from "../../config/supabaseClient.js";
import { sendMail, isMailerConfigured } from "./mailer.js";

// Same rate inventory.controller.js quotes in its in-app overdue message,
// duplicated here (not imported) since it's a UI-facing constant, not a
// charge that's actually applied anywhere yet.
const OVERDUE_RATE = 5;
const SENDER_MAILBOX = process.env.SMTP_USER || process.env.OVERDUE_EMAIL_SENDER || "makerspace.team@cadt.edu.kh";

// Calendar-day difference (due_date is a DATE column, no time-of-day), not a
// 24-hour window. A straight "now vs due_date timestamp" comparison has a
// gap: by the time the 8am job runs, an item due "today" already has a
// due_date (midnight) in the past, so it's neither ">= now" (due soon) nor
// far enough in the past to clear a 1-day overdue threshold — it fell
// through both buckets entirely. Comparing calendar days instead makes
// "today", "tomorrow" and "N days ago" exact and gap-free.
// Negative = overdue by that many days, 0 = due today, 1 = due tomorrow.
function daysUntilDue(dueDate, now = new Date()) {
  const due = new Date(dueDate);
  const dueDay = Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate());
  const nowDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((dueDay - nowDay) / 86400000);
}

function buildOverdueEmail({ studentName, items }) {
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

// Not a penalty notice — the late fee hasn't started yet, so this is a
// same-day nudge to still make it back in time.
function buildDueTodayEmail({ studentName, items }) {
  const lines = items.map((i) => `  • "${i.itemName}"`).join("\n");
  const plural = items.length > 1;
  return {
    subject: plural ? `Due today: ${items.length} items need to come back to the Makerspace` : `Due today: "${items[0].itemName}" needs to come back to the Makerspace`,
    body:
      `Hi ${studentName},\n\n` +
      `You have ${items.length} item${plural ? "s" : ""} due back at the Makerspace today:\n\n${lines}\n\n` +
      `Please return ${plural ? "them" : "it"} today to avoid the ${OVERDUE_RATE} credits/day late fee starting tomorrow.\n\n` +
      `- CADT Makerspace team`,
  };
}

// Friendly heads-up, sent the day before something's due, so a student
// still has a full day's notice to avoid the late fee entirely.
function buildDueSoonEmail({ studentName, items }) {
  const lines = items.map((i) => `  • "${i.itemName}": due ${i.dueDay}`).join("\n");
  const plural = items.length > 1;
  return {
    subject: plural ? `Reminder: ${items.length} items due back tomorrow` : `Reminder: "${items[0].itemName}" is due back tomorrow`,
    body:
      `Hi ${studentName},\n\n` +
      `Just a heads up — you have ${items.length} item${plural ? "s" : ""} due back at the Makerspace tomorrow:\n\n${lines}\n\n` +
      `Please return ${plural ? "them" : "it"} on time to avoid the ${OVERDUE_RATE} credits/day late fee.\n\n` +
      `- CADT Makerspace team`,
  };
}

// One query, then bucketed in JS by daysUntilDue — simpler and gap-free
// compared to three separate date-range queries (see daysUntilDue above).
async function fetchActiveBorrowsWithDueDate() {
  const { data, error } = await supabaseAdmin
    .from("borrow_transactions")
    .select("borrow_id, user_id, due_date, users!borrow_transactions_user_id_fkey(full_name, email), inventory_items(item_name)")
    .eq("status", "borrowed")
    .not("due_date", "is", null);
  if (error) throw error;
  return data;
}

function groupByUser(rows, mapItem) {
  const byUser = new Map();
  for (const b of rows) {
    const userId = b.user_id;
    if (!byUser.has(userId)) {
      byUser.set(userId, { userId, toEmail: b.users?.email || null, studentName: b.users?.full_name || "there", items: [] });
    }
    byUser.get(userId).items.push(mapItem(b));
  }
  return [...byUser.values()];
}

// Splits every active borrow with a due date into three buckets — overdue
// (1+ days late), due today, and due tomorrow — each producing its own
// per-student candidate list with the wording appropriate to that bucket.
// A student with items in more than one bucket gets more than one email;
// that's intentional, each is a different tone (penalty vs. same-day nudge
// vs. advance heads-up).
async function getReminderBuckets() {
  const rows = await fetchActiveBorrowsWithDueDate();
  const overdueRows = [], dueTodayRows = [], dueTomorrowRows = [];
  for (const b of rows) {
    const d = daysUntilDue(b.due_date);
    if (d < 0) overdueRows.push(b);
    else if (d === 0) dueTodayRows.push(b);
    else if (d === 1) dueTomorrowRows.push(b);
  }

  const overdue = groupByUser(overdueRows, (b) => {
    const overdueDays = -daysUntilDue(b.due_date);
    return {
      borrowId: b.borrow_id,
      itemName: b.inventory_items?.item_name || "your item",
      dueDay: (b.due_date || "").slice(0, 10),
      overdueDays,
      creditsAccrued: overdueDays * OVERDUE_RATE,
    };
  }).map((u) => ({ ...u, from: SENDER_MAILBOX, ...buildOverdueEmail(u) }));

  const mapPlain = (b) => ({ borrowId: b.borrow_id, itemName: b.inventory_items?.item_name || "your item", dueDay: (b.due_date || "").slice(0, 10) });

  const dueToday = groupByUser(dueTodayRows, mapPlain).map((u) => ({ ...u, from: SENDER_MAILBOX, ...buildDueTodayEmail(u) }));
  const dueTomorrow = groupByUser(dueTomorrowRows, mapPlain).map((u) => ({ ...u, from: SENDER_MAILBOX, ...buildDueSoonEmail(u) }));

  return { overdue, dueToday, dueTomorrow };
}

// Everything overdue right now, grouped by student. Kept as its own export
// since it's a natural unit on its own (e.g. for anything that only cares
// about overdue, not the due-today/due-tomorrow buckets).
export async function getOverdueReminderCandidates() {
  return (await getReminderBuckets()).overdue;
}

async function getStaffEmails() {
  const { data, error } = await supabaseAdmin.from("users").select("email").in("role", ["admin", "staff"]).not("email", "is", null);
  if (error) throw error;
  return [...new Set(data.map((u) => u.email).filter(Boolean))];
}

// One digest email to every admin/staff account, covering all three
// buckets across every student — so staff have the full picture without
// needing to check Manage Stock. Built as the same {toEmail, items, from,
// subject, body} shape the per-student candidates use, so it flows through
// the same send loop and the same admin preview UI with no special-casing.
function buildAdminDigest(buckets, staffEmails) {
  const totalItems = buckets.overdue.length + buckets.dueToday.length + buckets.dueTomorrow.length
    ? buckets.overdue.reduce((s, c) => s + c.items.length, 0) + buckets.dueToday.reduce((s, c) => s + c.items.length, 0) + buckets.dueTomorrow.reduce((s, c) => s + c.items.length, 0)
    : 0;
  if (totalItems === 0 || staffEmails.length === 0) return null;

  const section = (title, list) => {
    if (list.length === 0) return "";
    const count = list.reduce((s, c) => s + c.items.length, 0);
    const lines = list
      .map((c) => c.items.map((i) => `  • ${c.studentName}: "${i.itemName}"${i.overdueDays ? ` (${i.overdueDays}d overdue, ${i.creditsAccrued}cr)` : ""}`).join("\n"))
      .join("\n");
    return `${title} — ${count} item(s), ${list.length} student(s):\n${lines}\n\n`;
  };

  const flatItems = [
    ...buckets.overdue.flatMap((c) => c.items),
    ...buckets.dueToday.flatMap((c) => c.items),
    ...buckets.dueTomorrow.flatMap((c) => c.items),
  ];

  return {
    userId: "admin-digest",
    toEmail: staffEmails.join(","),
    studentName: "Makerspace Staff (Digest)",
    items: flatItems,
    from: SENDER_MAILBOX,
    subject: `Makerspace daily digest: ${buckets.overdue.reduce((s, c) => s + c.items.length, 0)} overdue, ${buckets.dueToday.reduce((s, c) => s + c.items.length, 0)} due today, ${buckets.dueTomorrow.reduce((s, c) => s + c.items.length, 0)} due tomorrow`,
    body:
      `Daily borrow status digest — ${new Date().toISOString().slice(0, 10)}\n\n` +
      section("OVERDUE", buckets.overdue) +
      section("DUE TODAY", buckets.dueToday) +
      section("DUE TOMORROW", buckets.dueTomorrow) +
      `- CADT Makerspace system`,
  };
}

// dryRun=true (used by the admin preview endpoint) always just logs, so
// staff can check the content/recipient list without anything going out.
// The daily cron below calls this with dryRun=false and sends for real —
// as long as SMTP_USER/SMTP_PASS are set (see mailer.js); if they're not,
// it falls back to logging so an unconfigured deploy doesn't error out.
// Covers overdue, due-today, and due-tomorrow student reminders, plus one
// combined digest email to every admin/staff account.
export async function runOverdueReminderJob({ dryRun = false } = {}) {
  const buckets = await getReminderBuckets();
  const staffEmails = await getStaffEmails();
  const adminDigest = buildAdminDigest(buckets, staffEmails);

  const candidates = [...buckets.overdue, ...buckets.dueToday, ...buckets.dueTomorrow, ...(adminDigest ? [adminDigest] : [])];
  const sendReal = !dryRun && isMailerConfigured;
  for (const c of candidates) {
    if (!c.toEmail) {
      console.warn(`[overdue-reminder] skipped user ${c.userId}: no email on file`);
      continue;
    }
    if (sendReal) {
      try {
        await sendMail({ to: c.toEmail, subject: c.subject, text: c.body });
        console.log(`[overdue-reminder] sent to=${c.toEmail} items=${c.items.length}`);
      } catch (err) {
        console.error(`[overdue-reminder] failed to send to=${c.toEmail}:`, err.message);
      }
    } else {
      console.log(`[overdue-reminder][DRY RUN] to=${c.toEmail} from=${c.from} items=${c.items.length} subject="${c.subject}"`);
    }
  }
  return { checked: candidates.length, candidates, sent: sendReal };
}

// Daily at 08:00 Phnom Penh time. Sends real email once SMTP_USER/SMTP_PASS
// are set in the environment (see mailer.js); otherwise falls back to the
// same dry-run logging as before.
export function startOverdueReminderScheduler() {
  cron.schedule(
    "0 8 * * *",
    async () => {
      try {
        const { checked, sent } = await runOverdueReminderJob({ dryRun: false });
        console.log(`[overdue-reminder] daily run complete: ${checked} reminder(s) checked (sent=${sent})`);
      } catch (err) {
        console.error("[overdue-reminder] daily run failed:", err);
      }
    },
    { timezone: "Asia/Phnom_Penh" }
  );
}
