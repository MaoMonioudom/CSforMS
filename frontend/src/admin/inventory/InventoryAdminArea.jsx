import { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useInventory } from '../../lib/inventory/InventoryContext'
import Toast from '../../components/inventory/ui/Toast'

import AdminDashboard from './pages/AdminDashboard'
import InventoryManager from './pages/InventoryManager'
import ServicePage from './pages/ServicePage'
import PaymentsPage from './pages/PaymentsPage'
import BorrowsTracker from './pages/BorrowsTracker'
import RequestsManager from './pages/RequestsManager'
import Catalog from '../../components/inventory/Catalog'

// Titles for the shared page header (same plain style as Community/Learning's
// admin dashboards). This header is the ONLY page header — the pages
// themselves don't render their own duplicate title banners underneath it.
const PAGE_META = {
  '':          { title: 'Dashboard',          subtitle: 'Inventory overview & management' },
  'catalog':   { title: 'Browse Items',       subtitle: 'Manage inventory, or select a student to sell consumables and lend tools at the counter' },
  'services':  { title: 'Lab Services',       subtitle: 'Fulfill walk-up print and 3D print jobs — find a student, charge credits directly' },
  'requests':  { title: 'Request Management', subtitle: 'Review and approve student requests — borrow items, credit top-ups, and print jobs' },
  'borrows':   { title: 'Borrow Tracker',     subtitle: 'Track all active borrowed and returns — click any row for full transaction details' },
  'manage':    { title: 'Manage Stock',       subtitle: 'Manage items, stock, and availability' },
  'payments':  { title: 'Payment List',       subtitle: 'Track credit top-ups and item purchases' },
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

  // Brief flash right after login, before InventoryContext finishes creating
  // this hub account's inventory profile — nothing meaningful to render yet.
  if (!user) return null

  const sharedBorrow = { borrows, setBorrows, items, setItems }

  return (
    <div className="inv-root">
      {/* Plain page header — same style as the Community/Learning admin
          dashboards. The shared AdminSidebar already shows the signed-in
          user's name/role and provides sign out, so this doesn't duplicate
          that with its own profile chip. */}
      <div className="border-b border-border bg-white px-5 py-6 sm:px-8">
        <h1 className="text-2xl font-bold text-foreground">{meta.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{meta.subtitle}</p>
      </div>

      <Routes>
        <Route index element={<AdminDashboard items={items} users={users} borrows={borrows} requests={requests} payments={payments} />} />
        <Route path="manage"   element={<InventoryManager items={items} setItems={setItems} user={user} filaments={filaments} setFilaments={setFilaments} />} />
        <Route path="services" element={<ServicePage user={user} users={users} setUsers={setUsers} filaments={filaments} setFilaments={setFilaments} setNotifications={setNotifications} setPayments={setPayments} showToast={showToast} />} />
        <Route path="borrows"  element={<BorrowsTracker {...sharedBorrow} users={users} setUsers={setUsers} showToast={showToast} user={user} />} />
        <Route path="requests" element={<RequestsManager requests={requests} setRequests={setRequests} {...sharedBorrow} users={users} setUsers={setUsers} user={user} setNotifications={setNotifications} setPayments={setPayments} showToast={showToast} filaments={filaments} setFilaments={setFilaments} />} />
        <Route path="payments" element={<PaymentsPage payments={payments} setPayments={setPayments} items={items} requests={requests} users={users} />} />
        <Route path="catalog"  element={<Catalog items={items} user={user} cart={cart} setCart={setCart} showToast={showToast} users={users} setUsers={setUsers} setItems={setItems} setBorrows={setBorrows} setPayments={setPayments} />} />
        <Route path="*"        element={<Navigate to="/admin/inventory" replace />} />
      </Routes>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
