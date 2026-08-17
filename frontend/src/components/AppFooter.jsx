import { Link } from "react-router-dom";
import { LogIn, User } from "lucide-react";
import { useAuth } from "../hub/AuthContext";
import bbgLogo from "../assets/ms_bbg_logo.png";

// ── Column data ───────────────────────────────────────────────────────────────
const COLUMNS = [
  {
    label:  "Quick Links",
    accent: "rgba(255,255,255,0.55)",
    links: [
      { label: "About Us",       to: "/hub/about"  },
      { label: "Guidelines",  to: "/hub/about#guidelines" },
      { label: "FAQ",         to: "/hub/about#faq" },
      { label: "Contact Our Team",     to: "/hub/about#contact" },
    ],
  },
  {
    label:  "Community",
    accent: "var(--community-gold)",
    links: [
      { label: "Community Home",           to: "/community"                  },
      { label: "Find Events",         to: "/community/eventspace"       },
      { label: "Find Your Team",      to: "/community/collabspace"      },
      { label: "Connect",        to: "/community/communityspace"   },
    ],
  },
  {
    label:  "Learning",
    // Plain --color-oxblood(-deep) is a dark red built for use on Learning's
    // light parchment background — against this footer's near-black bg it
    // reads as almost no color at all. Lightened just for this on-dark spot
    // so it's as legible as the gold/inv-accent columns next to it.
    accent: "color-mix(in oklch, var(--color-oxblood) 65%, white)",
    links: [
      { label: "Learning Home",           to: "/learning" },
      { label: "Guidelines for Learning",       to: "/learning/about" },
      { label: "View Courses",       to: "/learning/courses" },
      // { label: "Bookmarks",      to: "/learning" },
      // { label: "Announcements",  to: "/learning" },
    ],
  },
  {
    label:  "Inventory",
    accent: "var(--color-inv-accent)",
    links: [
      { label: "Inventory Home",   to: "/inventory" },
      { label: "Borrow & Purchase", to: "/inventory/browse" },
    ],
  },
];

// ── Footer ────────────────────────────────────────────────────────────────────
export function AppFooter() {
  const { user } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "#07090f", borderTop: "1px solid rgba(255,255,255,0.06)" }}>

      {/* Top accent line */}
      <div style={{ height: 2, background: "linear-gradient(90deg, transparent, color-mix(in oklch, var(--color-inv-accent-text) 50%, transparent), color-mix(in oklch, var(--color-inv-accent) 50%, transparent), transparent)" }} />

      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-5">

          {/* ── Logo column ── */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 flex flex-col gap-4">
            <Link to="/" className="flex items-center w-fit">
              <img src={bbgLogo} alt="Makerspace" className="h-8 w-auto object-contain" />
            </Link>
            <p className="text-xs font-medium leading-relaxed max-w-[200px]" style={{ color: "var(--on-dark-muted)" }}>
              Your makerspace community — learn, build, and collaborate at CADT.
            </p>
          </div>

          {/* ── Link columns ── */}
          {COLUMNS.map(col => (
            <div key={col.label} className="flex flex-col gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em]"
                style={{ color: col.accent }}>
                {col.label}
              </p>
              <ul className="flex flex-col gap-2">
                {col.links.map(l => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-xs font-semibold transition-colors duration-150 hover:text-white"
                      style={{ color: "var(--on-dark-muted)" }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-4">
          <p className="text-[11px] font-medium" style={{ color: "var(--on-dark-muted)" }}>
            © {year} CADT Makerspace · All rights reserved
          </p>

          {user ? (
            <Link to="/profile"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold transition-colors hover:text-white"
              style={{ color: "var(--on-dark-muted)" }}>
              <User size={11} />
              {user.name}
            </Link>
          ) : (
            <Link to="/login"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold transition-colors hover:text-white"
              style={{ color: "var(--on-dark-muted)" }}>
              <LogIn size={11} />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
