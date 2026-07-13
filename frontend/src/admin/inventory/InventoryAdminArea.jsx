import { useState, useEffect, useRef } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { LogOut, ChevronDown } from 'lucide-react'
import { useInventory } from '../../lib/inventory/InventoryContext'
import { SignOutConfirmDialog } from '../../components/SignOutConfirmDialog'
import Toast from '../../components/inventory/ui/Toast'

import AdminDashboard from './pages/AdminDashboard'
import InventoryManager from './pages/InventoryManager'
import ServicePage from './pages/ServicePage'
import UserManager from './pages/UserManager'
import PaymentsPage from './pages/PaymentsPage'
import BorrowsTracker from './pages/BorrowsTracker'
import RequestsManager from './pages/RequestsManager'
import Catalog from '../../components/inventory/Catalog'

// Titles for the teal gradient header — same visual language as the student side.
const PAGE_META = {
  '':          { title: 'Dashboard',      subtitle: 'Inventory overview & management' },
  'catalog':   { title: 'Browse Items',   subtitle: 'Sell consumables and lend tools at the counter' },
  'services':  { title: 'Lab Services',   subtitle: 'Fulfill walk-up print and 3D print jobs' },
  'requests':  { title: 'Requests',       subtitle: 'Review and approve student requests' },
  'borrows':   { title: 'Borrow Tracker', subtitle: 'Track all active loans and returns' },
  'manage':    { title: 'Manage Stock',   subtitle: 'Manage items, stock, and availability' },
  'payments':  { title: 'Payment List',   subtitle: 'Track credit top-ups and item purchases' },
  'users':     { title: 'Users & Roles',  subtitle: 'Manage members and staff permissions' },
}

// Inventory admin pages, rendered inside the shared AdminLayout (sidebar shell).
// Reaching this component already means AdminGuard (hub auth) confirmed an
// Admin/Staff role, so there's no separate sign-in gate here.
export default function InventoryAdminArea() {
  const location = useLocation()
  const sub = location.pathname.replace(/^\/admin\/inventory\/?/, '').split('/')[0]
  const meta = PAGE_META[sub] || PAGE_META['']
  const inv = useInventory()
  const {
    user, items, setItems, users, setUsers,
    borrows, setBorrows, requests, setRequests,
    notifications, setNotifications, payments, setPayments,
    filaments, setFilaments, toast, setToast, showToast,
  } = inv

  // Staff in-person sale on the catalog page needs a local cart slot.
  const [cart, setCart] = useState([])

  // Profile dropdown in the top bar (holds Sign out).
  const [profileOpen, setProfileOpen] = useState(false)
  const [signOutOpen, setSignOutOpen] = useState(false)
  const profileRef = useRef(null)
  useEffect(() => {
    if (!profileOpen) return
    const onClickAway = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false) }
    document.addEventListener('mousedown', onClickAway)
    return () => document.removeEventListener('mousedown', onClickAway)
  }, [profileOpen])

  // Brief flash right after login, before InventoryContext finishes creating
  // this hub account's inventory profile — nothing meaningful to render yet.
  if (!user) return null

  const sharedBorrow = { borrows, setBorrows, items, setItems }

  return (
    <div className="inv-root">
      {/* Full-width top bar — spans the whole area right of the sidebar.
          Shows the page title and the signed-in profile (dropdown → sign out). */}
      <div className="sticky top-0 z-40" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(145deg, #0c4a6e 0%, #0e7490 55%, #0891b2 100%)',
        backgroundSize: '40px 40px, 40px 40px, cover',
        borderBottom: '1px solid rgba(8,145,178,0.25)',
      }}>
        <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <div className="min-w-0">
            <h1 className="m-0 truncate text-lg font-bold text-white sm:text-xl" style={{ letterSpacing: '-0.02em' }}>{meta.title}</h1>
            <p className="m-0 mt-0.5 hidden truncate text-xs sm:block" style={{ color: 'rgba(255,255,255,0.55)' }}>{meta.subtitle}</p>
          </div>

          {/* Profile chip + dropdown */}
          <div ref={profileRef} className="relative flex-shrink-0">
            <button onClick={() => setProfileOpen(v => !v)}
              className="flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-3"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#67e8f9,#0891b2)', color: '#083344' }}>
                {user.name[0].toUpperCase()}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-xs font-bold leading-tight text-white">{user.name}</span>
                <span className="block text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.55)' }}>{user.role}</span>
              </span>
              <ChevronDown size={13} color="rgba(255,255,255,0.7)" style={{ transition: 'transform .15s', transform: profileOpen ? 'rotate(180deg)' : 'none' }} />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl bg-white"
                style={{ border: `1px solid #e2e8f0`, boxShadow: '0 12px 32px rgba(15,23,42,0.14)' }}>
                <div className="px-4 py-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <p className="m-0 text-[13px] font-bold text-charcoal">{user.name}</p>
                  <p className="m-0 mt-0.5 text-[11px] text-faint">{user.email}</p>
                </div>
                <button onClick={() => { setProfileOpen(false); setSignOutOpen(true) }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] font-semibold"
                  style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer' }}>
                  <LogOut size={13} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <SignOutConfirmDialog open={signOutOpen} onOpenChange={setSignOutOpen} redirectTo="/inventory" />

      <Routes>
        <Route index element={<AdminDashboard items={items} users={users} borrows={borrows} requests={requests} />} />
        <Route path="manage"   element={<InventoryManager items={items} setItems={setItems} user={user} filaments={filaments} setFilaments={setFilaments} />} />
        <Route path="services" element={<ServicePage user={user} users={users} setUsers={setUsers} filaments={filaments} setFilaments={setFilaments} setNotifications={setNotifications} setPayments={setPayments} showToast={showToast} />} />
        <Route path="users"    element={user.role === 'admin' ? <UserManager users={users} setUsers={setUsers} /> : <Navigate to="/admin/inventory" replace />} />
        <Route path="borrows"  element={<BorrowsTracker {...sharedBorrow} users={users} setUsers={setUsers} showToast={showToast} />} />
        <Route path="requests" element={<RequestsManager requests={requests} setRequests={setRequests} {...sharedBorrow} users={users} setUsers={setUsers} user={user} setNotifications={setNotifications} setPayments={setPayments} showToast={showToast} filaments={filaments} setFilaments={setFilaments} />} />
        <Route path="payments" element={<PaymentsPage payments={payments} setPayments={setPayments} />} />
        <Route path="catalog"  element={<Catalog items={items} user={user} cart={cart} setCart={setCart} showToast={showToast} users={users} setUsers={setUsers} setItems={setItems} setBorrows={setBorrows} setPayments={setPayments} />} />
        <Route path="*"        element={<Navigate to="/admin/inventory" replace />} />
      </Routes>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
