import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Layers, ArrowRight, ChevronDown,
  MessageSquare, BookOpen, Package,
  Target, Heart, Users, Lightbulb,
} from "lucide-react";
import { HubScene } from "./HubScene";
import msLogo from "../assets/ms_wbg_logo.png";

// ── Scene palette ─────────────────────────────────────────────────────────────
const SKY_TOP = "#5baad8";
const SKY_BOT = "#b8daf2";
const MULLION  = "#4a5870";
const CEIL     = "#1a2433";

// ── Dark below-fold palette ───────────────────────────────────────────────────
const D = {
  bg1:       "#0c1420",
  bg2:       "#111d2e",
  bg3:       "#0e1824",
  bgCard:    "#14202e",
  text:      "#c8d8e8",
  muted:     "#6a8aaa",
  faint:     "#445566",
  border:    "rgba(74,136,180,0.15)",
  borderBr:  "rgba(74,136,180,0.28)",
  accent:    "#6366f1",
  shadow:    "0 2px 20px rgba(0,10,30,0.45)",
  shadowLg:  "0 8px 48px rgba(0,10,30,0.6)",
};

// ── Nav ───────────────────────────────────────────────────────────────────────
function LandingNav() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center"
      style={{
        background: "rgba(91,170,216,0.35)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderBottom: `1px solid rgba(74,88,112,0.18)`,
      }}
    >
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src={msLogo} alt="CADT Makerspace" className="h-9 w-auto object-contain" style={{ maxWidth: 140 }} />
        </Link>

        <nav className="hidden sm:flex items-center gap-5">
          <a href="#about" className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: "#1a2e42" }}>
            About
          </a>
          <div style={{ width: 1, height: 16, background: "rgba(42,58,78,0.22)" }} />
          {[
            { label: "Community", href: "/community",  color: "#f59e0b" },
            { label: "Learning",  href: "#",  color: "#3b82f6" },
            { label: "Storage",   href: "#",  color: "#10b981" },
          ].map(m => (
            <a key={m.label} href={m.href}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full transition-opacity hover:opacity-75"
              style={{ background: `${m.color}20`, color: m.color, border: `1px solid ${m.color}50` }}>
              {m.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/hub/login"
            className="hidden sm:block text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "rgba(26,46,66,0.65)" }}>
            Sign in
          </Link>
          <Link to="/hub/register"
            className="text-sm font-semibold px-4 py-2 rounded-full text-white transition-opacity hover:opacity-85"
            style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
export function HubFooter() {
  return (
    <footer style={{ background: "#06060c", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
              <Layers size={13} color="white" strokeWidth={2.2} />
            </div>
            <span className="font-bold text-white">CADT Hub</span>
          </div>
          <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.28)" }}>
            © {new Date().getFullYear()} CADT Intern 1. Built with purpose.
          </p>
          <div className="flex items-center gap-5">
            <Link to="/hub" className="text-xs transition-opacity hover:opacity-70" style={{ color: "rgba(255,255,255,0.32)" }}>Home</Link>
            <a href="#about"  className="text-xs transition-opacity hover:opacity-70" style={{ color: "rgba(255,255,255,0.32)" }}>About</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────
function SectionLabel({ number, children }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="text-[10px] font-black tracking-[0.22em] uppercase px-2.5 py-1 rounded font-mono"
        style={{ background: "rgba(99,102,241,0.15)", color: D.accent, border: "1px solid rgba(99,102,241,0.3)" }}>
        {number}
      </span>
      <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: D.faint }}>
        {children}
      </span>
    </div>
  );
}

function SteelDivider() {
  return (
    <div className="flex items-center gap-4 my-2">
      <div className="flex-1 h-px" style={{ background: D.border }} />
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: D.faint }} />
      <div className="flex-1 h-px" style={{ background: D.border }} />
    </div>
  );
}

function ModuleCard({ icon: Icon, accent, tag, roomNum, title, theme, description, capabilities, href }) {
  return (
    <div className="rounded-2xl overflow-hidden flex flex-col"
      style={{ background: D.bgCard, border: `1px solid ${D.border}`, borderLeft: `3px solid ${accent}`, boxShadow: D.shadow }}>
      <div className="px-6 pt-6 pb-4" style={{ borderBottom: `1px solid ${D.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black tracking-[0.14em] uppercase px-2 py-0.5 rounded font-mono"
            style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}30` }}>
            Room {roomNum}
          </span>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${accent}14`, border: `1px solid ${accent}24` }}>
            <Icon size={18} style={{ color: accent }} />
          </div>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: accent }}>{tag}</p>
        <h3 className="text-xl font-extrabold leading-tight" style={{ color: D.text }}>{title}</h3>
        <span className="inline-block text-[10px] font-semibold mt-1.5 px-2 py-0.5 rounded-full font-mono"
          style={{ background: `${accent}10`, color: accent, border: `1px solid ${accent}22` }}>
          {theme}
        </span>
      </div>
      <div className="px-6 py-5 flex-1 flex flex-col">
        <p className="text-sm leading-relaxed mb-5" style={{ color: D.muted }}>{description}</p>
        <ul className="flex flex-col gap-2 mb-6 flex-1">
          {capabilities.map(c => (
            <li key={c} className="flex items-start gap-2.5 text-sm" style={{ color: D.muted }}>
              <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: accent }} />
              {c}
            </li>
          ))}
        </ul>
        <a href={href} className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: accent }}>
          Visit Module <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );
}

function ValueCard({ icon: Icon, title, body, accent = D.accent }) {
  return (
    <div className="rounded-2xl p-6"
      style={{ background: D.bgCard, border: `1px solid ${D.border}`, boxShadow: D.shadow }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `${accent}14`, border: `1px solid ${accent}28` }}>
        <Icon size={18} style={{ color: accent }} />
      </div>
      <h4 className="font-bold mb-2" style={{ color: D.text }}>{title}</h4>
      <p className="text-sm leading-relaxed" style={{ color: D.muted }}>{body}</p>
    </div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────
const MODULES = [
  {
    icon: MessageSquare, accent: "#c9a86c", tag: "Community Module", roomNum: "A01",
    title: "Bulletin Board", theme: "Cork board · Sticky notes",
    description: "A warm, tactile digital space inspired by physical cork boards. Students pin events, drop sticky-note project ideas, and connect in community threads.",
    capabilities: ["Pin events as polaroid-style photo cards","Post collaboration requests as sticky notes","Start and join community discussions","Browse by category: events, projects, discussions"],
    href: "/community",
  },
  {
    icon: BookOpen, accent: "#c0392b", tag: "Learning Module", roomNum: "B02",
    title: "Digital Library", theme: "Book pages · Chapters",
    description: "Courses are presented as books — each module is a volume, each topic a chapter. The reading-style interface keeps learners focused and makes progress feel tangible.",
    capabilities: ["Browse courses as a library of books","Follow chapter-by-chapter progression","Track reading progress per course","Bookmark key sections for review"],
    href: "/learning",
  },
  {
    icon: Package, accent: "#0891b2", tag: "Inventory Module", roomNum: "C03",
    title: "Resource Manager", theme: "Minimal · Data-driven",
    description: "A clean, modern interface for tracking CADT's physical and digital assets. Built around clarity and speed — see what's available, request what you need.",
    capabilities: ["Real-time stock levels and availability","Submit and track resource requests","Category and tag-based filtering","Approval workflow for administrators"],
    href: "/inventory",
  },
];

const VALUES = [
  { icon: Target,     accent: D.accent,  title: "Purpose-Built", body: "Every module was designed with a specific user job in mind — not as a generic tool, but as the right tool for that exact context." },
  { icon: Heart,      accent: "#c9a86c", title: "Student-First",  body: "Decisions about layout, language, and flow are made with students at the center — because they are the primary users of this ecosystem." },
  { icon: Users,      accent: "#0891b2", title: "Collaborative",  body: "Built by a team of interns working together, the platform itself reflects the collaborative values it's meant to enable." },
  { icon: Lightbulb,  accent: "#c0392b", title: "Open to Grow",   body: "The architecture supports adding new modules over time. As CADT's needs evolve, the platform can expand without rebuilding from scratch." },
];

// ── Glass curtain wall decoration (SVG, matches the scene's glass wall) ───────
function CurtainWallDecoration() {
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
  const aboutRef      = useRef(null);

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

  const scrollToAbout = () =>
    aboutRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={{ width: "100vw", background: D.bg1 }}>
      <LandingNav />

      {/* ── 1. WELCOME ─────────────────────────────────────────────────── */}
      <section
        style={{
          width: "100%",
          height: "100vh",
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
        <div className="relative z-10 text-center px-4 sm:px-8 max-w-3xl mx-auto" style={{ paddingTop: 64 }}>
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
              background: "linear-gradient(135deg,#6366f1,#a855f7)",
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
            <Link to="/hub/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-85"
              style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
              Get Started <ArrowRight size={14} />
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
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none"
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

      {/* ── 3. ABOUT & TEAM ────────────────────────────────────────────── */}
      <div id="about" ref={aboutRef}>

        {/* § 01 Mission */}
        <section className="py-28" style={{ background: D.bg1, borderBottom: `1px solid ${D.border}`, position: "relative", overflow: "hidden" }}>
          <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: `linear-gradient(rgba(74,136,180,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(74,136,180,0.04) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }} />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-16">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-bold uppercase tracking-[0.18em]"
                style={{ background: D.bgCard, border: `1px solid ${D.borderBr}`, color: D.muted }}>
                <span className="w-2 h-2 rounded-full" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }} />
                Makerspace - MakerClub
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold mb-5 leading-tight" style={{ color: D.text }}>
                Welcome to the MakerClub.
                <br />
                <span style={{
                  background: "linear-gradient(135deg,#6366f1,#a855f7)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>For CADT Students.</span>
              </h2>
              <p className="text-base max-w-xl mx-auto leading-relaxed" style={{ color: D.muted }}>
                MakerClub connects three purpose-built modules, each with its own distinct design language, under a single entry point for the CADT community.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <SectionLabel number="§ 01">Our Mission</SectionLabel>
                <h3 className="text-3xl font-extrabold mb-6 leading-tight" style={{ color: D.text }}>
                  Connected tools for a{" "}
                  <span style={{
                    background: "linear-gradient(135deg,#5baad8,#6366f1)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}>connected campus.</span>
                </h3>
                <p className="text-base leading-relaxed mb-4" style={{ color: D.muted }}>
                  Students at CADT needed tools for learning, for finding teammates, for accessing resources. But scattered, disconnected apps create friction. MakerClub exists to eliminate that friction.
                </p>
                <p className="text-base leading-relaxed" style={{ color: D.muted }}>
                  By linking three specialized modules through a single hub, we give every student one place to start and three unique worlds to explore.
                </p>
              </div>

              {/* Connected orbs */}
              <div className="relative flex items-center justify-center h-64 lg:h-72">
                <svg className="absolute inset-0 w-full h-full" aria-hidden>
                  <line x1="50%" y1="50%" x2="25%"  y2="20%" stroke={D.border} strokeWidth="1.5" strokeDasharray="5 4" />
                  <line x1="50%" y1="50%" x2="75%"  y2="20%" stroke={D.border} strokeWidth="1.5" strokeDasharray="5 4" />
                  <line x1="50%" y1="50%" x2="50%"  y2="82%" stroke={D.border} strokeWidth="1.5" strokeDasharray="5 4" />
                </svg>
                <div className="absolute w-20 h-20 rounded-2xl flex items-center justify-center z-10"
                  style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", boxShadow: "0 0 48px rgba(99,102,241,0.4)" }}>
                  <span className="text-white font-extrabold text-base">Hub</span>
                </div>
                {[
                  { Icon: MessageSquare, color: "#c9a86c", style: { top: "8%",   left: "16%" } },
                  { Icon: BookOpen,      color: "#c0392b", style: { top: "8%",   right: "16%" } },
                  { Icon: Package,       color: "#0891b2", style: { bottom: "8%", left: "50%", transform: "translateX(-50%)" } },
                ].map(({ Icon, color, style }, i) => (
                  <div key={i} className="absolute w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: `${color}14`, border: `2px solid ${color}40`, boxShadow: `0 0 24px ${color}20`, ...style }}>
                    <Icon size={20} style={{ color }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* § 02 Three Worlds */}
        <section className="py-28" style={{ background: D.bg2, borderTop: `1px solid ${D.border}`, borderBottom: `1px solid ${D.border}` }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14">
              <SectionLabel number="§ 02">The Three Worlds</SectionLabel>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <h2 className="text-4xl font-extrabold leading-tight" style={{ color: D.text }}>
                  Each one built<br />with intention.
                </h2>
                <p className="text-base max-w-sm leading-relaxed" style={{ color: D.muted }}>
                  Rather than building one app that does everything poorly, we built three apps that each do one thing exceptionally well.
                </p>
              </div>
              <SteelDivider />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {MODULES.map(m => <ModuleCard key={m.tag} {...m} />)}
            </div>
          </div>
        </section>

        {/* § 03 Values */}
        <section className="py-28" style={{ background: D.bg1, borderBottom: `1px solid ${D.border}`, position: "relative", overflow: "hidden" }}>
          <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: `linear-gradient(rgba(74,136,180,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(74,136,180,0.035) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }} />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <div className="mb-14">
              <SectionLabel number="§ 03">What Drives Us</SectionLabel>
              <h2 className="text-4xl font-extrabold leading-tight" style={{ color: D.text }}>Our principles.</h2>
              <SteelDivider />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {VALUES.map(v => <ValueCard key={v.title} {...v} />)}
            </div>
          </div>
        </section>

        {/* § 04 Team */}
        <section className="py-28" style={{ background: D.bg2, borderBottom: `1px solid ${D.border}` }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14">
              <SectionLabel number="§ 04">The Team</SectionLabel>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <h2 className="text-4xl font-extrabold leading-tight" style={{ color: D.text }}>
                  CADT Intern 1<br />Cohort.
                </h2>
                <p className="text-base max-w-sm leading-relaxed" style={{ color: D.muted }}>
                  This platform was designed and built entirely by student interns as part of the CADT Intern 1 program. Three teams, three modules, one shared vision.
                </p>
              </div>
              <SteelDivider />
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { label: "Community Team",  count: "3 members", accent: "#c9a86c", room: "A01" },
                { label: "Learning Team",   count: "3 members", accent: "#c0392b", room: "B02" },
                { label: "Inventory Team",  count: "3 members", accent: "#0891b2", room: "C03" },
              ].map(t => (
                <div key={t.label} className="rounded-2xl p-7"
                  style={{ background: D.bgCard, border: `1px solid ${D.border}`, borderLeft: `4px solid ${t.accent}`, boxShadow: D.shadow }}>
                  <div className="text-[10px] font-black tracking-[0.16em] uppercase mb-4 px-2 py-0.5 rounded inline-block font-mono"
                    style={{ background: `${t.accent}18`, color: t.accent, border: `1px solid ${t.accent}30` }}>
                    Room {t.room}
                  </div>
                  <div className="font-bold text-lg mb-1" style={{ color: D.text }}>{t.label}</div>
                  <div className="text-sm" style={{ color: t.accent }}>{t.count}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-28" style={{ background: D.bg3 }}>
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl p-12 sm:p-16 text-center relative overflow-hidden"
              style={{ background: D.bgCard, border: `1px solid ${D.borderBr}`, boxShadow: D.shadowLg }}>
              {/* LED strip */}
              <div style={{
                position: "absolute", top: 0, left: "15%", right: "15%", height: 3,
                background: "linear-gradient(90deg, transparent, #6366f1, #a855f7, transparent)",
                opacity: 0.7,
              }} />
              <div aria-hidden className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden" style={{
                backgroundImage: `linear-gradient(rgba(74,136,180,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(74,136,180,0.04) 1px, transparent 1px)`,
                backgroundSize: "32px 32px",
              }} />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] mb-6"
                  style={{ background: "#6366f114", color: D.accent, border: "1px solid rgba(99,102,241,0.25)" }}>
                  Enroll Today
                </div>
                <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight" style={{ color: D.text }}>
                  Become part of
                  <br />
                  <span style={{
                    background: "linear-gradient(135deg,#6366f1,#a855f7)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}>the ecosystem.</span>
                </h2>
                <p className="text-base mb-10 max-w-md mx-auto" style={{ color: D.muted }}>
                  Create your account and get access to the Community, Learning, and Inventory modules today.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link to="/hub/register"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-85"
                    style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
                    Create Free Account <ArrowRight size={15} />
                  </Link>
                  <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-70"
                    style={{ color: D.muted, border: `1px solid ${D.border}`, background: "none", cursor: "pointer" }}>
                    Back to Top
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <HubFooter />
    </div>
  );
}
