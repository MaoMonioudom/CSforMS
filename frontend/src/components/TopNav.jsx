import { Link } from "react-router-dom";
import { Menu, Search, X, ArrowUpRight, Calendar, Users, MessageSquare } from "lucide-react";
import logo from "../assets/makerspace_logo.png";
import { useEffect, useState } from "react";

const sections = [
  {
    title: "Events",
    to: "/events",
    bg: "bg-events",
    fg: "text-events-foreground",
    icon: Calendar,
    stat: "12 upcoming",
    desc: "Workshops & competitions",
  },
  {
    title: "Collaboration",
    to: "/collaboration",
    bg: "bg-collaboration",
    fg: "text-collaboration-foreground",
    icon: Users,
    stat: "23 open roles",
    desc: "Find your teammates",
  },
  {
    title: "Community",
    to: "/community",
    bg: "bg-community",
    fg: "text-community-foreground",
    icon: MessageSquare,
    stat: "156 discussions",
    desc: "Share & connect",
  },
];

// Small doodle SVGs for overlay background
function OverlayDoodles() {
  const ink = "white";
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
      {/* Lightbulb */}
      <svg className="absolute top-[8%] left-[6%] w-10 h-10 opacity-30 animate-float-slow" style={{ "--r": "-15deg" }} viewBox="0 0 40 40" fill="none">
        <path d="M20 4C13.4 4 8 9.4 8 16c0 4.2 2.1 7.9 5.3 10.2V29a1 1 0 001 1h11a1 1 0 001-1v-2.8C29.9 23.9 32 20.2 32 16c0-6.6-5.4-12-12-12z" fill={ink} />
        <rect x="14" y="30" width="12" height="2" rx="1" fill={ink} />
        <rect x="15" y="33" width="10" height="2" rx="1" fill={ink} />
      </svg>
      {/* Rocket */}
      <svg className="absolute top-[12%] right-[8%] w-10 h-10 opacity-25 animate-float" style={{ "--r": "20deg", animationDelay: "1s" }} viewBox="0 0 40 40" fill="none">
        <path d="M20 4C20 4 12 12 12 22h16C28 12 20 4 20 4z" fill={ink} />
        <path d="M12 22l-4 8 8-4M28 22l4 8-8-4" fill={ink} />
        <circle cx="20" cy="22" r="3" fill={ink} opacity="0.6" />
      </svg>
      {/* Star */}
      <svg className="absolute bottom-[20%] left-[10%] w-8 h-8 opacity-20 animate-float-slow" style={{ "--r": "10deg", animationDelay: "2s" }} viewBox="0 0 32 32" fill="none">
        <path d="M16 2l3.1 9.6H29l-8.1 5.9 3.1 9.5L16 22l-8 5 3.1-9.5L3 11.6h9.9L16 2z" fill={ink} />
      </svg>
      {/* Wrench */}
      <svg className="absolute bottom-[25%] right-[7%] w-9 h-9 opacity-20 animate-float" style={{ "--r": "-25deg", animationDelay: "0.5s" }} viewBox="0 0 36 36" fill="none">
        <path d="M28 4a6 6 0 00-5.8 7.4L8 25.6A6 6 0 108 32a6 6 0 006-6l14.2-14.2A6 6 0 0028 4z" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      {/* Paint brush */}
      <svg className="absolute top-[45%] left-[4%] w-9 h-9 opacity-20 animate-float-slow" style={{ "--r": "30deg", animationDelay: "1.5s" }} viewBox="0 0 36 36" fill="none">
        <path d="M28 4L10 22c-2 2-2 5 0 7s5 2 7 0L34 10 28 4z" stroke={ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 22c-4 1-7 4-6 8 2-1 5-2 8-4" fill={ink} opacity="0.5" />
      </svg>
      {/* Circuit dots */}
      <svg className="absolute top-[60%] right-[12%] w-12 h-12 opacity-15 animate-float" style={{ "--r": "0deg", animationDelay: "3s" }} viewBox="0 0 48 48" fill="none">
        <circle cx="12" cy="12" r="3" fill={ink} />
        <circle cx="36" cy="12" r="3" fill={ink} />
        <circle cx="12" cy="36" r="3" fill={ink} />
        <circle cx="36" cy="36" r="3" fill={ink} />
        <circle cx="24" cy="24" r="4" fill={ink} />
        <path d="M12 12h12M36 12H24M12 36h12M36 36H24M24 12v12M24 36V24" stroke={ink} strokeWidth="1.5" />
      </svg>
    </div>
  );
}

export function TopNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="Makerspace logo" className="h-8 w-auto" />
          </Link>
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search events, projects, people…"
                className="w-full rounded-full border border-border bg-secondary/60 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-foreground/40 focus:bg-background"
              />
            </div>
          </div>

          {/* Menu button with pulse ring */}
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <span className="absolute inset-0 rounded-full bg-primary animate-pulse-ring" />
            <Menu className="h-5 w-5 relative z-10" />
          </button>
        </div>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          style={{ background: "oklch(0.14 0.04 260 / 0.96)" }}
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          {/* Dot grid on overlay */}
          <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />
          <OverlayDoodles />

          {/* Top bar */}
          <div
            className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-white/10 sticky top-0 backdrop-blur-md z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
              <img src={logo} alt="Makerspace logo" className="h-8 w-auto brightness-0 invert" />
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav content */}
          <nav className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-10 gap-4">
            <p className="text-white/40 text-xs uppercase tracking-[0.2em] mb-2 font-semibold">
              Where do you want to go?
            </p>

            {/* Top card — Events */}
            <NavCard
              s={sections[0]}
              delay={0}
              onClose={() => setOpen(false)}
              rotate={-1.5}
            />

            {/* Bottom two cards */}
            <div className="flex gap-8 sm:gap-12">
              {sections.slice(1).map((s, i) => (
                <NavCard
                  key={s.to}
                  s={s}
                  delay={(i + 1) * 80}
                  onClose={() => setOpen(false)}
                  rotate={[2, -1][i]}
                />
              ))}
            </div>

            <p className="text-white/30 text-xs mt-6">Press Esc or click outside to close</p>
          </nav>
        </div>
      )}
    </>
  );
}

function NavCard({ s, delay, onClose, rotate }) {
  const Icon = s.icon;
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative animate-pin-in"
      style={{ animationDelay: `${delay}ms`, transform: `rotate(${rotate}deg)`, transformOrigin: "top center" }}
    >
      {/* Push pin */}
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10 drop-shadow">
        <svg width="16" height="28" viewBox="0 0 16 28" fill="none" aria-hidden>
          <circle cx="8" cy="8" r="7" fill="white" />
          <circle cx="5.5" cy="5.5" r="2.5" fill="rgba(255,255,255,0.6)" />
          <line x1="8" y1="15" x2="8" y2="28" stroke="#aaa" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <Link
        to={s.to}
        onClick={onClose}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`group relative flex flex-col items-start gap-1 w-44 sm:w-52 p-5 pt-6 ${s.bg} ${s.fg} select-none`}
        style={{
          boxShadow: hovered ? "6px 12px 40px rgba(0,0,0,0.55)" : "4px 8px 28px rgba(0,0,0,0.4)",
          transform: hovered ? "scale(1.05) translateY(-4px)" : "scale(1)",
          transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease",
        }}
      >
        <Icon className="h-6 w-6 mb-1 opacity-80" />
        <span className="text-xl sm:text-2xl font-extrabold tracking-tight leading-tight">{s.title}</span>
        <span className="text-xs font-semibold opacity-75">{s.stat}</span>
        <span className="text-[10px] opacity-50 leading-snug">{s.desc}</span>
        <ArrowUpRight className="absolute top-3 right-3 h-4 w-4 opacity-50 transition-all duration-300 group-hover:rotate-45 group-hover:opacity-100" />
      </Link>
    </div>
  );
}
