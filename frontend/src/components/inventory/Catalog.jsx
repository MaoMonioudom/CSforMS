import { useState } from 'react'
import { Search, AlertTriangle, X, Info, RotateCcw, ShoppingBag, Boxes, Lock, UserCheck, CreditCard, Minus, Plus, CheckCircle2, BadgeCheck, Wallet, Calendar, MapPin } from 'lucide-react'
import Badge from './ui/Badge'
import PageBreadcrumb from './layout/PageBreadcrumb'
import { T } from '../../lib/inventory/theme'
import { CATEGORIES, MEMBERSHIP_PLAN, CREDIT_RATE, OVERDUE_RATE } from '../../lib/inventory/data'
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

const TEAL = '#0891b2'

function CategoryTiles({ items, filterCat, setFilterCat }) {
  const countFor = (id) => id === 'all' ? items.length : items.filter(i => i.category === id).length

  return (
    // Mobile: Telegram-folder style — one horizontal scrollable row of icon tabs.
    // Tablet/desktop: grid of tiles with labels and counts.
    <div className="inv-hscroll mb-5 flex gap-1.5 overflow-x-auto pb-1 sm:grid sm:gap-2 sm:overflow-visible sm:pb-0"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(64px, 1fr))' }}>
      <button onClick={() => setFilterCat('all')}
        className="inv-tile flex min-w-[54px] flex-shrink-0 flex-col items-center gap-1 rounded-lg p-1.5 transition-all sm:min-w-0 sm:flex-shrink sm:rounded-xl sm:p-2"
        style={filterCat === 'all'
          ? { background: `${TEAL}12`, border: `1.5px solid ${TEAL}55`, boxShadow: `0 0 0 3px ${TEAL}10` }
          : { background: '#fff', border: '1.5px solid #e2e8f0' }}>
        <div className="flex h-6 w-6 items-center justify-center rounded-md sm:h-8 sm:w-8 sm:rounded-lg" style={{ background: filterCat === 'all' ? `${TEAL}18` : '#f1f5f9' }}>
          <Boxes size={13} color={filterCat === 'all' ? TEAL : '#64748b'} className="sm:hidden" />
          <Boxes size={15} color={filterCat === 'all' ? TEAL : '#64748b'} className="hidden sm:block" />
        </div>
        <span className={`w-full truncate text-center text-[10px] font-semibold ${filterCat === 'all' ? '' : 'hidden sm:block'}`} style={{ color: filterCat === 'all' ? TEAL : '#374151' }}>All</span>
        <span className="hidden text-[9px] font-medium sm:block" style={{ color: '#94a3b8' }}>{countFor('all')}</span>
      </button>
      {CATEGORIES.map(c => {
        const active = filterCat === c.id
        return (
          <button key={c.id} onClick={() => setFilterCat(c.id)}
            className="inv-tile flex min-w-[54px] flex-shrink-0 flex-col items-center gap-1 rounded-lg p-1.5 transition-all sm:min-w-0 sm:flex-shrink sm:rounded-xl sm:p-2"
            style={active
              ? { background: `${TEAL}12`, border: `1.5px solid ${TEAL}55`, boxShadow: `0 0 0 3px ${TEAL}10` }
              : { background: '#fff', border: '1.5px solid #e2e8f0' }}>
            <div className="flex h-6 w-6 items-center justify-center rounded-md sm:h-8 sm:w-8 sm:rounded-lg" style={{ background: active ? `${TEAL}18` : '#f1f5f9' }}>
              <c.Icon size={13} color={active ? TEAL : '#64748b'} className="sm:hidden" />
              <c.Icon size={15} color={active ? TEAL : '#64748b'} className="hidden sm:block" />
            </div>
            {/* Mobile: label only shows under the active category. Tablet/desktop: always shown. */}
            <span className={`w-full truncate text-center text-[10px] font-semibold ${active ? '' : 'hidden sm:block'}`} style={{ color: active ? TEAL : '#374151' }}>{c.label}</span>
            <span className="hidden text-[9px] font-medium sm:block" style={{ color: '#94a3b8' }}>{countFor(c.id)}</span>
          </button>
        )
      })}
    </div>
  )
}

// ── Item Card — larger, modern card with image, name, category, stock, location ──
export function ItemCard({ item, onView, onAddCart, user, onRequireAuth, staffMode, staffStudent, onStaffAdd }) {
  const cat   = CATEGORIES.find(c => c.id === item.category)
  const isLow = item.stock <= item.minStock && item.stock > 0

  return (
    <div onClick={() => onView(item)}
      className="flex cursor-pointer flex-col overflow-hidden rounded-2xl transition-all hover:-translate-y-1"
      style={{ background: '#fff', border: '1.5px solid #e2e8f0', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 28px rgba(15,23,42,0.10)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 2px rgba(15,23,42,0.04)'}>

      {/* Image */}
      <div className="relative h-36 flex-shrink-0 sm:h-44 lg:h-48">
        <ItemImage item={item} cat={cat} size={52} className="h-full w-full" />
        <div className="absolute left-3 top-3"><Badge status={item.status} small /></div>
        <div className="absolute right-3 top-3 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          style={{ background: item.type === 'Returnable' ? '#e0f9fe' : '#f0fdf4', color: item.type === 'Returnable' ? TEAL : '#16a34a', boxShadow: '0 1px 2px rgba(15,23,42,0.08)' }}>
          {item.type === 'Returnable' ? 'Returnable' : 'Consumable'}
        </div>
        <div className="absolute bottom-3 right-3 rounded-lg px-2 py-1 text-[13px] font-bold shadow-sm"
          style={item.credits > 0
            ? { background: '#fff', color: TEAL, border: `1.5px solid ${TEAL}33` }
            : { background: '#dcfce7', color: '#16a34a' }}>
          {item.credits > 0 ? `${item.credits} cr` : 'Free'}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        {cat && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold"
            style={{ background: '#f1f5f9', color: '#64748b' }}>
            <cat.Icon size={11} color={cat.iconColor} />
            {cat.label}
          </span>
        )}

        <h3 className="m-0 truncate text-[16px] font-bold leading-snug sm:text-[17px]" style={{ color: '#0f172a' }}>{item.name}</h3>

        <div className="flex items-center justify-between text-[12px]">
          <span className="flex items-center gap-1 truncate font-medium" style={{ color: '#64748b' }}>
            <MapPin size={11} style={{ flexShrink: 0, color: '#94a3b8' }} /> {item.room}{item.zone ? ` · Zone ${item.zone}` : ''}
          </span>
          <span className="flex flex-shrink-0 items-center gap-1 font-semibold" style={{ color: isLow ? '#f59e0b' : '#16a34a' }}>
            {isLow && <AlertTriangle size={10} />}{item.stock} in stock
          </span>
        </div>

        {/* Action button — equal height across all cards/breakpoints */}
        <div className="mt-2">
          {staffMode && (() => {
            const enabled = !!staffStudent && item.status === 'available' && item.stock > 0
            return (
              <button onClick={e => { e.stopPropagation(); onStaffAdd(item) }}
                disabled={!enabled}
                className="h-10 w-full rounded-xl border-none text-[13px] font-semibold sm:h-11"
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
                className="h-10 w-full rounded-xl border-none text-[13px] font-semibold sm:h-11"
                style={{ background: enabled ? TEAL : '#f1f5f9', color: enabled ? '#fff' : '#94a3b8', cursor: enabled ? 'pointer' : 'not-allowed' }}>
                {enabled ? (item.type === 'Returnable' ? 'Borrow' : 'Purchase') : 'Unavailable'}
              </button>
            )
          })()}
          {!staffMode && !user && onRequireAuth && (
            <button onClick={e => { e.stopPropagation(); onRequireAuth() }}
              className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl text-[13px] font-semibold sm:h-11"
              style={{ border: `1.5px dashed ${TEAL}55`, background: `${TEAL}08`, color: TEAL }}>
              <Lock size={12} />{item.type === 'Returnable' ? 'Join to Borrow' : 'Join to Purchase'}
            </button>
          )}
          {!staffMode && !user && !onRequireAuth && (
            <button onClick={e => { e.stopPropagation(); onView(item) }}
              className="h-10 w-full rounded-xl text-[13px] font-semibold sm:h-11"
              style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', color: '#475569' }}>
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Pricing reference card — shown before any charge so staff know the rates ───
function PricingRateCard() {
  return (
    <div className="rounded-lg p-3" style={{ background: T.accentLight }}>
      <p className="m-0 mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: T.accent }}>
        <Info size={12} /> Pricing reference
      </p>
      <div className="flex items-start gap-2 py-1">
        <BadgeCheck size={14} className="mt-0.5 flex-shrink-0" style={{ color: T.accent }} />
        <p className="m-0 text-xs leading-snug text-ink">
          Membership: <strong>${MEMBERSHIP_PLAN.price}/year</strong> → grants <strong>{MEMBERSHIP_PLAN.bonusCredits} bonus credits</strong> per student
        </p>
      </div>
      <div className="flex items-start gap-2 py-1">
        <Wallet size={14} className="mt-0.5 flex-shrink-0" style={{ color: T.accent }} />
        <p className="m-0 text-xs leading-snug text-ink">
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
  const [payMethod, setPayMethod] = useState('Cash')

  const results = query.trim()
    ? users.filter(u => u.role === 'user' && (
        u.studentId?.toLowerCase().includes(query.toLowerCase()) ||
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
      ))
    : []

  const total = staffOrder.filter(o => o.item.type === 'Consumable').reduce((s, o) => s + o.item.credits * o.qty, 0)
  const creditsPreview = Math.round(Number(dollarAmount || 0) * CREDIT_RATE)

  const confirmTopUp = () => {
    const amt = Number(dollarAmount)
    if (!amt || amt <= 0) return
    onTopUp(amt, payMethod)
    setDollarAmount('')
    setShowTopUp(false)
  }

  const PayMethodToggle = () => (
    <div className="flex gap-1.5">
      {['Cash', 'QR'].map(m => (
        <button key={m} onClick={() => setPayMethod(m)}
          className="flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors"
          style={m === payMethod
            ? { background: T.accent, color: '#fff', border: 'none' }
            : { background: '#fff', color: T.muted, border: `1px solid ${T.border}` }}>
          {m === 'QR' ? 'QR / Bank' : 'Cash'}
        </button>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-white p-4">
      <h3 className="m-0 flex items-center gap-2 text-sm font-bold text-charcoal">
        <UserCheck size={15} style={{ color: T.accent }} /> In-Person Sale
      </h3>

      {!staffStudent ? (
        <>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <input placeholder="Search student ID, name, or email…" value={query} onChange={e => setQuery(e.target.value)}
              className="w-full rounded-md border border-border bg-cream py-2 pl-8 pr-3 text-[13px] outline-none" />
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
                        <p className="m-0 text-[13px] font-semibold text-ink">{u.name}</p>
                        <p className="m-0 mt-0.5 text-[11px] text-faint">{u.studentId} · {u.credits} cr</p>
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
                  <p className="m-0 text-[13px] font-bold text-charcoal">{staffStudent.name}</p>
                  <p className="m-0 mt-0.5 text-[11px] text-faint">{staffStudent.studentId}</p>
                </div>
              </div>
              <button onClick={() => { setStaffStudent(null); setStaffOrder([]) }}
                className="rounded-md border border-border bg-cream px-2 py-1 text-[11px] text-inv-muted">Change</button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-md p-2" style={{ background: T.cream }}>
                <p className="m-0 text-[10px] uppercase tracking-wide text-faint">Membership</p>
                <p className="m-0 mt-0.5 text-[13px] font-bold" style={{ color: staffStudent.membership === 'active' ? T.green : T.red }}>
                  {staffStudent.membership === 'active' ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className="rounded-md p-2" style={{ background: T.cream }}>
                <p className="m-0 text-[10px] uppercase tracking-wide text-faint">Credit Balance</p>
                <p className="m-0 mt-0.5 text-[13px] font-bold text-charcoal">{staffStudent.credits} cr</p>
              </div>
            </div>
          </div>

          <PricingRateCard />

          {staffStudent.membership !== 'active' ? (
            <div className="flex flex-col gap-2">
              <PayMethodToggle />
              <button onClick={() => onActivateMembership(payMethod)}
                className="flex items-center justify-center gap-2 rounded-md border-none py-2.5 text-[13px] font-bold text-white"
                style={{ background: T.red }}>
                <BadgeCheck size={14} /> Activate Membership — ${MEMBERSHIP_PLAN.price} → +{MEMBERSHIP_PLAN.bonusCredits} cr
              </button>
            </div>
          ) : (
            <button onClick={() => setShowTopUp(s => !s)}
              className="flex items-center justify-center gap-2 rounded-md border-none py-2.5 text-[13px] font-bold"
              style={{ background: T.amberLight, color: T.amber }}>
              <CreditCard size={14} /> Top Up Credits (cash or QR)
            </button>
          )}

          {showTopUp && (
            <div className="flex flex-col gap-2 rounded-md p-3" style={{ background: T.cream }}>
              <PayMethodToggle />
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-faint">$</span>
                <input type="number" min="1" placeholder="Amount paid" value={dollarAmount} onChange={e => setDollarAmount(e.target.value)}
                  className="flex-1 rounded-md border border-border bg-white px-2.5 py-1.5 text-[13px] outline-none" />
              </div>
              {dollarAmount > 0 && (
                <p className="m-0 text-xs text-inv-muted">= <strong style={{ color: T.charcoal }}>{creditsPreview} credits</strong> at {CREDIT_RATE}cr/$1</p>
              )}
              <button onClick={confirmTopUp} className="rounded-md border-none py-2 text-[13px] font-bold text-white" style={{ background: T.green }}>
                Charge ${dollarAmount || 0} via {payMethod} → +{creditsPreview} cr
              </button>
            </div>
          )}

          {/* Order summary */}
          <div className="flex flex-col gap-2 border-t border-stone pt-3">
            <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-faint">Current Order</p>
            {staffOrder.length === 0 ? (
              <p className="m-0 text-xs text-faint">Add items from the catalog to sell or lend.</p>
            ) : staffOrder.map(o => (
              <div key={o.item.id} className="flex items-center gap-2">
                <span className="flex-1 truncate text-xs text-ink">{o.item.name}</span>
                <span className="flex-shrink-0 text-[11px] text-faint">{o.item.type === 'Returnable' ? 'Borrow' : `${o.item.credits * o.qty} cr`}</span>
                {o.item.type === 'Consumable' && (
                  <>
                    <button onClick={() => setStaffOrder(prev => prev.map(x => x.item.id === o.item.id ? { ...x, qty: Math.max(1, x.qty - 1) } : x))}
                      className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full border border-border bg-white"><Minus size={9} /></button>
                    <span className="w-3 flex-shrink-0 text-center text-[11px]">{o.qty}</span>
                    <button onClick={() => setStaffOrder(prev => prev.map(x => x.item.id === o.item.id ? { ...x, qty: x.qty + 1 } : x))}
                      className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full border border-border bg-white"><Plus size={9} /></button>
                  </>
                )}
                <button onClick={() => setStaffOrder(prev => prev.filter(x => x.item.id !== o.item.id))} className="flex-shrink-0 border-none bg-transparent text-faint"><X size={12} /></button>
              </div>
            ))}
          </div>

          {staffOrder.length > 0 && (
            <>
              <div className="flex items-center justify-between border-t border-stone pt-3">
                <span className="text-sm text-inv-muted">Total</span>
                <span className="text-lg font-bold text-charcoal">{total} cr</span>
              </div>
              <button onClick={onCheckout}
                className="flex items-center justify-center gap-2 rounded-md border-none py-3 text-sm font-bold text-white" style={{ background: T.charcoal }}>
                <CheckCircle2 size={15} /> Complete Sale
              </button>
            </>
          )}
        </>
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

  const filtered = items.filter(i =>
    (filterCat === 'all' || i.category === filterCat) &&
    (filterType === 'all' || i.type === filterType) &&
    i.name.toLowerCase().includes(search.toLowerCase())
  )

  const addCart = (item, dueDate) => {
    if (!user || user.role !== 'user')        { showToast('Log in as a student to borrow or purchase.', 'error'); return }
    if (user.membership !== 'active')          { showToast('Active membership required.', 'error'); return }
    if (item.status !== 'available')           { showToast('This item is not currently available.', 'error'); return }
    setCart(prev => {
      const ex = prev.find(ci => ci.item.id === item.id)
      return ex ? prev.map(ci => ci.item.id === item.id ? { ...ci, qty: ci.qty + 1 } : ci) : [...prev, { item, qty: 1, dueDate }]
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
  const addToStaffOrder = (item) => {
    if (!staffStudent) { showToast('Select a student first.', 'error'); return }
    setStaffOrder(prev => {
      const ex = prev.find(o => o.item.id === item.id)
      if (ex) return item.type === 'Consumable' ? prev.map(o => o.item.id === item.id ? { ...o, qty: o.qty + 1 } : o) : prev
      return [...prev, { item, qty: 1 }]
    })
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
        cart: staffOrder.map(o => ({ itemId: o.item.id, qty: o.qty, action: o.item.type === 'Consumable' ? 'purchase' : 'borrow' })),
      })
      showToast(`Order complete for ${staffStudent.name}.`)
      setStaffStudent(prev => buyTotal > 0 ? { ...prev, credits: prev.credits - buyTotal } : prev)
      setStaffOrder([])
    } catch (err) {
      showToast(err.message || 'Sale failed.', 'error')
    }
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header — dark teal gradient banner */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(145deg, #0c4a6e 0%, #0e7490 55%, #0891b2 100%)',
        backgroundSize: '40px 40px, 40px 40px, cover',
        borderBottom: '1px solid rgba(8,145,178,0.2)',
      }}>
        <div style={{ position: 'absolute', top: '50%', right: '10%', transform: 'translateY(-50%)', width: 320, height: 220, background: 'radial-gradient(circle, rgba(8,145,178,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="mx-auto max-w-[1280px] px-5 pt-8 pb-7 sm:px-8 lg:px-12" style={{ position: 'relative', zIndex: 1 }}>
          {user && !isStaff && <PageBreadcrumb current="/catalog" />}
          <h1 style={{ margin: 0, fontSize: 'clamp(26px,4vw,40px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
            {isStaff ? 'Browse Items' : 'Browse Equipment'}
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.5)', maxWidth: 560 }}>
            {isStaff ? 'Manage inventory, or select a student to sell consumables and lend tools at the counter.' : 'Find what you need — borrow tools or purchase consumables with credits.'}
          </p>
        </div>
      </div>

    <div className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
      <div className={isStaff ? 'grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]' : ''}>
        {/* Main column — categories, search, filters, item grid */}
        <div className="min-w-0">
          <CategoryTiles items={items} filterCat={filterCat} setFilterCat={setFilterCat} />

          {/* Search + type filters */}
          <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative flex-1 sm:max-w-[360px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
              <input placeholder="Search by name…" value={search} onChange={e => setSearch(e.target.value)}
                className="w-full py-2.5 pl-8 pr-3 text-sm outline-none"
                style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10, color: '#0f172a', transition: 'border-color .15s' }}
                onFocus={e => e.target.style.borderColor = TEAL}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </div>
            <div className="inv-hscroll flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
              {TYPE_FILTERS.map(t => {
                const active = filterType === t.id
                return (
                  <button key={t.id} onClick={() => setFilterType(t.id)}
                    className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors"
                    style={active
                      ? { background: TEAL, color: '#fff', border: 'none' }
                      : { background: '#fff', color: '#64748b', border: '1.5px solid #e2e8f0' }}>
                    <t.Icon size={12} color={active ? '#fff' : '#94a3b8'} />
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          <p className="m-0 mb-3 text-[13px] font-medium" style={{ color: '#94a3b8' }}>{filtered.length} items</p>

          {/* Fixed column counts so cards stay equal-sized even with 1–2 results */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {filtered.map(item => (
              <ItemCard key={item.id} item={item} onView={setSelected} onAddCart={handleAddCart} user={user} onRequireAuth={onRequireAuth}
                staffMode={isStaff} staffStudent={staffStudent} onStaffAdd={addToStaffOrder} />
            ))}
          </div>
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
              style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: hasLong ? 780 : 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(15,23,42,0.18)' }}>

              {/* Mobile: image stacked ON TOP of the info. sm+: two columns when there's long content. */}
              <div className={`grid grid-cols-1 ${hasLong ? 'sm:grid-cols-[minmax(200px,40%)_1fr]' : ''}`} style={{ minHeight: 0 }}>

                {/* Image panel */}
                <div className="relative h-40 sm:h-auto" style={{ minHeight: 160 }}>
                  <ItemImage item={selected} cat={cat} size={60}
                    className={`h-full w-full rounded-t-[20px] ${hasLong ? 'sm:rounded-tr-none sm:rounded-l-[20px]' : ''}`} />
                  {/* Status + type badges */}
                  <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <Badge status={selected.status} small />
                    <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: selected.type === 'Returnable' ? '#e0f9fe' : '#f0fdf4', color: selected.type === 'Returnable' ? '#0891b2' : '#16a34a' }}>
                      {selected.type === 'Returnable' ? 'Borrowable' : 'Purchasable'}
                    </span>
                  </div>
                  {/* Credit chip */}
                  <div style={{ position: 'absolute', bottom: 12, right: 12, padding: '4px 10px', borderRadius: 8, fontSize: 13, fontWeight: 800, background: 'rgba(255,255,255,0.95)', color: '#0891b2', border: '1.5px solid rgba(8,145,178,0.3)', backdropFilter: 'blur(4px)' }}>
                    {selected.credits > 0 ? `${selected.credits} cr` : 'Free'}
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-col gap-3 p-4 sm:gap-4 sm:p-6" style={{ minHeight: 0 }}>
                  {/* Close */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -8 }}>
                    <button onClick={() => setSelected(null)} style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <X size={14} color="#64748b" />
                    </button>
                  </div>

                  {/* Title */}
                  <div>
                    {cat && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <cat.Icon size={13} color={cat.iconColor} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '.04em', textTransform: 'uppercase' }}>{cat.label}</span>
                      </div>
                    )}
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{selected.name}</h2>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: '#94a3b8' }}>{selected.room} · Zone {selected.zone}</p>
                  </div>

                  {/* Description */}
                  {selected.description && (
                    <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.65 }}>{selected.description}</p>
                  )}

                  {/* Stats grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                    {[
                      ['Stock', selected.stock],
                      ['Room',  selected.room],
                      ['Zone',  selected.zone],
                    ].map(([k, v]) => (
                      <div key={k} style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 12px', border: '1.5px solid #e2e8f0' }}>
                        <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em' }}>{k}</p>
                        <p style={{ margin: '3px 0 0', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{String(v)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Usage note */}
                  {selected.usage && (
                    <div style={{ background: '#f0fdff', borderRadius: 10, padding: '10px 14px', display: 'flex', gap: 10, border: '1px solid rgba(8,145,178,0.2)' }}>
                      <Info size={13} color="#0891b2" style={{ flexShrink: 0, marginTop: 2 }} />
                      <p style={{ margin: 0, fontSize: 12, color: '#0e7490', lineHeight: 1.55 }}>{selected.usage}</p>
                    </div>
                  )}

                  {/* CTA */}
                  <div style={{ marginTop: 'auto' }}>
                    {!isStaff && !user && onRequireAuth && (
                      <button onClick={onRequireAuth}
                        className="flex w-full items-center justify-center gap-2 py-2.5 text-[13px] sm:py-3 sm:text-sm"
                        style={{ background: '#0891b2', border: 'none', borderRadius: 12, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
                        <Lock size={13} /> Join to {selected.type === 'Returnable' ? 'Borrow' : 'Purchase'}
                      </button>
                    )}
                    {isStaff && (() => {
                      const enabled = !!staffStudent && selected.status === 'available' && selected.stock > 0
                      return (
                        <button onClick={() => { addToStaffOrder(selected); setSelected(null) }} disabled={!enabled}
                          className="w-full py-2.5 text-[13px] sm:py-3 sm:text-sm"
                          style={{ background: enabled ? '#0891b2' : '#f1f5f9', color: enabled ? '#fff' : '#94a3b8', border: 'none', borderRadius: 12, fontWeight: 700, cursor: enabled ? 'pointer' : 'not-allowed' }}>
                          {!staffStudent ? 'Select a student first' : enabled ? (selected.type === 'Returnable' ? 'Borrow for Student' : 'Add to Order') : `Not Available`}
                        </button>
                      )
                    })()}
                    {!isStaff && user?.role === 'user' && (() => {
                      const enabled = selected.status === 'available'
                      const isBorrow = selected.type === 'Returnable'
                      return (
                        <button onClick={() => { handleAddCart(selected); setSelected(null) }} disabled={!enabled}
                          className="w-full py-2.5 text-[13px] sm:py-3 sm:text-sm"
                          style={{ background: enabled ? '#0891b2' : '#f1f5f9', color: enabled ? '#fff' : '#94a3b8', border: 'none', borderRadius: 12, fontWeight: 700, cursor: enabled ? 'pointer' : 'not-allowed', transition: 'opacity .15s' }}>
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
            <div onClick={e => e.stopPropagation()} className="w-full max-w-[380px] rounded-2xl bg-white p-6">
              <h3 className="m-0 mb-1 flex items-center gap-2 font-heading text-base font-bold text-charcoal">
                <Calendar size={16} style={{ color: '#0891b2' }} /> Confirm Borrow
              </h3>
              <p className="m-0 mb-4 text-xs text-faint">{confirmBorrow.name}</p>
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg p-3" style={{ background: T.cream }}>
                  <p className="m-0 text-[10px] uppercase tracking-wide text-faint">Borrow Date</p>
                  <p className="m-0 mt-1 text-sm font-bold text-charcoal">{fmt(today)}</p>
                </div>
                <div className="rounded-lg p-3" style={{ background: T.cream }}>
                  <p className="m-0 mb-1 text-[10px] uppercase tracking-wide text-faint">Return Date</p>
                  <input type="date" min={minDue} value={borrowDueDate || fmt(defaultDue)}
                    onChange={e => setBorrowDueDate(e.target.value)}
                    className="w-full rounded-md border-none bg-transparent p-0 text-sm font-bold text-charcoal outline-none" />
                </div>
              </div>
              <p className="m-0 mb-3 text-xs text-inv-muted">Choose when you'll return this item. Staff still need to approve the request.</p>
              {/* Late-return rule — the student agrees to this before confirming */}
              <div className="mb-4 flex items-start gap-2 rounded-lg px-3 py-2.5" style={{ background: '#fef3c7', border: '1px solid #fde68a' }}>
                <AlertTriangle size={13} style={{ color: '#d97706', flexShrink: 0, marginTop: 1 }} />
                <p className="m-0 text-xs leading-snug" style={{ color: '#92400e' }}>
                  Late returns are charged <strong>{OVERDUE_RATE} credits per day</strong> after your chosen return date.
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setConfirmBorrow(null); setBorrowDueDate('') }}
                  className="flex-1 rounded-lg border py-2.5 text-sm font-semibold text-inv-muted" style={{ borderColor: T.border }}>
                  Cancel
                </button>
                <button onClick={() => { addCart(confirmBorrow, borrowDueDate || fmt(defaultDue)); setConfirmBorrow(null); setBorrowDueDate('') }}
                  className="flex-1 rounded-lg border-none py-2.5 text-sm font-bold text-white" style={{ background: '#0891b2' }}>
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
