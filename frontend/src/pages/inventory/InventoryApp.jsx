import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'

// Inventory module — student/guest side, mounted at /inventory/*.
// Chrome (nav, cursor, footer) and auth are the hub's — this module only owns
// its own routes/state. State lives in InventoryProvider so the admin area at
// /admin/inventory/* shares the same data.
import { useInventory } from '../../lib/inventory/InventoryContext'
import { useAuth } from '../../hub/AuthContext'

import Toast from '../../components/inventory/ui/Toast'
import { TopNav } from '../../components/TopNav'
import { CursorEffect } from '../../components/community/CursorEffect'
import { AppFooter } from '../../components/AppFooter'

import HomePage from './HomePage'
import NotificationsPage from './NotificationsPage'

import Catalog from '../../components/inventory/Catalog'
import CartPanel from '../../components/inventory/CartPanel'

const BASE = '/inventory'

export default function InventoryApp() {
  const navigate = useNavigate()
  const { user: hubUser } = useAuth()
  const goToLogin = () => navigate('/login', { state: { from: BASE } })

  const {
    user, setUser, items, setItems, users, setUsers,
    borrows, setBorrows, requests, setRequests,
    notifications, setNotifications, payments, setPayments,
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
      <CursorEffect />
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

            {/* Guest-accessible read-only browse — no account needed to look around */}
            <Route path="browse" element={
              <Catalog items={items} user={null} cart={cart} setCart={setCart} showToast={showToast} onRequireAuth={goToLogin} />
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
                {/* My Borrows merged into Notifications as a folder tab */}
                <Route path="my-borrows" element={<Navigate to={`${BASE}/notifications`} replace />} />
                <Route path="notifications" element={
                  <NotificationsPage notifications={notifications} setNotifications={setNotifications} user={user} borrows={borrows} requests={requests} items={items} />
                } />
              </>
            )}

            <Route path="*" element={<Navigate to={BASE} replace />} />
          </Routes>
        </main>
        {cartOpen && user && (
          <CartPanel cart={cart} setCart={setCart} user={user} setUser={setUser} setBorrows={setBorrows} setRequests={setRequests} showToast={showToast} onClose={() => setCartOpen(false)} />
        )}
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <AppFooter />
    </div>
  )
}
