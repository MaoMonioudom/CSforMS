import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/learning/useAuth";

const LABEL = "text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-navy-muted";
const INPUT =
  "w-full rounded border border-gold/20 bg-navy px-3.5 py-3 text-[0.9rem] text-parchment outline-none transition-colors duration-300 focus:border-gold";

/**
 * Staff sign-in for the learning module (admin + lecturer).
 * Not routed yet — wire it up once the admin/lecturer dashboards are fixed.
 */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const result = login(form.email, form.password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate(result.user.role === "admin" ? "/admin" : "/lecturer");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-deep p-4 font-body">
      <div className="w-full max-w-[380px] rounded-lg border border-gold/15 bg-navy px-6 py-8">
        <Link to="/learning" className="mb-6 block font-display text-base text-parchment">
          📚 Makerspace Learning
        </Link>
        <h1 className="mb-1.5 font-display text-[1.6rem] text-parchment">Staff Sign In</h1>
        <p className="mb-6 text-sm text-navy-muted">
          Admin and lecturer access to manage the platform.
        </p>

        <form className="flex flex-col gap-4" onSubmit={submit}>
          <div className="flex flex-col gap-1.5">
            <label className={LABEL} htmlFor="email">Email</label>
            <input
              id="email"
              className={INPUT}
              value={form.email}
              onChange={update("email")}
              placeholder="you@makerspace.edu"
              autoComplete="username"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={LABEL} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className={INPUT}
              value={form.password}
              onChange={update("password")}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          {error && <span className="text-[0.65rem] text-[#E88080]">{error}</span>}
          <button
            type="submit"
            className="mt-2 w-full cursor-pointer rounded bg-gold px-7 py-[13px] text-[0.9rem] font-semibold text-navy transition-colors duration-300 hover:bg-gold-light"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 border-t border-gold/15 pt-5 text-[0.65rem] leading-[1.9] text-navy-muted">
          <p className="mb-1 font-semibold uppercase tracking-[0.08em] text-gold">Demo accounts</p>
          <p><strong>Admin</strong> — admin@makerspace.edu / admin123</p>
          <p><strong>Lecturer</strong> — sarah.chen@makerspace.edu / lecturer123</p>
        </div>
      </div>
    </div>
  );
}
