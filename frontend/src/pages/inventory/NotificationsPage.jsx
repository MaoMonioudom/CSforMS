import { useState } from 'react'
import { Bell, AlertTriangle, Clock, CheckCircle2, XCircle, RotateCcw, ShoppingBag, ClipboardList, CreditCard, X, Package2, Boxes } from 'lucide-react'
import { T } from '../../lib/inventory/theme'
import { CATEGORIES } from '../../lib/inventory/data'
import { useInventory } from '../../lib/inventory/InventoryContext'
import PageBreadcrumb from '../../components/inventory/layout/PageBreadcrumb'

const NOTIF_META = {
  low_stock: { Icon: AlertTriangle, color: T.amber,  bg: T.amberLight  },
  request:   { Icon: Clock,         color: T.blue,   bg: T.blueLight   },
  approved:  { Icon: CheckCircle2,  color: T.green,  bg: T.greenLight  },
  denied:    { Icon: XCircle,       color: T.red,    bg: T.redLight    },
  overdue:   { Icon: AlertTriangle, color: T.red,    bg: T.redLight    },
}

const ACTIVITY_META = {
  transaction:  { label: 'Transaction',     Icon: Package2,      color: T.blue,   bg: T.blueLight   },
  request:      { label: 'Borrow Request',  Icon: ClipboardList, color: T.purple, bg: T.purpleLight },
  credit_topup: { label: 'Credit Top-Up',   Icon: CreditCard,    color: T.teal,   bg: T.tealLight   },
}

// Telegram-style folder tabs — My Borrows and History live here now.
const FEED_FILTERS = [
  { id: 'all',          label: 'All',           Icon: Boxes },
  { id: 'notification', label: 'Notifications', Icon: Bell },
  { id: 'borrows',      label: 'My Borrows',    Icon: RotateCcw },
  { id: 'purchases',    label: 'Purchases',     Icon: ShoppingBag },
  { id: 'history',      label: 'History',       Icon: Clock },
  { id: 'requested',    label: 'Requests',      Icon: ClipboardList },
]

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
                    {it.returnDate ? ` · Returned ${it.returnDate}` : ''}
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

export default function NotificationsPage({ notifications, setNotifications, user, borrows, requests, items = [] }) {
  const ctx = useInventory()
  const isUser = user.role === 'user'
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')

  // Optimistic local flip + server write-through.
  const markAll = () => {
    setNotifications(p => p.map(n => ({ ...n, read: true })))
    ctx?.markAllNotificationsRead?.().catch(() => {})
  }
  const markOne = (id) => {
    setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n))
    ctx?.markNotificationRead?.(id).catch(() => {})
  }

  // Build one unified, chronological feed: system notifications + (for students)
  // their own borrow/purchase/request activity — all in a single list, no tabs.
  const notifEntries = notifications
    .filter(n => n.forRoles?.includes(user.role) || n.userId === user.id)
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

  const visibleFeed = feed.filter(e => {
    if (filter === 'all') return true
    if (filter === 'borrows')   return e.kind === 'transaction' && !isPurchaseGroup(e.raw) && !isFinishedGroup(e.raw)
    if (filter === 'purchases') return e.kind === 'transaction' && isPurchaseGroup(e.raw)
    if (filter === 'history')   return e.kind === 'transaction' && !isPurchaseGroup(e.raw) && isFinishedGroup(e.raw)
    if (filter === 'requested') return e.kind === 'request' || e.kind === 'credit_topup'
    return e.kind === filter
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
    low_stock: 'Low Stock Alert',
    request:   'Request Update',
    approved:  'Approved',
    denied:    'Declined',
    overdue:   'Overdue Item',
  }

  // Aggregate status across a transaction group — worst-case wins so an
  // overdue/pending item isn't hidden behind an already-returned one.
  const groupStatus = (group) => {
    if (group.some(b => b.action !== 'purchased' && b.status === 'active' && b.dueDate && new Date(b.dueDate) < new Date())) return 'overdue'
    if (group.some(b => b.action !== 'purchased' && b.status === 'active')) return 'active'
    if (group.every(b => b.action === 'purchased' || b.status === 'completed')) return group.every(b => b.action === 'purchased') ? 'purchased' : 'completed'
    return group[0].status
  }

  return (
    <div style={{ background: T.cream, minHeight: '100%' }}>
      {/* Dark teal header banner — students only (admin layout already shows a TopBar title) */}
      {isUser && (
        <div style={{
          position: 'relative', overflow: 'hidden',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(145deg, #0c4a6e 0%, #0e7490 55%, #0891b2 100%)',
          backgroundSize: '40px 40px, 40px 40px, cover',
          borderBottom: '1px solid rgba(8,145,178,0.2)',
        }}>
          <div className="px-5 pt-8 pb-7 sm:px-8 lg:px-12" style={{ maxWidth: 1280, margin: '0 auto' }}>
            <PageBreadcrumb current="/notifications" />
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        {!isUser
          ? <h1 className="m-0 font-heading text-lg font-bold text-charcoal">Notifications</h1>
          : <span />}
        <button onClick={markAll} style={{ background: 'none', border: 'none', color: '#0e7490', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Mark all as read
        </button>
      </div>

      {isUser && (
        <div className="inv-hscroll mb-4 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
          {FEED_FILTERS.map(f => {
            const active = filter === f.id
            return (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
                style={{ border: active ? 'none' : `1px solid ${T.border}`, background: active ? '#0891b2' : T.white, color: active ? '#fff' : T.muted }}>
                <f.Icon size={12} color={active ? '#fff' : T.faint} />
                {f.label}
              </button>
            )
          })}
        </div>
      )}

      {visibleFeed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: T.faint }}>
          <Bell size={48} strokeWidth={1} color={T.borderDark} style={{ marginBottom: 16 }} />
          <p style={{ margin: 0, fontSize: 15 }}>Nothing here yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {visibleFeed.map(e => {
            if (e.kind === 'notification') {
              const n = e.raw
              const cfg = NOTIF_META[n.type] || NOTIF_META.request
              return (
                <div key={e.id} onClick={() => openEntry(e)}
                  style={{ background: n.read ? T.white : T.cream, border: `1px solid ${n.read ? T.border : T.borderDark}`, borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <cfg.Icon size={16} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, color: T.charcoal, fontWeight: n.read ? 400 : 600 }}>{n.message}</p>
                    <p style={{ margin: '3px 0 0', fontSize: 12, color: T.faint }}>{n.date}</p>
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
                      {group.length > 1 ? group.map(b => b.itemName).join(', ') : (group[0].action === 'purchased' ? 'Purchased' : 'Borrowed')} · {e.date}
                    </p>
                  </div>
                  <Badge status={groupStatus(group)} />
                </div>
              )
            }

            if (e.kind === 'request') {
              const group = e.raw
              const meta = ACTIVITY_META.request
              const title = group.length === 1 ? group[0].itemName : `${group.length} item borrow request`
              return (
                <div key={e.id} onClick={() => openEntry(e)}
                  style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <meta.Icon size={16} color={meta.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, color: T.charcoal, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</p>
                    <p style={{ margin: '3px 0 0', fontSize: 12, color: T.faint }}>Borrow Request · {e.date}</p>
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
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, color: T.charcoal, fontWeight: 600 }}>Credit Top-Up — ${e.raw.amountUSD}</p>
                  <p style={{ margin: '3px 0 0', fontSize: 12, color: T.faint }}>{meta.label} · {e.date}</p>
                </div>
                <Badge status={e.raw.status} />
              </div>
            )
          })}
        </div>
      )}

      {selected && selected.kind === 'notification' && (
        <DetailModal
          title={NOTIF_TYPE_LABEL[selected.raw.type] || 'Notification'}
          onClose={() => setSelected(null)}
          rows={[
            ['Message', selected.raw.message],
            ['Date', selected.raw.date],
            ['Status', selected.raw.read ? 'Read' : 'Unread'],
          ]}
        />
      )}
      {selected && selected.kind === 'request' && (
        <DetailModal
          title={selected.raw.length === 1 ? selected.raw[0].itemName : `Borrow Request — ${selected.raw.length} items`}
          status={selected.raw[0].status}
          onClose={() => setSelected(null)}
          itemList={selected.raw.map(r => enrich({ itemName: r.itemName, itemId: r.itemId, action: 'borrowed', dueDate: r.dueDate, qty: r.qty }))}
          rows={[
            ['Requested', selected.raw[0].date],
            ['Note', selected.raw[0].note],
          ]}
        />
      )}
      {selected && selected.kind === 'credit_topup' && (
        <DetailModal
          title="Credit Top-Up Request"
          status={selected.raw.status}
          onClose={() => setSelected(null)}
          rows={[
            ['Requested Amount', `$${selected.raw.amountUSD}`],
            ['Requested', selected.raw.date],
            ['Approved By', selected.raw.approvedBy ? `Staff #${selected.raw.approvedBy}` : null],
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
              ['Date', selected.raw[0].date],
              ['Total', totalCr > 0 ? `${totalCr} cr` : null],
              ['Approved By', selected.raw[0].approvedBy ? `Staff #${selected.raw[0].approvedBy}` : (selected.raw[0].soldBy ? `Staff #${selected.raw[0].soldBy}` : null)],
            ]}
          />
        )
      })()}
      </div>
    </div>
  )
}
