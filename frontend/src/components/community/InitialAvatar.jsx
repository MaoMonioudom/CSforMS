// Shows a real photo when the account has one; otherwise a colored circle
// with the first letter of the name — no external avatar-image service.
const COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e",
  "#10b981", "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e",
];

function colorForName(name) {
  const str = name || "?";
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function InitialAvatar({ name, src, className = "" }) {
  if (src) {
    return <img src={src} alt={name} className={`rounded-full object-cover ${className}`} />;
  }
  const letter = (name || "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold text-white ${className}`}
      style={{ backgroundColor: colorForName(name) }}
    >
      {letter}
    </div>
  );
}
