import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, LogIn, UserPlus } from 'lucide-react'

// Inventory module — student/guest side, mounted at /inventory/*.
// State (and the module's own auth) lives in InventoryProvider so the
// admin area at /admin/inventory/* shares the same data.
import { LOGO_IMAGE } from '../../lib/inventory/data'
import { useInventory } from '../../lib/inventory/InventoryContext'

import Toast from '../../components/inventory/ui/Toast'
import AuthPage from './AuthPage'
import TopNav from '../../components/inventory/layout/TopNav'

import HomePage from './HomePage'
import NotificationsPage from './NotificationsPage'

import Catalog from '../../components/inventory/Catalog'
import CartPanel from '../../components/inventory/CartPanel'

const BASE = '/inventory'

export default function InventoryApp() {
  const navigate = useNavigate()
  const location = useLocation()
  // Module-relative path ('/home', '/catalog', …) — inner components keep
  // using the same keys they used when MakerVault was standalone.
  const page = location.pathname.replace(/^\/inventory/, '') || '/home'
  const go = (p) => navigate(`${BASE}${p === '/home' ? '' : p}`)

  const {
    user, setUser, items, setItems, users, setUsers,
    borrows, setBorrows, requests, setRequests,
    notifications, setNotifications, payments, setPayments,
    filaments, toast, setToast, showToast,
  } = useInventory()

  const [cart,     setCart]     = useState([])
  const [cartOpen, setCartOpen] = useState(false)

  const handleLogin = (u) => {
    setUser(u)
    navigate(u.role === 'admin' || u.role === 'staff' ? '/admin/inventory' : BASE, { replace: true })
  }

  const handleSignup = (newUser) => { setUsers(p => [...p, newUser]) }

  const handleLogout = () => {
    setUser(null)
    setCart([])
    navigate(BASE, { replace: true })
  }

  // ── Public routes (not signed in to the inventory module) ─────────────────
  if (!user) {
    return (
      <Routes>
        <Route index element={
          <HomePage user={null} items={items} users={users} borrows={borrows}
            onEnter={() => navigate(`${BASE}/auth`)} onBrowse={() => navigate(`${BASE}/browse`)} />
        } />
        <Route path="auth" element={
          <div className="inv-root"><AuthPage onLogin={handleLogin} onSignup={handleSignup} users={users} /></div>
        } />
        <Route path="browse" element={
          <div className="inv-root min-h-screen bg-cream">
            <GuestTopBar onBack={() => navigate(BASE)} onEnter={() => navigate(`${BASE}/auth`)} />
            <main>
              <Catalog items={items} user={null} cart={cart} setCart={setCart} showToast={showToast} onRequireAuth={() => navigate(`${BASE}/auth`)} />
            </main>
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
          </div>
        } />
        <Route path="*" element={<Navigate to={BASE} replace />} />
      </Routes>
    )
  }

  // ── Staff/admin manage the module from the shared admin panel ─────────────
  if (user.role === 'staff' || user.role === 'admin') {
    return <Navigate to="/admin/inventory" replace />
  }

  // ── Student layout ─────────────────────────────────────────────────────────
  return (
    <div className="inv-root min-h-screen bg-cream">
      <TopNav
        user={user} page={page} setPage={go} onLogout={handleLogout}
        cartCount={cart.length} onCartOpen={() => setCartOpen(true)}
        notifications={notifications} setNotifications={setNotifications}
        setRequests={setRequests} showToast={showToast}
      />
      <div className="flex min-h-[calc(100vh-56px)] sm:min-h-[calc(100vh-60px)]">
        <main className="min-w-0 flex-1">
          <Routes>
            <Route index element={<HomePage user={user} items={items} borrows={borrows} notifications={notifications} setPage={go} filaments={filaments} setRequests={setRequests} showToast={showToast} />} />
            <Route path="home"          element={<HomePage user={user} items={items} borrows={borrows} notifications={notifications} setPage={go} filaments={filaments} setRequests={setRequests} showToast={showToast} />} />
            <Route path="catalog"       element={<Catalog items={items} user={user} cart={cart} setCart={setCart} showToast={showToast} users={users} setUsers={setUsers} setItems={setItems} setBorrows={setBorrows} setPayments={setPayments} onCartOpen={() => setCartOpen(true)} borrows={borrows} />} />
            {/* My Borrows merged into Notifications as a folder tab */}
            <Route path="my-borrows"    element={<Navigate to={`${BASE}/notifications`} replace />} />
            <Route path="notifications" element={<NotificationsPage notifications={notifications} setNotifications={setNotifications} user={user} borrows={borrows} requests={requests} items={items} />} />
            <Route path="*"             element={<Navigate to={BASE} replace />} />
          </Routes>
        </main>
        {cartOpen && (
          <CartPanel cart={cart} setCart={setCart} user={user} setUser={setUser} setBorrows={setBorrows} setRequests={setRequests} showToast={showToast} onClose={() => setCartOpen(false)} />
        )}
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

// ── Visitor top bar (guest catalog browse) ─────────────────────────────────────
function GuestTopBar({ onBack, onEnter }) {
  return (
    <header className="sticky top-0 z-[100] border-b border-border bg-white">
      <div className="mx-auto flex h-auto max-w-[1280px] flex-wrap items-center justify-between gap-2 px-3 py-2 sm:h-[60px] sm:flex-nowrap sm:gap-4 sm:px-6 sm:py-0">
        <button onClick={onBack} className="flex flex-shrink-0 items-center gap-2 border-none bg-transparent p-0">
          <ArrowLeft size={15} className="text-inv-muted" />
          <img src={LOGO_IMAGE} alt="MakerVault" className="h-5 w-auto object-contain sm:h-[26px]" />
        </button>
        <div className="order-3 w-full justify-center rounded-full bg-inv-accent-light px-3.5 py-1.5 text-center sm:order-none sm:w-auto sm:flex-1 sm:text-left">
          <span className="text-[11px] font-semibold text-inv-accent sm:text-xs">Browsing as a visitor — join to borrow or purchase</span>
        </div>
        <div className="flex flex-shrink-0 gap-2">
          <button onClick={onEnter} className="flex items-center gap-1.5 rounded-[10px] border border-border bg-white px-3 py-2 text-[12px] font-semibold text-charcoal sm:px-4 sm:text-[13px]">
            <LogIn size={14} /> <span className="hidden sm:inline">Login</span>
          </button>
          <button onClick={onEnter} className="flex items-center gap-1.5 rounded-[10px] border-none bg-charcoal px-3 py-2 text-[12px] font-semibold text-white sm:px-4 sm:text-[13px]">
            <UserPlus size={14} /> <span className="hidden sm:inline">Join Membership</span>
          </button>
        </div>
      </div>
    </header>
  )
}
