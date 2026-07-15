import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCheck, Bell, BellOff, MessageSquare } from "lucide-react";
import { useAuth } from "./AuthContext";
import { TopNav } from "../components/TopNav";
import { BackBar } from "../components/BackBar";
import { fetchNotifications, markNotificationRead } from "../lib/notifications-data";
import { formatRelativeTime } from "../lib/community-data";

const D = {
  bg:     "#eef5fc",
  bg2:    "#dceafa",
  card:   "#ffffff",
  border: "rgba(91,170,216,0.22)",
  muted:  "#5b7286",
  faint:  "#8aa0b2",
  text:   "#16324a",
};

const FILTERS = [
  { key: "all",       label: "All" },
  { key: "unread",    label: "Unread" },
  { key: "community", label: "Community", color: "#c9a86c" },
  { key: "learning",  label: "Learning",  color: "#c0392b" },
  { key: "inventory", label: "Inventory", color: "#0891b2" },
  { key: "system",    label: "System",    color: "#6366f1" },
];

// Presentation per notification_type — the backend only stores a plain
// message string, so icon/color/title/filter-bucket/link are decided here.
// Add an entry per new notification_type as the backend grows more of them.
const TYPE_META = {
  event_reminder: { title: "Event reminder", icon: MessageSquare, color: "#c9a86c", to: "/community/eventspace", filterKey: "community" },
};
const DEFAULT_META = { title: "Notification", icon: Bell, color: "#6366f1", filterKey: "system" };
const metaFor = (type) => TYPE_META[type] || DEFAULT_META;

// Groups by calendar day so the list reads as Today / Yesterday / Earlier
// instead of one long undifferentiated feed.
function groupOf(iso) {
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(new Date(iso))) / 86400000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return "Earlier";
}
const GROUPS = ["Today", "Yesterday", "Earlier"];

function NotificationRow({ n, onClick, isLast }) {
  const meta = metaFor(n.type);
  const Icon = meta.icon;
  return (
    <button onClick={() => onClick(n)}
      className="w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-black/[0.02]"
      style={{
        borderBottom: isLast ? "none" : "1px solid rgba(15,50,80,0.08)",
        background: n.read ? "transparent" : `${meta.color}0d`,
      }}>
      <Icon size={16} style={{ color: meta.color, marginTop: 2 }} className="shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm truncate" style={{ color: D.text }}>{meta.title}</p>
          {!n.read && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: meta.color }} />}
        </div>
        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: D.muted }}>{n.message}</p>
      </div>
      <span className="text-[10px] shrink-0" style={{ color: D.faint }}>{formatRelativeTime(n.postedAt)}</span>
    </button>
  );
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    // Wait for AuthContext to finish restoring the session from a stored
    // token before deciding no one's logged in — otherwise a page refresh
    // here always bounces through /login (user is briefly null on mount)
    // even when the session is valid.
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    fetchNotifications().then(setNotifs).finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const unreadCount = notifs.filter(n => !n.read).length;

  const visible = notifs.filter(n => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return metaFor(n.type).filterKey === filter;
  });

  const markAllRead = () => {
    const unread = notifs.filter(n => !n.read);
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    unread.forEach(n => markNotificationRead(n.id).catch(() => {}));
  };

  const handleClick = (n) => {
    setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
    if (!n.read) markNotificationRead(n.id).catch(() => {});
    const to = metaFor(n.type).to;
    if (to) navigate(to);
  };

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${D.bg} 0%, ${D.bg2} 100%)` }}>

      <div aria-hidden className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: `linear-gradient(rgba(99,102,241,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.05) 1px,transparent 1px)`, backgroundSize: "48px 48px" }} />

      <TopNav />
      <BackBar />

      <main className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 py-12">

        {/* Title */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(99,102,241,0.14)", border: "1px solid rgba(99,102,241,0.28)" }}>
              <Bell size={19} style={{ color: "#6366f1" }} />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold" style={{ color: D.text }}>Notifications</h1>
              <p className="text-sm" style={{ color: D.muted }}>
                {unreadCount > 0 ? `${unreadCount} unread of ${notifs.length} total` : "You're all caught up"}
              </p>
            </div>
          </div>
          <button onClick={markAllRead} disabled={unreadCount === 0} aria-label="Mark all read"
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-full text-xs font-semibold transition-all hover:opacity-80 disabled:opacity-40 shrink-0"
            style={{ color: D.muted, border: "1px solid rgba(15,50,80,0.14)" }}>
            <CheckCheck size={13} /> <span className="hidden sm:inline">Mark all read</span>
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map(f => {
            const active = filter === f.key;
            const accent = f.color ?? "#6366f1";
            return (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
                style={active
                  ? { background: accent, color: "white", border: `1px solid ${accent}` }
                  : { background: D.card, color: D.muted, border: `1px solid ${D.border}` }}>
                {f.label}
                {f.key === "unread" && unreadCount > 0 && ` (${unreadCount})`}
              </button>
            );
          })}
        </div>

        {/* Notification list — grouped by recency, colour-accented by module */}
        {loading ? (
          <p className="text-sm text-center py-12" style={{ color: D.muted }}>Loading…</p>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl p-12 text-center flex flex-col items-center gap-3"
            style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: "0 2px 20px rgba(15,50,80,0.06)" }}>
            <BellOff size={28} style={{ color: D.faint }} />
            <p className="text-sm font-semibold" style={{ color: D.muted }}>Nothing here</p>
            <p className="text-xs" style={{ color: D.faint }}>No notifications in this category yet.</p>
          </div>
        ) : (
          GROUPS.map(group => {
            const items = visible.filter(n => groupOf(n.postedAt) === group);
            if (items.length === 0) return null;
            return (
              <div key={group} className="mb-6 last:mb-0">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] mb-2 px-1" style={{ color: D.faint }}>{group}</p>
                <div className="rounded-2xl overflow-hidden" style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: "0 2px 20px rgba(15,50,80,0.06)" }}>
                  {items.map((n, i) => (
                    <NotificationRow key={n.id} n={n} onClick={handleClick} isLast={i === items.length - 1} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
