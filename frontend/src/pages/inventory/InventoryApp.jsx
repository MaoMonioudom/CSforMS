import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'

// Inventory module — student/guest side, mounted at /inventory/*.
// Chrome (nav, cursor, footer) and auth are the hub's — this module only owns
// its own routes/state. State lives in InventoryProvider so the admin area at
// /admin/inventory/* shares the same data.
import { useInventory } from '../../lib/inventory/InventoryContext'
import { useAuth } from '../../hub/AuthContext'

import Toast from '../../components/inventory/ui/Toast'
import { TopNav } from '../../components/TopNav'
import { AppFooter } from '../../components/AppFooter'

import HomePage from './HomePage'

import Catalog from '../../components/inventory/Catalog'
import CartPanel from '../../components/inventory/CartPanel'

const BASE = '/inventory'

export default function InventoryApp() {
  const navigate = useNavigate()
  const { user: hubUser } = useAuth()
  const goToLogin = () => navigate('/login', { state: { from: BASE } })

  const {
    user, items, setItems, users, setUsers,
    borrows, setBorrows, setRequests,
    notifications, payments, setPayments,
    filaments, toast, setToast, showToast,
    cart, setCart, cartOpen, setCartOpen,
  } = useInventory()

  const go = (p) => navigate(`${BASE}${p === '/home' ? '' : p}`)

  // Staff/admin manage the module from the shared admin panel.
  if (hubUser && (hubUser.role === 'Staff' || hubUser.role === 'Admin')) {
    return <Navigate to="/admin/inventory" replace />
  }

  return (
    <div className="inv-root min-h-screen bg-cream flex flex-col">
      <TopNav />
      <div className="flex-1 flex min-h-[calc(100vh-56px)] sm:min-h-[calc(100vh-60px)]">
        <main className="min-w-0 flex-1">
          <Routes>
            <Route index element={
              <HomePage
                user={user} items={items} users={users} borrows={borrows} notifications={notifications}
                filaments={filaments} setRequests={setRequests} setPage={go} showToast={showToast}
                onEnter={goToLogin} onBrowse={() => navigate(`${BASE}/browse`)}
              />
            } />

            {/* Guest-accessible read-only browse — no account needed to look
                around. If you're actually signed in when you land here (e.g.
                the TopNav menu link, a bookmark), send you to the real
                catalog instead of the read-only preview. */}
            <Route path="browse" element={
              hubUser
                ? <Navigate to={`${BASE}/catalog`} replace />
                : <Catalog items={items} user={null} cart={cart} setCart={setCart} showToast={showToast} onRequireAuth={goToLogin} />
            } />

            {hubUser && (
              <>
                <Route path="home" element={
                  <HomePage
                    user={user} items={items} users={users} borrows={borrows} notifications={notifications}
                    filaments={filaments} setRequests={setRequests} setPage={go} showToast={showToast}
                  />
                } />
                <Route path="catalog" element={
                  <Catalog
                    items={items} user={user} cart={cart} setCart={setCart} showToast={showToast}
                    users={users} setUsers={setUsers} setItems={setItems} setBorrows={setBorrows} setPayments={setPayments}
                    onCartOpen={() => setCartOpen(true)} borrows={borrows}
                  />
                } />
                {/* Notifications page is now shared across all 3 modules — one
                    implementation at /notifications (see hub/NotificationsPage.jsx),
                    still reachable from here for anything that links to the old path. */}
                <Route path="my-borrows" element={<Navigate to="/notifications" replace />} />
                <Route path="notifications" element={<Navigate to="/notifications" replace />} />
              </>
            )}

            <Route path="*" element={<Navigate to={BASE} replace />} />
          </Routes>
        </main>
        {cartOpen && user && (
          <CartPanel cart={cart} setCart={setCart} user={user} showToast={showToast} onClose={() => setCartOpen(false)} />
        )}
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <AppFooter />
    </div>
  )
}
