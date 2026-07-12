import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Layers, Mail, Lock, User, LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import { useAuth } from "./AuthContext";
import msBbgLogo from "../assets/ms_bbg_logo.png";
import { HubNav } from "./HubNav";
import { AppFooter } from "../components/AppFooter";
// Single shared page for both /login and /register — which mode is active
// is derived from the route, and switching modes navigates between the two
// routes while sliding an overlay panel across (classic sign-in/sign-up
// panel pattern): register puts the info panel on the left and the form on
// the right; login is the mirror of that.

const D = {
  bg:     "#eef5fc",
  bg2:    "#dbeafe",
  card:   "#ffffff",
  border: "rgba(99,102,241,0.18)",
  muted:  "#5b7286",
  text:   "#16324a",
};
const GRADIENT = "linear-gradient(135deg,#033e8a,#0078b7)";

// const MODULES = [
//   { label: "Community", color: "#c9a86c" },
//   { label: "Learning",  color: "#c0392b" },
//   { label: "Inventory", color: "#0891b2" },
// ];

const inputStyle = { background: "rgba(15,50,80,0.045)", border: "1px solid rgba(15,50,80,0.14)", color: D.text };
const focusIn  = (e) => (e.target.style.borderColor = "#6366f1");
const focusOut = (e) => (e.target.style.borderColor = "rgba(15,50,80,0.14)");

function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <div className="px-4 py-2.5 rounded-xl text-sm font-medium"
      style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.28)", color: "#b91c1c" }}>
      {message}
    </div>
  );
}

function TextField({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: D.muted }} />
      <input {...props} className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
        style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
    </div>
  );
}

function PasswordField({ value, onChange, placeholder, autoComplete, show, onToggleShow }) {
  return (
    <div className="relative">
      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: D.muted }} />
      <input
        type={show ? "text" : "password"} value={value} onChange={onChange}
        placeholder={placeholder} autoComplete={autoComplete}
        className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm outline-none transition-colors"
        style={inputStyle} onFocus={focusIn} onBlur={focusOut}
      />
      <button type="button" onClick={onToggleShow} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: D.muted }}>
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

// ── Login form ──────────────────────────────────────────────────────────────
function LoginForm({ form, setForm, error, loading, showPw, setShowPw, onSubmit, mobileToggle }) {
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <form onSubmit={onSubmit} className="w-full flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: D.text }}>Welcome back</h1>
      <p className="text-sm" style={{ color: D.muted }}>Sign in to your CADT Hub account.</p>
      <ErrorBox message={error} />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold" style={{ color: D.muted }}>Email</label>
        <TextField icon={Mail} type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold" style={{ color: D.muted }}>Password</label>
        <PasswordField value={form.password} onChange={set("password")} placeholder="••••••••" autoComplete="current-password" show={showPw} onToggleShow={() => setShowPw(v => !v)} />
      </div>

      <button type="submit" disabled={loading}
        className="mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-85 disabled:opacity-60"
        style={{ background: GRADIENT }}>
        {loading ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <LogIn size={14} />}
        {loading ? "Signing in…" : "Sign In"}
      </button>

      {mobileToggle}
    </form>
  );
}

// ── Register form ────────────────────────────────────────────────────────────
function RegisterForm({ form, setForm, error, loading, showPw, setShowPw, onSubmit, mobileToggle }) {
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <form onSubmit={onSubmit} className="w-full flex flex-col gap-3.5">
      {/* <div className="flex gap-1.5 mb-1">
        {MODULES.map(m => (
          <span key={m.label} className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${m.color}18`, color: m.color, border: `1px solid ${m.color}30` }}>
            {m.label}
          </span>
        ))}
      </div> */}
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: D.text }}>Create account</h1>
      <p className="text-sm" style={{ color: D.muted }}>Join Makerclub and access all three modules.</p>
      <ErrorBox message={error} />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold" style={{ color: D.muted }}>Full Name</label>
        <TextField icon={User} type="text" value={form.name} onChange={set("name")} placeholder="Your name" autoComplete="name" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold" style={{ color: D.muted }}>Email</label>
        <TextField icon={Mail} type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold" style={{ color: D.muted }}>Password</label>
        <PasswordField value={form.password} onChange={set("password")} placeholder="Min. 6 characters" autoComplete="new-password" show={showPw} onToggleShow={() => setShowPw(v => !v)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold" style={{ color: D.muted }}>Confirm Password</label>
        <PasswordField value={form.confirm} onChange={set("confirm")} placeholder="Repeat password" autoComplete="new-password" show={showPw} onToggleShow={() => setShowPw(v => !v)} />
      </div>

      <button type="submit" disabled={loading}
        className="mt-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-85 disabled:opacity-60"
        style={{ background: GRADIENT }}>
        {loading ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <UserPlus size={14} />}
        {loading ? "Creating account…" : "Create Account"}
      </button>

      {mobileToggle}
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AuthPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isRegister = location.pathname === "/register";

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm]     = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw]       = useState(false);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  useEffect(() => { setError(""); setLoading(false); }, [isRegister]);

  // Already signed in but landed on /login or /register anyway (e.g. via a
  // bookmark, or the "back" button after a previous sign-in) — bounce to
  // Profile instead of showing a stale auth form. Uses replace so it doesn't
  // add yet another entry for "back" to trip over.
  useEffect(() => {
    if (user) navigate("/profile", { replace: true });
  }, [user, navigate]);

  const switchTo = (mode) => navigate(mode === "register" ? "/register" : "/login");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    if (!loginForm.email || !loginForm.password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setTimeout(() => {
      const name = loginForm.email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      login({ name, email: loginForm.email });
      navigate("/profile", { replace: true });
    }, 700);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError("");
    if (!regForm.name || !regForm.email || !regForm.password) { setError("Please fill in all fields."); return; }
    if (regForm.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (regForm.password !== regForm.confirm) { setError("Passwords don't match."); return; }
    setLoading(true);
    setTimeout(() => {
      login({ name: regForm.name, email: regForm.email });
      navigate("/profile", { replace: true });
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: `linear-gradient(160deg, ${D.bg} 0%, ${D.bg2} 100%)` }}>
    <HubNav light />

      <div aria-hidden className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: `linear-gradient(rgba(99,102,241,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.05) 1px,transparent 1px)`, backgroundSize: "40px 40px" }} />

      {/* <Link to="/" className="flex items-center gap-2.5 mb-8 relative z-10">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: GRADIENT }}>
          <Layers size={16} color="white" strokeWidth={2.2} />
        </div>
        <span className="font-bold text-lg" style={{ color: D.text }}>CADT <span style={{ color: "#6366f1" }}>Hub</span></span>
      </Link> */}

      {/* ── Desktop: sliding overlay panel ──────────────────────────── */}
      <div className="relative z-10 hidden md:block w-full max-w-[840px] rounded-3xl overflow-hidden "
        style={{ height: 580, background: D.card, boxShadow: "0 24px 64px rgba(0,0,30,0.35)" }}>

        {/* Sign-in form — lives in the left half, slides right and fades out when registering */}
        <div className="absolute top-0 left-0 h-full w-1/2 flex items-center px-10 transition-all duration-700 ease-in-out"
          style={{
            transform: isRegister ? "translateX(100%)" : "translateX(0)",
            opacity: isRegister ? 0 : 1,
            zIndex: isRegister ? 1 : 5,
            pointerEvents: isRegister ? "none" : "auto",
          }}>
          <LoginForm form={loginForm} setForm={setLoginForm} error={!isRegister ? error : ""} loading={loading}
            showPw={showPw} setShowPw={setShowPw} onSubmit={handleLogin} />
        </div>

        {/* Sign-up form — lives in the left half too, revealed on the right when registering */}
        <div className="absolute top-0 left-0 h-full w-1/2 flex items-center px-10 py-8 overflow-y-auto transition-all duration-700 ease-in-out"
          style={{
            transform: isRegister ? "translateX(100%)" : "translateX(0)",
            opacity: isRegister ? 1 : 0,
            zIndex: isRegister ? 5 : 1,
            pointerEvents: isRegister ? "auto" : "none",
          }}>
          <RegisterForm form={regForm} setForm={setRegForm} error={isRegister ? error : ""} loading={loading}
            showPw={showPw} setShowPw={setShowPw} onSubmit={handleRegister} />
        </div>

        {/* Sliding gradient overlay — occupies whichever half the active form ISN'T on */}
        <div className="absolute top-0 h-full w-1/2 overflow-hidden transition-all duration-700 ease-in-out"
          style={{ left: isRegister ? 0 : "50%", zIndex: 20 }}>
          <div className="relative h-full transition-all duration-700 ease-in-out" style={{ width: "200%", left: isRegister ? "0%" : "-100%" }}>
            <div className="absolute inset-0" style={{ background: GRADIENT }} />
            <div aria-hidden className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "18px 18px" }} />

            {/* Shown when the overlay sits on the LEFT (register mode) — points back to sign in */}
            <div className="absolute top-0 left-0 h-full w-1/2 flex flex-col items-center justify-center text-center px-10 text-white">
              <img src={msBbgLogo} alt="CADT Makerspace" className="h-10 w-auto object-contain mb-6" />
              <h2 className="text-2xl font-extrabold mb-3">Welcome back!</h2>
              <p className="text-sm text-white/80 mb-8 leading-relaxed">Already part of Makerclub? Sign in to pick up where you left off.</p>
              <button type="button" onClick={() => switchTo("login")}
                className="px-7 py-2.5 rounded-full font-bold text-sm border-2 border-white text-white transition-colors hover:bg-white hover:text-indigo-600">
                Sign In
              </button>
            </div>

            {/* Shown when the overlay sits on the RIGHT (login mode) — points to sign up */}
            <div className="absolute top-0 right-0 h-full w-1/2 flex flex-col items-center justify-center text-center px-10 text-white">
              <img src={msBbgLogo} alt="CADT Makerspace" className="h-10 w-auto object-contain mb-6" />
              <h2 className="text-2xl font-extrabold mb-3">New here?</h2>
              <p className="text-sm text-white/80 mb-8 leading-relaxed">Create a free account and unlock Community, Learning, and Inventory.</p>
              <button type="button" onClick={() => switchTo("register")}
                className="px-7 py-2.5 rounded-full font-bold text-sm border-2 border-white text-white transition-colors hover:bg-white hover:text-indigo-600">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile: full-screen takeover, no sliding (too tight a space for it) ── */}
      <div className="md:hidden fixed inset-0 z-40 flex flex-col overflow-y-auto" style={{ background: D.card }}>

        {/* Info banner — same branding as the desktop overlay, with its own toggle button */}
        <div className="shrink-0 px-8 pt-14 pb-8 text-center" style={{ background: GRADIENT }}>
          <img src={msBbgLogo} alt="CADT Makerspace" className="h-9 w-auto object-contain mx-auto mb-3" />
          <h2 className="text-xl font-extrabold text-white mb-1.5">
            {isRegister ? "New here?" : "Welcome back"}
          </h2>
          <p className="text-xs text-white/85 leading-relaxed mb-5 max-w-xs mx-auto">
            {isRegister ? "Join the CADT Makerspace community." : "Sign in to continue to Makerclub."}
          </p>
          <button type="button" onClick={() => switchTo(isRegister ? "login" : "register")}
            className="px-6 py-2 rounded-full font-bold text-xs border-2 border-white text-white transition-colors hover:bg-white hover:text-indigo-600">
            {isRegister ? "Sign In instead" : "Create an account"}
          </button>
        </div>

        <div className="flex-1 px-8 py-8">
          {isRegister ? (
            <RegisterForm form={regForm} setForm={setRegForm} error={error} loading={loading}
              showPw={showPw} setShowPw={setShowPw} onSubmit={handleRegister} />
          ) : (
            <LoginForm form={loginForm} setForm={setLoginForm} error={error} loading={loading}
              showPw={showPw} setShowPw={setShowPw} onSubmit={handleLogin} />
          )}
        </div>
      </div>

      {/* <p className="relative z-10 mt-8 text-xs" style={{ color: D.muted, opacity: 0.7 }}>
        © {new Date().getFullYear()} CADT Makerspace · Demo only
      </p> */}
        {/* <AppFooter /> */}
    </div>
  );
}
