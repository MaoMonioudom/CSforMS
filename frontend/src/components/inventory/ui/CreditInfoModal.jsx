import { useState } from 'react'
import { X, CreditCard, Mail, Send, BadgeCheck, Wallet, Clock, ArrowLeft } from 'lucide-react'
import { T } from '../../../lib/inventory/theme'
import { MEMBERSHIP_PLAN, CREDIT_TIERS, CREDIT_RATE, TEAM_CONTACT } from '../../../lib/inventory/data'

// Shown when a student clicks the credit pill — pricing reference, a list of credit
// tiers they can click to request, a custom-amount request, and direct team contacts.
// Requesting is a two-step flow: pick/enter an amount, then confirm before it's sent.
export default function CreditInfoModal({ user, onClose, onRequestTopUp }) {
  const [customAmount, setCustomAmount] = useState('')
  const [pendingAmount, setPendingAmount] = useState(null)
  const [sent, setSent] = useState(false)
  const customCredits = Math.round(Number(customAmount || 0) * CREDIT_RATE)
  const pendingCredits = Math.round((pendingAmount || 0) * CREDIT_RATE)

  const confirmRequest = () => {
    onRequestTopUp(pendingAmount)
    setSent(true)
  }

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center bg-charcoal/40 p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-[420px] rounded-2xl bg-white p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: T.amberLight }}>
              <CreditCard size={18} color={T.amber} />
            </div>
            <div>
              <h2 className="m-0 font-heading text-base font-bold text-charcoal">Your Credits</h2>
              <p className="m-0 mt-0.5 text-xs text-faint">{user.credits} cr available</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border-none bg-cream text-inv-muted">
            <X size={15} />
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-2 rounded-xl py-8 text-center" style={{ background: T.greenLight }}>
            <Clock size={28} style={{ color: T.green }} />
            <p className="m-0 text-sm font-bold text-charcoal">Request sent!</p>
            <p className="m-0 max-w-[280px] text-xs text-inv-muted">The makerspace team has been notified. You'll see it in your Notifications once it's approved.</p>
            <button onClick={onClose} className="mt-2 rounded-lg border-none px-4 py-2 text-xs font-bold text-white" style={{ background: T.charcoal }}>Done</button>
          </div>
        ) : pendingAmount !== null ? (
          // ── Confirm step — make sure the student really wants to contact the team ──
          <>
            <button onClick={() => setPendingAmount(null)} className="mb-3 flex items-center gap-1.5 border-none bg-transparent text-xs font-semibold text-faint">
              <ArrowLeft size={13} /> Back
            </button>
            <div className="mb-4 rounded-xl p-4 text-center" style={{ background: T.accentLight }}>
              <p className="m-0 text-xs font-semibold uppercase tracking-wide" style={{ color: T.accent }}>You're requesting</p>
              <p className="m-0 mt-1 text-3xl font-bold text-charcoal">${pendingAmount}</p>
              <p className="m-0 mt-1 text-sm text-inv-muted">= {pendingCredits} credits at {CREDIT_RATE}cr/$1</p>
            </div>
            <p className="m-0 mb-4 text-[13px] leading-relaxed text-inv-muted">
              Confirming will notify the makerspace team to contact you and arrange payment. Make sure this is the amount you want before continuing.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPendingAmount(null)} className="flex-1 rounded-lg border py-2.5 text-sm font-semibold text-inv-muted" style={{ borderColor: T.border }}>
                Cancel
              </button>
              <button onClick={confirmRequest} className="flex-1 rounded-lg border-none py-2.5 text-sm font-bold text-white" style={{ background: T.green }}>
                Confirm & Notify Team
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Membership card — moved here from the home page */}
            <div className="mb-3 overflow-hidden rounded-xl" style={user.membership === 'active'
              ? { background: 'linear-gradient(145deg, #0c4a6e 0%, #0e7490 60%, #0891b2 100%)' }
              : { background: T.cream, border: `1px solid ${T.border}` }}>
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: user.membership === 'active' ? 'rgba(255,255,255,0.18)' : '#0891b2' }}>
                    {user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="m-0 text-[13px] font-bold" style={{ color: user.membership === 'active' ? '#fff' : T.charcoal }}>{user.name}</p>
                    <p className="m-0 mt-0.5 text-[11px]" style={{ color: user.membership === 'active' ? 'rgba(255,255,255,0.55)' : T.faint }}>
                      {user.studentId || user.email}
                    </p>
                  </div>
                </div>
                <span className="flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold" style={user.membership === 'active'
                  ? { background: 'rgba(103,232,249,0.2)', color: '#67e8f9' }
                  : { background: T.stone, color: T.faint }}>
                  {user.membership === 'active' ? 'Active Member' : 'No Membership'}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 pb-3.5" style={{ color: user.membership === 'active' ? 'rgba(255,255,255,0.7)' : T.muted }}>
                <span className="text-[11px]">Student Membership · ${MEMBERSHIP_PLAN.price}/year</span>
                <span className="text-[11px] font-bold" style={{ color: user.membership === 'active' ? '#67e8f9' : T.green }}>+{MEMBERSHIP_PLAN.bonusCredits} cr bonus</span>
              </div>
            </div>

            <div className="mb-3 rounded-xl p-3.5" style={{ background: T.accentLight }}>
              <div className="flex items-start gap-2 py-1">
                <BadgeCheck size={14} className="mt-0.5 flex-shrink-0" style={{ color: T.accent }} />
                <p className="m-0 text-[13px] leading-snug text-ink">
                  Membership: <strong>${MEMBERSHIP_PLAN.price}/year</strong> → <strong>{MEMBERSHIP_PLAN.bonusCredits} bonus credits</strong>
                </p>
              </div>
              <div className="flex items-start gap-2 py-1">
                <Wallet size={14} className="mt-0.5 flex-shrink-0" style={{ color: T.accent }} />
                <p className="m-0 text-[13px] leading-snug text-ink">Top-up rate: <strong>{CREDIT_RATE} credits per $1</strong></p>
              </div>
            </div>

            <p className="m-0 mb-2 text-[11px] font-bold uppercase tracking-wide text-faint">Tap a tier to request it</p>
            <div className="mb-3 flex flex-col gap-1.5">
              {CREDIT_TIERS.map(([credits, cost]) => (
                <button key={credits} onClick={() => setPendingAmount(cost)}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-left transition-colors hover:bg-cream">
                  <span className="text-sm font-bold text-charcoal">{credits} credits</span>
                  <span className="text-xs text-faint">${cost}.00</span>
                </button>
              ))}
            </div>

            <p className="m-0 mb-2 text-[11px] font-bold uppercase tracking-wide text-faint">Or request a custom amount</p>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm font-semibold text-faint">$</span>
              <input type="number" min="1" placeholder="Amount" value={customAmount} onChange={e => setCustomAmount(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-cream px-3 py-2 text-sm outline-none focus:border-inv-accent" />
              <button onClick={() => customAmount > 0 && setPendingAmount(Number(customAmount))} disabled={!customAmount || customAmount <= 0}
                className="rounded-lg border-none px-3 py-2 text-xs font-bold text-white disabled:opacity-40" style={{ background: T.accent }}>
                Request
              </button>
            </div>
            {customAmount > 0 && (
              <p className="m-0 mb-4 -mt-2 text-xs text-inv-muted">= <strong style={{ color: T.charcoal }}>{customCredits} credits</strong> at {CREDIT_RATE}cr/$1</p>
            )}

            <p className="m-0 mb-2 text-[11px] font-bold uppercase tracking-wide text-faint">Or reach the team directly</p>
            <div className="flex flex-col gap-2">
              <a href={`mailto:${TEAM_CONTACT.email}?subject=Credit%20top-up%20request&body=Hi%20team%2C%20I%27d%20like%20to%20top%20up%20my%20MakerVault%20credits.`}
                className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 text-sm font-semibold text-ink hover:bg-cream">
                <Mail size={15} style={{ color: T.blue }} /> Email {TEAM_CONTACT.email}
              </a>
              <a href={TEAM_CONTACT.telegram} target="_blank" rel="noreferrer"
                className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 text-sm font-semibold text-ink hover:bg-cream">
                <Send size={15} style={{ color: '#229ED9' }} /> Message us on Telegram
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
