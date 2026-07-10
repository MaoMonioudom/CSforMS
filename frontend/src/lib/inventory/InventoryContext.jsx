import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { getInitialState, persist } from './api'
import { OVERDUE_RATE } from './data'
import { useAuth } from '../../hub/AuthContext'

// Shared inventory-module state. Both the student-facing module (/inventory/*)
// and the inventory admin area (/admin/inventory/*) read from this one provider,
// so approving a request in the admin area is instantly visible to the student
// side.
//
// Identity comes from the hub's auth (useAuth()), not a separate inventory
// login: the current hub user is matched by email against this module's own
// `users` list (which carries inventory-specific fields like credits and
// studentId that the hub account doesn't have), auto-creating a fresh
// inventory profile the first time a hub account shows up here.
const InventoryCtx = createContext(null)

const ROLE_MAP = { Admin: 'admin', Staff: 'staff', User: 'user' }

const initialState = getInitialState()

export function InventoryProvider({ children }) {
  const { user: hubUser } = useAuth() || {}
  const [items,         setItems]         = useState(initialState.items)
  const [users,         setUsers]         = useState(initialState.users)
  const [borrows,       setBorrows]       = useState(initialState.borrows)
  const [requests,      setRequests]      = useState(initialState.requests)
  const [notifications, setNotifications] = useState(initialState.notifications)
  const [payments,      setPayments]      = useState(initialState.payments)
  const [filaments,     setFilaments]     = useState(initialState.filaments)
  const [toast,         setToast]         = useState(null)
  const [cart,          setCart]          = useState([])
  const [cartOpen,      setCartOpen]      = useState(false)

  const showToast = (msg, type = 'success') => setToast({ msg, type })

  // The inventory profile matching whoever's signed in via the hub, if any.
  const user = useMemo(
    () => (hubUser ? users.find(u => u.email === hubUser.email) ?? null : null),
    [hubUser, users]
  )

  // First time a hub account shows up here, give it a blank inventory profile.
  useEffect(() => {
    if (!hubUser) return
    setUsers(prev => {
      if (prev.some(u => u.email === hubUser.email)) return prev
      return [...prev, {
        id: Date.now(),
        name: hubUser.name || hubUser.email,
        email: hubUser.email,
        role: ROLE_MAP[hubUser.role] || 'user',
        studentId: null,
        membership: null,
        credits: 0,
        permissions: [],
      }]
    })
  }, [hubUser])

  // Patches the current user's inventory profile (e.g. deducting credits on
  // purchase) — mirrors the old setUser(updater) API call sites already use.
  const setUser = (updater) => {
    if (!user) return
    setUsers(prev => prev.map(u => (
      u.id === user.id ? (typeof updater === 'function' ? updater(u) : updater) : u
    )))
  }

  useEffect(() => { persist('items', items) }, [items])
  useEffect(() => { persist('users', users) }, [users])
  useEffect(() => { persist('borrows', borrows) }, [borrows])
  useEffect(() => { persist('requests', requests) }, [requests])
  useEffect(() => { persist('notifications', notifications) }, [notifications])
  useEffect(() => { persist('payments', payments) }, [payments])
  useEffect(() => { persist('filaments', filaments) }, [filaments])

  // Auto due-date alerts — whenever a loan is running up to (or past) its return
  // date, the student automatically gets a notification. Each alert is keyed per
  // borrow + state so it's only ever created once.
  useEffect(() => {
    const now = new Date()
    const alerts = []
    borrows.forEach(b => {
      if (b.action === 'purchased' || b.status !== 'active' || !b.dueDate) return
      const daysLeft = Math.ceil((new Date(b.dueDate) - now) / 86400000)
      if (daysLeft < 0) {
        alerts.push({
          key: `overdue-${b.id}`, userId: b.userId, type: 'overdue',
          message: `"${b.itemName}" is overdue (due ${b.dueDate}) — late returns are charged ${OVERDUE_RATE} credits per day. Please return it as soon as possible.`,
        })
      } else if (daysLeft <= 1) {
        alerts.push({
          key: `due-${b.id}`, userId: b.userId, type: 'request',
          message: `Reminder: "${b.itemName}" is due ${daysLeft === 0 ? 'today' : 'tomorrow'} (${b.dueDate}). Late returns are charged ${OVERDUE_RATE} credits per day.`,
        })
      }
    })
    setNotifications(prev => {
      const existing = new Set(prev.map(n => n.key).filter(Boolean))
      const fresh = alerts.filter(a => !existing.has(a.key))
      if (fresh.length === 0) return prev
      const today = new Date().toISOString().split('T')[0]
      return [...fresh.map((a, i) => ({ id: Date.now() + i, read: false, date: today, ...a })), ...prev]
    })
  }, [borrows])

  const value = {
    user, setUser,
    items, setItems,
    users, setUsers,
    borrows, setBorrows,
    requests, setRequests,
    notifications, setNotifications,
    payments, setPayments,
    filaments, setFilaments,
    toast, setToast, showToast,
    cart, setCart, cartOpen, setCartOpen,
  }

  return <InventoryCtx.Provider value={value}>{children}</InventoryCtx.Provider>
}

export const useInventory = () => useContext(InventoryCtx)
