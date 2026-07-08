import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, MessageSquare, BookOpen, Package,
  Compass, Target, ShieldCheck, Wrench, Users, MessageCircle,
  MapPin, Mail, Clock, ChevronDown,
} from "lucide-react";
import { HubNav } from "./HubNav";
import { CurtainWallDecoration } from "./LandingPage";
import { AppFooter } from "../components/AppFooter";

// ── Sky & Cloud palette — matches Landing / Login / Register / Profile ────────
const T = {
  bg1:      "#f4f8fc",
  bg2:      "#eaf2fa",
  bg3:      "#e3edf7",
  bgCard:   "#ffffff",
  text:     "#16324a",
  muted:    "#4a6478",
  faint:    "#7a93a8",
  border:   "rgba(91,170,216,0.22)",
  borderBr: "rgba(91,170,216,0.38)",
  accent:   "#6366f1",
  shadow:   "0 2px 20px rgba(15,50,80,0.08)",
  shadowLg: "0 8px 48px rgba(15,50,80,0.14)",
};

const GRADIENT = "linear-gradient(135deg,#6366f1,#a855f7)";
const SKY_TOP  = "#5baad8";
const SKY_BOT  = "#b8daf2";

// ── Helpers ───────────────────────────────────────────────────────────────────

function SectionLabel({ number, children }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span
        className="text-[10px] font-black tracking-[0.22em] uppercase px-2.5 py-1 rounded font-mono"
        style={{ background: GRADIENT, color: "white" }}
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
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.faint }} />
      <div className="flex-1 h-px" style={{ background: T.border }} />
    </div>
  );
}

// ── Ruled "notebook paper" card — used for Guidelines ─────────────────────────
const RULE_H = 28;

function RuledCard({ icon: Icon, title, body, accent = T.accent }) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "#fffdf7",
        border: `1px solid ${T.border}`,
        boxShadow: T.shadow,
        backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${RULE_H - 1}px, rgba(37,99,235,0.35) ${RULE_H - 1}px, rgba(37,99,235,0.35) ${RULE_H}px)`,
        backgroundPosition: "0 14px",
      }}
    >
      <div className="absolute inset-y-0" style={{ left: 34, width: 1.5, background: `${accent}66` }} />
      <div className="absolute rounded-full" style={{ left: 13, top: 44, width: 7, height: 7, background: "rgba(15,50,80,0.10)", boxShadow: "inset 0 1px 1px rgba(0,0,0,0.15)" }} />
      <div className="absolute rounded-full" style={{ left: 13, bottom: 44, width: 7, height: 7, background: "rgba(15,50,80,0.10)", boxShadow: "inset 0 1px 1px rgba(0,0,0,0.15)" }} />

      <div className="relative p-6 pl-12">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
          style={{ background: `${accent}14`, border: `1px solid ${accent}28` }}>
          <Icon size={18} style={{ color: accent }} />
        </div>
        <h4 className="font-bold mb-2" style={{ color: T.text }}>{title}</h4>
        <p className="text-sm leading-relaxed" style={{ color: T.muted }}>{body}</p>
      </div>
    </div>
  );
}

// ── FAQ accordion item ─────────────────────────────────────────────────────────
function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
      >
        <span className="font-bold" style={{ color: T.text }}>{q}</span>
        <ChevronDown
          size={18}
          style={{ color: T.faint, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
          className="shrink-0"
        />
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-sm leading-relaxed" style={{ color: T.muted }}>{a}</p>
        </div>
      )}
    </div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const GUIDELINES = [
  { icon: ShieldCheck,   accent: T.accent,  title: "Membership & access", body: "You need an active CADT Makerspace membership to book equipment or workspace. Sign up once — it covers all three modules." },
  { icon: Wrench,        accent: "#c9a86c", title: "Safety first",        body: "Some equipment (like the laser cutter) requires a certification workshop before solo use. Never operate tools you haven't been trained on." },
  { icon: Package,       accent: "#0891b2", title: "Borrow & return",     body: "Return borrowed items by the due date shown in your request. Report damage or loss right away rather than staying quiet about it." },
  { icon: Users,         accent: "#c0392b", title: "Respect the space",   body: "Clean up after yourself, put tools back where they belong, and flag anything broken so the next person isn't caught off guard." },
  { icon: MessageCircle, accent: "#6366f1", title: "Code of conduct",     body: "Keep Community and Find Team posts respectful and on-topic. Harassment or spam isn't tolerated and may result in account action." },
  { icon: Target,        accent: "#c9a86c", title: "Event registration", body: "Register ahead when you can, and cancel your spot if plans change — it frees the seat up for someone on the waitlist." },
];

const FAQS = [
  { q: "Who can use the CADT Makerspace?", a: "Any active CADT student with a MakerClub account. Create an account with your CADT email to get started." },
  { q: "Is MakerClub free to use?", a: "Yes — it's free for all CADT students. Create an account and you'll have access to Community, Learning, and Inventory from day one." },
  { q: "How do I borrow tools or equipment?", a: "Head to the Inventory module (Resource Manager), find the item you need, and submit a request. An admin reviews and approves it before it's checked out to you." },
  { q: "What if I damage or lose something I borrowed?", a: "Report it as soon as possible rather than waiting — either through the app or directly to Makerspace staff. Being upfront keeps the whole system working for everyone." },
  { q: "How do I find teammates for a project?", a: "Post on Find Team in the Community module — describe your project and the roles you're looking for. Interested students reach out to you directly." },
  { q: "How do I register for an event or workshop?", a: "Browse Events in the Community module and click register. Some sessions (like equipment certifications) are prerequisites for using certain tools solo." },
];

// ── About Page ────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div style={{ backgroundColor: T.bg1, color: T.text, minHeight: "100vh" }}>
      <HubNav light />

      {/* ── HERO — same sky-glass scene as the landing page welcome ───────── */}
      <section
        className="relative pt-40 pb-28 overflow-hidden"
        style={{ background: `linear-gradient(180deg, ${SKY_TOP} 0%, ${SKY_BOT} 100%)` }}
      >
        <CurtainWallDecoration />

        <div aria-hidden style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(91,170,216,0.45) 100%)",
        }} />

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-bold uppercase tracking-[0.2em]"
            style={{ background: "rgba(255,255,255,0.28)", border: "1px solid rgba(74,88,112,0.22)", color: "#1a3350", backdropFilter: "blur(8px)" }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: GRADIENT }} />
            CADT MakerClub — Hub
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight tracking-tight" style={{ color: "#0f2033" }}>
            One hub for every
            <br />
            <span style={{ background: GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              CADT student.
            </span>
          </h1>

          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "rgba(15,32,51,0.65)" }}>
            MakerClub is the official platform of the CADT Makerspace — a single place where students connect with the community, access courses, and manage shared resources. Three modules, one home.
          </p>

          <div className="flex flex-wrap gap-3 justify-center mt-10">
            <Link to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-85"
              style={{ background: GRADIENT }}>
              Join MakerClub <ArrowRight size={14} />
            </Link>
            <Link to="/hub"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-opacity hover:opacity-70"
              style={{ color: "#1a3350", background: "rgba(255,255,255,0.30)", border: "1px solid rgba(74,88,112,0.22)", backdropFilter: "blur(8px)" }}>
              Explore the Hub
            </Link>
          </div>
        </div>

        <div aria-hidden style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
          background: `linear-gradient(to bottom, transparent, ${T.bg1})`,
          pointerEvents: "none",
        }} />
      </section>

      {/* ── § 01 WHAT IS THE MAKERSPACE ─────────────────────────────────── */}
      <section className="py-24" style={{ background: T.bg1 }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionLabel number="§ 01">What Is the Makerspace?</SectionLabel>
            <h2 className="text-4xl font-extrabold mb-6 leading-tight" style={{ color: T.text }}>
              A real, physical space —{" "}
              <span style={{ background: GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                not just an app.
              </span>
            </h2>
            <p className="text-base leading-relaxed mb-4" style={{ color: T.muted }}>
              The CADT Makerspace is a hands-on workshop on campus — electronics benches, 3D printers, a laser cutter, and a wood + metal shop — where students build things instead of just reading about them.
            </p>
            <p className="text-base leading-relaxed mb-6" style={{ color: T.muted }}>
              MakerClub is the digital front door to that space: discover workshops and events, request the tools and materials you need, and find people to build with — all from one account.
            </p>

            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { label: "Modules",  value: "3",       accent: T.accent },
                { label: "Access",   value: "CADT",     accent: "#c9a86c" },
                { label: "Cost",     value: "Free",     accent: "#c0392b" },
              ].map((f) => (
                <div key={f.label} className="rounded-xl p-4 text-center" style={{ background: T.bgCard, border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
                  <div className="text-2xl font-extrabold mb-1" style={{ color: f.accent }}>{f.value}</div>
                  <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: T.faint }}>{f.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual: connected orbs */}
          <div className="relative flex items-center justify-center h-64 lg:h-72">
            <svg className="absolute inset-0 w-full h-full" aria-hidden>
              <line x1="50%" y1="50%" x2="25%" y2="20%" stroke={T.border} strokeWidth="1.5" strokeDasharray="5 4" />
              <line x1="50%" y1="50%" x2="75%" y2="20%" stroke={T.border} strokeWidth="1.5" strokeDasharray="5 4" />
              <line x1="50%" y1="50%" x2="50%" y2="82%" stroke={T.border} strokeWidth="1.5" strokeDasharray="5 4" />
            </svg>
            <div className="absolute w-20 h-20 rounded-2xl flex items-center justify-center z-10"
              style={{ background: GRADIENT, boxShadow: "0 0 40px rgba(99,102,241,0.35)" }}>
              <span className="text-white font-extrabold text-base">Hub</span>
            </div>
            {[
              { Icon: MessageSquare, color: "#c9a86c", style: { top: "8%",    left: "16%" } },
              { Icon: BookOpen,      color: "#c0392b", style: { top: "8%",    right: "16%" } },
              { Icon: Package,       color: "#0891b2", style: { bottom: "8%", left: "50%", transform: "translateX(-50%)" } },
            ].map(({ Icon, color, style }, i) => (
              <div key={i} className="absolute w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: `${color}14`, border: `2px solid ${color}40`, boxShadow: `0 0 24px ${color}20`, ...style }}>
                <Icon size={20} style={{ color }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── § 02 VISION & MISSION ───────────────────────────────────────── */}
      <section className="py-24" style={{ background: T.bg2, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <SectionLabel number="§ 02">Vision &amp; Mission</SectionLabel>
            <h2 className="text-4xl font-extrabold leading-tight" style={{ color: T.text }}>Why this exists.</h2>
            <Divider />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-2xl p-8" style={{ background: T.bgCard, border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                style={{ background: `${T.accent}14`, border: `1px solid ${T.accent}28` }}>
                <Compass size={20} style={{ color: T.accent }} />
              </div>
              <h3 className="font-bold text-xl mb-3" style={{ color: T.text }}>Vision</h3>
              <p className="text-base leading-relaxed" style={{ color: T.muted }}>
                A campus where every CADT student has the tools, space, and community to turn ideas into things — not just in theory, but with their own hands.
              </p>
            </div>

            <div className="rounded-2xl p-8" style={{ background: T.bgCard, border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                style={{ background: "rgba(192,57,43,0.14)", border: "1px solid rgba(192,57,43,0.28)" }}>
                <Target size={20} style={{ color: "#c0392b" }} />
              </div>
              <h3 className="font-bold text-xl mb-3" style={{ color: T.text }}>Mission</h3>
              <p className="text-base leading-relaxed" style={{ color: T.muted }}>
                To give CADT students one connected platform for the physical Makerspace: discover workshops and events, request the tools and materials you need, and find people to build with.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── § 03 GUIDELINES ─────────────────────────────────────────────── */}
      <section id="guidelines" className="py-24" style={{ background: T.bg1, scrollMarginTop: 80 }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <SectionLabel number="§ 03">Guidelines</SectionLabel>
            <h2 className="text-4xl font-extrabold leading-tight" style={{ color: T.text }}>How the space works.</h2>
            <Divider />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {GUIDELINES.map((g) => <RuledCard key={g.title} {...g} />)}
          </div>
        </div>
      </section>

      {/* ── § 04 FAQ ─────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24" style={{ background: T.bg2, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, scrollMarginTop: 80 }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <SectionLabel number="§ 04">FAQ</SectionLabel>
            <h2 className="text-4xl font-extrabold leading-tight" style={{ color: T.text }}>Common questions.</h2>
            <Divider />
          </div>
          <div className="flex flex-col gap-3">
            {FAQS.map((f, i) => (
              <FaqItem key={f.q} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ── § 05 CONTACT ─────────────────────────────────────────────────── */}
      <section id="contact" className="py-24" style={{ background: T.bg1, scrollMarginTop: 80 }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <div className="flex justify-center">
              <SectionLabel number="§ 05">Contact</SectionLabel>
            </div>
            <h2 className="text-4xl font-extrabold leading-tight" style={{ color: T.text }}>Find us.</h2>
          </div>

          <div className="rounded-2xl p-8 sm:p-10" style={{ background: T.bgCard, border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
            <div className="grid sm:grid-cols-3 gap-8">
              <div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${T.accent}14`, border: `1px solid ${T.accent}28` }}>
                  <MapPin size={18} style={{ color: T.accent }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: T.faint }}>Address</p>
                <p className="text-sm leading-relaxed" style={{ color: T.text }}>
                  CADT, IDRI Building, Bridge 2,
                  Prek Leap, Chroy Changva
                  Phnom Penh, Cambodia
                </p>
              </div>

              <div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(201,168,108,0.14)", border: "1px solid rgba(201,168,108,0.28)" }}>
                  <Mail size={18} style={{ color: "#c9a86c" }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: T.faint }}>Email</p>
                <p className="text-sm leading-relaxed" style={{ color: T.faint }}>Makerspace@cadt.edu.kh</p>
              </div>

              <div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(8,145,178,0.14)", border: "1px solid rgba(8,145,178,0.28)" }}>
                  <Clock size={18} style={{ color: "#0891b2" }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: T.faint }}>Hours</p>
                <p className="text-sm leading-relaxed" style={{ color: T.faint }}>9:00 AM - 5:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: T.bg3 }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl p-12 sm:p-16 text-center relative overflow-hidden"
            style={{ background: T.bgCard, border: `1px solid ${T.borderBr}`, boxShadow: T.shadowLg }}>
            <div style={{
              position: "absolute", top: 0, left: "20%", right: "20%", height: 3,
              background: "linear-gradient(90deg, transparent, #6366f1, #a855f7, transparent)",
            }} />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] mb-6"
                style={{ background: "#6366f114", color: T.accent, border: "1px solid rgba(99,102,241,0.25)" }}>
                Free for CADT Students
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight" style={{ color: T.text }}>
                Ready to join the
                <br />
                <span style={{ background: GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  MakerClub?
                </span>
              </h2>
              <p className="text-base mb-10 max-w-md mx-auto" style={{ color: T.muted }}>
                Create your free account and unlock the Community, Learning, and Inventory modules — all in one place.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link to="/register"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-85"
                  style={{ background: GRADIENT }}>
                  Create Free Account <ArrowRight size={15} />
                </Link>
                <Link to="/hub"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-70"
                  style={{ color: T.muted, border: `1px solid ${T.border}`, background: "none" }}>
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AppFooter />
    </div>
  );
}
