// Data-access layer. Every export is async on purpose: today it resolves
// against localStorage-backed mock data, but a real backend can replace the
// body of each function without touching any component that calls it.
import {
  SAMPLE_ITEMS, INITIAL_USERS, INITIAL_BORROWS, INITIAL_REQUESTS, INITIAL_NOTIFICATIONS, INITIAL_FILAMENTS,
} from './data'
import { loadCollection, saveCollection } from './storage'

const delay = (v) => new Promise((res) => setTimeout(() => res(v), 0))

export function getInitialState() {
  return {
    items:         loadCollection('items', SAMPLE_ITEMS),
    users:         loadCollection('users', INITIAL_USERS),
    borrows:       loadCollection('borrows', INITIAL_BORROWS),
    requests:      loadCollection('requests', INITIAL_REQUESTS),
    notifications: loadCollection('notifications', INITIAL_NOTIFICATIONS),
    payments:      loadCollection('payments', []),
    filaments:     loadCollection('filaments', INITIAL_FILAMENTS),
  }
}

export function persist(key, value) {
  saveCollection(key, value)
}

// ── Auth ─────────────────────────────────────────────────────────────────
export async function login({ email, password }, users) {
  const match = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (!match) throw new Error('No account found for that email.')
  if (match.membership === 'pending') throw new Error('Your membership is still pending staff approval.')
  return delay(match)
}

export async function register(payload, users) {
  const isCadtEmail = /@(student\.)?cadt\.edu\.kh$/i.test(payload.email)
  if (!payload.studentId && !isCadtEmail) {
    throw new Error('A valid Student ID or CADT email is required to register.')
  }
  const newUser = {
    id: Date.now(),
    role: 'user',
    membership: 'pending',
    credits: 0,
    joinDate: new Date().toISOString().split('T')[0],
    ...payload,
  }
  return delay(newUser)
}
