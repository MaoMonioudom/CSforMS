import "dotenv/config";
import nodemailer from "nodemailer";

// One-off test: tries to send a single real email via direct SMTP login,
// using whatever mailbox is configured in SMTP_USER/SMTP_PASS (a personal
// Gmail/Outlook.com account with an app password, by design — the
// makerspace@cadt.edu.kh / Microsoft Graph route in testGraphMailSend.js
// turned out to need a CADT Global Admin nobody currently has access to).
//
// Usage:
//   node scripts/testSmtpMailSend.js you@student.cadt.edu.kh
// (defaults to the address below if no argument is given)

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const TO_ADDRESS = process.argv[2] || "Monioudom.mao@student.cadt.edu.kh";

(async () => {
  if (!SMTP_USER || !SMTP_PASS) {
    console.error("Missing SMTP_USER / SMTP_PASS in backend/.env");
    console.error("  SMTP_USER should be your personal Gmail/Outlook.com address");
    console.error("  SMTP_PASS should be an app password for that account (not your normal login password)");
    process.exit(1);
  }

  console.log(`Connecting to: ${SMTP_HOST}:${SMTP_PORT}`);
  console.log(`Sending from:  ${SMTP_USER}`);
  console.log(`Sending to:    ${TO_ADDRESS}\n`);

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transporter.sendMail({
      from: SMTP_USER,
      to: TO_ADDRESS,
      subject: "Test: Makerspace SMTP mail send check",
      text:
        "This is a one-off test from testSmtpMailSend.js.\n\n" +
        "If you're reading this, SMTP AUTH works for this mailbox — the " +
        "overdue-reminder emails can go out for real.",
    });
    console.log("✅ SUCCESS — the mail server accepted the message. Check the inbox above.");
  } catch (err) {
    console.log(`❌ FAILED — ${err.message}`);
    if (err.responseCode === 535 || /auth/i.test(err.message)) {
      console.log("\n   Login was rejected. Most likely causes for a personal Gmail/Outlook.com account:");
      console.log("   - You used your normal account password instead of an app password.");
      console.log("     Gmail: Google Account → Security → 2-Step Verification (must be ON) → App passwords");
      console.log("            → generate one for \"Mail\" → use that 16-character code as SMTP_PASS.");
      console.log("     Outlook.com: account.live.com/proofs/AppPassword → generate one the same way.");
      console.log("   - SMTP_USER doesn't match the account the app password was generated for.");
    }
  }
})();
