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
      { label: "About",       to: "/hub/about"  },
      { label: "Guidelines",  to: "/hub/about#guidelines" },
      { label: "FAQ",         to: "/hub/about#faq" },
      { label: "Contact",     to: "/hub/about#contact" },
    ],
  },
  {
    label:  "Community",
    accent: "#c9a86c",
    links: [
      { label: "Home",           to: "/community"                  },
      { label: "Events",         to: "/community/eventspace"       },
      { label: "Find Team",      to: "/community/collabspace"      },
      { label: "Connect",        to: "/community/communityspace"   },
    ],
  },
  {
    label:  "Learning",
    accent: "#e07060",
    links: [
      { label: "Home",           to: "/learning" },
      { label: "About",       to: "/learning/about" },
      { label: "Courses",       to: "/learning/courses" },
      // { label: "Bookmarks",      to: "/learning" },
      // { label: "Announcements",  to: "/learning" },
    ],
  },
  {
    label:  "Inventory",
    accent: "#38bdf8",
    links: [
      { label: "Home",   to: "/inventory" },
      { label: "Browse", to: "/inventory/browse" },
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
      <div style={{ height: 2, background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), rgba(168,85,247,0.5), transparent)" }} />

      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-5">

          {/* ── Logo column ── */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 flex flex-col gap-4">
            <Link to="/" className="flex items-center w-fit">
              <img src={bbgLogo} alt="Makerspace" className="h-8 w-auto object-contain" />
            </Link>
            <p className="text-xs font-medium leading-relaxed max-w-[200px]" style={{ color: "rgba(255,255,255,0.60)" }}>
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
                      style={{ color: "rgba(255,255,255,0.75)" }}
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
          <p className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.50)" }}>
            © {year} CADT Makerspace · All rights reserved
          </p>

          {user ? (
            <Link to="/profile"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold transition-colors hover:text-white"
              style={{ color: "rgba(255,255,255,0.70)" }}>
              <User size={11} />
              {user.name}
            </Link>
          ) : (
            <Link to="/login"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold transition-colors hover:text-white"
              style={{ color: "rgba(255,255,255,0.70)" }}>
              <LogIn size={11} />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
