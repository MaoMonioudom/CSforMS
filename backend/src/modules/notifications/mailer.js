import nodemailer from "nodemailer";

// Sends over plain SMTP login — deliberately NOT the Microsoft
// Graph/makerspace@cadt.edu.kh route (scripts/testGraphMailSend.js), which
// needs a CADT Global Admin to grant Mail.Send + admin consent, and turned
// out to be a dead end (no admin account available). This works with any
// mailbox's own credentials — a personal Gmail/Outlook.com account included
// — so it has no dependency on the school's tenant admin at all.
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
// Display name only, e.g. "CADT Makerspace" — so recipients still see a
// friendly sender name even though the address underneath is a personal
// Gmail/Outlook account, not makerspace@cadt.edu.kh.
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || "CADT Makerspace";

export const isMailerConfigured = Boolean(SMTP_USER && SMTP_PASS);

let transporter = null;
function getTransporter() {
  if (!isMailerConfigured) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: false, // STARTTLS on 587, not implicit TLS
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

export async function sendMail({ to, subject, text }) {
  const t = getTransporter();
  if (!t) throw new Error("SMTP_USER / SMTP_PASS not set — mailer is not configured");
  await t.sendMail({ from: `"${SMTP_FROM_NAME}" <${SMTP_USER}>`, to, subject, text });
}
