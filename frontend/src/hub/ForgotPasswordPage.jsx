import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { HubNav } from "./HubNav";
import { api, BASE_URL } from "../lib/api/client";
import { D, GRADIENT, ErrorBox, TextField, MicrosoftButton } from "./authUi";

const ERROR_MESSAGES = {
  no_account: "We couldn't find an account for that Microsoft identity. If you're new here, create an account first.",
  inactive: "This account is inactive. Contact an admin for help.",
  invalid_state: "That verification attempt expired. Please try again.",
  no_email: "Microsoft didn't share an email address for that account.",
  missing_email: "Please enter your account email first.",
  email_mismatch: "The Microsoft account you signed in with doesn't match the email you entered. Sign in with the Microsoft account that owns that email.",
};

// Two steps: (1) the user tells us which account they're recovering and we
// confirm it exists; (2) they prove they own it by signing into the matching
// Microsoft account, which sends them on to /reset-password.
export default function ForgotPasswordPage() {
  const location = useLocation();
  const [email, setEmail]       = useState("");
  const [verified, setVerified] = useState(false); // account exists, ready for Microsoft step
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(location.search).get("error");
    if (code) setError(ERROR_MESSAGES[code] || "Something went wrong verifying your identity.");
  }, [location.search]);

  const handleCheck = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) { setError("Please enter your account email."); return; }
    setLoading(true);
    try {
      await api.post("/api/auth/forgot-password/check", { email });
      setVerified(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const continueWithMicrosoft = () => {
    window.location.href = `${BASE_URL}/api/auth/microsoft/login?intent=reset&email=${encodeURIComponent(email)}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: `linear-gradient(160deg, ${D.bg} 0%, ${D.bg2} 100%)` }}>
      <HubNav light />

      <div aria-hidden className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: `linear-gradient(rgba(99,102,241,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.05) 1px,transparent 1px)`, backgroundSize: "40px 40px" }} />

      <div className="relative z-10 w-full max-w-md rounded-3xl p-8 flex flex-col gap-4"
        style={{ background: D.card, boxShadow: "0 24px 64px rgba(0,0,30,0.35)" }}>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-1" style={{ background: GRADIENT }}>
          <ShieldCheck size={18} color="white" strokeWidth={2.2} />
        </div>
        <h1 className="text-2xl font-extrabold" style={{ color: D.text }}>Forgot your password?</h1>

        {!verified ? (
          <>
            <p className="text-sm leading-relaxed" style={{ color: D.muted }}>
              Enter your account email and we'll check it for you. You'll then verify it's really you
              through your Microsoft account — no reset email needed.
            </p>

            <form onSubmit={handleCheck} className="flex flex-col gap-4">
              <ErrorBox message={error} />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold" style={{ color: D.muted }}>Email</label>
                <TextField icon={Mail} type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" autoComplete="email" />
              </div>

              <button type="submit" disabled={loading}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-85 disabled:opacity-60"
                style={{ background: GRADIENT }}>
                {loading ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <ArrowRight size={14} />}
                {loading ? "Checking…" : "Continue"}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.28)", color: "#15803d" }}>
              <CheckCircle2 size={15} />
              Account found for {email}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: D.muted }}>
              Now prove it's you: sign in with the Microsoft account that owns <b>{email}</b>,
              and you'll be able to set a new password right after.
            </p>

            <ErrorBox message={error} />

            <MicrosoftButton label="Verify with Microsoft" onClick={continueWithMicrosoft} />

            <button type="button" onClick={() => { setVerified(false); setError(""); }}
              className="text-sm font-semibold hover:underline" style={{ color: D.muted }}>
              Use a different email
            </button>
          </>
        )}

        <Link to="/login" className="text-sm font-semibold text-center mt-1 hover:underline" style={{ color: "#6366f1" }}>
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
