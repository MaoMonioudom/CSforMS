import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import msLogo from "../assets/ms_wbg_logo.png";

const D = {
  border: "rgba(91,170,216,0.22)",
  muted:  "#5b7286",
};

// Shared header for hub subpages (Profile, Notifications, …):
// logo sits at the true left edge like every other nav, and the back
// action lives in its own slim bar underneath instead of competing
// with the logo for space.
export function SubpageHeader({ backLabel = "Back", rightSlot }) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-40" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
      <header className="flex items-center justify-between px-4 sm:px-8 h-16" style={{ borderBottom: `1px solid ${D.border}` }}>
        <Link to="/" className="shrink-0">
          <img src={msLogo} alt="CADT Makerspace" className="h-7 sm:h-8 w-auto object-contain" />
        </Link>
        {rightSlot}
      </header>

      <div className="flex items-center px-4 sm:px-8 h-9" style={{ borderBottom: `1px solid ${D.border}`, background: "rgba(15,50,80,0.02)" }}>
        <button onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
          style={{ color: D.muted }}>
          <ArrowLeft size={13} /> {backLabel}
        </button>
      </div>
    </div>
  );
}
