import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  Menu, X, ArrowUpRight, MessageSquare,
  BookOpen, Package, ChevronRight, LogIn, UserPlus, LogOut, User, Search,
} from "lucide-react";
import logo    from "../assets/ms_wbg_logo.png";
import bbg_logo from "../assets/ms_bbg_logo.png";
import { useEffect, useState } from "react";
import { useAuth } from "../hub/AuthContext";

// ── Module config ─────────────────────────────────────────────────────────────
const MODULE_CFG = {
  community: {
    accent:      "#c9a86c",
    placeholder: "Search events, posts, collabs…",
    root:        "/community",
    dark:        false,
  },
  learning: {
    accent:      "#c0392b",
    placeholder: "Search courses and lessons…",
    root:        "/learning",
    dark:        true,
  },
  inventory: {
    accent:      "#0891b2",
    placeholder: "Search items and equipment…",
    root:        "/inventory",
    dark:        true,
  },
};

function useModule() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/learning"))  return "learning";
  if (pathname.startsWith("/inventory")) return "inventory";
  return "community";
}

// ── Nav data ─────────────────────────────────────────────────────────────────
const COMMUNITY_LINKS = [
  { label: "Community Home",  to: "/community",                 featured: true, desc: "Announcements & activity feed" },
  { label: "Event Space",     to: "/community/eventspace"     },
  { label: "Collab Space",    to: "/community/collabspace"    },
  { label: "Community Board", to: "/community/communityspace" },
];

const LEARNING_LINKS = [
  { label: "Library",        to: "/learning",  featured: true, desc: "Browse all courses"        },
  { label: "My Courses",     to: "/learning"  },
  { label: "Progress",       to: "/learning"  },
  { label: "Bookmarks",      to: "/learning"  },
  { label: "Announcements",  to: "/learning"  },
];

const INVENTORY_LINKS = [
  { label: "Browse Resources", to: "/inventory", featured: true, desc: "All makerspace items" },
  { label: "My Requests",      to: "/inventory" },
  { label: "Categories",       to: "/inventory" },
  { label: "Reserve an Item",  to: "/inventory" },
  { label: "Return Tracker",   to: "/inventory" },
];

// ── Cluster label ─────────────────────────────────────────────────────────────
function ClusterLabel({ number, label, accent, icon: Icon }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      {Icon && (
        <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
          style={{ background: `${accent}22`, border: `1px solid ${accent}32` }}>
          <Icon size={12} style={{ color: accent }} />
        </div>
      )}
      <div className="flex items-baseline gap-1.5">
        {number && <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>{number}</span>}
        <span className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.65)" }}>{label}</span>
      </div>
    </div>
  );
}

// ── Module cluster (Community / Learning / Inventory) ─────────────────────────
function ModuleCluster({ number, label, accent, icon, links, onClose }) {
  const featured = links.find(l => l.featured);
  const rest     = links.filter(l => !l.featured);
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <ClusterLabel number={number} label={label} accent={accent} icon={icon} />
      <Link
        to={featured.to} onClick={onClose}
        className="group flex items-start justify-between gap-2 rounded-xl p-3.5 mb-3 transition-all hover:scale-[1.02]"
        style={{ background: `${accent}16`, border: `1px solid ${accent}28` }}
      >
        <div>
          <p className="font-extrabold text-white text-sm">{featured.label}</p>
          {featured.desc && <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>{featured.desc}</p>}
        </div>
        <ArrowUpRight size={14} style={{ color: accent }} className="shrink-0 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity" />
      </Link>
      {rest.map(l => (
        <Link key={l.label} to={l.to} onClick={onClose}
          className="group flex items-center gap-2 py-2 px-1 text-sm transition-colors hover:text-white"
          style={{ color: "rgba(255,255,255,0.50)" }}>
          <ChevronRight size={11} style={{ color: `${accent}bb` }} className="shrink-0 group-hover:translate-x-0.5 transition-transform" />
          {l.label}
        </Link>
      ))}
    </div>
  );
}

// ── Profile cluster ───────────────────────────────────────────────────────────
function ProfileCluster({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = user?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  const handleLogout = () => { logout(); onClose(); navigate("/"); };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <ClusterLabel label="Account" accent="#6366f1" icon={User} />

      {user ? (
        <div className="flex flex-col gap-1 pt-1">
          <div className="flex items-center gap-3 p-3 rounded-xl mb-3"
            style={{ background: "rgba(99,102,241,0.10)", border: "1px solid rgba(99,102,241,0.20)" }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm text-white shrink-0"
              style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm truncate">{user.name}</p>
              <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.38)" }}>{user.email}</p>
            </div>
          </div>

          {[
            { label: "My Profile", to: "/profile" },
            { label: "Settings",   to: "/hub/settings" },
          ].map(l => (
            <Link key={l.label} to={l.to} onClick={onClose}
              className="group flex items-center gap-2 py-2 px-1 text-sm transition-colors hover:text-white"
              style={{ color: "rgba(255,255,255,0.50)" }}>
              <ChevronRight size={11} style={{ color: "rgba(129,140,248,0.75)" }} className="shrink-0 group-hover:translate-x-0.5 transition-transform" />
              {l.label}
            </Link>
          ))}

          <div className="my-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />

          <button onClick={handleLogout}
            className="flex items-center gap-2 py-2 px-1 text-sm w-full text-left transition-colors hover:text-red-400"
            style={{ color: "rgba(255,255,255,0.35)" }}>
            <LogOut size={12} className="shrink-0" />
            Sign Out
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 pt-1">
          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.38)" }}>
            Sign in to track your progress across all three modules.
          </p>
          <Link to="/hub/login" onClick={onClose}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-85"
            style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
            <LogIn size={14} /> Sign In
          </Link>
          <Link to="/hub/register" onClick={onClose}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all hover:border-white/30 hover:text-white"
            style={{ color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.13)" }}>
            <UserPlus size={14} /> Create Account
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Background doodles ────────────────────────────────────────────────────────
function OverlayDoodles() {
  const ink = "white";
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
      <svg className="absolute top-[8%] left-[3%] w-8 h-8 opacity-[0.12] animate-float-slow" viewBox="0 0 40 40" fill="none">
        <path d="M20 4C13.4 4 8 9.4 8 16c0 4.2 2.1 7.9 5.3 10.2V29a1 1 0 001 1h11a1 1 0 001-1v-2.8C29.9 23.9 32 20.2 32 16c0-6.6-5.4-12-12-12z" fill={ink} />
      </svg>
      <svg className="absolute top-[10%] right-[4%] w-8 h-8 opacity-[0.10] animate-float" style={{ animationDelay: "1s" }} viewBox="0 0 40 40" fill="none">
        <path d="M20 4C20 4 12 12 12 22h16C28 12 20 4 20 4z" fill={ink} />
      </svg>
      <svg className="absolute bottom-[12%] left-[5%] w-7 h-7 opacity-[0.08] animate-float-slow" style={{ animationDelay: "2s" }} viewBox="0 0 32 32" fill="none">
        <path d="M16 2l3.1 9.6H29l-8.1 5.9 3.1 9.5L16 22l-8 5 3.1-9.5L3 11.6h9.9L16 2z" fill={ink} />
      </svg>
      <svg className="absolute bottom-[15%] right-[5%] w-8 h-8 opacity-[0.08] animate-float" style={{ animationDelay: "0.5s" }} viewBox="0 0 36 36" fill="none">
        <path d="M28 4a6 6 0 00-5.8 7.4L8 25.6A6 6 0 108 32a6 6 0 006-6l14.2-14.2A6 6 0 0028 4z" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ── Module box ────────────────────────────────────────────────────────────────
const MOD_ICONS = { community: MessageSquare, learning: BookOpen, inventory: Package };

function ModuleBox({ mod, cfg, dark }) {
  const Icon = MOD_ICONS[mod];
  const label = mod.charAt(0).toUpperCase() + mod.slice(1);
  return (
    <div
      className="flex items-center gap-1.5 shrink-0 rounded-lg px-2.5 py-1.5 transition-colors duration-200"
      style={{
        background: dark ? `${cfg.accent}1a` : `${cfg.accent}14`,
        border:     `1.5px solid ${cfg.accent}${dark ? "40" : "28"}`,
        color:      cfg.accent,
      }}
    >
      <Icon size={13} strokeWidth={2.2} />
      {/* Full label on sm+, initial-only on mobile */}
      <span className="text-[11px] font-extrabold tracking-wide hidden sm:block">{label}</span>
      <span className="text-[11px] font-extrabold sm:hidden">{label[0]}</span>
    </div>
  );
}

// ── Search bar ────────────────────────────────────────────────────────────────
function NavSearch({ cfg, dark }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");

  useEffect(() => { setQ(params.get("q") || ""); }, [params]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = q.trim();
    navigate(`${cfg.root}${trimmed ? `?q=${encodeURIComponent(trimmed)}` : ""}`);
  };

  return (
    <form onSubmit={handleSubmit} className="hidden sm:flex flex-1 justify-center px-4">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-muted-foreground" />
        {dark ? (
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={cfg.placeholder}
            className="w-full rounded-full py-2 pl-10 pr-4 text-sm outline-none transition text-white placeholder:text-white/30 focus:ring-1"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
            }}
            onFocus={e => e.target.style.borderColor = cfg.accent}
            onBlur={e  => e.target.style.borderColor = "rgba(255,255,255,0.14)"}
          />
        ) : (
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={cfg.placeholder}
            className="w-full rounded-full border border-border bg-secondary/60 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-foreground/40 focus:bg-background"
          />
        )}
      </div>
    </form>
  );
}

// ── Mobile search (inside overlay) ───────────────────────────────────────────
function MobileSearch({ cfg }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  useEffect(() => { setQ(params.get("q") || ""); }, [params]);
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = q.trim();
    navigate(`${cfg.root}${trimmed ? `?q=${encodeURIComponent(trimmed)}` : ""}`);
  };
  return (
    <form onSubmit={handleSubmit} className="px-5 pt-16 pb-0" onClick={e => e.stopPropagation()}>
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.30)" }} />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder={cfg.placeholder}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.07)",
            border: "1.5px solid rgba(255,255,255,0.14)",
            borderRadius: 10,
            color: "white",
            fontSize: 13,
            padding: "9px 14px 9px 32px",
            outline: "none",
          }}
        />
      </div>
    </form>
  );
}

// ── TopNav ────────────────────────────────────────────────────────────────────
export function TopNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const mod = useModule();
  const cfg = MODULE_CFG[mod];
  const { pathname } = useLocation();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);

    // Measure scrollbar width BEFORE hiding so we can compensate
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPadding  = document.body.style.paddingRight;
    document.body.style.overflow     = "hidden";
    document.body.style.paddingRight = scrollbarW > 0 ? `${scrollbarW}px` : "";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow     = prevOverflow;
      document.body.style.paddingRight = prevPadding;
    };
  }, [open]);

  // Header background: dark modules get dark header; community gets warm paper tint
  const headerBg = open
    ? "rgba(7,8,18,0.97)"
    : cfg.dark
      ? "rgba(7,10,20,0.92)"
      : undefined; // undefined → use className (bg-background/80)

  const headerClass = `sticky top-0 z-[60] w-full border-b transition-all duration-200 ${
    open
      ? "border-white/10 backdrop-blur-md"
      : cfg.dark
        ? "border-white/[0.06] backdrop-blur-md"
        : "border-border/60 bg-background/80 backdrop-blur-md"
  }`;

  const logoLight = cfg.dark || open;  // dark logo on community, light logo elsewhere

  return (
    <>
      {/* Sticky header */}
      <header className={headerClass} style={headerBg ? { backgroundColor: headerBg } : undefined}>
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">

          {/* 1 · Logo */}
          <Link
            to={cfg.root}
            className="shrink-0"
            onClick={(e) => {
              if (open) setOpen(false);
              if (pathname === cfg.root) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            <img
              src={logoLight ? bbg_logo : logo}
              alt="Makerspace"
              className="h-8 w-40 object-contain object-left"
            />
          </Link>

          {/* 2 · Search bar — expands to fill center on sm+ */}
          <NavSearch cfg={cfg} dark={cfg.dark || open} />

          {/* Mobile spacer (search is hidden on mobile) */}
          <div className="flex-1 sm:hidden" />

          {/* 3 · Module box */}
          <ModuleBox mod={mod} cfg={cfg} dark={cfg.dark || open} />

          {/* 4 · Menu button */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(v => !v)}
            className={`relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
              open ? "bg-white/10 text-white hover:bg-white/20" : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
          >
            {!open && <span className="absolute inset-0 rounded-full bg-primary animate-pulse-ring" />}
            {open ? <X className="h-5 w-5 relative z-10" /> : <Menu className="h-5 w-5 relative z-10" />}
          </button>
        </div>
      </header>

      {/* Full-screen overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          style={{ background: "oklch(0.10 0.04 260 / 0.97)" }}
          role="dialog"
          aria-modal="true"
          onClick={close}
        >
          <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
          <OverlayDoodles />

          {/* Mobile search inside overlay */}
          <div className="sm:hidden">
            <MobileSearch cfg={cfg} />
          </div>

          <div className="min-h-screen flex flex-col justify-center px-4 py-6 pt-6 sm:pt-12">
            <p className="text-center text-white/30 text-[10px] uppercase tracking-[0.25em] font-bold mb-5">
              Where do you want to go?
            </p>

            {/* 4-cluster grid */}
            <div className="mx-auto w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
              <ModuleCluster number="01" label="Community" accent="#f59e0b" icon={MessageSquare} links={COMMUNITY_LINKS} onClose={close} />
              <ModuleCluster number="02" label="Learning"  accent="#c0392b" icon={BookOpen} links={LEARNING_LINKS}  onClose={close} />
              <ModuleCluster number="03" label="Inventory" accent="#0891b2" icon={Package}  links={INVENTORY_LINKS} onClose={close} />
              <ProfileCluster onClose={close} />
            </div>

            <p className="text-center text-white/20 text-[10px] mt-6">
              Press <kbd className="px-1.5 py-0.5 rounded text-[9px] font-mono" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>Esc</kbd> or click outside to close
            </p>
          </div>
        </div>
      )}
    </>
  );
}
