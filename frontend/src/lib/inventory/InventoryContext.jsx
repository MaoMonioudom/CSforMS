import { createContext, useContext, useState, useEffect } from 'react'
import { getInitialState, persist } from './api'
import { OVERDUE_RATE } from './data'

// Shared inventory-module state. Both the student-facing module (/inventory/*)
// and the inventory admin area (/admin/inventory/*) read from this one provider,
// so approving a request in the admin area is instantly visible to the student
// side. Includes the module's own auth user until hub auth is unified.
const InventoryCtx = createContext(null)

const initialState = getInitialState()

export function InventoryProvider({ children }) {
  const [user,          setUser]          = useState(null)
  const [items,         setItems]         = useState(initialState.items)
  const [users,         setUsers]         = useState(initialState.users)
  const [borrows,       setBorrows]       = useState(initialState.borrows)
  const [requests,      setRequests]      = useState(initialState.requests)
  const [notifications, setNotifications] = useState(initialState.notifications)
  const [payments,      setPayments]      = useState(initialState.payments)
  const [filaments,     setFilaments]     = useState(initialState.filaments)
  const [toast,         setToast]         = useState(null)

  const showToast = (msg, type = 'success') => setToast({ msg, type })

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
  }

  return <InventoryCtx.Provider value={value}>{children}</InventoryCtx.Provider>
}

export const useInventory = () => useContext(InventoryCtx)
