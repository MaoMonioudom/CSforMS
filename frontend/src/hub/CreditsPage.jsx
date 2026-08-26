import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Coins, Sparkles, BadgeCheck, Wallet, Mail, Send, Clock, ArrowLeft,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { useInventory } from "../lib/inventory/InventoryContext";
import { MEMBERSHIP_PLAN, CREDIT_TIERS, CREDIT_RATE, TEAM_CONTACT } from "../lib/inventory/data";
import { TopNav } from "../components/TopNav";
import { BackBar } from "../components/BackBar";
import { HUB as D } from "./hubTheme";

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4" style={{ color: D.muted }}>{children}</p>
  );
}

export default function CreditsPage() {
  const { user, loading: authLoading } = useAuth();
  const { submitTopUpRequest } = useInventory();
  const navigate = useNavigate();

  // Wait for AuthContext to finish confirming a stored token before
  // deciding the user is logged out — otherwise a refresh bounces someone
  // who's genuinely still logged in through /login and out to /inventory.
  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }
    if (!user.isMember) navigate("/membership");
  }, [user, authLoading, navigate]);

  // Top-up request flow — moved here from Inventory's old credits modal so
  // there's one real "Manage Credits" destination instead of two.
  const [customAmount, setCustomAmount] = useState("");
  const [pendingAmount, setPendingAmount] = useState(null);
  const [sent, setSent] = useState(false);
  const [requestError, setRequestError] = useState("");
  const customCredits = Math.round(Number(customAmount || 0) * CREDIT_RATE);
  const pendingCredits = Math.round((pendingAmount || 0) * CREDIT_RATE);

  const confirmRequest = async () => {
    setRequestError("");
    try {
      await submitTopUpRequest({ amountUSD: pendingAmount });
      setSent(true);
    } catch (err) {
      setRequestError(err.message || "Could not send the top-up request — please try again.");
    }
  };

  if (!user || !user.isMember) return null;

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${D.bg1} 0%, ${D.bg2} 100%)` }}>
      <div aria-hidden className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: `linear-gradient(color-mix(in oklch, var(--color-inv-accent) 5%, transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in oklch, var(--color-inv-accent) 5%, transparent) 1px,transparent 1px)`, backgroundSize: "48px 48px" }} />

      <TopNav />

      <main className="relative z-10 mx-auto max-w-[1280px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
        <BackBar />

        {/* Balance hero */}
        <div className="rounded-2xl p-8 mb-8 text-center relative overflow-hidden"
          style={{ background: D.bgCard, border: `1px solid ${D.border}`, boxShadow: "0 2px 20px rgba(15,50,80,0.08)" }}>
          <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 2, background: "linear-gradient(90deg,transparent,#10b981,transparent)" }} />
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.28)" }}>
            <Coins size={24} style={{ color: "#10b981" }} />
          </div>
          <p className="text-4xl font-extrabold" style={{ color: D.text }}>{user.credits ?? 0}</p>
          <p className="text-sm mt-1" style={{ color: D.muted }}>credits available</p>
        </div>

        {/* How to earn — kept deliberately vague: the only credit sources
            actually wired up today are membership signup and top-up
            requests below. Event/course bonuses aren't built yet, so this
            is a heads-up rather than a list of exact numbers. */}
        <div className="mb-8">
          <div className="flex items-start gap-3 rounded-2xl p-4" style={{ background: D.bgCard, border: `1px solid ${D.border}`, boxShadow: "0 2px 20px rgba(15,50,80,0.06)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(16,185,129,0.10)" }}>
              <Sparkles size={16} style={{ color: "#10b981" }} />
            </div>
            <p className="m-0 text-sm leading-relaxed" style={{ color: D.muted }}>
              Joining events, completing courses, and other Makerspace activities can earn you bonus credits — keep an eye on your Notifications for updates.
            </p>
          </div>
        </div>

        {/* How to top up — request an amount, staff arrange payment and add it */}
        <div className="mb-8">
          <SectionLabel>Top up credits</SectionLabel>
          <div className="rounded-2xl p-5" style={{ background: D.bgCard, border: `1px solid ${D.border}`, boxShadow: D.shadow }}>

            {sent ? (
              <div className="flex flex-col items-center gap-2 rounded-xl py-8 text-center" style={{ background: "rgba(16,185,129,0.08)" }}>
                <Clock size={28} style={{ color: "#10b981" }} />
                <p className="m-0 text-sm font-bold" style={{ color: D.text }}>Request sent!</p>
                <p className="m-0 max-w-[280px] text-xs" style={{ color: D.muted }}>The makerspace team has been notified. You'll see it in your Notifications once it's approved.</p>
                <button onClick={() => { setSent(false); setPendingAmount(null); setCustomAmount(""); }}
                  className="mt-2 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: D.text }}>
                  Done
                </button>
              </div>
            ) : pendingAmount !== null ? (
              // ── Confirm step — make sure the student really wants to contact the team ──
              <>
                <button onClick={() => setPendingAmount(null)} className="mb-3 flex items-center gap-1.5 border-none bg-transparent text-xs font-semibold" style={{ color: D.faint }}>
                  <ArrowLeft size={13} /> Back
                </button>
                <div className="mb-4 rounded-xl p-4 text-center" style={{ background: "rgba(16,185,129,0.08)" }}>
                  <p className="m-0 text-xs font-semibold uppercase tracking-wide" style={{ color: "#10b981" }}>You're requesting</p>
                  <p className="m-0 mt-1 text-3xl font-bold" style={{ color: D.text }}>${pendingAmount}</p>
                  <p className="m-0 mt-1 text-sm" style={{ color: D.muted }}>= {pendingCredits} credits at {CREDIT_RATE}cr/$1</p>
                </div>
                {requestError && (
                  <p className="m-0 mb-3 text-xs font-semibold" style={{ color: "#dc2626" }}>{requestError}</p>
                )}
                <p className="m-0 mb-4 text-sm leading-relaxed" style={{ color: D.muted }}>
                  Confirming will notify the makerspace team to contact you and arrange payment. Make sure this is the amount you want before continuing.
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setPendingAmount(null)} className="flex-1 rounded-lg py-2 text-sm font-bold" style={{ border: `1px solid ${D.border}`, color: D.muted, background: "transparent" }}>
                    Cancel
                  </button>
                  <button onClick={confirmRequest} className="flex-1 rounded-lg py-2 text-sm font-bold text-white" style={{ background: "#10b981" }}>
                    Confirm & Notify Team
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Membership card */}
                <div className="mb-4 overflow-hidden rounded-xl" style={user.isMember
                  ? { background: "linear-gradient(145deg, color-mix(in oklch, var(--color-inv-accent) 40%, black) 0%, var(--color-inv-accent-text) 60%, var(--color-inv-accent) 100%)" }
                  : { background: D.bg2, border: `1px solid ${D.border}` }}>
                  <div className="flex items-center justify-between gap-3 p-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: user.isMember ? "rgba(255,255,255,0.18)" : "var(--color-inv-accent)" }}>
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="m-0 text-sm font-bold" style={{ color: user.isMember ? "#fff" : D.text }}>{user.name}</p>
                        <p className="m-0 mt-0.5 text-xs" style={{ color: user.isMember ? "rgba(255,255,255,0.7)" : D.faint }}>{user.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                      style={user.isMember
                        ? { background: "rgba(255,255,255,0.2)", color: "#fff" }
                        : { background: D.bg2, color: D.faint }}>
                      {user.isMember ? "Active Member" : "No Membership"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 pb-3.5" style={{ color: user.isMember ? "rgba(255,255,255,0.7)" : D.muted }}>
                    <span className="text-xs">Student Membership · ${MEMBERSHIP_PLAN.price}/year</span>
                    <span className="text-xs font-bold" style={{ color: user.isMember ? "#fff" : "#10b981" }}>+{MEMBERSHIP_PLAN.bonusCredits} cr bonus</span>
                  </div>
                </div>

                <div className="mb-4 rounded-xl p-3.5" style={{ background: D.bg2 }}>
                  <div className="flex items-start gap-2 py-1">
                    <BadgeCheck size={14} className="mt-0.5 flex-shrink-0" style={{ color: "var(--color-inv-accent)" }} />
                    <p className="m-0 text-sm leading-snug" style={{ color: D.text }}>
                      Membership: <strong>${MEMBERSHIP_PLAN.price}/year</strong> → <strong>{MEMBERSHIP_PLAN.bonusCredits} bonus credits</strong>
                    </p>
                  </div>
                  <div className="flex items-start gap-2 py-1">
                    <Wallet size={14} className="mt-0.5 flex-shrink-0" style={{ color: "var(--color-inv-accent)" }} />
                    <p className="m-0 text-sm leading-snug" style={{ color: D.text }}>Top-up rate: <strong>{CREDIT_RATE} credits per $1</strong></p>
                  </div>
                </div>

                <p className="m-0 mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: D.faint }}>Tap a tier to request it</p>
                <div className="mb-4 flex flex-col gap-1.5">
                  {CREDIT_TIERS.map(([credits, cost]) => (
                    <button key={credits} onClick={() => setPendingAmount(cost)}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-left transition-colors"
                      style={{ border: `1px solid ${D.border}` }}>
                      <span className="text-sm font-bold" style={{ color: D.text }}>{credits} credits</span>
                      <span className="text-xs" style={{ color: D.faint }}>${cost}.00</span>
                    </button>
                  ))}
                </div>

                <p className="m-0 mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: D.faint }}>Or request a custom amount</p>
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: D.faint }}>$</span>
                  <input type="number" min="1" placeholder="Amount" value={customAmount} onChange={e => setCustomAmount(e.target.value)}
                    className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ border: `1px solid ${D.border}`, background: D.bg2, color: D.text }} />
                  <button onClick={() => customAmount > 0 && setPendingAmount(Number(customAmount))} disabled={!customAmount || customAmount <= 0}
                    className="rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-40" style={{ background: "var(--color-inv-accent)" }}>
                    Request
                  </button>
                </div>
                {customAmount > 0 && (
                  <p className="m-0 mb-4 -mt-2 text-xs" style={{ color: D.muted }}>= <strong style={{ color: D.text }}>{customCredits} credits</strong> at {CREDIT_RATE}cr/$1</p>
                )}

                <p className="m-0 mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: D.faint }}>Or reach the team directly</p>
                <div className="flex flex-col gap-2">
                  <a href={`mailto:${TEAM_CONTACT.email}?subject=Credit%20top-up%20request&body=Hi%20team%2C%20I%27d%20like%20to%20top%20up%20my%20MakerVault%20credits.`}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold" style={{ border: `1px solid ${D.border}`, color: D.text }}>
                    <Mail size={15} style={{ color: "#2563eb" }} /> Email {TEAM_CONTACT.email}
                  </a>
                  <a href={TEAM_CONTACT.telegram} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold" style={{ border: `1px solid ${D.border}`, color: D.text }}>
                    <Send size={15} style={{ color: "#229ED9" }} /> Message us on Telegram
                  </a>
                </div>
              </>
            )}
          </div>
        </div>

        {/* How to redeem — actual cost is per-item and shown live in the
            Inventory catalog, so this just points there instead of listing
            fixed prices that would drift out of sync. */}
        <div className="mb-8">
          <div className="rounded-2xl p-4 flex items-center justify-between gap-3" style={{ background: D.bgCard, border: `1px solid ${D.border}`, boxShadow: "0 2px 20px rgba(15,50,80,0.06)" }}>
            <p className="m-0 text-sm leading-relaxed" style={{ color: D.muted }}>
              Spend credits by borrowing tools or buying consumables — each item's cost is shown in the Inventory catalog.
            </p>
            <button onClick={() => navigate("/inventory/catalog")}
              className="shrink-0 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: "var(--color-inv-accent)" }}>
              Browse Catalog
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
