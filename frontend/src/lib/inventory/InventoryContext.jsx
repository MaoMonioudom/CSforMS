import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react'
import * as inv from './api'
import { useAuth } from '../../hub/AuthContext'

// Shared inventory-module state, now backed by the real API. Both the
// student-facing module (/inventory/*) and the inventory admin area
// (/admin/inventory/*) read from this one provider; every action function
// calls the backend then refetches the affected collections, so approving a
// request in the admin area is visible to the student side on next load.
//
// Identity comes straight from the hub's auth. user_id is the same row in
// `users` everywhere, and membership/credits arrive via /api/membership/me
// (already fetched by AuthContext.refreshMembership).
const InventoryCtx = createContext(null)

const ROLE_MAP = { Admin: 'admin', Staff: 'staff', User: 'user' }

export function InventoryProvider({ children }) {
  const { user: hubUser, refreshMembership } = useAuth() || {}

  const [items,         setItems]         = useState([])
  const [filaments,     setFilaments]     = useState([])
  const [categories,    setCategories]    = useState([])
  const [locations,     setLocations]     = useState([])
  const [users,         setUsers]         = useState([])
  const [borrows,       setBorrows]       = useState([])
  const [requests,      setRequests]      = useState([])
  const [notifications, setNotifications] = useState([])
  const [payments,      setPayments]      = useState([])
  const [loading,       setLoading]       = useState(true)
  const [toast,         setToast]         = useState(null)
  const [cart,          setCart]          = useState([])
  const [cartOpen,      setCartOpen]      = useState(false)

  const showToast = (msg, type = 'success') => setToast({ msg, type })

  const role = hubUser ? (ROLE_MAP[hubUser.role] || 'user') : null
  const staff = role === 'admin' || role === 'staff'

  // The inventory view of whoever's signed in via the hub.
  const user = useMemo(() => {
    if (!hubUser) return null
    return {
      id: hubUser.id,
      name: hubUser.name,
      email: hubUser.email,
      role,
      studentId: hubUser.studentId || null,
      membership: hubUser.isMember ? 'active' : 'inactive',
      credits: hubUser.credits ?? 0,
      permissions: [],
    }
  }, [hubUser, role])

  // ── Fetch helpers (each safe to call for a refresh) ─────────────────────
  const refreshCatalog = useCallback(async () => {
    const { items, filaments, categories, locations } = await inv.fetchCatalog()
    setItems(items); setFilaments(filaments); setCategories(categories); setLocations(locations)
  }, [])

  const refreshBorrows = useCallback(() => inv.fetchBorrows().then(setBorrows), [])
  const refreshRequests = useCallback(() => inv.fetchRequests().then(setRequests), [])
  const refreshNotifications = useCallback(() => inv.fetchNotifications().then(setNotifications), [])
  const refreshPayments = useCallback(() => inv.fetchPayments().then(setPayments), [])
  const refreshUsers = useCallback(() => inv.fetchUsers().then(setUsers), [])

  // Live-ish sync interval. There's no websocket/realtime channel here, so
  // this is what makes one person's action (student submits a request,
  // staff approves it, another admin edits stock...) show up in everyone
  // else's already-open tab without them having to hit reload.
  const POLL_MS = 20000

  // Public catalog: guests can browse. Polled too — stock/availability
  // changes made by staff should show up for anyone already browsing.
  useEffect(() => {
    refreshCatalog().catch(() => {}).finally(() => setLoading(false))
    const interval = setInterval(() => { refreshCatalog().catch(() => {}) }, POLL_MS)
    return () => clearInterval(interval)
  }, [refreshCatalog])

  // Authed collections: polled so a request/borrow/notification created or
  // resolved by someone else (staff approving a student's request, another
  // session on the same account, etc.) appears without a manual reload.
  useEffect(() => {
    if (!hubUser) { setBorrows([]); setRequests([]); setNotifications([]); return }
    refreshBorrows().catch(() => {})
    refreshRequests().catch(() => {})
    refreshNotifications().catch(() => {})
    const interval = setInterval(() => {
      refreshBorrows().catch(() => {})
      refreshRequests().catch(() => {})
      refreshNotifications().catch(() => {})
    }, POLL_MS)
    return () => clearInterval(interval)
  }, [hubUser, refreshBorrows, refreshRequests, refreshNotifications])

  // Staff-only collections: also polled, so one admin's counter sale or
  // credit top-up shows up for a different admin's already-open tab.
  useEffect(() => {
    if (!staff) { setPayments([]); setUsers([]); return }
    refreshPayments().catch(() => {})
    refreshUsers().catch(() => {})
    const interval = setInterval(() => {
      refreshPayments().catch(() => {})
      refreshUsers().catch(() => {})
    }, POLL_MS)
    return () => clearInterval(interval)
  }, [staff, refreshPayments, refreshUsers])

  // Staff-only: pop a toast when a new pending request appears (piggybacks
  // on the requests poll above). `seenPendingIds` starts null so the first
  // load (whatever's already pending) doesn't trigger a toast — only
  // requests that appear after that do.
  const seenPendingIds = useRef(null)
  useEffect(() => {
    if (!staff) seenPendingIds.current = null
  }, [staff])

  useEffect(() => {
    if (!staff) return
    const pending = requests.filter(r => r.status === 'pending')
    const pendingIds = new Set(pending.map(r => r.id))
    if (seenPendingIds.current) {
      const newOnes = pending.filter(r => !seenPendingIds.current.has(r.id))
      if (newOnes.length === 1) showToast(`New request: ${newOnes[0].itemName || newOnes[0].type}`)
      else if (newOnes.length > 1) showToast(`${newOnes.length} new requests waiting for approval`)
    }
    seenPendingIds.current = pendingIds
  }, [requests, staff])

  // ── Actions: call the API, then refresh what changed ──────────────────
  // Each returns the API result so callers can toast on success/failure.
  const run = async (fn, refreshers = []) => {
    const result = await fn()
    await Promise.all(refreshers.map((r) => r().catch(() => {})))
    return result
  }
  const creditsChanged = () => refreshMembership?.()

  const actions = {
    // student
    submitBorrowRequests: (lines) => run(() => inv.submitBorrowRequests(lines), [refreshRequests]),
    submitTopUpRequest:   (p) => run(() => inv.submitTopUpRequest(p), [refreshRequests]),
    submitPrintingRequest:(p) => run(() => inv.submitPrintingRequest(p), [refreshRequests]),
    submit3DPrintRequest: (p) => run(() => inv.submit3DPrintRequest(p), [refreshRequests]),
    // Purchases are requests now. Nothing is charged until staff approve.
    purchaseItems:        (cart) => run(() => inv.purchaseItems(cart), [refreshRequests]),

    // staff: requests
    approveBorrowGroup: (ids) => run(() => inv.approveBorrowGroup(ids), [refreshRequests, refreshBorrows, refreshCatalog]),
    approvePurchaseGroup: (ids) => run(() => inv.approvePurchaseGroup(ids), [refreshRequests, refreshPayments, refreshCatalog, refreshUsers, creditsChanged]),
    denyRequests:       (ids) => run(() => inv.denyRequests(ids), [refreshRequests]),
    deleteRequestGroup: (ids) => run(() => inv.deleteRequestGroup(ids), [refreshRequests]),
    approveTopUp:       (id) => run(() => inv.approveTopUp(id), [refreshRequests, refreshPayments, refreshUsers, creditsChanged]),
    approvePrinting:    (id) => run(() => inv.approvePrinting(id), [refreshRequests, refreshPayments, refreshUsers, creditsChanged]),
    confirm3DWeight:    (id, grams) => run(() => inv.confirm3DWeight(id, grams), [refreshRequests, refreshPayments, refreshUsers, refreshCatalog, creditsChanged]),

    // staff: borrows & counter
    returnBorrow:  (id, opts) => run(() => inv.returnBorrow(id, opts), [refreshBorrows, refreshCatalog]),
    deductCredits: (p) => run(() => inv.deductCredits(p), [refreshPayments, refreshUsers, creditsChanged]),
    chargePrint:   (p) => run(() => inv.chargePrint(p), [refreshPayments, refreshUsers, creditsChanged]),
    charge3D:      (p) => run(() => inv.charge3D(p), [refreshPayments, refreshUsers, refreshCatalog, creditsChanged]),
    chargeMachineTime: (p) => run(() => inv.chargeMachineTime(p), [refreshPayments, refreshUsers, creditsChanged]),
    staffSale:     (p) => run(() => inv.staffSale(p), [refreshPayments, refreshUsers, refreshBorrows, refreshCatalog, creditsChanged]),
    topUpCounter:  (p) => run(() => inv.topUpCounter(p), [refreshPayments, refreshUsers, creditsChanged]),

    // staff: item/filament CRUD
    saveItem: (ui) => run(async () => {
      // Any room + shelf code the form is submitted with gets a real
      // location row if one doesn't already exist, see resolveLocation.
      const location = await inv.resolveLocation({ room: ui.room, zone: ui.zone }, locations)
      const payload = inv.toDbItem({ ...ui, locationId: location?.location_id ?? null }, categories, locations)
      return ui.id ? inv.updateItem(ui.id, payload) : inv.createItem(payload)
    }, [refreshCatalog]),
    deleteItem:     (id) => run(() => inv.deleteItem(id), [refreshCatalog]),
    saveFilament:   (f) => run(() => (f.id ? inv.updateFilament(f.id, f) : inv.createFilament(f)), [refreshCatalog]),
    deleteFilament: (id) => run(() => inv.deleteFilament(id), [refreshCatalog]),
    reportMaintenance:   (id, opts) => run(() => inv.reportMaintenance(id, opts), [refreshCatalog]),
    completeMaintenance: (id) => run(() => inv.completeMaintenance(id), [refreshCatalog]),

    // notifications
    markNotificationRead:     (id) => run(() => inv.markNotificationRead(id), [refreshNotifications]),
    markAllNotificationsRead: () => run(() => inv.markAllNotificationsRead(), [refreshNotifications]),
  }

  // Every one of the actions above is a "click to submit" mutation. This
  // guards ALL of them (student and staff alike) against rapid repeat clicks
  // firing the same request multiple times (e.g. "Complete Sale" clicked 3x
  // creating 3 transactions). One action name in flight at a time; extra
  // clicks while it's pending are silently ignored rather than queued.
  const pendingActions = useRef(new Set())
  const guardedActions = Object.fromEntries(
    Object.entries(actions).map(([name, fn]) => [name, (...args) => {
      if (pendingActions.current.has(name)) return Promise.resolve()
      pendingActions.current.add(name)
      return Promise.resolve(fn(...args)).finally(() => pendingActions.current.delete(name))
    }])
  )

  const value = {
    user, loading,
    items, filaments, categories, locations,
    users, borrows, requests, notifications, payments,
    // raw setters kept for optimistic tweaks; prefer the actions
    setItems, setUsers, setBorrows, setRequests, setNotifications, setPayments, setFilaments,
    refreshCatalog, refreshBorrows, refreshRequests, refreshNotifications, refreshPayments, refreshUsers,
    ...guardedActions,
    toast, setToast, showToast,
    cart, setCart, cartOpen, setCartOpen,
  }

  return <InventoryCtx.Provider value={value}>{children}</InventoryCtx.Provider>
}

export const useInventory = () => useContext(InventoryCtx)
