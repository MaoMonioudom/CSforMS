import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, AlertTriangle, Clock, CheckCircle2, XCircle, RotateCcw, ShoppingBag, ClipboardList, CreditCard, X, Package2, Boxes, MessageSquare, BookOpen, Package, ArrowLeft } from 'lucide-react'
import { T } from '../lib/inventory/theme'
import { CATEGORIES } from '../lib/inventory/data'
import { useInventory } from '../lib/inventory/InventoryContext'
import { useAuth } from './AuthContext'
import { TopNav } from '../components/TopNav'
import { AppFooter } from '../components/AppFooter'
import { fetchNotifications, markNotificationRead as apiMarkOne, markAllNotificationsRead as apiMarkAll } from '../lib/notifications-data'
import { fmtDateTime } from '../lib/inventory/datetime'

// One notification feed for all three modules (Community, Learning,
// Inventory) — same page whether you land here from the top-nav bell or
// from inside the Inventory module (/inventory/notifications redirects
// here). Inventory-specific types keep their existing icon/color; anything
// else (e.g. Community's event_reminder) gets its own entry below, with a
// generic DEFAULT for whatever a future module adds.
const NOTIF_META = {
  low_stock:      { Icon: AlertTriangle, color: T.amber,  bg: T.amberLight },
  request:        { Icon: Clock,         color: T.blue,   bg: T.blueLight  },
  approved:       { Icon: CheckCircle2,  color: T.green,  bg: T.greenLight },
  denied:         { Icon: XCircle,       color: T.red,    bg: T.redLight   },
  overdue:        { Icon: AlertTriangle, color: T.red,    bg: T.redLight   },
  event_reminder: { Icon: MessageSquare, color: T.teal,   bg: T.tealLight  },
  DEFAULT:        { Icon: Bell,          color: T.purple, bg: T.purpleLight },
}

// Which module a notification_type came from — drives the Community/
// Learning/Inventory/System filter tabs below. Add an entry here whenever
// a new notification_type is introduced; anything unlisted falls to
// 'system' rather than silently disappearing from every module filter.
const NOTIF_MODULE = {
  event_reminder: 'community',
  low_stock:      'inventory',
  request:        'inventory',
  approved:       'inventory',
  denied:         'inventory',
  overdue:        'inventory',
}
const notifModule = (type) => NOTIF_MODULE[type] || 'system'

const ACTIVITY_META = {
  transaction:  { label: 'Transaction',     Icon: Package2,      color: T.blue,   bg: T.blueLight   },
  request:      { label: 'Borrow Request',  Icon: ClipboardList, color: T.purple, bg: T.purpleLight },
  credit_topup: { label: 'Credit Top-Up',   Icon: CreditCard,    color: T.teal,   bg: T.tealLight   },
}

// Top-level tabs — one per source module, plus All. My Borrows/Purchases/
// History/Requests are real Inventory records (not alert types from other
// modules), so they don't sit alongside Community/Learning/System — they're
// a second-level breakdown that only appears once "Inventory" is selected
// (see INVENTORY_SUB_FILTERS below and InventoryApp.jsx's
// /inventory/my-borrows redirect for how you land here from that module).
const FEED_FILTERS = [
  { id: 'all',       label: 'All',        Icon: Boxes },
  { id: 'system',    label: 'System',     Icon: Bell },
  { id: 'community', label: 'Community',  Icon: MessageSquare },
  { id: 'learning',  label: 'Learning',   Icon: BookOpen },
  { id: 'inventory', label: 'Inventory',  Icon: Package },
]

// Second-level tabs, shown only when the Inventory tab is active. There's no
// All/Alerts here — inventory alert notifications live under the top-level
// "All" filter; this row is purely the student's own activity records.
const INVENTORY_SUB_FILTERS = [
  { id: 'borrows',   label: 'My Borrows',   Icon: RotateCcw },
  { id: 'purchases', label: 'My Purchases', Icon: ShoppingBag },
  { id: 'requested', label: 'My Requests',  Icon: ClipboardList },
  { id: 'history',   label: 'History',      Icon: Clock },
]

// Every entry kind (notification, borrow/purchase, request, credit top-up)
// carries a real timestamp — always shown in full ("2:09 PM, 7-16-2026"),
// in Cambodia time, regardless of how recent it is. Module-scope (not just
// inside NotificationsPage) since DetailModal's itemList rendering
// (returnDate) needs it too.
const formatEntryDateTime = fmtDateTime

function DetailModal({ title, rows, status, onClose, itemList }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.white, borderRadius: 18, padding: '1.75rem 2rem', width: '100%', maxWidth: 460, maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: T.charcoal }}>{title}</h2>
          <button onClick={onClose} style={{ background: T.cream, border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <X size={14} color={T.muted} />
          </button>
        </div>
        {status && <div style={{ marginBottom: '1rem' }}><Badge status={status} /></div>}

        {itemList && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1rem' }}>
            {itemList.map((it, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: T.cream, borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: it.action === 'purchased' ? T.amberLight : T.blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {it.action === 'purchased' ? <ShoppingBag size={13} color={T.amber} /> : <RotateCcw size={13} color={T.blue} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.charcoal }}>{it.itemName}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: T.faint }}>
                    {it.category ? `${it.category} · ` : ''}
                    {it.action === 'purchased'
                      ? `Purchased${it.qty > 1 ? ` ×${it.qty}` : ''}${it.unitCredits != null ? ` · ${it.unitCredits} cr each` : ''} · ${it.credits ?? 0} cr`
                      : it.dueDate ? `Borrowed · due ${it.dueDate}` : 'Borrowed'}
                    {it.returnDate ? ` · Returned ${formatEntryDateTime(it.returnDate)}` : ''}
                    {it.condition ? ` · ${it.condition}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {rows && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rows.filter(([, v]) => v !== null && v !== undefined && v !== '').map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: `1px solid ${T.stone}` }}>
                <span style={{ fontSize: 12, color: T.faint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.charcoal, textAlign: 'right' }}>{String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Inline Badge (kept local — avoids importing the shared component into a file that
// also defines its own DetailModal styling conventions).
function Badge({ status }) {
  const map = {
    pending: { label: 'Pending', color: T.blue, bg: T.blueLight },
    active: { label: 'Active', color: T.amber, bg: T.amberLight },
    completed: { label: 'Completed', color: T.muted, bg: T.stone },
    purchased: { label: 'Purchased', color: T.teal, bg: T.tealLight },
    approved: { label: 'Approved', color: T.green, bg: T.greenLight },
    denied: { label: 'Declined', color: T.red, bg: T.redLight },
  }
  const s = map[status] || { label: status, color: T.muted, bg: T.stone }
  return <span style={{ background: s.bg, color: s.color, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{s.label}</span>
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { user: hubUser, loading: authLoading } = useAuth()
  const { user, borrows, requests, items = [] } = useInventory()

  const [notifications, setNotifications] = useState([])
  const [notifLoading, setNotifLoading] = useState(true)
  const isUser = user?.role === 'user'
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [invSubFilter, setInvSubFilter] = useState('borrows')

  // Wait for AuthContext to finish restoring the session before deciding
  // no one's logged in — otherwise a page refresh here always bounces
  // through /login even when the session is valid (user is briefly null).
  useEffect(() => {
    if (!authLoading && !hubUser) navigate('/login')
  }, [hubUser, authLoading, navigate])

  useEffect(() => {
    if (!hubUser) return
    fetchNotifications().then(setNotifications).finally(() => setNotifLoading(false))
  }, [hubUser])

  if (!hubUser || !user) return null

  // Optimistic local flip + server write-through.
  const markAll = () => {
    setNotifications(p => p.map(n => ({ ...n, read: true })))
    apiMarkAll().catch(() => {})
  }
  const markOne = (id) => {
    setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n))
    apiMarkOne(id).catch(() => {})
  }

  // Build one unified, chronological feed: system notifications + (for students)
  // their own borrow/purchase/request activity — all in a single list, no tabs.
  const notifEntries = notifications
    .map(n => ({ kind: 'notification', id: `n${n.id}`, raw: n, date: n.date, read: n.read }))

  // Items placed in the same checkout share an orderId — group them into one
  // "transaction" entry so a single click shows everything that was borrowed
  // or purchased together, instead of one fragmented row per item.
  const groupByOrder = (list) => {
    const groups = []
    const index = new Map()
    list.forEach(rec => {
      const key = rec.orderId || `single-${rec.id}`
      if (index.has(key)) { groups[index.get(key)].push(rec); return }
      index.set(key, groups.length)
      groups.push([rec])
    })
    return groups
  }

  const activityEntries = isUser ? [
    ...groupByOrder(borrows.filter(b => b.userId === user.id)).map(group => ({
      kind: 'transaction', id: `b${group[0].id}`, raw: group, date: group[0].date, read: true,
    })),
    ...groupByOrder(requests.filter(r => r.userId === user.id && r.type !== 'credit_topup')).map(group => ({
      kind: 'request', id: `r${group[0].id}`, raw: group, date: group[0].date, read: true,
    })),
    ...requests.filter(r => r.userId === user.id && r.type === 'credit_topup').map(r => ({
      kind: 'credit_topup', id: `r${r.id}`, raw: r, date: r.date, read: true,
    })),
  ] : []

  const feed = [...notifEntries, ...activityEntries].sort((a, b) => new Date(b.date) - new Date(a.date))

  const isPurchaseGroup = (g) => g.every(b => b.action === 'purchased')
  // A borrow group is "history" once nothing in it is still out.
  const isFinishedGroup = (g) => g.every(b => b.action === 'purchased' || b.status !== 'active')

  // Sub-filter predicates, shared between the Inventory tab's breakdown and
  // (now redundant top-level ids are gone) nothing else — kept as named
  // functions since "history" needs two conditions and reads better named.
  const isBorrowsEntry   = (e) => e.kind === 'transaction' && !isPurchaseGroup(e.raw) && !isFinishedGroup(e.raw)
  // My Purchases covers both completed purchases (transactions) and purchase
  // requests still waiting for staff approval.
  const isPurchasesEntry = (e) =>
    (e.kind === 'transaction' && isPurchaseGroup(e.raw)) ||
    (e.kind === 'request' && e.raw[0]?.type === 'purchase')
  const isHistoryEntry   = (e) => e.kind === 'transaction' && !isPurchaseGroup(e.raw) && isFinishedGroup(e.raw)
  const isRequestedEntry = (e) => e.kind === 'request' || e.kind === 'credit_topup'
  // Everything that "belongs to Inventory": its own alert types, plus every
  // borrow/purchase/request activity record (there's no such thing as
  // Community or Learning activity in this feed — it's all Inventory data).
  const isInventoryEntry = (e) =>
    (e.kind === 'notification' && notifModule(e.raw.type) === 'inventory') ||
    e.kind === 'transaction' || isRequestedEntry(e)

  const visibleFeed = feed.filter(e => {
    if (filter === 'all') return true
    if (filter === 'community' || filter === 'learning' || filter === 'system') {
      return e.kind === 'notification' && notifModule(e.raw.type) === filter
    }
    if (filter === 'inventory') {
      // Only the student's own activity records — inventory alert
      // notifications appear under the top-level "All" filter instead.
      if (!isInventoryEntry(e) || e.kind === 'notification') return false
      if (invSubFilter === 'borrows')   return isBorrowsEntry(e)
      if (invSubFilter === 'purchases') return isPurchasesEntry(e)
      if (invSubFilter === 'history')   return isHistoryEntry(e)
      if (invSubFilter === 'requested') return isRequestedEntry(e)
      return false
    }
    return false
  })

  // Category label + per-item credits for the detail breakdown.
  const enrich = (rec) => {
    const item = items.find(i => i.id === rec.itemId)
    const cat  = item && CATEGORIES.find(c => c.id === item.category)
    return { ...rec, category: cat?.label, unitCredits: item?.credits }
  }

  const openEntry = (e) => {
    if (e.kind === 'notification') markOne(e.raw.id)
    setSelected(e)
  }

  const NOTIF_TYPE_LABEL = {
    low_stock:      'Low Stock Alert',
    request:        'Request Update',
    approved:       'Approved',
    denied:         'Declined',
    overdue:        'Overdue Item',
    event_reminder: 'Event Reminder',
  }

  // "Today" / "Yesterday" / actual date — visibleFeed is already sorted
  // newest-first, so grouping consecutive same-date entries here just needs
  // one pass, no re-sorting.
  const dateGroupLabel = (dateStr) => {
    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    const diffDays = Math.round((startOfDay(new Date()) - startOfDay(new Date(dateStr))) / 86400000)
    if (diffDays <= 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  // Aggregate status across a transaction group — worst-case wins so an
  // overdue/pending item isn't hidden behind an already-returned one.
  const groupStatus = (group) => {
    if (group.some(b => b.action !== 'purchased' && b.status === 'active' && b.dueDate && new Date(b.dueDate) < new Date())) return 'overdue'
    if (group.some(b => b.action !== 'purchased' && b.status === 'active')) return 'active'
    if (group.every(b => b.action === 'purchased' || b.status === 'completed')) return group.every(b => b.action === 'purchased') ? 'purchased' : 'completed'
    return group[0].status
  }

  // visibleFeed is already sorted newest-first, so bucketing consecutive
  // same-date entries into date-labeled sections is a single pass.
  const dateGroups = []
  for (const e of visibleFeed) {
    const label = dateGroupLabel(e.date)
    const last = dateGroups[dateGroups.length - 1]
    if (last && last.label === label) last.entries.push(e)
    else dateGroups.push({ label, entries: [e] })
  }

  return (
    <div style={{ background: T.cream, minHeight: '100vh' }}>
      {/* This page is reached from every module (top-nav bell, inventory's own
          nav), not just from inside InventoryApp/InventoryAdminArea — those
          normally provide TopNav themselves, but at this shared route nothing
          else does, so it's rendered here unconditionally. */}
      <TopNav />

      {/* Dark teal header banner — students only (admin layout already shows a TopBar title) */}
      {isUser && (
        <div style={{
          position: 'relative', overflow: 'hidden',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(145deg, #0c4a6e 0%, #0e7490 55%, #0891b2 100%)',
          backgroundSize: '40px 40px, 40px 40px, cover',
          borderBottom: '1px solid rgba(8,145,178,0.2)',
        }}>
          <div className="px-5 pt-8 pb-7 sm:px-8 lg:px-12" style={{ maxWidth: 1280, margin: '0 auto' }}>
            <button onClick={() => navigate(-1)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <ArrowLeft size={14} /> Back
            </button>
            <h1 style={{ margin: 0, fontSize: 'clamp(24px,3.5vw,34px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
              Notifications
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
              Alerts, requests, and your borrow & purchase history.
            </p>
          </div>
        </div>
      )}

      <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-12" style={{ maxWidth: 1280, margin: '0 auto' }}>
      {!isUser && (
        <button onClick={() => navigate(-1)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12, padding: '6px 12px', borderRadius: 8, background: T.white, border: `1px solid ${T.border}`, color: T.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <ArrowLeft size={14} /> Back
        </button>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        {!isUser
          ? <h1 className="m-0 font-heading text-lg font-bold text-charcoal">Notifications</h1>
          : <span />}
        <button onClick={markAll} style={{ background: 'none', border: 'none', color: '#0e7490', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Mark all as read
        </button>
      </div>

      {isUser && (
        <div className="inv-hscroll mb-4 flex items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
          {FEED_FILTERS.map(f => {
            const active = filter === f.id
            return (
              <button key={f.id} onClick={() => { setFilter(f.id); setInvSubFilter('borrows') }}
                className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
                style={{ border: active ? 'none' : `1px solid ${T.border}`, background: active ? '#0891b2' : T.white, color: active ? '#fff' : T.muted }}>
                <f.Icon size={12} color={active ? '#fff' : T.faint} />
                {f.label}
              </button>
            )
          })}

          {/* Inventory's own borrow/purchase/request/history breakdown — shown
              inline on the same row right after the module tabs, only once
              Inventory is the active filter, instead of a separate row below. */}
          {filter === 'inventory' && (
            <>
              <div style={{ width: 1, height: 18, background: T.border, flexShrink: 0, margin: '0 2px' }} />
              {INVENTORY_SUB_FILTERS.map(f => {
                const active = invSubFilter === f.id
                return (
                  <button key={f.id} onClick={() => setInvSubFilter(f.id)}
                    className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors"
                    style={{ border: `1px solid ${active ? T.teal : T.border}`, background: active ? T.tealLight : 'transparent', color: active ? T.teal : T.faint }}>
                    <f.Icon size={11} color={active ? T.teal : T.faint} />
                    {f.label}
                  </button>
                )
              })}
            </>
          )}
        </div>
      )}

      {notifLoading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: T.faint }}>
          <p style={{ margin: 0, fontSize: 15 }}>Loading…</p>
        </div>
      ) : visibleFeed.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '5rem 1rem', color: T.faint }}>
          <Bell size={48} strokeWidth={1} color={T.borderDark} style={{ marginBottom: 16 }} />
          <p style={{ margin: 0, fontSize: 15 }}>Nothing here yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {dateGroups.map(dg => (
          <div key={dg.label}>
            <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: T.faint, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{dg.label}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {dg.entries.map(e => {
            if (e.kind === 'notification') {
              const n = e.raw
              const cfg = NOTIF_META[n.type] || NOTIF_META.DEFAULT
              return (
                <div key={e.id} onClick={() => openEntry(e)}
                  style={{ background: n.read ? T.white : T.cream, border: `1px solid ${n.read ? T.border : T.borderDark}`, borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <cfg.Icon size={16} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, color: T.charcoal, fontWeight: n.read ? 400 : 600 }}>{n.message}</p>
                    <p style={{ margin: '3px 0 0', fontSize: 12, color: T.faint }}>{formatEntryDateTime(n.date)}</p>
                  </div>
                  {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.red, flexShrink: 0, marginTop: 4 }} />}
                </div>
              )
            }

            if (e.kind === 'transaction') {
              const group = e.raw
              const meta = ACTIVITY_META.transaction
              const title = group.length === 1 ? group[0].itemName : `${group.length} items`
              return (
                <div key={e.id} onClick={() => openEntry(e)}
                  style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <meta.Icon size={16} color={meta.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, color: T.charcoal, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</p>
                    <p style={{ margin: '3px 0 0', fontSize: 12, color: T.faint }}>
                      {group.length > 1 ? group.map(b => b.itemName).join(', ') : (group[0].action === 'purchased' ? 'Purchased' : 'Borrowed')} · {formatEntryDateTime(e.date)}
                    </p>
                  </div>
                  <Badge status={groupStatus(group)} />
                </div>
              )
            }

            if (e.kind === 'request') {
              const group = e.raw
              const isPurchaseReq = group[0]?.type === 'purchase'
              const meta = isPurchaseReq ? ACTIVITY_META.transaction : ACTIVITY_META.request
              const reqLabel = isPurchaseReq ? 'Purchase Request' : 'Borrow Request'
              const title = group.length === 1 ? group[0].itemName : `${group.length} item ${reqLabel.toLowerCase()}`
              return (
                <div key={e.id} onClick={() => openEntry(e)}
                  style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <meta.Icon size={16} color={meta.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, color: T.charcoal, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</p>
                    <p style={{ margin: '3px 0 0', fontSize: 12, color: T.faint }}>{reqLabel} · {formatEntryDateTime(e.date)}</p>
                  </div>
                  <Badge status={group[0].status} />
                </div>
              )
            }

            // credit_topup
            const meta = ACTIVITY_META.credit_topup
            return (
              <div key={e.id} onClick={() => openEntry(e)}
                style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <meta.Icon size={16} color={meta.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14, color: T.charcoal, fontWeight: 600 }}>Credit Top-Up — ${e.raw.amountUSD}</p>
                  <p style={{ margin: '3px 0 0', fontSize: 12, color: T.faint }}>{meta.label} · {formatEntryDateTime(e.date)}</p>
                </div>
                <Badge status={e.raw.status} />
              </div>
            )
          })}
            </div>
          </div>
          ))}
        </div>
      )}

      {selected && selected.kind === 'notification' && (
        <DetailModal
          title={NOTIF_TYPE_LABEL[selected.raw.type] || 'Notification'}
          onClose={() => setSelected(null)}
          rows={[
            ['Message', selected.raw.message],
            ['Date', formatEntryDateTime(selected.raw.date)],
            ['Status', selected.raw.read ? 'Read' : 'Unread'],
          ]}
        />
      )}
      {selected && selected.kind === 'request' && (() => {
        const isPurchaseReq = selected.raw[0]?.type === 'purchase'
        return (
          <DetailModal
            title={selected.raw.length === 1
              ? selected.raw[0].itemName
              : `${isPurchaseReq ? 'Purchase' : 'Borrow'} Request — ${selected.raw.length} items`}
            status={selected.raw[0].status}
            onClose={() => setSelected(null)}
            itemList={selected.raw.map(r => enrich({ itemName: r.itemName, itemId: r.itemId, action: isPurchaseReq ? 'purchased' : 'borrowed', dueDate: r.dueDate, qty: r.qty }))}
            rows={[
              ['Requested', formatEntryDateTime(selected.raw[0].date)],
              ['Approved', selected.raw[0].approvedAt ? formatEntryDateTime(selected.raw[0].approvedAt) : null],
              ['Purpose', isPurchaseReq ? null : selected.raw[0].note],
            ]}
          />
        )
      })()}
      {selected && selected.kind === 'credit_topup' && (
        <DetailModal
          title="Credit Top-Up Request"
          status={selected.raw.status}
          onClose={() => setSelected(null)}
          rows={[
            ['Requested Amount', `$${selected.raw.amountUSD}`],
            ['Requested', formatEntryDateTime(selected.raw.date)],
            ['Approved', selected.raw.approvedAt ? formatEntryDateTime(selected.raw.approvedAt) : null],
          ]}
        />
      )}
      {selected && selected.kind === 'transaction' && (() => {
        const totalCr = selected.raw.reduce((s, b) => s + (b.credits || 0), 0)
        return (
          <DetailModal
            title={selected.raw.length === 1 ? selected.raw[0].itemName : `Transaction — ${selected.raw.length} items`}
            status={groupStatus(selected.raw)}
            onClose={() => setSelected(null)}
            itemList={selected.raw.map(enrich)}
            rows={[
              ['Date', formatEntryDateTime(selected.raw[0].date)],
              ['Total', totalCr > 0 ? `${totalCr} cr` : null],
              ['Approved By', selected.raw[0].approvedBy ? `Staff #${selected.raw[0].approvedBy}` : (selected.raw[0].soldBy ? `Staff #${selected.raw[0].soldBy}` : null)],
            ]}
          />
        )
      })()}
      </div>
      {isUser && <AppFooter />}
    </div>
  )
}
