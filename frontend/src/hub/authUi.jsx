import { Lock, Eye, EyeOff } from "lucide-react";
import { HUB, HUB_GRADIENT } from "./hubTheme";

// Shared design tokens/components for every auth-adjacent page (sign in,
// register, forgot password, reset password) so they all match without
// duplicating styling. Re-exported under this file's own key names (bg/
// card/etc, rather than HUB's bg1/bgCard/etc) so every existing consumer
// keeps working — only the underlying values changed, unifying with the
// rest of the hub instead of carrying a third slightly-different palette.
export const D = {
  bg:     HUB.bg1,
  bg2:    HUB.bg2,
  card:   HUB.bgCard,
  border: HUB.border,
  muted:  HUB.muted,
  text:   HUB.text,
};
export const GRADIENT = HUB_GRADIENT;

export const inputStyle = { background: "rgba(15,50,80,0.045)", border: "1px solid rgba(15,50,80,0.14)", color: D.text };
export const focusIn  = (e) => (e.target.style.borderColor = "var(--color-inv-accent)");
export const focusOut = (e) => (e.target.style.borderColor = "rgba(15,50,80,0.14)");

export function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <div className="px-4 py-2.5 rounded-xl text-sm font-medium"
      style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.28)", color: "#b91c1c" }}>
      {message}
    </div>
  );
}

export function TextField({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: D.muted }} />
      <input {...props} className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
        style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
    </div>
  );
}

export function PasswordField({ value, onChange, placeholder, autoComplete, show, onToggleShow }) {
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

// Microsoft's four-color square mark, per their sign-in button branding guidelines.
function MicrosoftMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 21 21" aria-hidden>
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}

export function MicrosoftButton({ label = "Continue with Microsoft", onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center justify-center gap-2.5 py-2.5 rounded-xl font-bold text-sm transition-colors hover:bg-black/[0.03]"
      style={{ border: "1px solid rgba(15,50,80,0.14)", color: D.text }}>
      <MicrosoftMark />
      {label}
    </button>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-0.5">
      <div className="h-px flex-1" style={{ background: "rgba(15,50,80,0.12)" }} />
      <span className="text-[11px] font-semibold" style={{ color: D.muted }}>OR</span>
      <div className="h-px flex-1" style={{ background: "rgba(15,50,80,0.12)" }} />
    </div>
  );
}
