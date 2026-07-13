import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ShoppingCart, Bell, CreditCard, LogOut, Home, Compass,
  Menu, X, ChevronRight, ArrowUpRight, Search, Package,
  Layers, Bookmark, MessageSquare, BookOpen,
} from 'lucide-react'
import { LOGO_IMAGE } from '../../../lib/inventory/data'
import CreditInfoModal from '../ui/CreditInfoModal'
import NotificationDropdown from './NotificationDropdown'

const TEAL  = '#0891b2'
const CYAN  = '#67e8f9'
const INK   = '#0f172a'
const MUTED = '#64748b'

// ── Search bar ────────────────────────────────────────────────────────────────
function NavSearch({ onNavigate }) {
  const [q, setQ] = useState('')
  const handleSubmit = (e) => {
    e.preventDefault()
    const t = q.trim()
    onNavigate(t ? `/catalog?q=${encodeURIComponent(t)}` : '/catalog')
  }
  return (
    <form onSubmit={handleSubmit} className="px-2 sm:px-4" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
        <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search…"
          className="text-xs sm:text-[13px]"
          style={{
            width: '100%', background: '#f8fafc',
            border: '1.5px solid #e2e8f0', borderRadius: 999,
            color: INK, padding: '8px 12px 8px 32px', outline: 'none',
            transition: 'border-color .15s, box-shadow .15s',
          }}
          onFocus={e => { e.target.style.borderColor = TEAL; e.target.style.boxShadow = `0 0 0 3px ${TEAL}14` }}
          onBlur={e  => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
        />
      </div>
    </form>
  )
}

// ── Page module chip ──────────────────────────────────────────────────────────
function ModuleChip({ activePage }) {
  const map = {
    '/home':          { label: 'Inventory Home', Icon: Home    },
    '/catalog':       { label: 'Browse Items',   Icon: Compass },
    '/notifications': { label: 'Notifications',  Icon: Bell    },
  }
  const entry = map[activePage] || { label: 'MakerVault', Icon: Layers }
  const Icon  = entry.Icon
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
      padding: '5px 12px', borderRadius: 8,
      background: `${TEAL}10`, border: `1.5px solid ${TEAL}28`, color: TEAL,
    }}>
      <Icon size={13} strokeWidth={2.2} />
      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.04em' }}>{entry.label}</span>
    </div>
  )
}

export default function TopNav({
  user, page, setPage, onLogout,
  cartCount, onCartOpen,
  notifications, setNotifications,
  setRequests, showToast,
}) {
  const navigate     = useNavigate()
  const location     = useLocation()
  const activePage   = page || location.pathname
  const unread       = notifications.filter(
    n => !n.read && (n.forRoles?.includes(user.role) || n.userId === user.id)
  ).length

  const [menuOpen,       setMenuOpen]       = useState(false)
  const [creditInfoOpen, setCreditInfoOpen] = useState(false)
  const [notifOpen,      setNotifOpen]      = useState(false)
  const notifRef = useRef(null)

  const close = () => setMenuOpen(false)
  const go    = (key) => { setPage(key); close() }
  const goSearch = (path) => { navigate(`/inventory${path}`); close() }

  useEffect(() => {
    if (!menuOpen) return
    const scrollW = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow     = 'hidden'
    document.body.style.paddingRight = scrollW > 0 ? `${scrollW}px` : ''
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow     = ''
      document.body.style.paddingRight = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  useEffect(() => {
    if (!notifOpen) return
    const onClickAway = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false) }
    const onKey = (e) => e.key === 'Escape' && setNotifOpen(false)
    document.addEventListener('mousedown', onClickAway)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClickAway)
      document.removeEventListener('keydown', onKey)
    }
  }, [notifOpen])

  const requestTopUp = (amountUSD) => {
    const today = new Date().toISOString().split('T')[0]
    const reqId = Date.now()
    setRequests?.(prev => [...prev, { id: reqId, userId: user.id, type: 'credit_topup', amountUSD, status: 'pending', date: today }])
    // Staff see this in their own Requests queue — only the student gets a notification.
    setNotifications?.(prev => [
      { id: reqId + 1, type: 'request', message: `Your $${amountUSD} credit top-up request is pending approval.`, read: false, date: today, userId: user.id },
      ...prev,
    ])
    showToast?.('Top-up request sent to the makerspace team.')
  }

  return (
    <>
      <style>{`
        @keyframes mv-pulse-ring {
          0%   { transform: scale(1);    opacity: .5 }
          70%  { transform: scale(1.55); opacity: 0  }
          100% { transform: scale(1.55); opacity: 0  }
        }
        .mv-pulse-ring { animation: mv-pulse-ring 2.2s cubic-bezier(.4,0,.6,1) infinite; }
        .mv-icon-btn { display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:9px;border:none;background:transparent;cursor:pointer;transition:background .15s; }
        .mv-icon-btn:hover { background:#f1f5f9; }
      `}</style>

      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: menuOpen ? 'rgba(7,8,18,0.98)' : 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: menuOpen ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
        transition: 'background .2s, border-color .2s',
      }}>
        <div className="gap-2 px-5 sm:gap-2.5 sm:px-8 lg:px-12" style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', height: 62 }}>

          {/* 1 · Logo */}
          <button onClick={() => go('/home')} style={{ border: 'none', background: 'none', cursor: 'pointer', flexShrink: 0, padding: 0, display: 'flex', alignItems: 'center' }}>
            <img src={LOGO_IMAGE} alt="MakerVault"
              className="h-5 sm:h-[26px]"
              style={{ width: 'auto', objectFit: 'contain', filter: menuOpen ? 'brightness(0) invert(1)' : 'none', transition: 'filter .2s' }} />
          </button>

          {/* 2 · Search — always reachable, compact on mobile */}
          {!menuOpen && <div className="min-w-0 flex-1"><NavSearch onNavigate={goSearch} /></div>}
          {menuOpen && <div style={{ flex: 1 }} />}

          {/* 3 · Right actions */}
          <div className="gap-1.5 sm:gap-2" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>

            {/* Credits pill */}
            {!menuOpen && (
              <button onClick={() => setCreditInfoOpen(true)} className="gap-1 px-2 py-1.5 sm:gap-1.5 sm:px-3.5" style={{
                display: 'flex', alignItems: 'center',
                borderRadius: 999, background: '#fffbeb', border: '1.5px solid #fde68a', cursor: 'pointer',
              }}>
                <CreditCard size={13} style={{ color: '#d97706', flexShrink: 0 }} />
                <span className="text-xs sm:text-[13px]" style={{ fontWeight: 700, color: '#b45309' }}>{user.credits}</span>
                <span className="hidden sm:inline" style={{ fontSize: 11, color: '#d97706', fontWeight: 500 }}>cr</span>
              </button>
            )}

            {/* Notifications */}
            {!menuOpen && (
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button onClick={() => setNotifOpen(v => !v)} className="mv-icon-btn" aria-expanded={notifOpen}
                  style={{ position: 'relative', ...(notifOpen || activePage === '/notifications' ? { borderColor: `${TEAL}50`, background: `${TEAL}08` } : {}) }}>
                  <Bell size={15} style={{ color: notifOpen || activePage === '/notifications' ? TEAL : MUTED }} />
                  {unread > 0 && (
                    <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: '#ef4444', border: '1.5px solid #fff' }} />
                  )}
                </button>
                {notifOpen && (
                  <NotificationDropdown
                    notifications={notifications} user={user} setNotifications={setNotifications}
                    onViewAll={() => { setNotifOpen(false); go('/notifications') }}
                  />
                )}
              </div>
            )}

            {/* Cart */}
            {!menuOpen && (
              <button onClick={onCartOpen} className="mv-icon-btn" style={{ position: 'relative' }}>
                <ShoppingCart size={15} style={{ color: MUTED }} />
                {cartCount > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 17, height: 17, borderRadius: 999, background: TEAL, color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', border: '2px solid #fff' }}>
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Module chip — only on non-open state, hidden on mobile (redundant with hamburger) */}
            {!menuOpen && <div className="hidden sm:block"><ModuleChip activePage={activePage} /></div>}

            {/* Hamburger */}
            <button onClick={() => setMenuOpen(v => !v)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="h-9 w-9 sm:h-10 sm:w-10" style={{
              position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%', cursor: 'pointer', border: 'none', flexShrink: 0,
              background: menuOpen ? 'rgba(255,255,255,0.12)' : TEAL, color: '#fff', transition: 'background .2s',
            }}>
              {!menuOpen && <span className="mv-pulse-ring" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: TEAL }} />}
              {menuOpen
                ? <X    size={18} style={{ position: 'relative', zIndex: 1 }} />
                : <Menu size={18} style={{ position: 'relative', zIndex: 1 }} />
              }
            </button>
          </div>
        </div>

      </header>

      {/* ── Full-screen overlay ────────────────────────────────────────────── */}
      {menuOpen && (
        <div onClick={close} style={{
          position: 'fixed', inset: 0, zIndex: 90, overflowY: 'auto',
          background: 'rgba(7,8,18,0.97)', backdropFilter: 'blur(16px)',
        }}>
          {/* Grid overlay */}
          <div aria-hidden style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.2,
            backgroundImage: `linear-gradient(rgba(8,145,178,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(8,145,178,0.08) 1px,transparent 1px)`,
            backgroundSize: '40px 40px',
          }} />

          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '88px 32px 48px', position: 'relative', zIndex: 1 }}
            onClick={e => e.stopPropagation()}>

            <p style={{ textAlign: 'center', fontSize: 10, fontWeight: 800, letterSpacing: '.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,.22)', marginBottom: 40 }}>
              Where do you want to go?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginBottom: 48 }}>

              {/* 01 · Community */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(201,168,108,0.2)', border: '1px solid rgba(201,168,108,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageSquare size={12} style={{ color: '#c9a86c' }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '.04em' }}>01 · Community</span>
                </div>
                <button onClick={() => { navigate('/community'); close() }} style={{
                  width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                  gap: 8, padding: '14px 16px', borderRadius: 14, marginBottom: 10, cursor: 'pointer', border: 'none',
                  background: 'rgba(201,168,108,0.14)', borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(201,168,108,0.28)', textAlign: 'left',
                }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: 0 }}>Community Home</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '3px 0 0' }}>Announcements &amp; activity feed</p>
                  </div>
                  <ArrowUpRight size={14} style={{ color: '#c9a86c', flexShrink: 0, marginTop: 2 }} />
                </button>
                {[
                  ['Events',    '/community/eventspace'],
                  ['Find Team', '/community/collabspace'],
                  ['Connect',   '/community/communityspace'],
                ].map(([label, to]) => (
                  <button key={label} onClick={() => { navigate(to); close() }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 4px', cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left' }}>
                    <ChevronRight size={11} style={{ color: '#c9a86cbb', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#fff' }}>{label}</span>
                  </button>
                ))}
              </div>

              {/* 02 · Learning */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(192,57,43,0.2)', border: '1px solid rgba(192,57,43,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={12} style={{ color: '#e07060' }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '.04em' }}>02 · Learning</span>
                </div>
                <button onClick={() => { navigate('/learning'); close() }} style={{
                  width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                  gap: 8, padding: '14px 16px', borderRadius: 14, marginBottom: 10, cursor: 'pointer', border: 'none',
                  background: 'rgba(192,57,43,0.14)', borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(192,57,43,0.28)', textAlign: 'left',
                }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: 0 }}>Library</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '3px 0 0' }}>Browse all courses</p>
                  </div>
                  <ArrowUpRight size={14} style={{ color: '#e07060', flexShrink: 0, marginTop: 2 }} />
                </button>
                {['My Courses', 'Progress', 'Bookmarks', 'Announcements'].map((label) => (
                  <button key={label} onClick={() => { navigate('/learning'); close() }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 4px', cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left' }}>
                    <ChevronRight size={11} style={{ color: '#e07060bb', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#fff' }}>{label}</span>
                  </button>
                ))}
              </div>

              {/* 03 · Inventory — the module you're already in; 5 entry points
                  that all resolve to the 3 real pages (Home / Catalog / Notifications). */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: `${TEAL}22`, border: `1px solid ${TEAL}32`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={12} style={{ color: CYAN }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '.04em' }}>03 · Inventory</span>
                </div>

                {/* Featured */}
                <button onClick={() => go('/home')} style={{
                  width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                  gap: 8, padding: '14px 16px', borderRadius: 14, marginBottom: 10, cursor: 'pointer', border: 'none',
                  background: `${TEAL}14`, borderWidth: 1, borderStyle: 'solid', borderColor: `${TEAL}28`, textAlign: 'left',
                }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: 0 }}>Inventory Home</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '3px 0 0' }}>Your makerspace overview</p>
                  </div>
                  <ArrowUpRight size={14} style={{ color: TEAL, flexShrink: 0, marginTop: 2 }} />
                </button>

                {[
                  ['Browse Items',   '/catalog'],
                  ['Borrow Items',   '/catalog'],
                  ['Purchase Items', '/catalog'],
                  ['My Requests',    '/notifications'],
                ].map(([label, key]) => (
                  <button key={label} onClick={() => go(key)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 4px', cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left' }}>
                    <ChevronRight size={11} style={{ color: `${TEAL}bb`, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#fff' }}>{label}</span>
                  </button>
                ))}
              </div>

              {/* Account cluster */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#818cf8' }}>{user.name[0]}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '.04em' }}>Account</span>
                </div>

                {/* User card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 14, marginBottom: 12, background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.20)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#fff', flexShrink: 0, background: 'linear-gradient(135deg,#6366f1,#a855f7)' }}>
                    {user.name[0].toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>{user.studentId || user.email}</p>
                  </div>
                </div>

                <button onClick={() => { setCreditInfoOpen(true); close() }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 4px', cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left' }}>
                  <ChevronRight size={12} style={{ color: 'rgba(245,158,11,0.8)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>
                    Credits — <strong style={{ color: '#f59e0b' }}>{user.credits} cr</strong>
                  </span>
                </button>

                <button onClick={() => go('/notifications')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 4px', cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left' }}>
                  <ChevronRight size={12} style={{ color: `${TEAL}bb`, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>
                    Notifications
                    {unread > 0 && (
                      <span style={{ marginLeft: 6, padding: '1px 7px', borderRadius: 999, background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 800 }}>{unread}</span>
                    )}
                  </span>
                </button>

                <div style={{ margin: '12px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }} />

                <button onClick={() => { onLogout(); close() }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 4px', cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left', color: 'rgba(255,255,255,0.3)', fontSize: 13, fontWeight: 600 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
                  <LogOut size={13} style={{ flexShrink: 0 }} />
                  Sign Out
                </button>
              </div>
            </div>

            <p style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.18)' }}>
              Press <kbd style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', fontFamily: 'monospace', fontSize: 9 }}>Esc</kbd> or click outside to close
            </p>
          </div>
        </div>
      )}

      {creditInfoOpen && (
        <CreditInfoModal user={user} onClose={() => setCreditInfoOpen(false)} onRequestTopUp={requestTopUp} />
      )}
    </>
  )
}
