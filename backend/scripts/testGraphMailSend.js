import "dotenv/config";

// One-off test: tries to send a single real email as Makerspace@cadt.edu.kh
// via Microsoft Graph, using the app's own identity (not a signed-in user).
// This is exactly the permission the overdue-reminder feature is waiting on
// (see backend/src/modules/notifications/overdueEmailReminders.js) — this
// script exists purely to find out, once and for all, whether that
// permission (Mail.Send, application type, admin-consented) has actually
// been granted on the Azure app registration or not.
//
// Safe to run: if the permission is missing, Microsoft's API just rejects
// the request with an error (usually "Authorization_RequestDenied") — no
// email goes out, nothing breaks, nothing gets sent to anyone.
//
// Usage:
//   node scripts/testGraphMailSend.js you@student.cadt.edu.kh
// (defaults to the address below if no argument is given)

const SENDER_MAILBOX = process.env.OVERDUE_EMAIL_SENDER || "Makerspace@cadt.edu.kh";
const TO_ADDRESS = process.argv[2] || "Monioudom.mao@student.cadt.edu.kh";

const { MICROSOFT_TENANT_ID, MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET } = process.env;

async function getAppToken() {
  const url = `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: MICROSOFT_CLIENT_ID,
    client_secret: MICROSOFT_CLIENT_SECRET,
    grant_type: "client_credentials",
    scope: "https://graph.microsoft.com/.default",
  });

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Token request failed (${res.status}): ${JSON.stringify(data, null, 2)}`);
  }
  return data.access_token;
}

async function sendTestMail(accessToken) {
  const url = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(SENDER_MAILBOX)}/sendMail`;
  const payload = {
    message: {
      subject: "Test: Makerspace app Graph Mail.Send permission check",
      body: {
        contentType: "Text",
        content:
          `This is a one-off test from testGraphMailSend.js.\n\n` +
          `If you're reading this, the app registration DOES have Mail.Send ` +
          `permission granted — real email sending (event reminders, overdue ` +
          `item reminders) can be switched on for real.`,
      },
      toRecipients: [{ emailAddress: { address: TO_ADDRESS } }],
    },
    saveToSentItems: "false",
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (res.status === 202) {
    console.log(`✅ SUCCESS — Microsoft accepted the send request. Check ${TO_ADDRESS}'s inbox.`);
    console.log(`   This means Mail.Send IS granted on the app registration.`);
    return;
  }

  const errBody = await res.json().catch(() => ({}));
  console.log(`❌ REJECTED (HTTP ${res.status}) — Microsoft Graph refused to send.`);
  console.log(JSON.stringify(errBody, null, 2));
  if (errBody?.error?.code === "ErrorAccessDenied" || res.status === 403 || res.status === 401) {
    console.log(`\n   This is the expected shape of error if Mail.Send is NOT granted yet.`);
    console.log(`   Fix: in the Azure Portal, go to this app's registration → API permissions →`);
    console.log(`   add "Mail.Send" (Application type, not Delegated) → click "Grant admin consent".`);
  }
}

(async () => {
  if (!MICROSOFT_TENANT_ID || !MICROSOFT_CLIENT_ID || !MICROSOFT_CLIENT_SECRET) {
    console.error("Missing MICROSOFT_TENANT_ID / MICROSOFT_CLIENT_ID / MICROSOFT_CLIENT_SECRET in backend/.env");
    process.exit(1);
  }
  console.log(`Sending from: ${SENDER_MAILBOX}`);
  console.log(`Sending to:   ${TO_ADDRESS}`);
  try {
    const token = await getAppToken();
    console.log("Got an app-identity token from Microsoft. Attempting to send…\n");
    await sendTestMail(token);
  } catch (err) {
    console.error("Failed before even attempting to send:", err.message);
  }
})();
