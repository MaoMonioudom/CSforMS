import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Package, Search, Filter, ArrowRight, CheckCircle, Clock, AlertCircle, ChevronRight, Box, Cpu, Wrench, Zap, Database } from "lucide-react";
import { TopNav } from "../../components/TopNav";
import { AppFooter } from "../../components/AppFooter";

// ── Palette ────────────────────────────────────────────────────────────────────
const TEAL    = "#0891b2";
const TEAL_DK = "#0e7490";

// ── Mock data ──────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all",        label: "All",          icon: Database },
  { id: "electronics",label: "Electronics",  icon: Cpu      },
  { id: "tools",      label: "Tools",        icon: Wrench   },
  { id: "materials",  label: "Materials",    icon: Box      },
  { id: "power",      label: "Power",        icon: Zap      },
];

const ITEMS = [
  { id: 1,  name: "Arduino Uno R3",          category: "electronics", qty: 12, total: 15, unit: "pcs",  status: "available",  location: "Shelf A-1", sku: "EL-001" },
  { id: 2,  name: "Raspberry Pi 4 (4GB)",    category: "electronics", qty: 3,  total: 5,  unit: "pcs",  status: "low",        location: "Shelf A-2", sku: "EL-002" },
  { id: 3,  name: "ESP32 Dev Board",         category: "electronics", qty: 0,  total: 8,  unit: "pcs",  status: "out",        location: "Shelf A-3", sku: "EL-003" },
  { id: 4,  name: "Soldering Iron 60W",      category: "tools",       qty: 6,  total: 6,  unit: "pcs",  status: "available",  location: "Cabinet B", sku: "TL-001" },
  { id: 5,  name: "Multimeter Digital",      category: "tools",       qty: 4,  total: 8,  unit: "pcs",  status: "available",  location: "Cabinet B", sku: "TL-002" },
  { id: 6,  name: "3D Printer (FDM)",        category: "tools",       qty: 2,  total: 3,  unit: "pcs",  status: "low",        location: "Room C",    sku: "TL-003" },
  { id: 7,  name: "PLA Filament 1kg",        category: "materials",   qty: 8,  total: 20, unit: "rolls",status: "available",  location: "Shelf D-1", sku: "MT-001" },
  { id: 8,  name: "Breadboard 830pt",        category: "materials",   qty: 22, total: 30, unit: "pcs",  status: "available",  location: "Shelf D-2", sku: "MT-002" },
  { id: 9,  name: "Jumper Wires (40pcs)",    category: "materials",   qty: 15, total: 25, unit: "sets", status: "available",  location: "Shelf D-3", sku: "MT-003" },
  { id: 10, name: "Power Supply 5V/3A",      category: "power",       qty: 1,  total: 6,  unit: "pcs",  status: "low",        location: "Cabinet E", sku: "PW-001" },
  { id: 11, name: "Li-Ion Battery 18650",    category: "power",       qty: 30, total: 50, unit: "pcs",  status: "available",  location: "Cabinet E", sku: "PW-002" },
  { id: 12, name: "USB-C Cable 1m",          category: "power",       qty: 0,  total: 12, unit: "pcs",  status: "out",        location: "Cabinet E", sku: "PW-003" },
];

const STATUS_CONFIG = {
  available: { label: "Available", color: "#059669", bg: "#d1fae5", icon: CheckCircle },
  low:       { label: "Low Stock", color: "#d97706", bg: "#fef3c7", icon: AlertCircle },
  out:       { label: "Out",       color: "#dc2626", bg: "#fee2e2", icon: AlertCircle },
};

const RECENT_REQUESTS = [
  { item: "Arduino Uno R3",       user: "Dara K.",    date: "30 Jun", status: "approved" },
  { item: "Soldering Iron 60W",   user: "Mao M.",     date: "29 Jun", status: "pending"  },
  { item: "PLA Filament 1kg",     user: "Sokha P.",   date: "28 Jun", status: "approved" },
  { item: "ESP32 Dev Board",      user: "Ratha C.",   date: "27 Jun", status: "returned" },
];

// ── Scene illustration ─────────────────────────────────────────────────────────
function StorageIllustration() {
  return (
    <svg viewBox="0 0 360 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-sm mx-auto">
      {/* Back wall */}
      <rect x="20" y="20" width="320" height="180" rx="4" fill="#0e2d3a" />

      {/* Shelving unit */}
      {[0, 1, 2].map(row => (
        <g key={row}>
          {/* Shelf plank */}
          <rect x="40" y={50 + row * 50} width="280" height="6" rx="2" fill="#0891b2" opacity="0.6" />
          {/* Items on shelf */}
          {[0, 1, 2, 3, 4].map(col => (
            <rect
              key={col}
              x={52 + col * 54}
              y={22 + row * 50}
              width={38}
              height={28}
              rx="3"
              fill={[
                "rgba(8,145,178,0.45)",
                "rgba(5,150,105,0.45)",
                "rgba(220,38,38,0.35)",
                "rgba(8,145,178,0.55)",
                "rgba(5,150,105,0.35)",
              ][col]}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          ))}
        </g>
      ))}

      {/* Bottom shelf */}
      <rect x="40" y="200" width="280" height="6" rx="2" fill="#0891b2" opacity="0.6" />

      {/* Side rails */}
      <rect x="36"  y="20" width="5" height="186" rx="2" fill="#0c4a5e" />
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

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: cfg.bg, color: cfg.color }}>
      <Icon size={9} />
      {cfg.label}
    </span>
  );
}

// ── Stock bar ─────────────────────────────────────────────────────────────────
function StockBar({ qty, total, status }) {
  const pct = total > 0 ? (qty / total) * 100 : 0;
  const barColor = status === "available" ? TEAL : status === "low" ? "#d97706" : "#dc2626";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
      </div>
      <span className="text-[10px] font-semibold text-neutral-500 shrink-0">{qty}/{total}</span>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ value, label, sub, accent = TEAL }) {
  return (
    <div className="rounded-2xl p-5 border border-neutral-100 bg-white">
      <p className="text-3xl font-extrabold mb-0.5" style={{ color: accent }}>{value}</p>
      <p className="text-xs font-bold text-neutral-700">{label}</p>
      {sub && <p className="text-[10px] text-neutral-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function InventoryLandingPage() {
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState("all");
  const [query,    setQuery]    = useState(searchParams.get("q") || "");

  useEffect(() => { setQuery(searchParams.get("q") || ""); }, [searchParams]);

  const filtered = ITEMS.filter(item =>
    (category === "all" || item.category === category) &&
    (!query || item.name.toLowerCase().includes(query.toLowerCase()))
  );

  const available = ITEMS.filter(i => i.status === "available").length;
  const low       = ITEMS.filter(i => i.status === "low").length;
  const out       = ITEMS.filter(i => i.status === "out").length;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f9ff" }}>
      <TopNav />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden pt-10 pb-0"
        style={{ background: "linear-gradient(160deg, #020d12 0%, #042330 55%, #063d52 100%)" }}
      >
        {/* Grid overlay */}
        <div aria-hidden className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(8,145,178,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(8,145,178,0.06) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center pb-16">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6 text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ background: "rgba(8,145,178,0.15)", color: "#67e8f9", border: "1px solid rgba(8,145,178,0.35)" }}>
                <Package size={10} /> Room C03 — Inventory Module
              </div>
              <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight text-white mb-4">
                Resource<br />
                <span style={{ color: "#67e8f9" }}>Manager.</span>
              </h1>
              <p className="text-base leading-relaxed max-w-md mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>
                Real-time stock levels, request tracking, and availability at a glance.
                See what's in the makerspace and reserve what you need.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white"
                  style={{ background: TEAL }}>
                  Browse Resources <ArrowRight size={14} />
                </button>
                <Link to="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold"
                  style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>
                  Back to Hub
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <StorageIllustration />
            </div>
          </div>

          {/* Stats strip */}
          <div className="border-t py-6 grid grid-cols-3 gap-4 text-center" style={{ borderColor: "rgba(8,145,178,0.2)" }}>
            {[
              { value: available, label: "Available",  color: "#34d399" },
              { value: low,       label: "Low stock",  color: "#fbbf24" },
              { value: out,       label: "Out of stock", color: "#f87171" },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-[1fr_300px] gap-8">

          {/* Left — inventory table */}
          <div>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
              <h2 className="text-lg font-extrabold text-neutral-900">
                Stock Overview
                <span className="ml-2 text-sm font-medium text-neutral-400">({filtered.length} items)</span>
              </h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="search"
                    placeholder="Search items…"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="pl-8 pr-3 py-2 rounded-full border border-neutral-200 bg-white text-xs outline-none focus:border-cyan-400 w-40"
                  />
                </div>
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
                    style={category === cat.id
                      ? { background: TEAL, color: "#fff", borderColor: TEAL }
                      : { background: "#fff", color: "#555", borderColor: "#e5e7eb" }
                    }
                  >
                    <Icon size={11} />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Table */}
            <div className="rounded-2xl overflow-hidden border border-neutral-200 bg-white">
              <div className="grid text-[10px] font-black uppercase tracking-wider text-neutral-400 px-4 py-2.5"
                style={{ gridTemplateColumns: "1fr 90px 80px 110px 90px", borderBottom: "1px solid #f0f0f0", background: "#fafafa" }}>
                <span>Item</span>
                <span>SKU</span>
                <span>Location</span>
                <span>Stock</span>
                <span>Status</span>
              </div>

              {filtered.map((item, i) => (
                <div
                  key={item.id}
                  className="grid items-center px-4 py-3 text-sm hover:bg-cyan-50/40 transition-colors cursor-pointer group"
                  style={{
                    gridTemplateColumns: "1fr 90px 80px 110px 90px",
                    borderBottom: i < filtered.length - 1 ? "1px solid #f5f5f5" : "none",
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${TEAL}14`, border: `1px solid ${TEAL}22` }}>
                      <Package size={12} style={{ color: TEAL }} />
                    </div>
                    <span className="font-semibold text-neutral-800 text-xs truncate group-hover:text-cyan-700 transition-colors">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">{item.sku}</span>
                  <span className="text-[10px] text-neutral-500">{item.location}</span>
                  <div className="pr-3">
                    <StockBar qty={item.qty} total={item.total} status={item.status} />
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="text-center py-10 text-neutral-400">
                  <Package size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No items match your search.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-5">

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard value={ITEMS.length} label="Total items"   sub="across all categories" />
              <StatCard value={`${Math.round((available / ITEMS.length) * 100)}%`} label="Availability" sub="currently in stock" accent="#059669" />
            </div>

            {/* Request form */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
              <h3 className="text-sm font-extrabold text-neutral-900 mb-3">Request a Resource</h3>
              <div className="flex flex-col gap-2.5">
                <select className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-700 outline-none focus:border-cyan-400 bg-white">
                  <option value="">Select an item…</option>
                  {ITEMS.filter(i => i.status !== "out").map(i => (
                    <option key={i.id}>{i.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Quantity"
                  min="1"
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-cyan-400"
                />
                <textarea
                  placeholder="Purpose / project name…"
                  rows={2}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-cyan-400 resize-none"
                />
                <button
                  className="w-full py-2 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-85"
                  style={{ background: TEAL }}>
                  Submit Request
                </button>
                <p className="text-[10px] text-neutral-400 text-center">Demo only — not yet persisted.</p>
              </div>
            </div>

            {/* Recent activity */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
              <h3 className="text-sm font-extrabold text-neutral-900 mb-3">Recent Requests</h3>
              <div className="flex flex-col gap-3">
                {RECENT_REQUESTS.map((r, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-bold text-neutral-500">{r.user.split(" ")[0][0]}{r.user.split(" ")[1][0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-neutral-800 truncate">{r.item}</p>
                      <p className="text-[10px] text-neutral-400">{r.user} · {r.date}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      r.status === "approved" ? "bg-green-50 text-green-600" :
                      r.status === "pending"  ? "bg-amber-50 text-amber-600" :
                                                "bg-neutral-100 text-neutral-500"
                    }`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
