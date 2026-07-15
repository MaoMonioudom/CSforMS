import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserPlus, User as UserIcon } from "lucide-react";
import { HubNav } from "./HubNav";
import { api } from "../lib/api/client";
import { useAuth } from "./AuthContext";
import { destinationFor } from "./authNav";
import { D, GRADIENT, ErrorBox, TextField, PasswordField } from "./authUi";

// Lands here after Microsoft has verified the email but no account exists
// yet (see microsoftCallback's "ms_signup" branch) — Microsoft only proves
// the email is real, it doesn't get to pick the name or password for you.
export default function CompleteSignupPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const params = new URLSearchParams(location.search);
  const token = params.get("token");
  const email = params.get("email") || "";

  const [fullName, setFullName] = useState(params.get("name") || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!fullName.trim()) { setError("Please enter your name."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setLoading(true);
    try {
      const { token: sessionToken } = await api.post("/api/auth/microsoft/complete-signup", {
        token, full_name: fullName.trim(), password,
      });
      const user = await loginWithToken(sessionToken);
      navigate(destinationFor(user.role), { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
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
          <UserPlus size={18} color="white" strokeWidth={2.2} />
        </div>

        {!token ? (
          <>
            <h1 className="text-2xl font-extrabold" style={{ color: D.text }}>This link is invalid</h1>
            <p className="text-sm leading-relaxed" style={{ color: D.muted }}>
              We couldn't find a signup token in this link. Start over from the sign in page.
            </p>
            <Link to="/login" className="text-sm font-semibold text-center mt-1 hover:underline" style={{ color: "#6366f1" }}>
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold" style={{ color: D.text }}>Finish creating your account</h1>
            <p className="text-sm leading-relaxed" style={{ color: D.muted }}>
              Microsoft verified <b>{email}</b> is really you. Just pick a name and password to finish.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <ErrorBox message={error} />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold" style={{ color: D.muted }}>Full name</label>
                <TextField icon={UserIcon} type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name" autoComplete="name" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold" style={{ color: D.muted }}>Password</label>
                <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" autoComplete="new-password" show={showPw} onToggleShow={() => setShowPw(v => !v)} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold" style={{ color: D.muted }}>Confirm password</label>
                <PasswordField value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" autoComplete="new-password" show={showPw} onToggleShow={() => setShowPw(v => !v)} />
              </div>

              <button type="submit" disabled={loading}
                className="mt-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-85 disabled:opacity-60"
                style={{ background: GRADIENT }}>
                {loading ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : null}
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>

            <Link to="/login" className="text-sm font-semibold text-center mt-1 hover:underline" style={{ color: "#6366f1" }}>
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
