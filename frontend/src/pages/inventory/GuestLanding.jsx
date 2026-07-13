import {
  Cpu, Wrench, Layers, Box, Zap, Monitor, Hammer,
  Settings, MapPin, DoorOpen, ShoppingCart,
  LogIn, UserPlus, ArrowRight, Drill, ChevronRight,
  Package, Users, TrendingUp, Clock, Printer, CheckCircle2,
  RotateCcw, ShoppingBag, Compass, BookOpen,
} from "lucide-react";
import { T as THEME } from "../../lib/inventory/theme";
import { LOGO_IMAGE, BROWSE_LANDING_IMAGE, PRINT_SERVICES, MEMBERSHIP_PLAN, CREDIT_RATE, CREDIT_TIERS } from "../../lib/inventory/data.js";

/* ── palette ─────────────────────────────────────────────────────────────── */
const TEAL    = "#0891b2";
const TEAL_DK = "#0e7490";
const DARK    = "#0f172a";
const CREAM   = "#f8fafc";
const BORDER  = "#e2e8f0";
const MUTED   = "#64748b";

/* ── data ────────────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { id: "et",  label: "Electronic Tools",     icon: Zap,      desc: "Soldering stations, multimeters, probes",    tag: "TOOL",   room: "Makerspace Room" },
  { id: "ee",  label: "Electronic Equipment", icon: Cpu,      desc: "Power supplies, oscilloscopes, generators",  tag: "EQUIP",  room: "Makerspace Room" },
  { id: "ec",  label: "Electronic Components",icon: Settings, desc: "Arduino, sensors, modules, ICs, resistors",  tag: "COMP",   room: "Makerspace Room" },
  { id: "cnc", label: "CNC Machines",         icon: Drill,    desc: "Laser cutters, 3-axis routers, plotters",    tag: "CNC",    room: "Makerspace Room" },
  { id: "mm",  label: "Mechanical Tools",     icon: Wrench,   desc: "Drill press, bench grinder, hand tools",     tag: "MECH",   room: "Mechanic Room"   },
  { id: "mf",  label: "Fasteners & Hardware", icon: Layers,   desc: "Bolts, nuts, screws, standoffs, washers",    tag: "FIX",    room: "Mechanic Room"   },
  { id: "dd",  label: "Digital Devices",      icon: Monitor,  desc: "Raspberry Pi, logic analyzers, peripherals", tag: "DEVICE", room: "Makerspace Room" },
  { id: "rm",  label: "Raw Materials",        icon: Box,      desc: "PLA filament, acrylic, plywood, foam",       tag: "MAT",    room: "Makerspace Room" },
];

const STEPS = [
  { n: "01", icon: UserPlus,     title: "Sign up",          desc: "Create an account and get your makerspace membership activated." },
  { n: "02", icon: MapPin,       title: "Search inventory", desc: "Filter by zone, category, type, room, and availability."         },
  { n: "03", icon: ShoppingCart, title: "Reserve or buy",   desc: "Book returnable equipment or purchase consumables with credits."  },
  { n: "04", icon: Hammer,       title: "Build something",  desc: "Pick up your items and start making. Return tools when done."     },
];

const HIGHLIGHTS = [
  { icon: Compass,  title: "Browse Resources",  color: TEAL,      bg: "#e0f9fe", text: "Search 100+ tools, components, and materials by category, zone, and room — see live availability before you walk in." },
  { icon: BookOpen, title: "Learning Resources", color: "#7c3aed", bg: "#f5f3ff", text: "Guides and safety notes for every machine, so first-timers can borrow and use equipment with confidence." },
  { icon: Users,    title: "Community",          color: "#16a34a", bg: "#dcfce7", text: "Join a community of student makers — share projects, get help from peers, and connect with makerspace staff." },
];

/* ── scene illustration ──────────────────────────────────────────────────── */
function StorageIllustration() {
  return (
    <svg viewBox="0 0 360 220" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: 420, margin: "0 auto", display: "block" }}>
      {/* Back wall */}
      <rect x="20" y="20" width="320" height="180" rx="4" fill="#0e2d3a" />

      {/* Shelving unit */}
      {[0, 1, 2].map(row => (
        <g key={row}>
          <rect x="40" y={50 + row * 50} width="280" height="6" rx="2" fill="#0891b2" opacity="0.6" />
          {[0, 1, 2, 3, 4].map(col => (
            <rect key={col}
              x={52 + col * 54} y={22 + row * 50} width={38} height={28} rx="3"
              fill={[
                "rgba(8,145,178,0.45)",
                "rgba(5,150,105,0.45)",
                "rgba(220,38,38,0.35)",
                "rgba(8,145,178,0.55)",
                "rgba(5,150,105,0.35)",
              ][col]}
              stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          ))}
        </g>
      ))}

      {/* Bottom shelf */}
      <rect x="40" y="200" width="280" height="6" rx="2" fill="#0891b2" opacity="0.6" />

      {/* Side rails */}
      <rect x="36" y="20" width="5" height="186" rx="2" fill="#0c4a5e" />
      <rect x="319" y="20" width="5" height="186" rx="2" fill="#0c4a5e" />

      {/* Floating label chips */}
      {[
        { x: 54,  y: 12, label: "A-1", color: TEAL },
        { x: 108, y: 12, label: "A-2", color: "#059669" },
        { x: 162, y: 12, label: "A-3", color: "#dc2626" },
        { x: 216, y: 12, label: "B-1", color: TEAL },
        { x: 270, y: 12, label: "B-2", color: "#059669" },
      ].map(chip => (
        <g key={chip.label}>
          <rect x={chip.x} y={chip.y - 8} width="34" height="14" rx="7" fill={chip.color} opacity="0.85" />
          <text x={chip.x + 17} y={chip.y + 1} textAnchor="middle" fontSize="7" fontWeight="700" fill="white">{chip.label}</text>
        </g>
      ))}

      {/* Glow dots */}
      {[[58, 170], [165, 120], [290, 70]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill={TEAL} opacity="0.6" />
      ))}
    </svg>
  );
}

/* ── helpers ─────────────────────────────────────────────────────────────── */
function Eyebrow({ label, light = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      <span style={{ width: 32, height: 2, background: light ? "rgba(255,255,255,.5)" : TEAL }} />
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: light ? "rgba(255,255,255,.7)" : MUTED }}>
        {label}
      </span>
    </div>
  );
}

/* ── page ────────────────────────────────────────────────────────────────── */
export default function LandingPage({ onEnter, onBrowse, items = [], users = [], borrows = [] }) {
  const go     = () => onEnter?.();
  const browse = () => (onBrowse ? onBrowse() : onEnter?.());

  const liveStats = [
    { value: String(items.length),                                                                    label: "Items",        icon: Package    },
    { value: String(users.filter(u => u.role === "user" && u.membership === "active").length),        label: "Members",      icon: Users      },
    { value: String(borrows.filter(b => b.status === "active").length),                               label: "Borrowed Now", icon: TrendingUp },
    { value: "8",                                                                                     label: "Categories",   icon: Clock      },
  ];

  return (
    <div style={{ background: CREAM, color: DARK, fontFamily: "'Poppins',Inter,system-ui,sans-serif", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
        @keyframes mv-ticker { to { transform: translateX(-50%) } }
        .mv-ticker-inner { animation: mv-ticker 32s linear infinite; display: flex; width: max-content; }
        .mv-ticker-inner:hover { animation-play-state: paused; }
        .mv-nav-link { font-size:13px;font-weight:500;color:#64748b;text-decoration:none;transition:color .15s;cursor:pointer; }
        .mv-nav-link:hover { color:${DARK}; }
        .mv-btn-teal { display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:10px;background:${TEAL};color:#fff;font-size:13px;font-weight:700;border:none;cursor:pointer;transition:background .15s,transform .1s; }
        .mv-btn-teal:hover { background:${TEAL_DK};transform:translateY(-1px); }
        .mv-btn-ghost { display:inline-flex;align-items:center;gap:8px;padding:11px 22px;border-radius:10px;background:transparent;color:${DARK};font-size:13px;font-weight:600;border:1.5px solid rgba(15,23,42,.18);cursor:pointer;transition:border-color .15s,background .15s; }
        .mv-btn-ghost:hover { border-color:${DARK};background:rgba(15,23,42,.04); }
        .mv-btn-ghost-white { display:inline-flex;align-items:center;gap:8px;padding:11px 22px;border-radius:10px;background:transparent;color:#fff;font-size:13px;font-weight:600;border:1.5px solid rgba(255,255,255,.3);cursor:pointer;transition:border-color .15s; }
        .mv-btn-ghost-white:hover { border-color:rgba(255,255,255,.7); }
        .mv-btn-white { display:inline-flex;align-items:center;gap:8px;padding:13px 28px;border-radius:10px;background:#fff;color:${TEAL};font-size:13px;font-weight:700;border:none;cursor:pointer;transition:transform .1s; }
        .mv-btn-white:hover { transform:translateY(-1px); }
        .mv-cat-cell { padding:28px 24px;cursor:pointer;position:relative;overflow:hidden;transition:background .15s;background:transparent; }
        .mv-cat-cell:hover { background:#ecfeff; }
        .mv-cat-browse { transition:transform .2s;display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em; }
        .mv-cat-cell:hover .mv-cat-browse { transform:translateX(4px); }
        .mv-footer-link { font-size:12px;color:rgba(255,255,255,.45);margin-bottom:9px;cursor:pointer;transition:color .15s;display:block; }
        .mv-footer-link:hover { color:#fff; }
        .mv-hero-display { font-family:'CADTMonoDisplay','Poppins','Inter',sans-serif; }
        .mv-step-card { transition:background .15s,border-color .15s,box-shadow .15s; }
        .mv-step-card:hover { background:#fff!important;border-color:${TEAL}44!important;box-shadow:0 4px 20px rgba(8,145,178,.10); }
        .mv-testi-card { transition:box-shadow .2s; }
        .mv-testi-card:hover { box-shadow:0 8px 32px rgba(8,145,178,.10); }
        /* Section headers — Inter, larger on tablet/desktop */
        .mv-sec-h { font-family:'Inter','Poppins',sans-serif; font-weight:800; letter-spacing:-0.02em; }
        /* Buttons scale down on small screens */
        @media (max-width: 767px) {
          .mv-btn-teal, .mv-btn-ghost, .mv-btn-ghost-white { padding:9px 16px; font-size:12px; gap:6px; }
          .mv-btn-white { padding:10px 20px; font-size:12px; gap:6px; }
          .mv-cat-cell { padding:20px 16px; }
        }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", overflow: "hidden", background: "linear-gradient(145deg,#0c4a6e 0%,#0e7490 55%,#0891b2 100%)" }}>
        {/* Grid overlay */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        <div className="grid-cols-1 gap-8 px-4 pt-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14 lg:px-12 lg:pt-[72px]" style={{ position: "relative", zIndex: 1, maxWidth: 1320, margin: "0 auto", display: "grid", alignItems: "center" }}>
          {/* Left — headline */}
          <div style={{ paddingBottom: 72 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 999, marginBottom: 24, background: "rgba(8,145,178,0.15)", border: "1px solid rgba(8,145,178,0.35)" }}>
              <Package size={11} style={{ color: "#67e8f9" }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: "#67e8f9" }}>CADT · Makerspace Inventory</span>
            </div>
            <h1 className="mv-hero-display" style={{ fontSize: "clamp(44px,5.5vw,74px)", lineHeight: 1.05, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 24, color: "#fff" }}>
              Your<br />
              <span style={{ color: "#67e8f9" }}>Makerspace</span><br />
              Inventory Hub.
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.65, color: "rgba(255,255,255,0.5)", maxWidth: 460, marginBottom: 36 }}>
              Browse tools, borrow equipment, and purchase materials — searchable by zone, shelf, category, and room. Built for the CADT community.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
              <button className="mv-btn-teal" onClick={browse}>Browse Inventory <ArrowRight size={14} /></button>
              <button onClick={go} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 10, background: "transparent", color: "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: 600, border: "1.5px solid rgba(255,255,255,0.2)", cursor: "pointer" }}>
                <LogIn size={14} /> Login to Borrow
              </button>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 12, background: "rgba(8,145,178,0.10)", border: "1px solid rgba(8,145,178,0.25)" }}>
              <DoorOpen size={15} style={{ color: "#67e8f9" }} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Makerspace is open today</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>9:00 AM – 9:00 PM · Room C03</p>
              </div>
            </div>
          </div>

          {/* Right — illustration */}
          <div style={{ paddingBottom: 40 }}>
            <StorageIllustration />
          </div>
        </div>

        {/* Stats strip */}
        <div className="px-4 py-4 sm:px-12 sm:py-5" style={{ borderTop: "1px solid rgba(8,145,178,0.2)" }}>
          <div className="grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" style={{ maxWidth: 1320, margin: "0 auto", display: "grid", textAlign: "center" }}>
            {liveStats.map(({ value, label, icon: Icon }) => (
              <div key={label}>
                <p style={{ fontSize: 28, fontWeight: 800, color: "#67e8f9", lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TICKER ───────────────────────────────────────────────────── */}
      <div style={{ background: DARK, color: "#fff", padding: "15px 0", overflow: "hidden", borderTop: "1px solid rgba(255,255,255,.06)", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div className="mv-ticker-inner">
          {[...CATEGORIES, ...CATEGORIES, ...CATEGORIES, ...CATEGORIES].map((c, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "0 28px", fontSize: 13, fontWeight: 600, letterSpacing: ".05em" }}>
              {c.label}<span style={{ color: TEAL }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ───────────────────────────────────────────────── */}
      <section className="px-4 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20" style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
          <div>
            <Eyebrow label="Inventory" />
            <h2 className="mv-sec-h" style={{ fontSize: "clamp(30px,5vw,60px)" }}>Browse by Category</h2>
          </div>
          <button className="mv-btn-ghost" onClick={browse}><ArrowRight size={14} /> Full Catalog</button>
        </div>

        {/* Room legend */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { room: "Makerspace Room", color: TEAL, bg: "#e0f9fe" },
            { room: "Mechanic Room",   color: "#7c3aed", bg: "#f5f3ff" },
          ].map(({ room, color, bg }) => (
            <div key={room} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 12px", borderRadius: 8, background: bg, border: `1px solid ${color}22` }}>
              <MapPin size={11} style={{ color }} />
              <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: ".04em" }}>{room}</span>
            </div>
          ))}
        </div>

        {/* Item type explainer — Returnable vs Consumable */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14, marginBottom: 32 }}>
          {[
            { Icon: RotateCcw,   label: "Returnable", color: TEAL,      bg: "#e0f9fe", desc: "Borrow tools and equipment, then return them by your due date. No credits charged unless it's late or damaged." },
            { Icon: ShoppingBag, label: "Consumable",  color: "#16a34a", bg: "#dcfce7", desc: "Materials you keep — filament, fasteners, solder wire. Purchased outright with makerspace credits." },
          ].map(({ Icon, label, color, bg, desc }) => (
            <div key={label} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "16px 18px", borderRadius: 14, border: `1px solid ${BORDER}`, background: "#fff" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={17} style={{ color }} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: DARK, marginBottom: 3 }}>{label}</p>
                <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.55 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ display: "grid", border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden", background: "#fff" }}>
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            const isLastRow = i >= 4;
            const isLastCol = (i + 1) % 4 === 0;
            const isMechanic = cat.room === "Mechanic Room";
            const roomColor = isMechanic ? "#7c3aed" : TEAL;
            const roomBg    = isMechanic ? "#f5f3ff"  : "#e0f9fe";
            return (
              <div key={cat.id} className="mv-cat-cell border-b lg:border-b-0" onClick={browse}
                style={{ borderRight: isLastCol ? "none" : `1px solid ${BORDER}`, borderBottomColor: BORDER }}>
                <span style={{ position: "absolute", top: 12, right: 16, fontSize: 48, fontWeight: 700, color: "rgba(15,23,42,.04)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: roomBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <Icon size={20} style={{ color: roomColor }} />
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{ display: "inline-block", fontSize: 9, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: roomColor, background: roomBg, borderRadius: 4, padding: "2px 6px" }}>
                    {cat.tag}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 9, fontWeight: 600, color: roomColor, opacity: .75 }}>
                    <MapPin size={8} />{cat.room}
                  </span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{cat.label}</p>
                <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, marginBottom: 14 }}>{cat.desc}</p>
                <span className="mv-cat-browse" style={{ color: roomColor }}>Browse <ChevronRight size={11} /></span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────────────── */}
      <section className="px-4 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20" style={{ background: "#f0fdff" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
            <div>
              <Eyebrow label="Services" />
              <h2 className="mv-sec-h" style={{ fontSize: "clamp(30px,5vw,60px)" }}>What We Offer</h2>
              <p style={{ marginTop: 8, fontSize: 14, color: MUTED, maxWidth: 480 }}>
                Submit a request and our staff will handle the rest — pay with your makerspace credits.
              </p>
            </div>
            <button className="mv-btn-ghost" onClick={go}><ArrowRight size={14} /> Request a Service</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 24 }}>
            {PRINT_SERVICES.map(svc => {
              const Icon = svc.Icon;
              const isDoc = svc.id === "printing";
              const accentColor = isDoc ? "#0891b2" : "#7c3aed";
              const accentBg    = isDoc ? "#e0f9fe" : "#f5f3ff";
              const feats = isDoc
                ? ["Black & white or color", "A4 / Letter format", "Submit file + page count"]
                : ["PLA, PETG, ABS filament", "Staff weigh finished print", "Credits charged post-print"];
              return (
                <div key={svc.id} style={{ background: "#fff", borderRadius: 20, border: `1px solid ${BORDER}`, overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}>
                  {/* top accent bar */}
                  <div style={{ height: 4, background: accentColor, borderRadius: "20px 20px 0 0" }} />
                  {/* flex column so the Request button lands on the same line in both cards */}
                  <div style={{ padding: 28, display: "flex", flexDirection: "column", flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                      <div style={{ width: 52, height: 52, borderRadius: 16, background: accentBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={24} style={{ color: accentColor }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: accentColor, background: accentBg, padding: "4px 12px", borderRadius: 100, letterSpacing: ".04em" }}>
                        {isDoc ? "Document" : "3D Print"}
                      </span>
                    </div>

                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: DARK }}>{svc.label}</h3>
                    <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, marginBottom: 20 }}>{svc.desc}</p>

                    {/* rate */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 20 }}>
                      <span style={{ fontSize: 44, fontWeight: 800, color: DARK, lineHeight: 1 }}>{svc.rate}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>{svc.unitLabel}</span>
                    </div>

                    {/* features */}
                    <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 8 }}>
                      {feats.map(f => (
                        <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: MUTED }}>
                          <CheckCircle2 size={13} style={{ color: accentColor, flexShrink: 0 }} /> {f}
                        </li>
                      ))}
                    </ul>

                    <button onClick={go} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0", borderRadius: 12, border: "none", background: accentColor, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "opacity .15s", marginTop: "auto" }}
                      onMouseEnter={e => e.currentTarget.style.opacity = ".88"}
                      onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                      Request {isDoc ? "Printing" : "3D Print"} <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── MEMBERSHIP & CREDITS ─────────────────────────────────────── */}
      <section className="px-4 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20" style={{ background: "#fff", borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ marginBottom: 40 }}>
            <Eyebrow label="Membership" />
            <h2 className="mv-sec-h" style={{ fontSize: "clamp(30px,5vw,60px)" }}>Membership &amp; Credits</h2>
            <p style={{ marginTop: 8, fontSize: 14, color: MUTED, maxWidth: 520 }}>
              One yearly membership unlocks borrowing and purchasing — credits are the makerspace currency.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
            {/* Membership plan */}
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ height: 4, background: TEAL }} />
              <div className="p-6 sm:p-8" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: TEAL, marginBottom: 12 }}>Student Membership</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 48, fontWeight: 800, color: DARK, lineHeight: 1 }}>${MEMBERSHIP_PLAN.price}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: MUTED }}>/ year</span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#16a34a", marginBottom: 20 }}>+{MEMBERSHIP_PLAN.bonusCredits} bonus credits included</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  {["Borrow any returnable tool", "Purchase consumable supplies with credits", "Priority equipment access", "Valid for 12 months from activation"].map(f => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: MUTED }}>
                      <CheckCircle2 size={14} style={{ color: TEAL, flexShrink: 0 }} /> {f}
                    </li>
                  ))}
                </ul>
                <button className="mv-btn-teal" onClick={go} style={{ marginTop: 24, justifyContent: "center" }}>
                  <UserPlus size={14} /> Join at the Front Desk
                </button>
              </div>
            </div>

            {/* Credit top-up */}
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ height: 4, background: "#d97706" }} />
              <div className="p-6 sm:p-8" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "#d97706", marginBottom: 12 }}>Credit Top-Up</p>
                <p style={{ fontSize: 14, color: MUTED, marginBottom: 18 }}>
                  Rate: <strong style={{ color: DARK }}>{CREDIT_RATE} credits per $1</strong> — paid in cash or QR at the front desk.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {CREDIT_TIERS.map(([cr, usd]) => (
                    <div key={cr} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 10, background: "#f8fafc", border: `1px solid ${BORDER}` }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: DARK }}>{cr} credits</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>${usd}.00</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: MUTED, marginTop: "auto", paddingTop: 18 }}>
                  Membership and top-ups are handled in person — this section is for reference only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section className="px-4 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20" style={{ background: "#f8fafc", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div className="grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16" style={{ maxWidth: 1320, margin: "0 auto", display: "grid", alignItems: "stretch" }}>
          <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: 28, paddingBottom: 28 }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 44, height: 3, background: TEAL, borderRadius: 2 }} />
            <Eyebrow label="Getting Started" />
            <h2 className="mv-sec-h" style={{ fontSize: "clamp(34px,5.5vw,70px)", color: DARK, lineHeight: 1.08, marginBottom: 22 }}>
              User guide<br />for first-timers.
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: MUTED, maxWidth: 420 }}>
              New to the makerspace? Follow these steps to borrow equipment and start building your project.
            </p>
            <div style={{ position: "absolute", bottom: 0, left: 0, width: 44, height: 3, background: TEAL, borderRadius: 2 }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, justifyContent: "center" }}>
            {STEPS.map(({ n, icon: Icon, title, desc }) => (
              <div key={n} className="mv-step-card"
                style={{ display: "flex", gap: 16, padding: "18px 20px", borderRadius: 12, background: "#fff", border: `1px solid ${BORDER}` }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#e0f9fe", border: `1.5px solid ${TEAL}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={16} style={{ color: TEAL }} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: ".1em", color: TEAL }}>{n}</span>
                    <p style={{ fontSize: 14, fontWeight: 700, color: DARK }}>{title}</p>
                  </div>
                  <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.55 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMUNITY & RESOURCES ───────────────────────────────────────── */}
      <section className="px-4 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20" style={{ background: "#fff" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <Eyebrow label="Why MakerVault" />
            <h2 className="mv-sec-h" style={{ fontSize: "clamp(30px,4.5vw,56px)" }}>
              Built for the way you make.
            </h2>
          </div>
          <div className="grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5" style={{ display: "grid" }}>
            {HIGHLIGHTS.map(({ icon: Icon, title, color, bg, text }) => (
              <div key={title} className="mv-testi-card"
                style={{ background: "#fff", borderRadius: 14, padding: 28, border: `1px solid ${BORDER}` }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: DARK, marginBottom: 10 }}>{title}</p>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#374151" }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS + CTA ──────────────────────────────────────────────── */}
      <section className="px-4 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20" style={{ background: CREAM }}>
        <div className="grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16" style={{ maxWidth: 1320, margin: "0 auto", display: "grid", alignItems: "center" }}>
          {/* Stats in one row, vertically centered against the CTA card */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
            <Eyebrow label="By the numbers" />
            <div className="grid grid-cols-3 gap-3 sm:gap-6">
              {[
                { n: `${items.length}+`,       label: "Items Available",   sub: "Across all 8 categories"            },
                { n: `${users.filter(u => u.role === "user" && u.membership === "active").length}+`, label: "Active Members", sub: "Students, staff & researchers" },
                { n: `${borrows.length}+`,     label: "Borrows Recorded",  sub: "Successful equipment loans tracked" },
              ].map(({ n, label, sub }) => (
                <div key={label} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px 16px", textAlign: "center" }}>
                  <p style={{ fontSize: "clamp(28px,3.5vw,48px)", fontWeight: 800, lineHeight: 1, color: DARK }}>{n}</p>
                  <p className="text-[12px] sm:text-[15px]" style={{ fontWeight: 700, marginTop: 8 }}>{label}</p>
                  <p className="hidden sm:block" style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{sub}</p>
                  <div style={{ width: 32, height: 2, background: TEAL, margin: "14px auto 0" }} />
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-11" style={{ background: `linear-gradient(145deg,${TEAL} 0%,${TEAL_DK} 100%)`, borderRadius: 20, position: "relative", overflow: "hidden" }}>
            <div aria-hidden style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px)",
              backgroundSize: "36px 36px",
            }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <Eyebrow label="CADT, Phnom Penh" light />
              <h3 className="mv-sec-h" style={{ fontSize: "clamp(26px,3.5vw,48px)", color: "#fff", lineHeight: 1.15, marginBottom: 20 }}>
                The makerspace<br />of the future, today.
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,.7)", marginBottom: 32 }}>
                Real-time availability, seamless borrowing, and credit-based purchasing — all in one platform built for the CADT community.
              </p>
              {/* Buttons stay on one line — media query shrinks them on mobile */}
              <div style={{ display: "flex", gap: 10, flexWrap: "nowrap" }}>
                <button className="mv-btn-white" onClick={go}><UserPlus size={14} /> Create Account</button>
                <button className="mv-btn-ghost-white" onClick={browse}><ArrowRight size={14} /> Browse First</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="px-4 pb-9 pt-10 sm:px-8 sm:pt-12 lg:px-12" style={{ background: "#020d12" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div className="grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-10" style={{ display: "grid", marginBottom: 40 }}>
            <div className="col-span-2 sm:col-span-1">
              <img src={LOGO_IMAGE} alt="MakerVault" style={{ height: 26, marginBottom: 16, filter: "brightness(0) invert(1)", opacity: .8 }} />
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.38)", lineHeight: 1.65, maxWidth: 280 }}>
                CADT Makerspace inventory system — borrow equipment, purchase materials, and track your projects.
              </p>
            </div>
            {[
              { heading: "Platform",  links: ["Catalog", "Zones", "Membership", "Notifications"]     },
              { heading: "Resources", links: ["How It Works", "Equipment Guide", "Credit System", "FAQ"] },
              { heading: "CADT",      links: ["About", "Makerspace", "Contact Us", "Open Hours"]     },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.28)", marginBottom: 16 }}>
                  {heading}
                </p>
                {links.map(l => <a key={l} className="mv-footer-link" onClick={go}>{l}</a>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,.07)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.2)" }}>© 2025 CADT Makerspace. All rights reserved.</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.2)" }}>Built at CADT · Phnom Penh, Cambodia</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
