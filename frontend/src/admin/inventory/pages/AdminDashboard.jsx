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

export default function AdminDashboard({ items, users, borrows, requests }) {
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

      {/* ── Borrow & Purchase transactions — paginated like the payment list ── */}
      <TransactionsPanel borrows={borrows} users={users} />
    </div>
  )
}

const TXN_PAGE_SIZE = 10

// All borrow/purchase activity grouped into transactions, newest first,
// with next/prev paging.
function TransactionsPanel({ borrows, users }) {
  const [page, setPage] = useState(1)
  const [typeTab, setTypeTab] = useState('All')

  const getUser = (id) => users.find(u => u.id === id)

  const groups = []
  const seen = new Map()
  borrows.forEach(b => {
    const key = b.orderId || `single-${b.id}`
    if (seen.has(key)) { groups[seen.get(key)].items.push(b); return }
    seen.set(key, groups.length)
    groups.push({ key, userId: b.userId, date: b.date, items: [b] })
  })
  groups.sort((a, b) => new Date(b.date) - new Date(a.date))

  const groupType = (g) => g.items.every(b => b.action === 'purchased') ? 'Purchase' : 'Borrow'
  const filtered = typeTab === 'All' ? groups : groups.filter(g => groupType(g) === typeTab)
  const totalPages = Math.max(1, Math.ceil(filtered.length / TXN_PAGE_SIZE))
  const visible = filtered.slice((page - 1) * TXN_PAGE_SIZE, page * TXN_PAGE_SIZE)

  const groupStatus = (g) => {
    const active = g.items.filter(b => b.action !== 'purchased' && b.status === 'active')
    if (active.some(b => b.dueDate && new Date(b.dueDate) < new Date())) return 'overdue'
    if (active.length > 0) return 'active'
    return g.items.every(b => b.action === 'purchased') ? 'purchased' : 'completed'
  }

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-white lg:mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone px-4 py-4 sm:px-6">
        <h3 className="m-0 text-[15px] font-bold text-charcoal">Borrow &amp; Purchase Transactions</h3>
        <div className="flex flex-wrap gap-1.5">
          {['All', 'Borrow', 'Purchase'].map(t => (
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

      {visible.length === 0 ? (
        <p className="m-0 p-8 text-center text-sm text-faint">No transactions yet.</p>
      ) : visible.map(g => {
        const u = getUser(g.userId)
        return (
          <div key={g.key} className="flex items-center gap-3 border-b border-stone px-4 py-3 last:border-b-0 sm:gap-4 sm:px-6">
            <div className="min-w-0 flex-1">
              <p className="m-0 truncate text-[13px] font-semibold text-ink">{u?.name || `User #${g.userId}`}{u?.studentId ? ` (${u.studentId})` : ''}</p>
              <p className="m-0 mt-0.5 truncate text-[11px] text-faint">
                {g.items.map(b => b.itemName + (b.qty > 1 ? ` ×${b.qty}` : '')).join(', ')}
              </p>
            </div>
            <span className="hidden flex-shrink-0 text-xs text-inv-muted sm:block">{g.date}</span>
            <span className="flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold"
              style={groupType(g) === 'Purchase' ? { background: T.amberLight, color: T.amber } : { background: T.blueLight, color: T.blue }}>
              {groupType(g)}
            </span>
            <div className="flex-shrink-0"><Badge status={groupStatus(g)} small /></div>
          </div>
        )
      })}

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
