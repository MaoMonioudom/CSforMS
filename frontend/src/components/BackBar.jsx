import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const MUTED = "#5b7286";

// Plain back button for pages reached by drilling in (Profile, Notifications,
// Credits, Workspace, ...) rather than a top-level nav destination. Meant to
// be dropped as the first child inside a page's own <main> column, so it
// lines up with the content below it instead of sitting in its own
// full-width strip. Always steps back in history, regardless of which
// module space led here.
export function BackBar({ label = "Back" }) {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(-1)}
      className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
      style={{ color: MUTED }}>
      <ArrowLeft size={13} /> {label}
    </button>
  );
}
