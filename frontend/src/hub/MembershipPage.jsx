import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Coins, GraduationCap, Package, Armchair, CheckCircle2, ArrowRight,
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

const MEMBERSHIP_PRICE = "$20/year";

const PERKS = [
  { icon: GraduationCap, title: "Earn by learning",     desc: "Get credits for joining workshops and finishing courses." },
  { icon: Package,       title: "Spend in Inventory",   desc: "Use credits to borrow or take home makerspace items." },
  { icon: Armchair,      title: "Request a workspace",  desc: "Reserve a personal desk or bench at the makerspace." },
];

export default function MembershipPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${D.bg} 0%, ${D.bg2} 100%)` }}>
      <div aria-hidden className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: `linear-gradient(rgba(16,185,129,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,0.05) 1px,transparent 1px)`, backgroundSize: "48px 48px" }} />

      <TopNav />

      <main className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 py-12">

        {/* Hero */}
        <div className="rounded-2xl p-8 mb-6 text-center relative overflow-hidden"
          style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: "0 2px 20px rgba(15,50,80,0.08)" }}>
          <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 2, background: "linear-gradient(90deg,transparent,#10b981,#6366f1,transparent)" }} />
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.28)" }}>
            <Coins size={24} style={{ color: "#10b981" }} />
          </div>
          <h1 className="text-2xl font-extrabold" style={{ color: D.text }}>Become a CADT Makerspace Member</h1>
          <p className="text-sm mt-2 max-w-md mx-auto" style={{ color: D.muted }}>
            {MEMBERSHIP_PRICE} unlocks a credit balance and the ability to request a personal workspace — earn credits by
            showing up and learning, or top them up in person at the front desk.
          </p>
        </div>

        {user.isMember ? (
          <div className="rounded-2xl p-6 mb-6 flex items-center gap-4"
            style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.28)" }}>
            <CheckCircle2 size={22} style={{ color: "#10b981" }} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold" style={{ color: D.text }}>You're already a member</p>
              <p className="text-xs" style={{ color: D.muted }}>Current balance: {user.credits ?? 0} credits</p>
            </div>
            <Link to="/credits"
              className="shrink-0 inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-opacity hover:opacity-90"
              style={{ background: "#10b981", color: "white" }}>
              View Credits <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl p-6 mb-6 text-center"
            style={{ background: D.card, border: `1px solid ${D.border}` }}>
            <p className="text-sm font-bold" style={{ color: D.text }}>Not a member yet</p>
            <p className="text-xs mt-1.5 max-w-sm mx-auto" style={{ color: D.muted }}>
              Visit the front desk to pay {MEMBERSHIP_PRICE} and staff will activate your membership right away.
            </p>
          </div>
        )}

        {/* Perks */}
        <div className="grid sm:grid-cols-3 gap-4">
          {PERKS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl p-5"
              style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: "0 2px 20px rgba(15,50,80,0.06)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.26)" }}>
                <Icon size={18} style={{ color: "#10b981" }} />
              </div>
              <p className="font-bold text-sm" style={{ color: D.text }}>{title}</p>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: D.muted }}>{desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
