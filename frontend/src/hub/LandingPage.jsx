import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import { HubScene } from "./HubScene";
import { useAuth } from "./AuthContext";
import { HubNav } from "./HubNav";
import { AppFooter } from "../components/AppFooter";

// ── Scene palette ─────────────────────────────────────────────────────────────
const SKY_TOP = "#5baad8";
const SKY_BOT = "#b8daf2";
const MULLION  = "#4a5870";
const CEIL     = "#1a2433";

// ── Bright below-fold palette (Sky & Cloud) ───────────────────────────────────
const D = {
  bg1:       "#f4f8fc",
  bg2:       "#eaf2fa",
  bg3:       "#e3edf7",
  bgCard:    "#ffffff",
  text:      "#16324a",
  muted:     "#4a6478",
  faint:     "#7a93a8",
  border:    "rgba(91,170,216,0.22)",
  borderBr:  "rgba(91,170,216,0.38)",
  accent:    "#6366f1",
  shadow:    "0 2px 20px rgba(15,50,80,0.08)",
  shadowLg:  "0 8px 48px rgba(15,50,80,0.14)",
};

// ── Glass curtain wall decoration (SVG, matches the scene's glass wall) ───────
export function CurtainWallDecoration() {
  const panH = 420;
  const tiles = [-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6];
  return (
    <svg
      aria-hidden
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 900 600"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ceiling strip */}
      <rect x="0" y="0" width="900" height="22" fill={CEIL} opacity="0.55" />

      {/* Glass panes & mullions tiled across width */}
      {tiles.map(n => {
        const cx = 450 + n * 68;
        return (
          <g key={n} transform={`translate(${cx}, 0)`}>
            <rect x={-33} y={22} width={31} height={panH - 22} fill={SKY_BOT} opacity="0.18" />
            <rect x={2}   y={22} width={31} height={panH - 22} fill={SKY_BOT} opacity="0.18" />
            {/* Horizontal mid-rail */}
            <rect x={-33} y={22 + (panH - 22) * 0.48} width={66} height={2} fill={MULLION} opacity="0.35" />
            {/* Vertical mullion */}
            <rect x={-2}  y={22} width={3}  height={panH} fill={MULLION} opacity="0.30" />
          </g>
        );
      })}

      {/* Base rail */}
      <rect y={panH - 10} width={900} height={10} fill={MULLION} opacity="0.25" />
    </svg>
  );
}

// Camera range constants — must match HubScene.jsx
const CAM_MIN = -600;
const CAM_MAX  =  640;
// Extra scroll height for the scene wrapper (px). This is how many pixels the
// user needs to scroll to sweep the camera from CAM_MIN to CAM_MAX.
const SCENE_SCROLL_HEIGHT = (CAM_MAX - CAM_MIN) * 2; // 2480 px — smooth feel

// ── Landing Page ──────────────────────────────────────────────────────────────
export default function HubLandingPage() {
  const sceneWrapRef  = useRef(null); // tall sticky wrapper
  const setCamXRef    = useRef(null); // populated by HubScene
  const { user }      = useAuth();

  // Drive HubScene camera from page scroll position.
  useEffect(() => {
    const handleScroll = () => {
      if (!sceneWrapRef.current || !setCamXRef.current) return;
      const rect     = sceneWrapRef.current.getBoundingClientRect();
      const wrapH    = sceneWrapRef.current.offsetHeight;
      const viewH    = window.innerHeight;
      const scrolledIn = -rect.top;            // 0 when section top hits viewport top
      const maxScroll  = wrapH - viewH;        // total scroll distance inside wrapper
      if (scrolledIn <= 0 || scrolledIn >= maxScroll) return;
      const progress = scrolledIn / maxScroll; // 0 → 1
      setCamXRef.current(CAM_MIN + progress * (CAM_MAX - CAM_MIN));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToScene = () =>
    sceneWrapRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={{ width: "100vw", background: D.bg1 }}>
      <HubNav light />

      {/* ── 1. WELCOME ─────────────────────────────────────────────────── */}
      <section
        style={{
          width: "100%",
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(180deg, ${SKY_TOP} 0%, ${SKY_BOT} 100%)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Glass curtain wall pattern — same visual as the scene */}
        <CurtainWallDecoration />

        {/* Soft vignette edges */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(91,170,216,0.45) 100%)`,
        }} />

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center min-h-0 text-center px-4 sm:px-8 max-w-3xl mx-auto" style={{ paddingTop: 88, paddingBottom: 24 }}>
          {/* Building badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-bold uppercase tracking-[0.2em]"
            style={{
              background: "rgba(255,255,255,0.28)",
              border: `1px solid rgba(74,88,112,0.22)`,
              color: "#1a3350",
              backdropFilter: "blur(8px)",
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }} />
            CADT Makerspace Hub
          </div>

          <h1
            className="text-5xl sm:text-7xl font-extrabold leading-tight tracking-tight mb-6"
            style={{ color: "#0f2033" }}
          >
            Welcome to the
            <br />
            <span style={{
              background: "linear-gradient(135deg,#033e8a,#0078b7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Makerspace.
            </span>
          </h1>

          <p className="text-lg sm:text-xl leading-relaxed mb-10 max-w-xl mx-auto"
            style={{ color: "rgba(15,32,51,0.65)" }}>
            Your hub for community, learning, and resources, all in one place. Step inside, explore the space, and find your door.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link to={user ? "/profile" : "/register"}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-85"
              style={{ background: "linear-gradient(135deg,#033e8a,#0078b7)" }}>
              {user ? "Go to Profile" : "Get Started"} <ArrowRight size={14} />
            </Link>
            <button
              onClick={scrollToScene}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-opacity hover:opacity-70"
              style={{
                color: "#1a3350",
                background: "rgba(255,255,255,0.30)",
                border: "1px solid rgba(74,88,112,0.22)",
                backdropFilter: "blur(8px)",
              }}>
              Explore the Space
            </button>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="relative z-10 shrink-0 flex flex-col items-center gap-1.5 pb-8 pointer-events-none"
          style={{ color: "rgba(15,32,51,0.4)" }}>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Enter the space</span>
          <ChevronDown size={16} className="animate-bounce" />
        </div>

        {/* Bottom gradient bridge into scene */}
        <div aria-hidden style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
          background: `linear-gradient(to bottom, transparent, ${SKY_BOT})`,
          pointerEvents: "none",
        }} />
      </section>

      {/* ── 2. SCENE — sticky inside a tall wrapper ────────────────────── */}
      {/* The wrapper is taller than the viewport so the user scrolls through it.
          The sticky inner stays pinned, and scroll progress drives the camera. */}
      <div
        ref={sceneWrapRef}
        style={{ height: `calc(100vh + ${SCENE_SCROLL_HEIGHT}px)`, position: "relative" }}
      >
        <div style={{ position: "sticky", top: 64, height: "calc(100vh - 64px)", overflow: "hidden", background: SKY_BOT }}>
          <HubScene
            scrollControlRef={setCamXRef}
            initialCamX={CAM_MIN}
            onKeyMove={(delta) => window.scrollBy(0, Math.round(delta * 2))}
          />

          {/* Bottom gradient bridge into dark section */}
          <div aria-hidden style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 100,
            background: `linear-gradient(to bottom, transparent, ${D.bg1})`,
            pointerEvents: "none",
          }} />
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
