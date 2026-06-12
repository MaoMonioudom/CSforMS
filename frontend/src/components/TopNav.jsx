import { Link } from "react-router-dom";
import { Menu, Search, X, ArrowUpRight, Calendar, Users, MessageSquare } from "lucide-react";
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
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
      {/* Lightbulb */}
      <svg className="absolute top-[8%] left-[6%] w-10 h-10 opacity-20 animate-float-slow" style={{ "--r": "-15deg" }} viewBox="0 0 40 40" fill="none">
        <path d="M20 4C13.4 4 8 9.4 8 16c0 4.2 2.1 7.9 5.3 10.2V29a1 1 0 001 1h11a1 1 0 001-1v-2.8C29.9 23.9 32 20.2 32 16c0-6.6-5.4-12-12-12z" fill="white" />
        <rect x="14" y="30" width="12" height="2" rx="1" fill="white" />
        <rect x="15" y="33" width="10" height="2" rx="1" fill="white" />
      </svg>
      {/* Rocket */}
      <svg className="absolute top-[12%] right-[8%] w-10 h-10 opacity-20 animate-float" style={{ "--r": "20deg", animationDelay: "1s" }} viewBox="0 0 40 40" fill="none">
        <path d="M20 4C20 4 12 12 12 22h16C28 12 20 4 20 4z" fill="white" />
        <path d="M12 22l-4 8 8-4M28 22l4 8-8-4" fill="white" />
        <circle cx="20" cy="22" r="3" fill="white" opacity="0.6" />
      </svg>
      {/* Star */}
      <svg className="absolute bottom-[20%] left-[10%] w-8 h-8 opacity-15 animate-float-slow" style={{ "--r": "10deg", animationDelay: "2s" }} viewBox="0 0 32 32" fill="none">
        <path d="M16 2l3.1 9.6H29l-8.1 5.9 3.1 9.5L16 22l-8 5 3.1-9.5L3 11.6h9.9L16 2z" fill="white" />
      </svg>
      {/* Wrench */}
      <svg className="absolute bottom-[25%] right-[7%] w-9 h-9 opacity-15 animate-float" style={{ "--r": "-25deg", animationDelay: "0.5s" }} viewBox="0 0 36 36" fill="none">
        <path d="M28 4a6 6 0 00-5.8 7.4L8 25.6A6 6 0 108 32a6 6 0 006-6l14.2-14.2A6 6 0 0028 4z" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      {/* Paint brush */}
      <svg className="absolute top-[45%] left-[4%] w-9 h-9 opacity-15 animate-float-slow" style={{ "--r": "30deg", animationDelay: "1.5s" }} viewBox="0 0 36 36" fill="none">
        <path d="M28 4L10 22c-2 2-2 5 0 7s5 2 7 0L34 10 28 4z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 22c-4 1-7 4-6 8 2-1 5-2 8-4" fill="white" opacity="0.5" />
      </svg>
      {/* Circuit dots */}
      <svg className="absolute top-[60%] right-[12%] w-12 h-12 opacity-10 animate-float" style={{ "--r": "0deg", animationDelay: "3s" }} viewBox="0 0 48 48" fill="none">
        <circle cx="12" cy="12" r="3" fill="white" />
        <circle cx="36" cy="12" r="3" fill="white" />
        <circle cx="12" cy="36" r="3" fill="white" />
        <circle cx="36" cy="36" r="3" fill="white" />
        <circle cx="24" cy="24" r="4" fill="white" />
        <path d="M12 12h12M36 12H24M12 36h12M36 36H24M24 12v12M24 36V24" stroke="white" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

export function TopNav() {
  const [open, setOpen] = useState(false);
  const [activeHover, setActiveHover] = useState(null);

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
            <span className="inline-block h-6 w-6 rounded-md bg-gradient-to-br from-events via-community to-collaboration" />
            <span className="text-base font-bold tracking-tight">makerspace</span>
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
        >
          {/* Dot grid on overlay */}
          <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />
          <OverlayDoodles />

          {/* Top bar */}
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-white/10 sticky top-0 backdrop-blur-md z-10">
            <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
              <span className="inline-block h-6 w-6 rounded-md bg-gradient-to-br from-events via-community to-collaboration" />
              <span className="text-base text-white font-bold tracking-tight">makerspace</span>
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

            {/* Top bubble — Events */}
            <NavBubble
              s={sections[0]}
              delay={0}
              onClose={() => setOpen(false)}
              isHovered={activeHover === 0}
              onHover={() => setActiveHover(0)}
              onLeave={() => setActiveHover(null)}
            />

            {/* Bottom two bubbles */}
            <div className="flex gap-6 sm:gap-10">
              {sections.slice(1).map((s, i) => (
                <NavBubble
                  key={s.to}
                  s={s}
                  delay={(i + 1) * 80}
                  onClose={() => setOpen(false)}
                  isHovered={activeHover === i + 1}
                  onHover={() => setActiveHover(i + 1)}
                  onLeave={() => setActiveHover(null)}
                />
              ))}
            </div>

            <p className="text-white/30 text-xs mt-6">Press Esc to close</p>
          </nav>
        </div>
      )}
    </>
  );
}

function NavBubble({ s, delay, onClose, isHovered, onHover, onLeave }) {
  const Icon = s.icon;
  return (
    <Link
      to={s.to}
      onClick={onClose}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`group relative flex flex-col items-center justify-center rounded-full ${s.bg} ${s.fg} w-44 h-44 sm:w-56 sm:h-56 transition-transform duration-300 cursor-pointer select-none animate-bounce-in`}
      style={{
        animationDelay: `${delay}ms`,
        transform: isHovered ? "scale(1.08)" : "scale(1)",
        transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease",
        boxShadow: isHovered ? "0 20px 60px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,0,0,0.2)",
        animation: isHovered ? "wobble 0.6s ease-in-out" : undefined,
      }}
    >
      <Icon className="h-7 w-7 mb-1 opacity-80" />
      <span className="text-xl sm:text-2xl font-extrabold tracking-tight">{s.title}</span>
      <span className="text-xs font-semibold opacity-70 mt-0.5">{s.stat}</span>
      <span className="text-[10px] opacity-50 mt-0.5">{s.desc}</span>
      <ArrowUpRight className="absolute top-4 right-4 h-5 w-5 opacity-50 transition-all duration-300 group-hover:rotate-45 group-hover:opacity-100" />
    </Link>
  );
}
