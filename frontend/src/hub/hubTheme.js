// Shared "Sky & Cloud" palette for the hub's public-facing pages (Landing,
// About, Profile, nav). Previously each page redeclared its own copy of
// these values (and drifted — Profile's bg didn't quite match Landing/
// About's) — now there's one source. The accent is var(--color-inv-accent)
// rather than a hub-only color, so hub pages pull from the same palette the
// 3 modules already use instead of adding a 4th (the old accent was an
// unrelated indigo/purple, #6366f1/#a855f7).
export const HUB = {
  bg1:       "#f4f8fc",
  bg2:       "#eaf2fa",
  bg3:       "#e3edf7",
  bgCard:    "#ffffff",
  text:      "#16324a",
  muted:     "#4a6478",
  faint:     "#7a93a8",
  border:    "rgba(91,170,216,0.22)",
  borderBr:  "rgba(91,170,216,0.38)",
  accent:    "var(--color-inv-accent)",
  shadow:    "0 2px 20px rgba(15,50,80,0.08)",
  shadowLg:  "0 8px 48px rgba(15,50,80,0.14)",
};

// Used for hero gradient text, primary CTA pills, and small accent dots —
// one gradient everywhere instead of the old mix of indigo/purple and blue.
export const HUB_GRADIENT = "linear-gradient(135deg, var(--color-inv-accent-text), var(--color-inv-accent))";

// Sky-glass hero scene tones (Landing's welcome section + HubScene, About's
// hero banner) — deliberately kept as the hub's own visual identity, same
// as Community's corkboard, so this isn't part of the accent unification.
export const SKY_TOP = "#5baad8";
export const SKY_BOT = "#b8daf2";
