import { useState, useEffect } from 'react'
import { Search, AlertTriangle, X, Info, RotateCcw, ShoppingBag, Boxes, Lock, UserCheck, CreditCard, Minus, Plus, CheckCircle2, BadgeCheck, Wallet, Calendar, MapPin } from 'lucide-react'
import Badge from './ui/Badge'
import PageBreadcrumb from './layout/PageBreadcrumb'
import { Breadcrumb } from '../Breadcrumb'
import { T } from '../../lib/inventory/theme'
import { CATEGORIES, MEMBERSHIP_PLAN, CREDIT_RATE, OVERDUE_RATE, isLowStock, isOutOfStock } from '../../lib/inventory/data'
import { useInventory } from '../../lib/inventory/InventoryContext'

const LOAN_DAYS = 7 // standard borrow period — shown to the student before they confirm

const TYPE_FILTERS = [
  { id: 'all',         label: 'All Items', Icon: Boxes },
  { id: 'Returnable',  label: 'Borrow',    Icon: RotateCcw },
  { id: 'Consumable',  label: 'Purchase',  Icon: ShoppingBag },
]

// ── Item Image (falls back to category icon if photo is missing/broken) ───────
function ItemImage({ item, cat, size = 48, className = '' }) {
  const [broken, setBroken] = useState(false)
  const showPhoto = item.image && !broken

  return (
    <div className={`flex items-center justify-center ${className}`}
      style={{ background: `linear-gradient(160deg, ${cat?.color || T.stone} 0%, ${T.white} 100%)` }}>
      {showPhoto
        ? <img src={item.image} alt={item.name} onError={() => setBroken(true)} className="h-full w-full object-cover" />
        : cat && <cat.Icon size={size} color={cat.iconColor} strokeWidth={1.5} className="opacity-85" />
      }
    </div>
  )
}

const TEAL = 'var(--color-inv-accent)'

function TileTooltip({ label, count }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] font-semibold opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
      style={{ background: '#0f172a', color: '#fff' }}>
      {label} · {count} {count === 1 ? 'item' : 'items'}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent" style={{ borderBottomColor: '#0f172a' }} />
    </div>
  )
}

function CategoryTiles({ items, filterCat, setFilterCat }) {
  const countFor = (id) => id === 'all' ? items.length : items.filter(i => i.category === id).length

  return (
    // Mobile/tablet: Telegram-folder style — one horizontal scrollable row of
    // compact icon tabs (kept through tablet widths so tiles never wrap to a
    // second line). Only large desktop switches to a wrapping label+count grid.
    <div className="inv-hscroll mb-5 flex gap-2 overflow-x-auto pb-1 lg:grid lg:gap-2.5 lg:overflow-visible lg:pb-0"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(76px, 1fr))' }}>
      <div className="group relative flex-shrink-0 lg:flex-shrink">
        <button onClick={() => setFilterCat('all')}
          className="inv-tile flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 transition-all lg:w-full lg:flex-col lg:items-center lg:gap-1 lg:rounded-2xl lg:p-2.5"
          style={filterCat === 'all'
            ? { background: `${TEAL}12`, border: `1.5px solid ${TEAL}55`, boxShadow: `0 0 0 3px ${TEAL}10` }
            : { background: '#fff', border: '1.5px solid #e2e8f0' }}>
          <Boxes size={15} color={filterCat === 'all' ? TEAL : '#64748b'} className="lg:hidden" />
          <div className="hidden h-9 w-9 items-center justify-center rounded-xl lg:flex" style={{ background: filterCat === 'all' ? `${TEAL}18` : '#f1f5f9' }}>
            <Boxes size={17} color={filterCat === 'all' ? TEAL : '#64748b'} />
          </div>
          <span className="whitespace-nowrap text-[13px] font-bold lg:w-full lg:truncate lg:text-center lg:text-[11px] lg:font-semibold" style={{ color: filterCat === 'all' ? TEAL : '#0f172a' }}>All</span>
          <span className="hidden text-[9px] font-medium lg:block" style={{ color: '#94a3b8' }}>{countFor('all')}</span>
        </button>
        <TileTooltip label="All" count={countFor('all')} />
      </div>
      {CATEGORIES.map(c => {
        const active = filterCat === c.id
        return (
          <div key={c.id} className="group relative flex-shrink-0 lg:flex-shrink">
            <button onClick={() => setFilterCat(c.id)}
              className="inv-tile flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 transition-all lg:w-full lg:flex-col lg:items-center lg:gap-1 lg:rounded-2xl lg:p-2.5"
              style={active
                ? { background: `${TEAL}12`, border: `1.5px solid ${TEAL}55`, boxShadow: `0 0 0 3px ${TEAL}10` }
                : { background: '#fff', border: '1.5px solid #e2e8f0' }}>
              <c.Icon size={15} color={active ? TEAL : c.iconColor} className="lg:hidden" />
              <div className="hidden h-9 w-9 items-center justify-center rounded-xl lg:flex" style={{ background: active ? `${TEAL}18` : '#f1f5f9' }}>
                <c.Icon size={17} color={active ? TEAL : '#64748b'} />
              </div>
              <span className="whitespace-nowrap text-[13px] font-bold lg:w-full lg:truncate lg:text-center lg:text-[11px] lg:font-semibold" style={{ color: active ? TEAL : '#0f172a' }}>{c.label}</span>
              <span className="hidden text-[9px] font-medium lg:block" style={{ color: '#94a3b8' }}>{countFor(c.id)}</span>
            </button>
            <TileTooltip label={c.label} count={countFor(c.id)} />
          </div>
        )
      })}
    </div>
  )
}

// ── Item Card — larger, modern card with image, name, category, stock, location ──
export function ItemCard({ item, onView, onAddCart, user, onRequireAuth, staffMode, staffStudent, onStaffAdd }) {
  const cat   = CATEGORIES.find(c => c.id === item.category)
  const isLow = isLowStock(item.stock)

  return (
    <div onClick={() => onView(item)}
      className="flex cursor-pointer flex-col overflow-hidden rounded-[24px] transition-all hover:-translate-y-1"
      style={{ background: '#fff', border: '1.5px solid #e2e8f0', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 28px rgba(15,23,42,0.10)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 2px rgba(15,23,42,0.04)'}>

      {/* Image — slightly shorter in staff mode, where 3 cards share the row
          with the sale panel alongside, so compact reads cleaner. */}
      <div className={`relative flex-shrink-0 ${staffMode ? 'h-36 sm:h-40 lg:h-44' : 'h-40 sm:h-48 lg:h-52'}`}>
        <ItemImage item={item} cat={cat} size={48} className="h-full w-full" />
        <div className="absolute left-3 top-3"><Badge status={isOutOfStock(item.stock) && item.status === 'available' ? 'out_of_stock' : item.status} small /></div>
        <div className="absolute right-3 top-3 rounded-lg px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          style={{ background: item.type === 'Returnable' ? '#e0f9fe' : '#f0fdf4', color: item.type === 'Returnable' ? TEAL : '#16a34a', boxShadow: '0 1px 2px rgba(15,23,42,0.08)' }}>
          {item.type === 'Returnable' ? 'Returnable' : 'Consumable'}
        </div>
        <div className="absolute bottom-3 right-3 rounded-xl px-2 py-1 text-[13px] font-bold shadow-sm"
          style={item.credits > 0
            ? { background: '#fff', color: TEAL, border: `1.5px solid color-mix(in oklch, ${TEAL} 20%, transparent)` }
            : { background: 'var(--color-green-light)', color: 'var(--color-green)' }}>
          {item.credits > 0 ? `${item.credits} cr` : 'Free'}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {cat && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold"
            style={{ background: '#f1f5f9', color: '#64748b' }}>
            <cat.Icon size={11} color={cat.iconColor} />
            {cat.label}
          </span>
        )}

        <h3 className="m-0 truncate text-lg font-bold leading-snug sm:text-lg" style={{ color: 'var(--color-charcoal)' }}>{item.name}</h3>

        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 truncate font-medium" style={{ color: 'var(--muted-foreground)' }}>
            <MapPin size={staffMode ? 12 : 11} style={{ flexShrink: 0, color: 'var(--muted-foreground)' }} /> {item.room}{item.zone ? ` · Zone ${item.zone}` : ''}
          </span>
          <span className="flex flex-shrink-0 items-center gap-1 font-semibold" style={{ color: isLow ? 'var(--color-amber)' : 'var(--color-green)' }}>
            {isLow && <AlertTriangle size={10} />}{item.stock} in stock
          </span>
        </div>

        {/* Action button — pinned to the card bottom so every button in a
            row sits on the same line, whatever the content height above */}
        <div className="mt-auto pt-2">
          {staffMode && (() => {
            const enabled = !!staffStudent && item.status === 'available' && item.stock > 0
            return (
              <button onClick={e => { e.stopPropagation(); onStaffAdd(item) }}
                disabled={!enabled}
                className="h-10 w-full rounded-2xl border-none text-[13px] font-semibold sm:h-11"
                style={{ background: enabled ? TEAL : '#f1f5f9', color: enabled ? '#fff' : '#94a3b8', cursor: enabled ? 'pointer' : 'not-allowed' }}>
                {item.type === 'Returnable' ? 'Borrow' : 'Add Purchase'}
              </button>
            )
          })()}
          {!staffMode && user?.role === 'user' && (() => {
            const enabled = item.status === 'available' && item.stock > 0
            return (
              <button onClick={e => { e.stopPropagation(); onAddCart(item) }}
                disabled={!enabled}
                className="h-10 w-full rounded-2xl border-none text-[13px] font-semibold sm:h-11"
                style={{ background: enabled ? TEAL : '#f1f5f9', color: enabled ? '#fff' : '#94a3b8', cursor: enabled ? 'pointer' : 'not-allowed' }}>
                {enabled ? (item.type === 'Returnable' ? 'Borrow' : 'Purchase') : 'Unavailable'}
              </button>
            )
          })()}
          {!staffMode && !user && onRequireAuth && (
            <button onClick={e => { e.stopPropagation(); onRequireAuth() }}
              className="flex h-10 w-full items-center justify-center gap-1.5 rounded-2xl text-[13px] font-semibold sm:h-11"
              style={{ border: `1.5px dashed ${TEAL}55`, background: `${TEAL}08`, color: TEAL }}>
              <Lock size={12} />{item.type === 'Returnable' ? 'Join to Borrow' : 'Join to Purchase'}
            </button>
          )}
          {!staffMode && !user && !onRequireAuth && (
            <button onClick={e => { e.stopPropagation(); onView(item) }}
              className="h-10 w-full rounded-2xl text-[13px] font-semibold sm:h-11"
              style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', color: '#475569' }}>
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Compact Item Card — used for the student/guest browse grid at every
// screen size (mobile through desktop), not just phones. Corners are
// intentionally subtle (10px, not the 24px used on the staff ItemCard) —
// tap the whole card to open details; no inline action button. Staff still
// get the original ItemCard with a quick-add button, since counter sales
// need that one-click flow. ──
function CompactItemCard({ item, onView }) {
  const cat = CATEGORIES.find(c => c.id === item.category)
  const available = item.status === 'available' && item.stock > 0
  const statusLabel = item.status === 'available' ? (available ? 'Available' : 'Unavailable') : item.status === 'borrowed' ? 'Borrowed' : 'Maintenance'
  const statusColor = available ? { bg: '#dcfce7', fg: '#16a34a' } : { bg: '#e2e8f0', fg: '#64748b' }
  const actionLabel = available ? (item.type === 'Returnable' ? 'Borrow' : 'Add Purchase') : 'Unavailable'
  const actionColor = !available ? '#64748b' : (item.type === 'Returnable' ? '#2563eb' : '#16a34a')

  return (
    <div onClick={() => onView(item)}
      className="flex h-full cursor-pointer flex-col overflow-hidden rounded-[10px]"
      style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
      <div className="relative h-[118px] flex-shrink-0 sm:h-[150px] lg:h-[180px]">
        <ItemImage item={item} cat={cat} size={34} className="h-full w-full" />
        <span className="absolute right-2 top-2 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: statusColor.bg, color: statusColor.fg }}>
          {statusLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-0.5 p-2.5">
        <p className="m-0 truncate text-[14px] font-bold" style={{ color: '#0f172a' }}>{item.name}</p>
        <div className="mt-auto flex items-center justify-between gap-2 border-t pt-1.5" style={{ borderColor: '#f1f5f9' }}>
          <span className="whitespace-nowrap text-[13px] font-bold" style={{ color: TEAL }}>{item.credits > 0 ? `${item.credits} cr` : 'Free'}</span>
          <span className="whitespace-nowrap text-[11px] font-bold" style={{ color: actionColor }}>{actionLabel}</span>
        </div>
      </div>
    </div>
  )
}

// ── Pricing reference card — shown before any charge so staff know the rates ───
function PricingRateCard() {
  return (
    <div className="rounded-lg p-4" style={{ background: T.accentLight }}>
      <p className="m-0 mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide" style={{ color: T.accent }}>
        <Info size={14} /> Pricing reference
      </p>
      <div className="flex items-start gap-2 py-1.5">
        <BadgeCheck size={16} className="mt-0.5 flex-shrink-0" style={{ color: T.accent }} />
        <p className="m-0 text-sm leading-snug text-ink">
          Membership: <strong>${MEMBERSHIP_PLAN.price}/year</strong> → grants <strong>{MEMBERSHIP_PLAN.bonusCredits} bonus credits</strong> per student
        </p>
      </div>
      <div className="flex items-start gap-2 py-1.5">
        <Wallet size={16} className="mt-0.5 flex-shrink-0" style={{ color: T.accent }} />
        <p className="m-0 text-sm leading-snug text-ink">
          Credit top-up rate: <strong>{CREDIT_RATE} credits per $1</strong> paid in cash
        </p>
      </div>
    </div>
  )
}

// ── Staff in-person order panel — find a student, see their info BEFORE any
// charge, activate membership / top up by dollar amount, build + complete a sale.
function StaffOrderPanel({ users, staffStudent, setStaffStudent, staffOrder, setStaffOrder, onCheckout, onTopUp, onActivateMembership }) {
  const [query, setQuery] = useState('')
  const [dollarAmount, setDollarAmount] = useState('')
  const [showTopUp, setShowTopUp] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  // Every charge (top-up, membership, checkout) goes through one confirm
  // step instead of firing straight from the panel — { type: 'topup' |
  // 'membership' | 'checkout', amount? }. No cash/QR choice — every counter
  // charge is just recorded as a credit-card-style charge, one confirm click.
  const [confirmModal, setConfirmModal] = useState(null)
  // The context-level guard already blocks a second submit from firing a
  // second transaction — this just reflects that back in the button so
  // staff can see the click registered instead of mashing it again.
  const handleCheckout = async () => {
    setCheckingOut(true)
    try { await onCheckout() } finally { setCheckingOut(false) }
  }

  const results = query.trim()
    ? users.filter(u => u.role === 'user' && (
        u.studentId?.toLowerCase().includes(query.toLowerCase()) ||
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
      ))
    : []

  const total = staffOrder.filter(o => o.item.type === 'Consumable').reduce((s, o) => s + o.item.credits * o.qty, 0)
  const creditsPreview = Math.round(Number(dollarAmount || 0) * CREDIT_RATE)

  // Confirmed inside the modal below — this only closes it and fires the
  // actual charge once staff click "Confirm Charge". No method to pass
  // along anymore — every counter charge is just recorded the same way.
  const runConfirmedCharge = () => {
    if (confirmModal?.type === 'topup') onTopUp(confirmModal.amount, 'Cash')
    if (confirmModal?.type === 'membership') onActivateMembership('Cash')
    if (confirmModal?.type === 'checkout') handleCheckout()
    setConfirmModal(null)
    setDollarAmount('')
    setShowTopUp(false)
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-white p-5">
      <h3 className="m-0 flex items-center gap-2 text-base font-bold text-charcoal">
        <UserCheck size={17} style={{ color: T.accent }} /> In-Person Sale
      </h3>

      {!staffStudent ? (
        <>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <input placeholder="Search student ID, name, or email…" value={query} onChange={e => setQuery(e.target.value)}
              className="w-full rounded-md border border-border bg-cream py-2 pl-8 pr-3 text-sm outline-none" />
          </div>
          {query.trim() && (
            results.length === 0
              ? <p className="m-0 text-xs text-faint">No matching student.</p>
              : (
                <div className="flex flex-col gap-1.5">
                  {results.map(u => (
                    <button key={u.id} onClick={() => { setStaffStudent(u); setQuery('') }}
                      className="flex items-center justify-between gap-2 rounded-md border border-border bg-white px-3 py-2 text-left hover:bg-cream">
                      <div>
                        <p className="m-0 text-sm font-semibold text-ink">{u.name}</p>
                        <p className="m-0 mt-0.5 text-xs text-faint">{u.studentId} · {u.credits} cr</p>
                      </div>
                      <Badge status={u.membership === 'active' ? 'approved' : 'denied'} small />
                    </button>
                  ))}
                </div>
              )
          )}
          <PricingRateCard />
        </>
      ) : (
        <>
          {/* Student info card — shown before any charge is made */}
          <div className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: T.accent }}>
                  {staffStudent.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="m-0 text-sm font-bold text-charcoal">{staffStudent.name}</p>
                  <p className="m-0 mt-0.5 text-xs text-faint">{staffStudent.studentId}</p>
                </div>
              </div>
              <button onClick={() => { setStaffStudent(null); setStaffOrder([]) }}
                className="rounded-md border border-border bg-cream px-2 py-1 text-xs text-inv-muted">Change</button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-md p-2" style={{ background: T.cream }}>
                <p className="m-0 text-xs uppercase tracking-wide text-faint">Membership</p>
                <p className="m-0 mt-0.5 text-sm font-bold" style={{ color: staffStudent.membership === 'active' ? T.green : T.red }}>
                  {staffStudent.membership === 'active' ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className="rounded-md p-2" style={{ background: T.cream }}>
                <p className="m-0 text-xs uppercase tracking-wide text-faint">Credit Balance</p>
                <p className="m-0 mt-0.5 text-sm font-bold text-charcoal">{staffStudent.credits} cr</p>
              </div>
            </div>
          </div>

          <PricingRateCard />

          {staffStudent.membership !== 'active' ? (
            <button onClick={() => setConfirmModal({ type: 'membership' })}
              className="flex items-center justify-center gap-2 rounded-md border-none py-2.5 text-[13px] font-bold text-white"
              style={{ background: T.red }}>
              <BadgeCheck size={14} /> Activate Membership — ${MEMBERSHIP_PLAN.price} → +{MEMBERSHIP_PLAN.bonusCredits} cr
            </button>
          ) : (
            <button onClick={() => setShowTopUp(s => !s)}
              className="flex items-center justify-center gap-2 rounded-md border-none py-2.5 text-sm font-bold"
              style={{ background: T.amberLight, color: T.amber }}>
              <CreditCard size={14} /> Top Up Credits
            </button>
          )}

          {showTopUp && (
            <div className="flex flex-col gap-2 rounded-md p-3" style={{ background: T.cream }}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-faint">$</span>
                <input type="number" min="1" placeholder="Amount paid" value={dollarAmount} onChange={e => setDollarAmount(e.target.value)}
                  className="flex-1 rounded-md border border-border bg-white px-2.5 py-1.5 text-sm outline-none" />
              </div>
              {dollarAmount > 0 && (
                <p className="m-0 text-xs text-inv-muted">= <strong style={{ color: T.charcoal }}>{creditsPreview} credits</strong> at {CREDIT_RATE}cr/$1</p>
              )}
              <button onClick={() => { const amt = Number(dollarAmount); if (amt > 0) setConfirmModal({ type: 'topup', amount: amt }) }}
                className="rounded-md border-none py-2 text-[13px] font-bold text-white" style={{ background: T.green }}>
                Continue — ${dollarAmount || 0} → +{creditsPreview} cr
              </button>
            </div>
          )}

          {/* Order summary — same sectioned card list as the student cart:
              BORROW / PURCHASE groups, thumbnails, qty steppers, totals. */}
          {(() => {
            const borrowLines = staffOrder.filter(o => o.item.type === 'Returnable')
            const buyLines    = staffOrder.filter(o => o.item.type === 'Consumable')
            const borrowCr    = borrowLines.reduce((s, o) => s + o.item.credits * o.qty, 0)
            const setQty      = (id, d) => setStaffOrder(prev => prev.map(x => x.item.id === id ? { ...x, qty: Math.max(1, x.qty + d) } : x))
            const removeLine  = (id) => setStaffOrder(prev => prev.filter(x => x.item.id !== id))

            const OrderLine = ({ o }) => {
              const cat = CATEGORIES.find(c => c.id === o.item.category)
              return (
                <div className="flex items-center gap-2.5 border-b border-stone py-2.5 last:border-b-0">
                  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
                    <ItemImage item={o.item} cat={cat} size={20} className="h-full w-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 truncate text-sm font-semibold text-charcoal">{o.item.name}</p>
                    <p className="m-0 mt-0.5 text-xs text-faint">{o.item.credits} credit{o.item.credits === 1 ? '' : 's'}</p>
                    {o.item.type === 'Returnable' && o.dueDate && (
                      <p className="m-0 mt-0.5 text-xs font-semibold" style={{ color: T.blue }}>Return by {o.dueDate}</p>
                    )}
                  </div>
                  <button onClick={() => setQty(o.item.id, -1)}
                    className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-border bg-white"><Minus size={10} /></button>
                  <span className="w-4 flex-shrink-0 text-center text-xs font-bold">{o.qty}</span>
                  <button onClick={() => setQty(o.item.id, 1)}
                    className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-border bg-white"><Plus size={10} /></button>
                  <button onClick={() => removeLine(o.item.id)} className="flex-shrink-0 border-none bg-transparent text-faint"><X size={13} /></button>
                </div>
              )
            }

            return (
              <div className="flex flex-col gap-3 border-t border-stone pt-3">
                {staffOrder.length === 0 ? (
                  <p className="m-0 text-xs text-faint">Add items from the catalog to sell or lend.</p>
                ) : (
                  <>
                    {borrowLines.length > 0 && (
                      <div>
                        <p className="m-0 mb-1 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider" style={{ color: T.blue }}>
                          <RotateCcw size={11} /> Borrow — Returnable
                        </p>
                        {borrowLines.map(o => <OrderLine key={o.item.id} o={o} />)}
                      </div>
                    )}
                    {buyLines.length > 0 && (
                      <div>
                        <p className="m-0 mb-1 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider" style={{ color: T.amber }}>
                          <ShoppingBag size={11} /> Purchase — Consumable
                        </p>
                        {buyLines.map(o => <OrderLine key={o.item.id} o={o} />)}
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5 rounded-lg p-3" style={{ background: T.cream }}>
                      {borrowLines.length > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-inv-muted">Borrow (credit cost on approval)</span>
                          <span className="font-bold" style={{ color: T.teal }}>{borrowCr} cr</span>
                        </div>
                      )}
                      {buyLines.length > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-inv-muted">Purchase total</span>
                          <span className="font-bold text-charcoal">{total} cr</span>
                        </div>
                      )}
                    </div>

                    <button onClick={() => setConfirmModal({ type: 'checkout' })} disabled={checkingOut}
                      className="flex items-center justify-center gap-2 rounded-xl border-none py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60" style={{ background: T.charcoal }}>
                      <CheckCircle2 size={15} /> {checkingOut ? 'Processing…' : 'Complete Sale'}
                    </button>
                  </>
                )}
              </div>
            )
          })()}
        </>
      )}

      {/* One confirm step for every charge — top-up, membership, or checkout.
          Cash/QR is chosen here (not as a separate step beforehand) for the
          two that need a payment method. */}
      {confirmModal && (
        <div onClick={() => setConfirmModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 900, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: '1.75rem', width: 360 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700, color: T.charcoal }}>
              {confirmModal.type === 'topup' ? 'Confirm top-up' : confirmModal.type === 'membership' ? 'Confirm membership activation' : 'Confirm sale'}
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: T.muted }}>For {staffStudent?.name}</p>

            {confirmModal.type === 'topup' && (
              <p style={{ margin: '0 0 14px', fontSize: 14, color: T.charcoal }}>
                Charge <strong>${confirmModal.amount}</strong> → <strong>+{Math.round(confirmModal.amount * CREDIT_RATE)} credits</strong>
              </p>
            )}
            {confirmModal.type === 'membership' && (
              <p style={{ margin: '0 0 14px', fontSize: 14, color: T.charcoal }}>
                Charge <strong>${MEMBERSHIP_PLAN.price}</strong> → <strong>+{MEMBERSHIP_PLAN.bonusCredits} bonus credits</strong>
              </p>
            )}
            {confirmModal.type === 'checkout' && (
              <p style={{ margin: '0 0 14px', fontSize: 14, color: T.charcoal }}>
                {staffOrder.length} item{staffOrder.length === 1 ? '' : 's'} — {total} cr purchase total
              </p>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button onClick={() => setConfirmModal(null)} style={{ flex: 1, padding: '10px 0', background: T.cream, border: 'none', borderRadius: 8, color: T.muted, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={runConfirmedCharge} style={{ flex: 1, padding: '10px 0', background: T.green, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Confirm Charge</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Catalog Page ──────────────────────────────────────────────────────────────
export default function Catalog({ items, user, cart, setCart, showToast, onRequireAuth, users, onCartOpen, borrows = [] }) {
  const ctx = useInventory()
  const [search,     setSearch]     = useState('')
  const [filterCat,  setFilterCat]  = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [selected,   setSelected]   = useState(null)

  const isStaff = user?.role === 'staff' || user?.role === 'admin'
  const [staffStudent, setStaffStudent] = useState(null)
  const [staffOrder,   setStaffOrder]   = useState([])
  const [confirmBorrow, setConfirmBorrow] = useState(null)
  const [borrowDueDate, setBorrowDueDate] = useState('')
  const [borrowPurpose, setBorrowPurpose] = useState('')

  const filtered = items.filter(i =>
    (filterCat === 'all' || i.category === filterCat) &&
    (filterType === 'all' || i.type === filterType) &&
    i.name.toLowerCase().includes(search.toLowerCase())
  )

  // Show 3 rows of cards first (3 columns on desktop → 9 items); each
  // "See More" click reveals 9 more. Resets whenever the filters change.
  const PAGE_ROWS = 9
  const [visibleCount, setVisibleCount] = useState(PAGE_ROWS)
  useEffect(() => { setVisibleCount(PAGE_ROWS) }, [search, filterCat, filterType])
  const visible = filtered.slice(0, visibleCount)

  const addCart = (item, dueDate, purpose) => {
    if (!user || user.role !== 'user')        { showToast('Log in as a student to borrow or purchase.', 'error'); return }
    if (user.membership !== 'active')          { showToast('Active membership required.', 'error'); return }
    if (item.status !== 'available')           { showToast('This item is not currently available.', 'error'); return }
    setCart(prev => {
      const ex = prev.find(ci => ci.item.id === item.id)
      return ex ? prev.map(ci => ci.item.id === item.id ? { ...ci, qty: ci.qty + 1 } : ci) : [...prev, { item, qty: 1, dueDate, purpose }]
    })
    showToast(`${item.name} added to cart.`)
    // On mobile, don't auto-open the cart panel — only the explicit cart icon should.
    if (typeof window !== 'undefined' && window.innerWidth >= 640) onCartOpen?.()
  }

  // Returnable items go through a borrow/return date confirmation step first;
  // consumables are added straight away.
  const handleAddCart = (item) => {
    if (!user || user.role !== 'user')        { showToast('Log in as a student to borrow or purchase.', 'error'); return }
    if (user.membership !== 'active')          { showToast('Active membership required.', 'error'); return }
    if (item.status !== 'available')           { showToast('This item is not currently available.', 'error'); return }
    if (item.type === 'Returnable') { setConfirmBorrow(item); return }
    addCart(item)
  }

  // Staff: add an item to the in-person sale order for the selected student.
  // Returnables go through the same borrow-confirm dialog as the student
  // side (return date + purpose) before landing in the order.
  const addToStaffOrder = (item) => {
    if (!staffStudent) { showToast('Select a student first.', 'error'); return }
    if (item.type === 'Returnable') { setConfirmBorrow(item); return }
    setStaffOrder(prev => {
      const ex = prev.find(o => o.item.id === item.id)
      if (ex) return prev.map(o => o.item.id === item.id ? { ...o, qty: o.qty + 1 } : o)
      return [...prev, { item, qty: 1 }]
    })
  }

  // Called by the confirm dialog in staff mode once date + purpose are set.
  const addStaffBorrowConfirmed = (item, dueDate, purpose) => {
    setStaffOrder(prev => prev.find(o => o.item.id === item.id)
      ? prev.map(o => o.item.id === item.id ? { ...o, dueDate, purpose } : o)
      : [...prev, { item, qty: 1, dueDate, purpose }])
  }

  // Staff: activate a student's membership in person — $20 charge, 200 bonus credits.
  const activateStudentMembership = async (method = 'Cash') => {
    try {
      await ctx.topUpCounter({ studentId: staffStudent.id, amountUSD: MEMBERSHIP_PLAN.price, method: method.toLowerCase(), type: 'membership' })
      setStaffStudent(prev => ({ ...prev, membership: 'active', credits: prev.credits + MEMBERSHIP_PLAN.bonusCredits }))
      showToast(`Activated membership for ${staffStudent.name} — $${MEMBERSHIP_PLAN.price} charged (${method}), ${MEMBERSHIP_PLAN.bonusCredits} credits added.`)
    } catch (err) {
      showToast(err.message || 'Membership activation failed.', 'error')
    }
  }

  // Staff: top up a student's credits — staff enters the dollar amount paid in cash or QR,
  // credits are computed from the shared CREDIT_RATE (not deducted from existing credits).
  const topUpStudentCredits = async (dollarAmount, method = 'Cash') => {
    const creditsToAdd = Math.round(dollarAmount * CREDIT_RATE)
    try {
      await ctx.topUpCounter({ studentId: staffStudent.id, amountUSD: dollarAmount, method: method.toLowerCase(), type: 'topup' })
      setStaffStudent(prev => ({ ...prev, credits: prev.credits + creditsToAdd }))
      showToast(`Charged $${dollarAmount} via ${method} → ${creditsToAdd} credits added to ${staffStudent.name}.`)
    } catch (err) {
      showToast(err.message || 'Top-up failed.', 'error')
    }
  }

  // Staff: finalize the in-person order — the backend sells consumables (invoice +
  // credit charge + stock) and lends returnables (borrow_transactions) in one call.
  const completeStaffSale = async () => {
    if (!staffStudent || staffOrder.length === 0) return
    if (staffStudent.membership !== 'active') { showToast(`${staffStudent.name} does not have an active membership.`, 'error'); return }
    const buyTotal = staffOrder.filter(o => o.item.type === 'Consumable').reduce((s, o) => s + o.item.credits * o.qty, 0)
    if (buyTotal > staffStudent.credits) { showToast('Student has insufficient credits for this order.', 'error'); return }

    try {
      await ctx.staffSale({
        studentId: staffStudent.id,
        cart: staffOrder.map(o => ({
          itemId: o.item.id, qty: o.qty,
          action: o.item.type === 'Consumable' ? 'purchase' : 'borrow',
          dueDate: o.dueDate || null, note: o.purpose || null,
        })),
      })
      showToast(`Order complete for ${staffStudent.name}.`)
      setStaffStudent(prev => buyTotal > 0 ? { ...prev, credits: prev.credits - buyTotal } : prev)
      setStaffOrder([])
    } catch (err) {
      showToast(err.message || 'Sale failed.', 'error')
    }
  }

  return (
    <div style={{ background: 'var(--color-cream)', minHeight: '100vh' }}>
      {/* Header banner — student side only. On the admin side the shared
          teal top bar (PAGE_META in InventoryAdminArea) is the one page
          header, so rendering another banner here would duplicate it. */}
      {!isStaff && (
        <div style={{
          position: 'relative', overflow: 'hidden',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(145deg, color-mix(in oklch, var(--color-inv-accent) 40%, black) 0%, var(--color-inv-accent-text) 55%, var(--color-inv-accent) 100%)',
          backgroundSize: '40px 40px, 40px 40px, cover',
          borderBottom: '1px solid color-mix(in oklch, var(--color-inv-accent) 20%, transparent)',
        }}>
          <div style={{ position: 'absolute', top: '50%', right: '10%', transform: 'translateY(-50%)', width: 320, height: 220, background: 'radial-gradient(circle, color-mix(in oklch, var(--color-inv-accent) 12%, transparent) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div className="mx-auto max-w-[1280px] px-5 pt-8 pb-7 sm:px-8 lg:px-12" style={{ position: 'relative', zIndex: 1 }}>
            <Breadcrumb className="mb-3" light items={[
              { label: 'Home', to: '/' },
              { label: 'Inventory', to: '/inventory' },
              { label: 'Browse' },
            ]} />
            {user && <PageBreadcrumb current="/catalog" />}
            <h1 style={{ margin: 0, fontSize: 'clamp(26px,4vw,40px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
              Browse Equipment
            </h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--on-dark-muted)', maxWidth: 560 }}>
              Find what you need — borrow tools or purchase consumables with credits.
            </p>
          </div>
        </div>
      )}

    <div className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
      {/* The admin sidebar is always visible (no collapse at tablet), so the
          two-column split only kicks in at lg — at md the content column is
          too squeezed by the sidebar for a 340px side panel to fit. */}
      <div className={isStaff ? 'grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]' : ''}>
        {/* Main column — categories, search, filters, item grid */}
        <div className="min-w-0">
          <CategoryTiles items={items} filterCat={filterCat} setFilterCat={setFilterCat} />

          {/* Search + type filters */}
          <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative flex-1 sm:max-w-[360px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
              <input placeholder="Search by name…" value={search} onChange={e => setSearch(e.target.value)}
                className="field outline-none"
                style={{ paddingLeft: 32, background: '#fff', borderColor: 'var(--border)', color: 'var(--color-charcoal)' }}
                onFocus={e => e.target.style.borderColor = TEAL}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div className="inv-hscroll flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
              {TYPE_FILTERS.map(t => {
                const active = filterType === t.id
                return (
                  <button key={t.id} onClick={() => setFilterType(t.id)}
                    className="chip flex-shrink-0"
                    style={active
                      ? { background: TEAL, color: '#fff', border: 'none' }
                      : { background: '#fff', color: 'var(--muted-foreground)', border: '1.5px solid var(--border)' }}>
                    <t.Icon size={12} color={active ? '#fff' : 'var(--muted-foreground)'} />
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          <p className="m-0 mb-3 text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>{filtered.length} items</p>

          {isStaff ? (
            /* Staff keep the original card + quick-add button at every size — counter
               sales need that one-click flow, so this isn't part of the restyle below. */
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
              {visible.map(item => (
                <ItemCard key={item.id} item={item} onView={setSelected} onAddCart={handleAddCart} user={user} onRequireAuth={onRequireAuth}
                  staffMode={isStaff} staffStudent={staffStudent} onStaffAdd={addToStaffOrder} />
              ))}
            </div>
          ) : (
            /* Student/guest — same compact card at every screen size, 2 columns on
               phones up to 4 on desktop. */
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
              {visible.map(item => (
                <CompactItemCard key={item.id} item={item} onView={setSelected} />
              ))}
            </div>
          )}

          {/* See More — reveals the next batch of items */}
          {filtered.length > visibleCount && (
            <div className="mt-6 flex justify-center">
              <button onClick={() => setVisibleCount(c => c + PAGE_ROWS)}
                className="btn-secondary"
                style={{ background: '#fff', borderColor: `color-mix(in oklch, ${TEAL} 33%, transparent)`, color: TEAL, cursor: 'pointer' }}>
                See More ({filtered.length - visibleCount} more)
              </button>
            </div>
          )}
        </div>

        {/* Right column — sticky in-person order panel (staff/admin only) */}
        {isStaff && (
          <div className="lg:sticky lg:top-4 lg:self-start">
            <StaffOrderPanel
              users={users}
              staffStudent={staffStudent} setStaffStudent={setStaffStudent}
              staffOrder={staffOrder} setStaffOrder={setStaffOrder}
              onCheckout={completeStaffSale} onTopUp={topUpStudentCredits} onActivateMembership={activateStudentMembership}
            />
          </div>
        )}
      </div>

      {/* Detail modal — responsive two-column */}
      {selected && (() => {
        const cat     = CATEGORIES.find(c => c.id === selected.category)
        const hasLong = selected.description?.length > 120 || selected.usage
        return (
          <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
            <div onClick={e => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: hasLong ? 780 : 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(15,23,42,0.18)' }}>

              {/* Mobile: image stacked ON TOP of the info. sm+: two columns when there's long content. */}
              <div className={`grid grid-cols-1 ${hasLong ? 'sm:grid-cols-[minmax(200px,40%)_1fr]' : ''}`} style={{ minHeight: 0 }}>

                {/* Image panel */}
                <div className="relative h-40 sm:h-auto" style={{ minHeight: 160 }}>
                  <ItemImage item={selected} cat={cat} size={60}
                    className={`h-full w-full rounded-t-[24px] ${hasLong ? 'sm:rounded-tr-none sm:rounded-l-[24px]' : ''}`} />
                  {/* Status badge */}
                  <div style={{ position: 'absolute', top: 12, left: 12 }}>
                    <Badge status={selected.status} small />
                  </div>
                  {/* Close — overlaid on the image, top-right */}
                  <button onClick={() => setSelected(null)}
                    style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 10, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
                    <X size={14} color="#0f172a" />
                  </button>
                  {/* Credit chip */}
                  <div style={{ position: 'absolute', bottom: 12, right: 12, padding: '4px 10px', borderRadius: 8, fontSize: 13, fontWeight: 800, background: 'rgba(255,255,255,0.95)', color: 'var(--color-inv-accent)', border: 'none', backdropFilter: 'blur(4px)' }}>
                    {selected.credits > 0 ? `${selected.credits} cr` : 'Free'}
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-col gap-3 p-4 sm:gap-4 sm:p-6" style={{ minHeight: 0 }}>
                  {/* Title */}
                  <div>
                    {cat && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <cat.Icon size={13} color={cat.iconColor} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-foreground)', letterSpacing: '.04em', textTransform: 'uppercase' }}>{cat.label}</span>
                      </div>
                    )}
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--color-charcoal)', lineHeight: 1.2 }}>{selected.name}</h2>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>{selected.room} · Zone {selected.zone}</p>
                  </div>

                  {/* Description */}
                  {selected.description && (
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--color-inv-muted)', lineHeight: 1.65 }}>{selected.description}</p>
                  )}

                  {/* Stats grid — fixed minHeight + truncated values so a long
                      zone name (e.g. "Robotic Lab 2024") never grows its box
                      taller than the other two and breaks the equal-size row. */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, alignItems: 'stretch' }}>
                    {[
                      ['Stock', selected.stock],
                      ['Room',  selected.room],
                      ['Zone',  selected.zone],
                    ].map(([k, v]) => (
                      <div key={k} style={{ background: 'var(--color-cream)', borderRadius: 12, padding: '10px 12px', border: '1.5px solid var(--border)', minHeight: 56, boxSizing: 'border-box' }}>
                        <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{k}</p>
                        <p style={{ margin: '3px 0 0', fontSize: 13, fontWeight: 700, color: 'var(--color-charcoal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={String(v)}>{String(v)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Usage note */}
                  {selected.usage && (
                    <div style={{ background: 'var(--color-inv-accent-light)', borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 10, border: '1px solid color-mix(in oklch, var(--color-inv-accent) 20%, transparent)' }}>
                      <Info size={13} color="var(--color-inv-accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--color-inv-accent-text)', lineHeight: 1.55 }}>{selected.usage}</p>
                    </div>
                  )}

                  {/* CTA */}
                  <div style={{ marginTop: 'auto' }}>
                    {!isStaff && !user && onRequireAuth && (
                      <button onClick={onRequireAuth}
                        className="btn-primary w-full justify-center"
                        style={{ background: 'var(--color-inv-accent)', border: 'none', color: '#fff', cursor: 'pointer' }}>
                        <Lock size={13} /> Join to {selected.type === 'Returnable' ? 'Borrow' : 'Purchase'}
                      </button>
                    )}
                    {isStaff && (() => {
                      const enabled = !!staffStudent && selected.status === 'available' && selected.stock > 0
                      return (
                        <button onClick={() => { addToStaffOrder(selected); setSelected(null) }} disabled={!enabled}
                          className="w-full py-2.5 text-[13px] sm:py-3 sm:text-sm"
                          style={{ background: enabled ? 'var(--color-inv-accent)' : 'var(--muted)', color: enabled ? '#fff' : 'var(--muted-foreground)', border: 'none', borderRadius: 14, fontWeight: 700, cursor: enabled ? 'pointer' : 'not-allowed' }}>
                          {!staffStudent ? 'Select a student first' : enabled ? (selected.type === 'Returnable' ? 'Borrow for Student' : 'Add to Order') : `Not Available`}
                        </button>
                      )
                    })()}
                    {!isStaff && user?.role === 'user' && (() => {
                      const enabled = selected.status === 'available' && selected.stock > 0
                      const isBorrow = selected.type === 'Returnable'
                      return (
                        <button onClick={() => { handleAddCart(selected); setSelected(null) }} disabled={!enabled}
                          className="btn-primary w-full justify-center"
                          style={{ background: enabled ? 'var(--color-inv-accent)' : 'var(--muted)', color: enabled ? '#fff' : 'var(--muted-foreground)', border: 'none', cursor: enabled ? 'pointer' : 'not-allowed' }}>
                          {enabled ? (isBorrow ? '＋ Add to Cart — Borrow' : '＋ Add to Cart — Purchase') : `Not Available (${selected.status})`}
                        </button>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Borrow/return date confirmation — shown before a returnable item is added to cart */}
      {confirmBorrow && (() => {
        const today = new Date()
        const defaultDue = new Date(today); defaultDue.setDate(defaultDue.getDate() + LOAN_DAYS)
        const fmt = (d) => d.toISOString().split('T')[0]
        const minDue = fmt(new Date(today.getTime() + 86400000)) // tomorrow — can't return same day
        return (
          <div className="fixed inset-0 z-[850] flex items-center justify-center bg-charcoal/40 p-4" onClick={() => setConfirmBorrow(null)}>
            <div onClick={e => e.stopPropagation()} className="w-full max-w-[380px] rounded-3xl bg-white p-6">
              <h3 className="m-0 mb-1 flex items-center gap-2 font-heading text-base font-bold text-charcoal">
                <Calendar size={16} style={{ color: 'var(--color-inv-accent)' }} /> Confirm Borrow
              </h3>
              <p className="m-0 mb-4 text-xs text-faint">{confirmBorrow.name}</p>
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3" style={{ background: T.cream }}>
                  <p className="m-0 text-[10px] uppercase tracking-wide text-faint">Borrow Date</p>
                  <p className="m-0 mt-1 text-sm font-bold text-charcoal">{fmt(today)}</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: T.cream }}>
                  <p className="m-0 mb-1 text-[10px] uppercase tracking-wide text-faint">Return Date</p>
                  <input type="date" min={minDue} value={borrowDueDate || fmt(defaultDue)}
                    onChange={e => setBorrowDueDate(e.target.value)}
                    className="w-full rounded-md border-none bg-transparent p-0 text-sm font-bold text-charcoal outline-none" />
                </div>
              </div>
              <p className="m-0 mb-3 text-xs text-inv-muted">Choose when you'll return this item. Staff still need to approve the request.</p>

              {/* Required — staff see this on the request so they know why the item's needed */}
              <div className="mb-4">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-faint">Borrow Purpose</label>
                <textarea rows={2} value={borrowPurpose} onChange={e => setBorrowPurpose(e.target.value)}
                  placeholder="What are you using this for?"
                  className="field field-textarea resize-none bg-cream outline-none focus:ring-2" style={{ borderColor: T.border, '--tw-ring-color': 'color-mix(in oklch, var(--color-inv-accent) 25%, transparent)' }} />
              </div>

              {/* Late-return rule — the student agrees to this before confirming */}
              <div className="mb-4 flex items-start gap-2 rounded-xl px-3 py-2.5" style={{ background: 'var(--color-amber-light)', border: '1px solid color-mix(in oklch, var(--color-amber) 40%, transparent)' }}>
                <AlertTriangle size={13} style={{ color: 'var(--color-amber)', flexShrink: 0, marginTop: 1 }} />
                <p className="m-0 text-xs leading-snug" style={{ color: 'color-mix(in oklch, var(--color-amber) 70%, black)' }}>
                  Late returns are charged <strong>{OVERDUE_RATE} credits per day</strong> after your chosen return date.
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setConfirmBorrow(null); setBorrowDueDate(''); setBorrowPurpose('') }}
                  className="btn-secondary flex-1 justify-center text-inv-muted" style={{ borderColor: T.border }}>
                  Cancel
                </button>
                <button onClick={() => {
                    if (!borrowPurpose.trim()) { showToast('Please state the borrow purpose.', 'error'); return }
                    // Same dialog serves both sides: students add to their own
                    // cart, staff add to the in-person order for the student.
                    if (isStaff) addStaffBorrowConfirmed(confirmBorrow, borrowDueDate || fmt(defaultDue), borrowPurpose.trim())
                    else addCart(confirmBorrow, borrowDueDate || fmt(defaultDue), borrowPurpose.trim())
                    setConfirmBorrow(null); setBorrowDueDate(''); setBorrowPurpose('')
                  }}
                  disabled={!borrowPurpose.trim()}
                  className="btn-primary flex-1 justify-center border-none text-white disabled:cursor-not-allowed disabled:opacity-50" style={{ background: 'var(--color-inv-accent)' }}>
                  Confirm Borrow
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
    </div>
  )
}
