import { Link } from "react-router-dom";
import { ArrowRight, MessageSquare, BookOpen, Package, Target, Heart, Users, Lightbulb, Zap } from "lucide-react";
import { HubNav } from "./HubNav";
import { HubFooter } from "./LandingPage";

// ── Bright Palette ────────────────────────────────────────────────────────────
const T = {
  bg:       "#ffffff",
  bgAlt:    "#fafafa",
  bgCard:   "#ffffff",
  bgSoft:   "#f9f9f9",
  text:     "#1a1a2e",
  muted:    "#5a5a72",
  faint:    "#9898b0",
  border:   "rgba(0,0,0,0.08)",
  shadow:   "0 2px 16px rgba(0,0,0,0.06)",
  shadowLg: "0 8px 40px rgba(0,0,0,0.09)",
  accent:   "#6366f1",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function SectionLabel({ number, children }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span
        className="text-[10px] font-black tracking-[0.22em] uppercase px-2.5 py-1 rounded"
        style={{
          background: "linear-gradient(135deg,#4f6ef7,#7c3aed)",
          color: "white",
        }}
      >
        {number}
      </span>
      <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: T.faint }}>
        {children}
      </span>
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-4 my-2">
      <div className="flex-1 h-px" style={{ background: T.border }} />
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(99,138,196,0.4)" }} />
      <div className="flex-1 h-px" style={{ background: T.border }} />
    </div>
  );
}

// ── Module Card ───────────────────────────────────────────────────────────────

function WorldCard({ icon: Icon, accent, tag, roomNum, title, theme, description, capabilities, href }) {
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: T.bgCard,
        border: `1px solid ${T.border}`,
        borderTop: `4px solid ${accent}`,
        boxShadow: T.shadow,
      }}
    >
      <div className="px-6 pt-6 pb-4" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <span
            className="text-[10px] font-black tracking-[0.14em] uppercase px-2 py-0.5 rounded"
            style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}30` }}
          >
            Room {roomNum}
          </span>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${accent}14`, border: `1px solid ${accent}24` }}
          >
            <Icon size={18} style={{ color: accent }} />
          </div>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: accent }}>
          {tag}
        </p>
        <h3 className="text-xl font-extrabold leading-tight" style={{ color: T.text }}>{title}</h3>
        <span
          className="inline-block text-[10px] font-semibold mt-1.5 px-2 py-0.5 rounded-full"
          style={{ background: `${accent}10`, color: accent, border: `1px solid ${accent}22` }}
        >
          {theme}
        </span>
      </div>

      <div className="px-6 py-5 flex-1 flex flex-col">
        <p className="text-sm leading-relaxed mb-5" style={{ color: T.muted }}>
          {description}
        </p>
        <ul className="flex flex-col gap-2 mb-6 flex-1">
          {capabilities.map((c) => (
            <li key={c} className="flex items-start gap-2.5 text-sm" style={{ color: T.muted }}>
              <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: accent }} />
              {c}
            </li>
          ))}
        </ul>
        <a
          href={href}
          className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: accent }}
        >
          Visit Module <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );
}

// ── Value Card ────────────────────────────────────────────────────────────────

function ValueCard({ icon: Icon, title, body, accent = T.accent }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: T.bgCard,
        border: `1px solid ${T.border}`,
        boxShadow: T.shadow,
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `${accent}14`, border: `1px solid ${accent}28` }}
      >
        <Icon size={18} style={{ color: accent }} />
      </div>
      <h4 className="font-bold mb-2" style={{ color: T.text }}>{title}</h4>
      <p className="text-sm leading-relaxed" style={{ color: T.muted }}>{body}</p>
    </div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const WORLDS = [
  {
    icon:    MessageSquare,
    accent:  "#e8a020",
    tag:     "Community Module",
    roomNum: "A01",
    title:   "Bulletin Board",
    theme:   "Cork board · Sticky notes",
    description:
      "The social heart of MakerClub. Post events, find collaborators for your next project, and stay connected with the CADT community — all on a lively digital noticeboard.",
    capabilities: [
      "Pin events as polaroid-style photo cards",
      "Post collaboration requests as sticky notes",
      "Start and join community discussions",
      "Browse by category: events, projects, discussions",
    ],
    href: "/",
  },
  {
    icon:    BookOpen,
    accent:  "#e53e3e",
    tag:     "Learning Module",
    roomNum: "B02",
    title:   "Digital Library",
    theme:   "Book pages · Chapters",
    description:
      "Browse CADT courses laid out like a library shelf. Each course is a book, each topic a chapter — making learning feel structured, tangible, and genuinely rewarding.",
    capabilities: [
      "Browse courses as a library of books",
      "Follow chapter-by-chapter progression",
      "Track reading progress per course",
      "Bookmark key sections for review",
    ],
    href: "#",
  },
  {
    icon:    Package,
    accent:  "#0891b2",
    tag:     "Inventory Module",
    roomNum: "C03",
    title:   "Resource Manager",
    theme:   "Minimal · Data-driven",
    description:
      "Need a device, a tool, or a lab material? The Resource Manager gives you a real-time view of what's available at CADT and lets you request it in seconds.",
    capabilities: [
      "Real-time stock levels and availability",
      "Submit and track resource requests",
      "Category and tag-based filtering",
      "Approval workflow for administrators",
    ],
    href: "#",
  },
];

const VALUES = [
  { icon: Target,    accent: T.accent,  title: "Purpose-Built",  body: "Every module solves one specific problem well, rather than being a generic catch-all that does nothing great." },
  { icon: Heart,     accent: "#e8a020", title: "Student-First",  body: "Every layout, label, and flow was designed with CADT students as the primary user — because this platform exists for them." },
  { icon: Users,     accent: "#0891b2", title: "Collaborative",  body: "MakerClub was built by student interns working as a team — the platform itself embodies the values it promotes." },
  { icon: Lightbulb, accent: "#e53e3e", title: "Built to Grow",  body: "New modules can be added as CADT evolves. The architecture is open and extensible by design." },
];

// ── About Page ────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: T.bg, color: T.text, minHeight: "100vh" }}>
      <HubNav light />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative pt-40 pb-28 overflow-hidden"
        style={{ background: "linear-gradient(160deg, #f5f0ff 0%, #faf8ff 60%, #ffffff 100%)" }}
      >
        {/* Subtle dot grid */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(79,110,247,0.12) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />

        {/* Soft colour blobs */}
        <div aria-hidden style={{
          position: "absolute", top: "10%", right: "8%",
          width: 340, height: 340, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div aria-hidden style={{
          position: "absolute", bottom: "0%", left: "5%",
          width: 280, height: 280, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-bold uppercase tracking-[0.18em]"
            style={{
              background: "#fff",
              border: `1px solid ${T.border}`,
              color: T.faint,
              boxShadow: T.shadow,
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: "linear-gradient(135deg,#4f6ef7,#7c3aed)" }} />
            CADT MakerClub — Hub
          </div>

          <h1
            className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight tracking-tight"
            style={{ color: T.text }}
          >
            One hub for every
            <br />
            <span
              style={{
                background: "linear-gradient(135deg,#4f6ef7,#7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              CADT student.
            </span>
          </h1>

          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: T.muted }}>
            MakerClub is the official platform of the CADT Makerspace — a single place where students connect with the community, access courses, and manage shared resources. Three modules, one home.
          </p>

          <div className="flex flex-wrap gap-3 justify-center mt-10">
            <Link
              to="/hub/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-85"
              style={{ background: "linear-gradient(135deg,#4f6ef7,#7c3aed)" }}
            >
              Join MakerClub <ArrowRight size={14} />
            </Link>
            <Link
              to="/hub"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-opacity hover:opacity-70"
              style={{ color: T.muted, border: `1px solid ${T.border}`, background: "#fff" }}
            >
              Explore the Hub
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHAT IS THIS? ────────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: T.bgAlt, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">

          <div>
            <SectionLabel number="§ 01">What Is MakerClub?</SectionLabel>
            <h2 className="text-4xl font-extrabold mb-6 leading-tight" style={{ color: T.text }}>
              Your campus life,{" "}
              <span
                style={{
                  background: "linear-gradient(135deg,#4f6ef7,#7c3aed)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                all in one place.
              </span>
            </h2>
            <p className="text-base leading-relaxed mb-4" style={{ color: T.muted }}>
              MakerClub is CADT's unified student platform — built by interns, for students. It brings together the three things you need most on campus: a community space to connect and collaborate, a library to learn from, and a tool to manage shared resources.
            </p>
            <p className="text-base leading-relaxed mb-6" style={{ color: T.muted }}>
              Instead of juggling separate apps and links, everything lives here. Create one account and step into three distinct digital worlds, each designed around a single job done really well.
            </p>

            {/* Quick facts */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { label: "Modules",    value: "3",       accent: T.accent },
                { label: "Built by",   value: "Interns", accent: "#e8a020" },
                { label: "For",        value: "CADT",    accent: "#e53e3e" },
              ].map((f) => (
                <div key={f.label}
                  className="rounded-xl p-4 text-center"
                  style={{ background: "#fff", border: `1px solid ${T.border}`, boxShadow: T.shadow }}
                >
                  <div className="text-2xl font-extrabold mb-1" style={{ color: f.accent }}>{f.value}</div>
                  <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: T.faint }}>{f.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual: connected orbs */}
          <div className="relative flex items-center justify-center h-64 lg:h-72">
            <div
              className="absolute w-20 h-20 rounded-2xl flex items-center justify-center z-10"
              style={{
                background: "linear-gradient(135deg,#4f6ef7,#7c3aed)",
                boxShadow: "0 0 40px rgba(79,110,247,0.35)",
              }}
            >
              <span className="text-white font-extrabold text-base">Hub</span>
            </div>
            {[
              { Icon: MessageSquare, color: "#e8a020", style: { top: "8%",    left: "16%" } },
              { Icon: BookOpen,      color: "#e53e3e", style: { top: "8%",    right: "16%" } },
              { Icon: Package,       color: "#0891b2", style: { bottom: "8%", left: "50%", transform: "translateX(-50%)" } },
            ].map(({ Icon, color, style }, i) => (
              <div
                key={i}
                className="absolute w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: `${color}18`,
                  border: `2px solid ${color}40`,
                  boxShadow: `0 0 20px ${color}25`,
                  ...style,
                }}
              >
                <Icon size={20} style={{ color }} />
              </div>
            ))}
            <svg className="absolute inset-0 w-full h-full" aria-hidden>
              <line x1="50%" y1="50%" x2="25%"  y2="20%"  stroke={T.border} strokeWidth="1.5" strokeDasharray="5 4" />
              <line x1="50%" y1="50%" x2="75%"  y2="20%"  stroke={T.border} strokeWidth="1.5" strokeDasharray="5 4" />
              <line x1="50%" y1="50%" x2="50%"  y2="82%"  stroke={T.border} strokeWidth="1.5" strokeDasharray="5 4" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── THREE MODULES ────────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: T.bg }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <SectionLabel number="§ 02">The Three Modules</SectionLabel>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <h2 className="text-4xl font-extrabold leading-tight" style={{ color: T.text }}>
                Each one built<br />with intention.
              </h2>
              <p className="text-base max-w-sm leading-relaxed" style={{ color: T.muted }}>
                Rather than one app that does everything poorly, we built three apps that each do one thing exceptionally well — each with its own unique look and feel.
              </p>
            </div>
            <Divider />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WORLDS.map((w) => <WorldCard key={w.tag} {...w} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: T.bgAlt, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <SectionLabel number="§ 03">How It Works</SectionLabel>
            <h2 className="text-4xl font-extrabold leading-tight" style={{ color: T.text }}>Simple to get started.</h2>
            <Divider />
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Create your account", body: "Sign up once with your CADT email. Your account gives you access to all three modules from day one.", accent: T.accent, icon: Zap },
              { step: "02", title: "Choose your module", body: "Head to the Bulletin Board to connect, the Digital Library to learn, or the Resource Manager to find what you need.", accent: "#e8a020", icon: Layers },
              { step: "03", title: "Start doing things", body: "Post a collaboration request, enrol in a course, or request lab equipment — all from one unified platform.", accent: "#e53e3e", icon: ArrowRight },
            ].map(({ step, title, body, accent, icon: Icon }) => (
              <div key={step}
                className="rounded-2xl p-8"
                style={{ background: T.bgCard, border: `1px solid ${T.border}`, boxShadow: T.shadow }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-3xl font-black" style={{ color: accent, opacity: 0.18, lineHeight: 1 }}>{step}</span>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${accent}14`, border: `1px solid ${accent}28` }}>
                    <Icon size={17} style={{ color: accent }} />
                  </div>
                </div>
                <h4 className="font-bold text-lg mb-2" style={{ color: T.text }}>{title}</h4>
                <p className="text-sm leading-relaxed" style={{ color: T.muted }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: T.bg }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <SectionLabel number="§ 04">What Drives Us</SectionLabel>
            <h2 className="text-4xl font-extrabold leading-tight" style={{ color: T.text }}>
              Our principles.
            </h2>
            <Divider />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v) => <ValueCard key={v.title} {...v} />)}
          </div>
        </div>
      </section>

      {/* ── TEAM ─────────────────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: T.bgAlt, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <SectionLabel number="§ 05">The Team</SectionLabel>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <h2 className="text-4xl font-extrabold leading-tight" style={{ color: T.text }}>
                CADT Intern 1<br />Cohort.
              </h2>
              <p className="text-base max-w-sm leading-relaxed" style={{ color: T.muted }}>
                MakerClub was designed and built entirely by student interns — three teams, three modules, one shared goal.
              </p>
            </div>
            <Divider />
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { label: "Community Team",  desc: "Bulletin Board — events, collabs, threads",   count: "3 members", accent: "#e8a020", room: "A01" },
              { label: "Learning Team",   desc: "Digital Library — courses, chapters, progress", count: "3 members", accent: "#e53e3e", room: "B02" },
              { label: "Inventory Team",  desc: "Resource Manager — stock, requests, approvals", count: "3 members", accent: "#0891b2", room: "C03" },
            ].map((t) => (
              <div
                key={t.label}
                className="rounded-2xl p-7"
                style={{
                  background: T.bgCard,
                  border: `1px solid ${T.border}`,
                  borderTop: `4px solid ${t.accent}`,
                  boxShadow: T.shadow,
                }}
              >
                <div
                  className="text-[10px] font-black tracking-[0.16em] uppercase mb-4 px-2 py-0.5 rounded inline-block"
                  style={{ background: `${t.accent}14`, color: t.accent, border: `1px solid ${t.accent}28` }}
                >
                  Room {t.room}
                </div>
                <div className="font-bold text-lg mb-1" style={{ color: T.text }}>{t.label}</div>
                <div className="text-xs mb-3 leading-relaxed" style={{ color: T.faint }}>{t.desc}</div>
                <div className="text-sm font-semibold" style={{ color: t.accent }}>{t.count}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: T.bg }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-3xl p-12 sm:p-16 text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #f5f0ff 0%, #fdf8ff 100%)",
              border: `1px solid rgba(99,102,241,0.12)`,
              boxShadow: T.shadowLg,
            }}
          >
            {/* Top accent bar */}
            <div style={{
              position: "absolute", top: 0, left: "20%", right: "20%", height: 3,
              background: "linear-gradient(90deg, transparent, #4f6ef7, #7c3aed, transparent)",
            }} />

            <div className="relative z-10">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] mb-6"
                style={{ background: "#4f6ef714", color: T.accent, border: "1px solid rgba(79,110,247,0.25)" }}
              >
                Free for CADT Students
              </div>
              <h2
                className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight"
                style={{ color: T.text }}
              >
                Ready to join the
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg,#4f6ef7,#7c3aed)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  MakerClub?
                </span>
              </h2>
              <p className="text-base mb-10 max-w-md mx-auto" style={{ color: T.muted }}>
                Create your free account and unlock the Community, Learning, and Inventory modules — all in one place.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  to="/hub/register"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-85"
                  style={{ background: "linear-gradient(135deg,#4f6ef7,#7c3aed)" }}
                >
                  Create Free Account <ArrowRight size={15} />
                </Link>
                <Link
                  to="/hub"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-70"
                  style={{ color: T.muted, border: `1px solid ${T.border}`, background: "#fff" }}
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HubFooter />
    </div>
  );
}

// silence unused-import lint for Layers used in step card
function Layers({ size, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}
