import { Bell, AlertTriangle, Clock, CheckCircle2, XCircle } from 'lucide-react'

const TEAL = '#0891b2'

const NOTIF_META = {
  low_stock: { Icon: AlertTriangle, color: '#d97706', bg: '#fffbeb' },
  request:   { Icon: Clock,         color: '#2563eb', bg: '#eff6ff' },
  approved:  { Icon: CheckCircle2,  color: '#16a34a', bg: '#f0fdf4' },
  denied:    { Icon: XCircle,       color: '#dc2626', bg: '#fef2f2' },
}

// Compact preview panel shown under the bell icon — mirrors the full Notifications
// page's styling but stays anchored so a student doesn't have to leave the page.
export default function NotificationDropdown({ notifications, user, setNotifications, onViewAll }) {
  const feed = notifications
    .filter(n => n.forRoles?.includes(user.role) || n.userId === user.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6)

  const markOne = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  const markAll = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))

  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 10px)', right: 0, zIndex: 200,
      width: 'min(340px, 88vw)', background: '#fff', borderRadius: 14,
      border: '1.5px solid #e2e8f0', boxShadow: '0 16px 40px rgba(15,23,42,0.14)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid #f1f5f9' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Notifications</span>
        {feed.some(n => !n.read) && (
          <button onClick={markAll} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 11, fontWeight: 600, color: TEAL }}>
            Mark all as read
          </button>
        )}
      </div>

      {/* Feed */}
      <div style={{ maxHeight: 340, overflowY: 'auto' }}>
        {feed.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '32px 16px', color: '#94a3b8' }}>
            <Bell size={28} strokeWidth={1.2} />
            <span style={{ fontSize: 12 }}>You're all caught up</span>
          </div>
        ) : feed.map(n => {
          const meta = NOTIF_META[n.type] || NOTIF_META.request
          return (
            <button key={n.id} onClick={() => markOne(n.id)} style={{
              width: '100%', display: 'flex', gap: 10, padding: '11px 14px', textAlign: 'left',
              background: n.read ? '#fff' : '#f8fafc', border: 'none', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
            }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: meta.bg }}>
                <meta.Icon size={14} color={meta.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.4, color: '#334155', fontWeight: n.read ? 500 : 700 }}>{n.message}</p>
                <p style={{ margin: '3px 0 0', fontSize: 10, color: '#94a3b8' }}>{n.date}</p>
              </div>
              {!n.read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: TEAL, flexShrink: 0, marginTop: 4 }} />}
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <button onClick={onViewAll} style={{
        width: '100%', padding: '11px 14px', background: '#f8fafc', border: 'none', borderTop: '1px solid #f1f5f9',
        fontSize: 12, fontWeight: 700, color: TEAL, cursor: 'pointer',
      }}>
        View all notifications
      </button>
    </div>
  )
}
