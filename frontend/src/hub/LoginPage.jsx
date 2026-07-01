import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layers, Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import { useAuth } from "./AuthContext";

const D = {
  bg:     "#070d18",
  card:   "#0d1624",
  border: "rgba(99,102,241,0.18)",
  muted:  "rgba(255,255,255,0.38)",
  text:   "#c8d8f0",
};

export default function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    // Mock auth — accept any credentials, derive name from email
    setTimeout(() => {
      const name = form.email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      login({ name, email: form.email });
      navigate("/profile");
    }, 700);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: `linear-gradient(160deg, ${D.bg} 0%, #0a1628 100%)` }}>

      {/* Grid overlay */}
      <div aria-hidden className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: `linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)`, backgroundSize: "40px 40px" }} />

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 mb-10 relative z-10">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
          <Layers size={16} color="white" strokeWidth={2.2} />
        </div>
        <span className="font-bold text-lg text-white">CADT <span style={{ color: "#818cf8" }}>Hub</span></span>
      </Link>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl p-8"
        style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: "0 24px 64px rgba(0,0,30,0.6)" }}>

        {/* LED strip */}
        <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 2, background: "linear-gradient(90deg,transparent,#6366f1,#a855f7,transparent)", borderRadius: 2 }} />

        <h1 className="text-2xl font-extrabold text-white mb-1">Welcome back</h1>
        <p className="text-sm mb-7" style={{ color: D.muted }}>Sign in to your CADT Hub account.</p>

        {error && (
          <div className="mb-5 px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold" style={{ color: D.muted }}>Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: D.muted }} />
              <input
                type="email" value={form.email} onChange={set("email")}
                placeholder="you@example.com" autoComplete="email"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
                onFocus={e => e.target.style.borderColor = "#6366f1"}
                onBlur={e  => e.target.style.borderColor = "rgba(255,255,255,0.10)"}
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold" style={{ color: D.muted }}>Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: D.muted }} />
              <input
                type={showPw ? "text" : "password"} value={form.password} onChange={set("password")}
                placeholder="••••••••" autoComplete="current-password"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm text-white outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
                onFocus={e => e.target.style.borderColor = "#6366f1"}
                onBlur={e  => e.target.style.borderColor = "rgba(255,255,255,0.10)"}
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: D.muted }}>
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-85 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
            {loading ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <LogIn size={14} />}
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: D.muted }}>
          Don't have an account?{" "}
          <Link to="/hub/register" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
            Create one
          </Link>
        </p>
      </div>

      <p className="relative z-10 mt-8 text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
        © {new Date().getFullYear()} CADT Makerspace · Demo only
      </p>
    </div>
  );
}
