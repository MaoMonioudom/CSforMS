import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Coins, GraduationCap, Users, MessageSquare, Package,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { TopNav } from "../components/TopNav";

const D = {
  bg:     "#eef5fc",
  bg2:    "#dceafa",
  card:   "#ffffff",
  border: "rgba(91,170,216,0.22)",
  muted:  "#5b7286",
  faint:  "#8aa0b2",
  text:   "#16324a",
};

const EARN_WAYS = [
  { icon: GraduationCap, label: "Complete a course",              amount: 50, note: "per course" },
  { icon: Users,         label: "Attend a workshop",               amount: 20, note: "per workshop" },
  { icon: Package,       label: "Check in at the Makerspace",      amount: 5,  note: "per visit" },
  { icon: MessageSquare, label: "Refer a friend who joins",        amount: 30, note: "per referral" },
];

const BUY_PACKAGES = [
  { credits: 100, price: "$5"  },
  { credits: 300, price: "$12", badge: "Save 20%" },
  { credits: 750, price: "$25", badge: "Best value" },
];

const REDEEM_ITEMS = [
  { label: "Borrow Arduino Uno Kit",        cost: 10, unit: "/day" },
  { label: "Borrow a 3D printer",           cost: 40, unit: "/day" },
  { label: "Purchase a filament roll",      cost: 60, unit: "" },
  { label: "Reserve a Laser Cutter session", cost: 25, unit: "/session" },
];

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4" style={{ color: D.muted }}>{children}</p>
  );
}

export default function CreditsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (!user.isMember) navigate("/membership");
  }, [user, navigate]);

  if (!user || !user.isMember) return null;

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${D.bg} 0%, ${D.bg2} 100%)` }}>
      <div aria-hidden className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: `linear-gradient(rgba(16,185,129,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,0.05) 1px,transparent 1px)`, backgroundSize: "48px 48px" }} />

      <TopNav />

      <main className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 py-12">

        {/* Balance hero */}
        <div className="rounded-2xl p-8 mb-8 text-center relative overflow-hidden"
          style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: "0 2px 20px rgba(15,50,80,0.08)" }}>
          <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 2, background: "linear-gradient(90deg,transparent,#10b981,#6366f1,transparent)" }} />
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.28)" }}>
            <Coins size={24} style={{ color: "#10b981" }} />
          </div>
          <p className="text-4xl font-extrabold" style={{ color: D.text }}>{user.credits ?? 0}</p>
          <p className="text-sm mt-1" style={{ color: D.muted }}>credits available</p>
        </div>

        {/* How to earn */}
        <div className="mb-8">
          <SectionLabel>How to earn credits</SectionLabel>
          <div className="rounded-2xl overflow-hidden" style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: "0 2px 20px rgba(15,50,80,0.06)" }}>
            {EARN_WAYS.map((w, i) => (
              <div key={w.label} className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: i < EARN_WAYS.length - 1 ? "1px solid rgba(15,50,80,0.08)" : "none" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(16,185,129,0.10)" }}>
                  <w.icon size={16} style={{ color: "#10b981" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: D.text }}>{w.label}</p>
                  <p className="text-[11px]" style={{ color: D.faint }}>{w.note}</p>
                </div>
                <span className="text-sm font-extrabold shrink-0" style={{ color: "#10b981" }}>+{w.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How to buy */}
        <div className="mb-8">
          <SectionLabel>How to top up credits</SectionLabel>
          <div className="grid sm:grid-cols-3 gap-4">
            {BUY_PACKAGES.map(p => (
              <div key={p.credits} className="rounded-2xl p-5 text-center relative"
                style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: "0 2px 20px rgba(15,50,80,0.06)" }}>
                {p.badge && (
                  <span className="absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(16,185,129,0.14)", color: "#10b981" }}>{p.badge}</span>
                )}
                <p className="text-2xl font-extrabold" style={{ color: D.text }}>{p.credits}</p>
                <p className="text-[11px] mb-3" style={{ color: D.muted }}>credits</p>
                <div className="w-full py-2 rounded-xl text-sm font-bold"
                  style={{ background: "rgba(16,185,129,0.10)", color: "#10b981" }}>
                  {p.price}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] mt-3" style={{ color: D.faint }}>
            Credits are topped up in person at the front desk — ask staff to add a package to your balance.
          </p>
        </div>

        {/* How to redeem */}
        <div className="mb-8">
          <SectionLabel>How to redeem in Inventory</SectionLabel>
          <div className="rounded-2xl overflow-hidden" style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: "0 2px 20px rgba(15,50,80,0.06)" }}>
            {REDEEM_ITEMS.map((r, i) => (
              <div key={r.label} className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: i < REDEEM_ITEMS.length - 1 ? "1px solid rgba(15,50,80,0.08)" : "none" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(8,145,178,0.10)" }}>
                  <Package size={16} style={{ color: "#0891b2" }} />
                </div>
                <p className="flex-1 min-w-0 text-sm font-semibold" style={{ color: D.text }}>{r.label}</p>
                <span className="text-sm font-extrabold shrink-0" style={{ color: "#0891b2" }}>{r.cost} credits{r.unit}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
