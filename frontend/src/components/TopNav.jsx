import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  Menu, X, ArrowUpRight, MessageSquare,
  BookOpen, Package, ChevronRight, ChevronDown, LogIn, UserPlus, LogOut, User, Search, Bell,
} from "lucide-react";
import logo    from "../assets/ms_wbg_logo.png";
import bbg_logo from "../assets/ms_bbg_logo.png";
import { useEffect, useState } from "react";
import { useAuth } from "../hub/AuthContext";
import { SignOutConfirmDialog } from "./SignOutConfirmDialog";

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
  { label: "Community Home", to: "/community",                 featured: true, desc: "Announcements & activity feed" },
  { label: "Events",         to: "/community/eventspace"     },
  { label: "Find Team",      to: "/community/collabspace"    },
  { label: "Connect",        to: "/community/communityspace" },
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
    <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.14)" }}>
      {Icon && (
        <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
          style={{ background: `${accent}22`, border: `1px solid ${accent}32` }}>
          <Icon size={12} style={{ color: accent }} />
        </div>
      )}
      <div className="flex items-baseline gap-1.5">
        {number && <span className="text-[9px] font-black uppercase tracking-widest text-white">{number}</span>}
        <span className="text-xs font-bold text-white">{label}</span>
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
          {featured.desc && <p className="text-[10px] mt-0.5 text-white">{featured.desc}</p>}
        </div>
        <ArrowUpRight size={14} style={{ color: accent }} className="shrink-0 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity" />
      </Link>
      {rest.map(l => (
        <Link key={l.label} to={l.to} onClick={onClose}
          className="group flex items-center gap-2 py-2 px-1 text-sm text-white transition-colors">
          <ChevronRight size={11} style={{ color: `${accent}bb` }} className="shrink-0 group-hover:translate-x-0.5 transition-transform" />
          {l.label}
        </Link>
      ))}
    </div>
  );
}

// ── Profile cluster ───────────────────────────────────────────────────────────
function ProfileCluster({ onClose }) {
  const { user } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const initials = user?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <ClusterLabel label="Account" accent="#6366f1" icon={User} />

      {user ? (
        <div className="flex flex-col gap-1 pt-1">
          <Link to="/profile" onClick={onClose}
            className="flex items-center gap-3 p-3 rounded-xl mb-3 transition-all hover:scale-[1.02]"
            style={{ background: "rgba(99,102,241,0.10)", border: "1px solid rgba(99,102,241,0.20)" }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm text-white shrink-0"
              style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm truncate">{user.name}</p>
              <p className="text-[10px] truncate text-white">{user.email}</p>
            </div>
          </Link>

          <div className="my-1" style={{ borderTop: "1px solid rgba(255,255,255,0.14)" }} />

          <button onClick={() => setConfirmOpen(true)}
            className="flex items-center gap-2 py-2 px-1 text-sm w-full text-left transition-colors"
            style={{ color: "#f87171" }}>
            <LogOut size={12} className="shrink-0" />
            Sign Out
          </button>

          <SignOutConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} onSignedOut={onClose} />
        </div>
      ) : (
        <div className="flex flex-col gap-3 pt-1">
          <p className="text-xs leading-relaxed text-white">
            Sign in to track your progress across all three modules.
          </p>
          <Link to="/login" onClick={onClose}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-85"
            style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
            <LogIn size={14} /> Sign In
          </Link>
          <Link to="/register" onClick={onClose}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:border-white/50"
            style={{ border: "1px solid rgba(255,255,255,0.22)" }}>
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

// ── Notification bell ─────────────────────────────────────────────────────────
const NOTIF_COUNT = 3; // mock unread count — mirrors NotificationsPage's mock data

function NotifBell({ dark }) {
  return (
    <Link
      to="/notifications"
      aria-label="Notifications"
      className="relative inline-flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-200"
      style={{
        color: dark ? "white" : "#1a1a2e",
        background: dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.05)",
      }}
    >
      <Bell size={17} />
      {NOTIF_COUNT > 0 && (
        <span
          className="absolute top-1 right-1 min-w-[15px] h-[15px] px-[3px] rounded-full flex items-center justify-center text-[9px] font-bold text-white"
          style={{ background: "#ef4444", border: "1.5px solid" , borderColor: dark ? "rgba(12,16,30,0.9)" : "white" }}
        >
          {NOTIF_COUNT > 9 ? "9+" : NOTIF_COUNT}
        </span>
      )}
    </Link>
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
      <span className="text-[11px] font-extrabold tracking-wide">{label}</span>
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
    <form onSubmit={handleSubmit} onClick={e => e.stopPropagation()}>
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-white" />
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

// ── Mobile quick-menu — expandable module accordions (full sub-page access) ──
const MOBILE_MODULES = [
  { key: "community", icon: MessageSquare, label: "Community", desc: "Bulletin board & events",      accent: "#f59e0b", links: COMMUNITY_LINKS },
  { key: "learning",  icon: BookOpen,      label: "Learning",  desc: "Courses & digital library",     accent: "#c0392b", links: LEARNING_LINKS  },
  { key: "inventory", icon: Package,       label: "Inventory", desc: "Resources & requests",           accent: "#0891b2", links: INVENTORY_LINKS },
];

function MobileModuleAccordion({ modKey, icon: Icon, label, desc, accent, links, expanded, onToggle, onClose }) {
  return (
    <div onClick={(e) => e.stopPropagation()}
      className="rounded-2xl overflow-hidden transition-all" style={{ background: `${accent}18`, border: `1px solid ${accent}35` }}>
      <button type="button" onClick={() => onToggle(modKey)}
        className="w-full flex items-center gap-3 p-3 text-left">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accent}28` }}>
          <Icon size={18} style={{ color: accent }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-white text-[14px] leading-tight">{label}</p>
          <p className="text-white text-[11px] leading-tight truncate">{desc}</p>
        </div>
        <ChevronDown size={16} color="white" className="shrink-0 transition-transform duration-200"
          style={{ transform: expanded ? "rotate(180deg)" : "none" }} />
      </button>
      {expanded && (
        <div className="px-3 pb-3 flex flex-col gap-0.5">
          {links.map(l => (
            <Link key={l.label} to={l.to} onClick={onClose}
              className="flex items-center gap-2 py-2.5 px-2.5 rounded-lg text-sm text-white transition-colors"
              style={{ background: l.featured ? "rgba(255,255,255,0.14)" : "transparent" }}>
              <ChevronRight size={12} className="shrink-0" style={{ color: accent }} />
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileProfileRow({ onClose }) {
  const { user } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const initials = user?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  if (user) {
    return (
      <div onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-2 rounded-2xl p-2.5"
        style={{ background: "rgba(99,102,241,0.16)", border: "1px solid rgba(99,102,241,0.32)" }}>
        <Link to="/profile" onClick={onClose} className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-white text-sm shrink-0"
            style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white font-extrabold text-[14px] truncate">{user.name}</p>
            <p className="text-white text-[11px] truncate">View Profile</p>
          </div>
        </Link>
        <button onClick={() => setConfirmOpen(true)} aria-label="Sign out"
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(239,68,68,0.18)" }}>
          <LogOut size={15} style={{ color: "#f87171" }} />
        </button>
        <SignOutConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} onSignedOut={onClose} />
      </div>
    );
  }

  return (
    <div onClick={(e) => e.stopPropagation()} className="flex gap-2">
      <Link to="/login" onClick={onClose}
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl font-bold text-white text-sm"
        style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
        <LogIn size={14} /> Sign In
      </Link>
      <Link to="/register" onClick={onClose}
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl font-semibold text-white text-sm"
        style={{ border: "1px solid rgba(255,255,255,0.22)" }}>
        <UserPlus size={14} /> Sign Up
      </Link>
    </div>
  );
}

// ── TopNav ────────────────────────────────────────────────────────────────────
export function TopNav() {
  const [open, setOpen] = useState(false);
  const [expandedMod, setExpandedMod] = useState(null);
  const close = () => setOpen(false);
  const toggleMod = (key) => setExpandedMod(prev => prev === key ? null : key);
  const mod = useModule();
  const cfg = MODULE_CFG[mod];
  const { pathname } = useLocation();

  useEffect(() => {
    if (!open) setExpandedMod(null);
  }, [open]);

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
    ? "rgba(12,16,30,0.75)"
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
              className="h-6 w-auto sm:h-8 sm:w-40 object-contain object-left"
            />
          </Link>

          {/* 2 · Search bar — expands to fill center on sm+ */}
          <NavSearch cfg={cfg} dark={cfg.dark || open} />

          {/* Mobile spacer (search is hidden on mobile) */}
          <div className="flex-1 sm:hidden" />

          {/* Mobile search icon — opens the menu overlay, which hosts the search field */}
          <button
            type="button"
            aria-label="Search"
            onClick={() => setOpen(true)}
            className="sm:hidden inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-200"
            style={{
              color: cfg.dark || open ? "white" : "#1a1a2e",
              background: cfg.dark || open ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.05)",
            }}
          >
            <Search size={16} />
          </button>

          {/* 3 · Notifications */}
          <NotifBell dark={cfg.dark || open} />

          {/* 4 · Module box — desktop/tablet only, no room for it on mobile */}
          <div className="hidden sm:block">
            <ModuleBox mod={mod} cfg={cfg} dark={cfg.dark || open} />
          </div>

          {/* 5 · Menu button */}
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
          style={{
            background: "rgba(12,16,30,0.72)",
            backdropFilter: "blur(22px)",
            WebkitBackdropFilter: "blur(22px)",
          }}
          role="dialog"
          aria-modal="true"
          onClick={close}
        >
          <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
          <OverlayDoodles />

          {/* Mobile — expandable module accordions, full sub-page access.
              Note: no stopPropagation here — tapping the gaps between boxes
              should close the menu, same as clicking outside cards on desktop. */}
          <div
            className="sm:hidden flex flex-col gap-3 px-5 pt-20 pb-6"
            style={{ minHeight: "100vh" }}
          >
            <MobileSearch cfg={cfg} />

            <p className="text-center text-white text-[10px] uppercase tracking-[0.22em] font-bold">
              Where to?
            </p>

            <div className="flex flex-col gap-2.5">
              {MOBILE_MODULES.map((m) => (
                <MobileModuleAccordion key={m.key} modKey={m.key} icon={m.icon} label={m.label} desc={m.desc}
                  accent={m.accent} links={m.links} expanded={expandedMod === m.key} onToggle={toggleMod} onClose={close} />
              ))}
            </div>

            <MobileProfileRow onClose={close} />
          </div>

          {/* Desktop / tablet — full menu with sub-links */}
          <div className="hidden sm:flex min-h-screen flex-col justify-center px-4 py-6 sm:pt-12">
            <p className="text-center text-white text-[10px] uppercase tracking-[0.25em] font-bold mb-5">
              Where do you want to go?
            </p>

            {/* 4-cluster grid */}
            <div className="mx-auto w-full max-w-5xl grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
              <ModuleCluster number="01" label="Community" accent="#f59e0b" icon={MessageSquare} links={COMMUNITY_LINKS} onClose={close} />
              <ModuleCluster number="02" label="Learning"  accent="#c0392b" icon={BookOpen} links={LEARNING_LINKS}  onClose={close} />
              <ModuleCluster number="03" label="Inventory" accent="#0891b2" icon={Package}  links={INVENTORY_LINKS} onClose={close} />
              <ProfileCluster onClose={close} />
            </div>

            <p className="text-center text-white text-[10px] mt-6">
              Press <kbd className="px-1.5 py-0.5 rounded text-[9px] font-mono text-white" style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.16)" }}>Esc</kbd> or click outside to close
            </p>
          </div>
        </div>
      )}
    </>
  );
}
