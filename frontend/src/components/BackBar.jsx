import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const BORDER = "rgba(91,170,216,0.22)";
const MUTED  = "#5b7286";

// Slim back-strip shown directly under TopNav on pages reached by drilling in
// (Profile, Notifications, ...) rather than a top-level nav destination.
// Always steps back in history, regardless of which module space led here.
export function BackBar({ label = "Back" }) {
  const navigate = useNavigate();
  return (
    <div className="sticky top-16 z-[59] w-full"
      style={{ borderBottom: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)" }}>
      {/* Same max-w-7xl/px column as TopNav's header so Back lines up with the logo above it */}
      <div className="mx-auto flex h-9 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
          style={{ color: MUTED }}>
          <ArrowLeft size={13} /> {label}
        </button>
      </div>
    </div>
  );
}
