import { useState } from 'react'
import { RotateCcw, AlertTriangle, ChevronDown } from 'lucide-react'
import GradientStatCard from '../../../components/inventory/ui/GradientStatCard'
import DonutChart from '../../../components/inventory/ui/DonutChart'
import BarChart from '../../../components/inventory/ui/BarChart'
import Badge from '../../../components/inventory/ui/Badge'
import DateRangeFilter, { inRange } from '../../../components/inventory/ui/DateRangeFilter'
import { T } from '../../../lib/inventory/theme'
import { CATEGORIES } from '../../../lib/inventory/data'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function AdminDashboard({ items, users, borrows, requests, payments = [] }) {
  const [expanded, setExpanded] = useState(null)
  const [range, setRange] = useState('all')

  const total      = items.length
  const borrowed   = items.filter(i => i.status === 'borrowed').length
  const maint      = items.filter(i => i.status === 'maintenance').length
  const members    = users.filter(u => u.role === 'user' && u.membership === 'active').length
  const pending    = requests.filter(r => r.status === 'pending').length
  const lowStock   = items.filter(i => i.stock <= i.minStock)

  const rangedBorrows = borrows.filter(b => inRange(b.date, range))

  // Weekly activity — borrows vs purchases grouped by weekday, built from real borrow records
  // within the selected date range.
  const weekly = WEEKDAYS.map(label => ({ label, a: 0, b: 0 }))
  rangedBorrows.forEach(b => {
    const day = new Date(b.date).getDay()
    if (Number.isNaN(day)) return
    if (b.action === 'purchased') weekly[day].b += 1
    else weekly[day].a += 1
  })

  const catData = CATEGORIES.map(c => ({ label: c.label, value: items.filter(i => i.category === c.id).length, color: c.iconColor }))
    .filter(d => d.value > 0)

  // Top items within the selected range — falls back to each item's lifetime
  // borrowCount when a range has no activity, so the panel isn't empty on load.
  const rangedCounts = {}
  rangedBorrows.forEach(b => { rangedCounts[b.itemId] = (rangedCounts[b.itemId] || 0) + 1 })
  const hasRangedActivity = Object.keys(rangedCounts).length > 0
  const topItems = [...items]
    .sort((a, b) => (hasRangedActivity ? (rangedCounts[b.id] || 0) - (rangedCounts[a.id] || 0) : (b.borrowCount || 0) - (a.borrowCount || 0)))
    .slice(0, 5)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Gradient stat cards */}
      <div className="mb-6 grid gap-3 sm:gap-4 lg:mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <GradientStatCard label="Total Items" value={total} period="All time" trend={4.2} gradient="linear-gradient(135deg,#DBEAFE,#EEF2FF)" />
        <GradientStatCard label="Borrowed" value={borrowed} period="Today" trend={2.8} gradient="linear-gradient(135deg,#FEF3C7,#FFF7ED)" />
        <GradientStatCard label="Maintenance" value={maint} period="Today" trend={-1.5} gradient="linear-gradient(135deg,#FEE2E6,#FFF1F2)" />
        <GradientStatCard label="Active Members" value={members} period="This month" trend={6.1} gradient="linear-gradient(135deg,#DCFCE7,#F0FDF4)" />
        <GradientStatCard label="Pending Requests" value={pending} period="Today" trend={pending > 0 ? 3.4 : 0} gradient="linear-gradient(135deg,#EDE9FE,#F5F3FF)" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr] lg:mb-6">
        {/* Weekly activity chart */}
        <div className="rounded-2xl border border-border bg-white p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="m-0 text-[15px] font-semibold text-charcoal">Weekly Activity</h3>
            <DateRangeFilter value={range} onChange={setRange} />
          </div>
          <BarChart data={weekly} seriesA="Borrowed" seriesB="Purchased" colorA={T.blue} colorB={T.green} />
        </div>

        {/* Inventory by category — donut */}
        <div className="rounded-2xl border border-border bg-white p-4 sm:p-6">
          <h3 className="m-0 mb-4 text-[15px] font-semibold text-charcoal">Inventory by Category</h3>
          <DonutChart data={catData} />
          <div className="mt-4 flex flex-col gap-1.5">
            {catData.map(d => (
              <div key={d.label} className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: d.color }} />
                <span className="flex-1 truncate text-inv-muted">{d.label}</span>
                <span className="font-semibold text-charcoal">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        {/* Top items table — expandable rows */}
        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          <div className="border-b border-stone px-4 py-3.5 sm:px-6">
            <h3 className="m-0 text-[15px] font-semibold text-charcoal">Top Borrowed Items</h3>
          </div>
          {topItems.map(item => {
            const cat = CATEGORIES.find(c => c.id === item.category)
            const isOpen = expanded === item.id
            return (
              <div key={item.id} className="border-b border-stone last:border-b-0">
                <button onClick={() => setExpanded(isOpen ? null : item.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-cream sm:px-6">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: cat?.color || T.stone }}>
                    {cat && <cat.Icon size={16} color={cat.iconColor} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 truncate text-[13px] font-medium text-ink">{item.name}</p>
                    <p className="m-0 mt-0.5 truncate text-[11px] text-faint">{cat?.label}</p>
                  </div>
                  <span className="hidden text-xs text-inv-muted sm:block">{hasRangedActivity ? (rangedCounts[item.id] || 0) : (item.borrowCount || 0)} borrows</span>
                  <Badge status={item.status} small />
                  <ChevronDown size={14} className={`flex-shrink-0 text-faint transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`grid overflow-hidden transition-all duration-200 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    <div className="grid grid-cols-2 gap-3 px-4 pb-4 sm:grid-cols-4 sm:px-6">
                      {[['Stock', item.stock], ['Min Stock', item.minStock], ['Credits', item.credits], ['Condition', item.condition]].map(([k, v]) => (
                        <div key={k} className="rounded-md p-2" style={{ background: T.cream }}>
                          <p className="m-0 text-[10px] uppercase tracking-wide text-faint">{k}</p>
                          <p className="m-0 mt-0.5 text-[13px] font-semibold text-charcoal">{String(v)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex flex-col gap-4">
          {/* Low stock */}
          <div className="rounded-2xl border border-border bg-white p-4 sm:p-6">
            <h3 className="m-0 mb-3 flex items-center gap-2 text-[15px] font-semibold text-charcoal">
              <AlertTriangle size={15} color={T.amber} /> Low Stock
            </h3>
            {lowStock.length === 0 ? (
              <p className="text-[13px] text-faint">All items well-stocked.</p>
            ) : lowStock.map(item => (
              <div key={item.id} className="flex items-center justify-between border-b border-stone py-1.5 last:border-b-0">
                <span className="text-[13px] text-ink">{item.name}</span>
                <span className="text-xs font-bold text-red">{item.stock} left</span>
              </div>
            ))}
          </div>

          {/* Recent activity */}
          <div className="rounded-2xl border border-border bg-white p-4 sm:p-6">
            <h3 className="m-0 mb-3 text-[15px] font-semibold text-charcoal">Recent Activity</h3>
            {rangedBorrows.slice(-3).reverse().map(b => (
              <div key={b.id} className="mb-2.5 flex items-start gap-2.5 last:mb-0">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md" style={{ background: b.status === 'completed' ? T.greenLight : T.amberLight }}>
                  <RotateCcw size={13} color={b.status === 'completed' ? T.green : T.amber} />
                </div>
                <div className="min-w-0">
                  <p className="m-0 truncate text-[13px] font-medium text-ink">{b.itemName}</p>
                  <p className="m-0 text-xs text-faint">{b.action} · {b.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent transactions — borrows/purchases, credit payments, and
          pending/approved requests, all in one feed ── */}
      <TransactionsPanel borrows={borrows} users={users} items={items} payments={payments} requests={requests} />
    </div>
  )
}

const TXN_PAGE_SIZE = 10

// Credit-service payment types not already represented by a borrow/purchase
// record (Item Purchase / Item Loan share an orderId with a borrow entry,
// so including them here would just duplicate that row).
const CREDIT_PAYMENT_TYPES = ['Membership Activation', 'Membership Credit Top-Up', 'Document Printing', '3D Printing']

function requestLabel(req) {
  if (req.type === 'credit_topup') return `Credit Top-Up — $${req.amountUSD}`
  if (req.type === 'printing')     return `Document Printing — ${req.pages} page${req.pages === 1 ? '' : 's'}`
  if (req.type === '3d_printing')  return `3D Print Job — ${req.filamentName || 'filament TBD'}`
  return req.itemName
}

// Unified recent-transactions feed: borrow/purchase groups (from `borrows`),
// credit-service payments (from `payments`), and pending/approved requests
// not yet reflected elsewhere (from `requests`) — each row expands inline
// (no side panel, no separate View button) to list every item's name,
// category, and quantity.
function TransactionsPanel({ borrows, users, items, payments, requests }) {
  const [page, setPage] = useState(1)
  const [typeTab, setTypeTab] = useState('All')
  const [expandedKey, setExpandedKey] = useState(null)

  const getUser = (id) => users.find(u => u.id === id)
  const getProduct = (itemId) => items.find(i => i.id === itemId)
  const getCategory = (itemId) => {
    const product = getProduct(itemId)
    return product ? CATEGORIES.find(c => c.id === product.category)?.label : null
  }

  // ── Borrow / purchase groups ──────────────────────────────────────────
  const borrowGroups = []
  const seen = new Map()
  borrows.forEach(b => {
    const key = b.orderId || `single-${b.id}`
    if (seen.has(key)) { borrowGroups[seen.get(key)].raw.push(b); return }
    seen.set(key, borrowGroups.length)
    borrowGroups.push({ key: `bw-${key}`, userId: b.userId, date: b.date, raw: [b] })
  })
  const groupStatus = (g) => {
    const active = g.raw.filter(b => b.action !== 'purchased' && b.status === 'active')
    if (active.some(b => b.dueDate && new Date(b.dueDate) < new Date())) return 'overdue'
    if (active.length > 0) return 'active'
    return g.raw.every(b => b.action === 'purchased') ? 'purchased' : 'completed'
  }
  const borrowEntries = borrowGroups.map(g => ({
    key: g.key, userId: g.userId, date: g.date,
    type: g.raw.every(b => b.action === 'purchased') ? 'Purchase' : 'Borrow',
    status: groupStatus(g),
    // Borrowing itself isn't charged (only late/damaged penalties, handled
    // separately in Borrow Tracker) — so a Borrow item's unit/total is 0.
    // Purchases keep their real recorded credit cost.
    items: g.raw.map(b => {
      const qty = b.qty || 1
      const unit = b.action === 'purchased' ? (b.credits != null ? Math.round(b.credits / qty) : (getProduct(b.itemId)?.credits ?? 0)) : 0
      return { name: b.itemName, category: getCategory(b.itemId), qty, unit, total: unit * qty, currency: 'cr' }
    }),
  }))

  // ── Credit-service payments ───────────────────────────────────────────
  const paymentEntries = payments
    .filter(p => CREDIT_PAYMENT_TYPES.includes(p.type))
    .map(p => ({
      key: `pay-${p.id}`, userId: null, studentName: p.customerName, studentId: p.customerId, date: p.date,
      type: 'Credit', status: p.status === 'Completed' ? 'pay_completed' : 'pay_pending',
      items: [{ name: p.type, category: 'Credit Service', qty: 1, unit: p.amount, total: p.amount, currency: p.currency === 'USD' ? '$' : 'cr' }],
    }))

  // ── Pending / approved requests not yet turned into a borrow or payment ──
  const openRequests = requests.filter(r => r.status === 'pending' || r.status === 'awaiting_weight' || r.status === 'approved')
  const reqGroups = []
  const reqSeen = new Map()
  const reqOthers = []
  openRequests.forEach(r => {
    if (r.type === 'borrow') {
      const key = r.orderId || `single-${r.id}`
      if (reqSeen.has(key)) { reqGroups[reqSeen.get(key)].group.push(r); return }
      reqSeen.set(key, reqGroups.length)
      reqGroups.push({ key: `req-${key}`, group: [r] })
    } else {
      reqOthers.push(r)
    }
  })
  const requestValue = (req) => {
    if (req.type === 'credit_topup') return { unit: req.amountUSD, currency: '$' }
    if (req.type === 'printing')     return { unit: req.credits ?? 0, currency: 'cr' }
    if (req.type === '3d_printing')  return { unit: req.credits ?? 0, currency: 'cr' }
    return { unit: 0, currency: 'cr' }
  }
  const requestEntries = [
    ...reqGroups.map(g => ({
      key: g.key, userId: g.group[0].userId, date: g.group[0].date, type: 'Borrow',
      status: g.group[0].status === 'approved' ? 'approved' : 'pending',
      // Same rule as approved borrows — a Borrow item isn't charged, so 0/0.
      items: g.group.map(r => ({ name: r.itemName, category: getCategory(r.itemId), qty: r.qty || 1, unit: 0, total: 0, currency: 'cr' })),
    })),
    ...reqOthers.map(r => {
      const v = requestValue(r)
      return {
        key: `req-${r.id}`, userId: r.userId, date: r.date, type: 'Credit',
        status: r.status === 'approved' ? 'approved' : 'pending',
        items: [{ name: requestLabel(r), category: 'Credit Service', qty: 1, unit: v.unit, total: v.unit, currency: v.currency }],
      }
    }),
  ]

  const allEntries = [...borrowEntries, ...paymentEntries, ...requestEntries]
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const filtered = typeTab === 'All' ? allEntries : allEntries.filter(e => e.type === typeTab)
  const totalPages = Math.max(1, Math.ceil(filtered.length / TXN_PAGE_SIZE))
  const visible = filtered.slice((page - 1) * TXN_PAGE_SIZE, page * TXN_PAGE_SIZE)

  const TYPE_STYLE = {
    Borrow:   { bg: T.blueLight, fg: T.blue },
    Purchase: { bg: T.amberLight, fg: T.amber },
    Credit:   { bg: T.purpleLight, fg: T.purple },
  }

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-white lg:mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone px-4 py-4 sm:px-6">
        <div>
          <h3 className="m-0 text-[15px] font-bold text-charcoal">Recent Transactions</h3>
          <p className="m-0 mt-0.5 text-xs text-faint">Borrows &amp; purchases, credit payments, and pending/approved requests — click a row for item details.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['All', 'Borrow', 'Purchase', 'Credit'].map(t => (
            <button key={t} onClick={() => { setTypeTab(t); setPage(1) }}
              className="rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
              style={t === typeTab
                ? { background: '#0891b2', color: '#fff', border: 'none' }
                : { background: '#fff', color: T.muted, border: `1px solid ${T.border}` }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 760 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.8fr 2.2fr 1fr 1fr 24px', gap: 10, padding: '10px 24px', background: T.cream }}>
            {['Student Name', 'Transaction', 'Items', 'Date', 'Status', ''].map(h => (
              <span key={h} style={{ color: T.faint, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="m-0 p-8 text-center text-sm text-faint">No transactions yet.</p>
          ) : visible.map(e => {
            const u = e.userId != null ? getUser(e.userId) : null
            const studentName = u?.name || e.studentName || `User #${e.userId}`
            const studentId = u?.studentId || e.studentId
            const isOpen = expandedKey === e.key
            const ts = TYPE_STYLE[e.type]
            return (
              <div key={e.key}>
                <div onClick={() => setExpandedKey(isOpen ? null : e.key)}
                  style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.8fr 2.2fr 1fr 1fr 24px', gap: 10, padding: '12px 24px', alignItems: 'center', borderTop: `1px solid ${T.stone}`, cursor: 'pointer' }}
                  className="hover:bg-cream">
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{studentName}</p>
                    {studentId && <p style={{ margin: 0, fontSize: 10, color: T.faint }}>{studentId}</p>}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999, width: 'fit-content', background: ts.bg, color: ts.fg }}>
                    {e.type}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 12, color: T.charcoal, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.items.length === 1 ? e.items[0].name : `${e.items.length} items`}
                    </p>
                  </div>
                  <span style={{ fontSize: 12, color: T.muted }}>{e.date}</span>
                  <div><Badge status={e.status} small /></div>
                  <ChevronDown size={14} color={T.faint} style={{ transition: 'transform .15s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
                </div>

                {/* Inline expand — clean item table, no card/panel */}
                {isOpen && (() => {
                  const grandTotal = e.items.reduce((s, it) => s + (it.total || 0), 0)
                  const currency = e.items[0]?.currency || 'cr'
                  return (
                    <div style={{ padding: '0 24px 14px 24px', background: T.cream, borderTop: `1px solid ${T.stone}` }} onClick={ev => ev.stopPropagation()}>
                      <div style={{ marginTop: 12, background: '#fff', border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.3fr 0.6fr 0.9fr 0.9fr', gap: 8, padding: '8px 14px', background: T.cream, borderBottom: `1px solid ${T.border}` }}>
                          {['Item', 'Category', 'Qty', 'Unit Credit', 'Total'].map((h, i) => (
                            <span key={h} style={{ fontSize: 10, fontWeight: 800, color: T.faint, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: i >= 2 ? 'right' : 'left' }}>{h}</span>
                          ))}
                        </div>
                        {e.items.map((it, i) => (
                          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1.3fr 0.6fr 0.9fr 0.9fr', gap: 8, padding: '9px 14px', borderBottom: i === e.items.length - 1 ? 'none' : `1px solid ${T.stone}` }}>
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: T.charcoal, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.name}</span>
                            <span style={{ fontSize: 12, color: T.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.category || '—'}</span>
                            <span style={{ fontSize: 12, color: T.muted, textAlign: 'right' }}>{it.qty}</span>
                            <span style={{ fontSize: 12, color: T.muted, textAlign: 'right' }}>{it.currency === '$' ? '$' : ''}{it.unit}{it.currency === 'cr' ? ' cr' : ''}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: T.charcoal, textAlign: 'right' }}>{it.currency === '$' ? '$' : ''}{it.total}{it.currency === 'cr' ? ' cr' : ''}</span>
                          </div>
                        ))}
                        {e.items.length > 1 && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '9px 14px', background: T.cream, borderTop: `1px solid ${T.border}` }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: T.faint, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transaction Total</span>
                            <span style={{ fontSize: 13, fontWeight: 800, color: T.charcoal }}>{currency === '$' ? '$' : ''}{grandTotal}{currency === 'cr' ? ' cr' : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })()}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-stone px-4 py-3 sm:px-6">
        <span className="text-xs text-faint">Showing {visible.length} of {filtered.length} transactions</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="rounded-md border border-border px-2.5 py-1 text-xs text-inv-muted disabled:opacity-40">Prev</button>
          <span className="px-2 text-xs text-ink">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="rounded-md border border-border px-2.5 py-1 text-xs text-inv-muted disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  )
}
