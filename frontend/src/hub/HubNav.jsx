import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, Layers } from "lucide-react";

const NAV_LINKS = [
  { label: "Home",  to: "/" },
  { label: "About", to: "/hub/about" },
];

const MODULE_CHIPS = [
  { label: "Community", href: "/community", color: "#c9a86c" },
  { label: "Learning",  href: "/learning",  color: "#c0392b" },
  { label: "Inventory", href: "/inventory", color: "#0891b2" },
];

// light = true  → warm frosted nav for light-background pages
// light = false → dark frosted nav (legacy default)
export function HubNav({ light = true }) {
  const [open,    setOpen]    = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  /* ── Colour tokens ──────────────────────────────────────────────────────── */
  const bg = light
    ? scrolled ? "rgba(240,228,204,0.94)" : "rgba(240,228,204,0.80)"
    : scrolled ? "rgba(8,8,14,0.92)"      : "transparent";

  const blur        = scrolled || light ? "blur(16px)" : "none";
  const border      = light
    ? "1px solid rgba(160,120,60,0.18)"
    : scrolled ? "1px solid rgba(255,255,255,0.06)" : "none";

  const logoText    = light ? "#3d2200" : "white";
  const linkActive  = light ? "#3d2200" : "#fff";
  const linkMuted   = light ? "rgba(80,50,20,0.55)" : "rgba(255,255,255,0.48)";
  const divider     = light ? "rgba(160,100,40,0.25)" : "rgba(255,255,255,0.12)";
  const signInColor = light ? "rgba(80,50,20,0.6)"  : "rgba(255,255,255,0.5)";
  const mobileToggleBg   = light ? "rgba(160,100,40,0.12)" : "rgba(255,255,255,0.07)";
  const mobileToggleCol  = light ? "rgba(80,50,20,0.7)"    : "rgba(255,255,255,0.7)";
  const drawerBg    = light ? "rgba(240,228,204,0.98)" : "rgba(8,8,14,0.98)";
  const drawerBorder = light ? "rgba(160,100,40,0.18)" : "rgba(255,255,255,0.06)";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: bg,
        backdropFilter: blur,
        WebkitBackdropFilter: blur,
        borderBottom: border,
        transition: "background 0.3s, border-bottom 0.3s",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setOpen(false)}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
          >
            <Layers size={15} color="white" strokeWidth={2.2} />
          </div>
          <span className="font-bold text-lg tracking-tight leading-none" style={{ color: logoText }}>
            CADT<span style={{ color: "#6366f1" }}> Hub</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: location.pathname === l.to ? linkActive : linkMuted }}
            >
              {l.label}
            </Link>
          ))}

          <div className="w-px h-4" style={{ background: divider }} />

          {MODULE_CHIPS.map((m) => (
            <a
              key={m.label}
              href={m.href}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full transition-opacity hover:opacity-80"
              style={{
                background: `${m.color}1a`,
                color: m.color,
                border: `1px solid ${m.color}40`,
              }}
            >
              {m.label}
            </a>
          ))}
        </nav>

        {/* Auth — desktop */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/hub/login"
            className="text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: signInColor }}
          >
            Sign in
          </Link>
          <Link
            to="/hub/register"
            className="text-sm font-semibold px-4 py-2 rounded-full text-white transition-opacity hover:opacity-85"
            style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
          >
            Get Started
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-full transition-colors"
          style={{ color: mobileToggleCol, background: mobileToggleBg }}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="md:hidden flex flex-col gap-3 px-4 py-5"
          style={{ background: drawerBg, borderTop: `1px solid ${drawerBorder}` }}
        >
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium py-1"
              style={{ color: location.pathname === l.to ? linkActive : linkMuted }}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}

          <div className="flex flex-wrap gap-2 py-1">
            {MODULE_CHIPS.map((m) => (
              <a
                key={m.label}
                href={m.href}
                className="text-[11px] font-semibold px-3 py-1 rounded-full"
                style={{ background: `${m.color}1a`, color: m.color, border: `1px solid ${m.color}40` }}
                onClick={() => setOpen(false)}
              >
                {m.label}
              </a>
            ))}
          </div>

          <div
            className="flex gap-2 pt-2"
            style={{ borderTop: `1px solid ${drawerBorder}` }}
          >
            <Link
              to="/hub/login"
              className="flex-1 text-center py-2 text-sm rounded-full"
              style={{
                color: signInColor,
                border: light ? "1px solid rgba(160,100,40,0.3)" : "1px solid rgba(255,255,255,0.2)",
              }}
              onClick={() => setOpen(false)}
            >
              Sign in
            </Link>
            <Link
              to="/hub/register"
              className="flex-1 text-center py-2 text-sm font-semibold rounded-full text-white"
              style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
              onClick={() => setOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
