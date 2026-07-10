import { useState } from 'react'
import { Check, AlertTriangle, Search, ChevronDown, RotateCcw, ShoppingBag, Trash2, Pencil, CreditCard, X } from 'lucide-react'
import { T } from '../../../lib/inventory/theme'
import { OVERDUE_RATE } from '../../../lib/inventory/data'

const DAY = 86400000
const today = () => new Date().toISOString().split('T')[0]
const daysOverdue = (dueDate) => Math.max(0, Math.floor((Date.now() - new Date(dueDate).getTime()) / DAY))
const daysLeft    = (dueDate) => Math.ceil((new Date(dueDate).getTime() - Date.now()) / DAY)

// Status pill — richer than the shared Badge: shows how many days overdue,
// or that a loan is running close to its deadline.
function StatusPill({ statusKey, days }) {
  const map = {
    overdue:   { label: `Overdue · ${days} day${days > 1 ? 's' : ''}`, color: T.red,   bg: T.redLight   },
    dueSoon:   { label: 'Running to return date', color: T.amber,  bg: T.amberLight },
    active:    { label: 'Running to return date', color: T.blue,   bg: T.blueLight  },
    returned:  { label: 'Returned',               color: T.green,  bg: T.greenLight },
    purchased: { label: 'Purchased',              color: T.teal,   bg: T.tealLight  },
  }
  const s = map[statusKey] || map.active
  return <span style={{ background: s.bg, color: s.color, padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>{s.label}</span>
}

// ── Borrows Tracker (staff/admin) ────────────────────────────────────────────
// Columns: Student · Items · Borrow Date · Return Date · Status · Actions.
// Overdue loans can have credits deducted (prefilled at OVERDUE_RATE/day, staff
// can override); items needing repair take a short issue report.
export default function BorrowsTracker({ borrows, setBorrows, items, setItems, users = [], setUsers, showToast }) {
  const [expanded, setExpanded] = useState(null)
  const [search,   setSearch]   = useState('')
  const [page,     setPage]     = useState(1)
  const PAGE_SIZE = 10
  // Per-borrow inline panels: { id, mode: 'fix' | 'deduct' | 'edit' }
  const [action, setAction] = useState(null)
  const [fixNote, setFixNote] = useState('')
  const [deductAmount, setDeductAmount] = useState('')
  const [newDue, setNewDue] = useState('')

  const getUser = (id) => users.find(u => u.id === id)
  const getName = (id) => getUser(id)?.name || `User #${id}`

  const markReturned = (id, condition, issue) => {
    setBorrows(prev => {
      const borrow = prev.find(b => b.id === id)
      // The reported issue lands on the ITEM's condition label so Manage Stock
      // shows exactly what was reported on the maintenance entry.
      if (borrow) setItems(p => p.map(i => i.id === borrow.itemId
        ? {
            ...i,
            status: condition === 'needs_maintenance' ? 'maintenance' : 'available',
            stock: i.stock + 1,
            ...(condition === 'needs_maintenance'
              ? { condition: issue ? `Needs fix — ${issue}` : 'Needs maintenance', issue }
              : {}),
          }
        : i))
      return prev.map(b => b.id !== id ? b : { ...b, status: 'completed', returnDate: today(), condition, ...(issue ? { issue } : {}) })
    })
    setAction(null); setFixNote('')
    showToast?.(condition === 'needs_maintenance' ? 'Marked returned — item flagged for maintenance.' : 'Marked as returned.')
  }

  const deductCredits = (b) => {
    const amount = Number(deductAmount)
    if (!amount || amount <= 0) { showToast?.('Enter the credit amount to deduct.', 'error'); return }
    setUsers?.(prev => prev.map(u => u.id === b.userId ? { ...u, credits: Math.max(0, u.credits - amount) } : u))
    setBorrows(prev => prev.map(x => x.id === b.id ? { ...x, penaltyCredits: (x.penaltyCredits || 0) + amount } : x))
    setAction(null); setDeductAmount('')
    showToast?.(`Deducted ${amount} credits from ${getName(b.userId)} for the late return.`)
  }

  const saveDueDate = (b) => {
    if (!newDue) { setAction(null); return }
    setBorrows(prev => prev.map(x => x.id === b.id ? { ...x, dueDate: newDue } : x))
    setAction(null); setNewDue('')
    showToast?.(`Return date updated to ${newDue}.`)
  }

  const deleteBorrow = (b) => {
    // Restore stock if the item was still out.
    if (b.action !== 'purchased' && b.status === 'active') {
      setItems(p => p.map(i => i.id === b.itemId ? { ...i, status: 'available', stock: i.stock + 1 } : i))
    }
    setBorrows(prev => prev.filter(x => x.id !== b.id))
    showToast?.('Record deleted.')
  }

  // Group records sharing an orderId into one transaction.
  const groups = []
  const seen = new Map()
  borrows.forEach(b => {
    const key = b.orderId || `single-${b.id}`
    if (seen.has(key)) { groups[seen.get(key)].items.push(b); return }
    seen.set(key, groups.length)
    groups.push({ key, userId: b.userId, date: b.date, items: [b] })
  })
  groups.sort((a, b) => new Date(b.date) - new Date(a.date))

  const q = search.trim().toLowerCase()
  const filtered = !q ? groups : groups.filter(g => {
    const u = getUser(g.userId)
    return g.items.some(b => b.itemName.toLowerCase().includes(q) || (b.dueDate || '').includes(q)) ||
      g.date.includes(q) ||
      (u?.name || '').toLowerCase().includes(q) ||
      (u?.studentId || '').toLowerCase().includes(q) ||
      String(g.userId).includes(q)
  })

  // Aggregate group status — worst case first: overdue > due soon > active > returned.
  const groupStatus = (g) => {
    const activeLoans = g.items.filter(b => b.action !== 'purchased' && b.status === 'active')
    const overdueDays = Math.max(0, ...activeLoans.filter(b => b.dueDate).map(b => daysOverdue(b.dueDate)))
    if (overdueDays > 0) return { key: 'overdue', days: overdueDays }
    if (activeLoans.some(b => b.dueDate && daysLeft(b.dueDate) <= 2)) return { key: 'dueSoon' }
    if (activeLoans.length > 0) return { key: 'active' }
    if (g.items.every(b => b.action === 'purchased')) return { key: 'purchased' }
    return { key: 'returned' }
  }

  // Group-level return date: earliest due date still out, else latest actual return.
  const groupReturnDate = (g) => {
    const out = g.items.filter(b => b.action !== 'purchased' && b.status === 'active' && b.dueDate).map(b => b.dueDate).sort()
    if (out.length) return `Due ${out[0]}`
    const returned = g.items.filter(b => b.returnDate).map(b => b.returnDate).sort()
    if (returned.length) return returned[returned.length - 1]
    return '—'
  }

  return (
    <div className="p-4 sm:p-8">
      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, padding: '1rem 1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <Search size={16} color="#0891b2" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search by student name, student ID, item, or date (yyyy-mm-dd)…"
          style={{ flex: 1, minWidth: 240, background: T.cream, border: `1px solid ${T.border}`, borderRadius: 8, padding: '7px 12px', fontSize: 13, outline: 'none' }} />
        <span style={{ fontSize: 12, color: T.faint }}>{filtered.length} of {groups.length} transactions</span>
      </div>

      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'auto' }}>
        <div style={{ minWidth: 900 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.8fr 1fr 1.1fr 1.1fr 0.5fr', gap: 10, padding: '10px 16px', background: T.cream, borderBottom: `1px solid ${T.stone}` }}>
          {['Student', 'Items', 'Borrow Date', 'Return Date', 'Status', ''].map((h, i) => (
            <span key={h} style={{ color: T.faint, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: i === 5 ? 'right' : 'left' }}>{h}</span>
          ))}
        </div>
        {filtered.length === 0 && <p style={{ color: T.faint, textAlign: 'center', padding: '2rem' }}>No matching transactions.</p>}
        {filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(g => {
          const isOpen = expanded === g.key
          const u = getUser(g.userId)
          const st = groupStatus(g)
          const summary = g.items.length === 1 ? g.items[0].itemName : `${g.items.length} items — ${g.items.map(b => b.itemName).join(', ')}`
          return (
          <div key={g.key} style={{ borderBottom: `1px solid ${T.stone}` }}>
            <div className="trow" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.8fr 1fr 1.1fr 1.1fr 0.5fr', gap: 10, padding: '12px 16px', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => setExpanded(isOpen ? null : g.key)}>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, color: T.ink, fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getName(g.userId)}</p>
                {u?.studentId && <p style={{ margin: 0, color: T.faint, fontSize: 10 }}>{u.studentId}</p>}
              </div>
              {/* Plain item names — no icons in this column */}
              <span style={{ color: T.charcoal, fontWeight: 500, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{summary}</span>
              <span style={{ color: T.muted, fontSize: 12 }}>{g.date}</span>
              <span style={{ color: T.muted, fontSize: 12 }}>{groupReturnDate(g)}</span>
              <div><StatusPill statusKey={st.key} days={st.days} /></div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <ChevronDown size={14} color={T.faint} style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none', flexShrink: 0 }} />
              </div>
            </div>
            <div className="grid overflow-hidden transition-all duration-200" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ padding: '0 16px 14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {g.items.map(b => {
                    const isLoan   = b.action !== 'purchased'
                    const isActive = isLoan && b.status === 'active'
                    const odDays   = isActive && b.dueDate ? daysOverdue(b.dueDate) : 0
                    const suggested = odDays * OVERDUE_RATE
                    return (
                      <div key={b.id} style={{ background: T.cream, borderRadius: 8, padding: '8px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <div style={{ width: 26, height: 26, borderRadius: 7, background: b.action === 'purchased' ? T.amberLight : T.blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {b.action === 'purchased' ? <ShoppingBag size={12} color={T.amber} /> : <RotateCcw size={12} color={T.blue} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 140 }}>
                            <p style={{ margin: 0, color: T.charcoal, fontSize: 12, fontWeight: 600 }}>{b.itemName}</p>
                            <p style={{ margin: '2px 0 0', color: T.faint, fontSize: 11 }}>
                              {b.action === 'purchased'
                                ? `Purchased${b.qty > 1 ? ` ×${b.qty}` : ''} · ${b.credits ?? 0} cr`
                                : (b.returnDate ? `Returned ${b.returnDate}` : b.dueDate ? `Due ${b.dueDate}` : 'Pending approval')}
                              {odDays > 0 ? ` · ${odDays} day${odDays > 1 ? 's' : ''} overdue` : ''}
                              {b.penaltyCredits ? ` · ${b.penaltyCredits} cr deducted` : ''}
                              {b.condition ? ` · ${b.condition}` : ''}
                              {b.issue ? ` · Issue: ${b.issue}` : ''}
                            </p>
                          </div>
                          {isActive && (
                            <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
                              <button onClick={() => markReturned(b.id, 'good')}
                                style={{ padding: '5px 10px', background: T.greenLight, border: 'none', borderRadius: 7, color: T.green, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
                                <Check size={11} /> Returned
                              </button>
                              <button onClick={() => { setAction({ id: b.id, mode: 'fix' }); setFixNote('') }}
                                style={{ padding: '5px 10px', background: T.amberLight, border: 'none', borderRadius: 7, color: T.amber, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
                                <AlertTriangle size={11} /> Needs Fix
                              </button>
                              {odDays > 0 && (
                                <button onClick={() => { setAction({ id: b.id, mode: 'deduct' }); setDeductAmount(String(suggested)) }}
                                  style={{ padding: '5px 10px', background: T.redLight, border: 'none', borderRadius: 7, color: T.red, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
                                  <CreditCard size={11} /> Deduct Credits
                                </button>
                              )}
                              <button onClick={() => { setAction({ id: b.id, mode: 'edit' }); setNewDue(b.dueDate || '') }}
                                style={{ padding: '5px 10px', background: T.stone, border: 'none', borderRadius: 7, color: T.muted, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
                                <Pencil size={11} /> Edit
                              </button>
                            </div>
                          )}
                          <button onClick={() => deleteBorrow(b)} title="Delete record"
                            style={{ padding: '5px 8px', background: 'none', border: `1px solid ${T.border}`, borderRadius: 7, color: T.faint, fontSize: 11, display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
                            <Trash2 size={11} />
                          </button>
                        </div>

                        {/* Inline action panels */}
                        {action?.id === b.id && action.mode === 'fix' && (
                          <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                            <input value={fixNote} onChange={e => setFixNote(e.target.value)} placeholder="Report the issue — what needs fixing?"
                              style={{ flex: 1, minWidth: 180, background: T.white, border: `1px solid ${T.border}`, borderRadius: 7, padding: '6px 10px', fontSize: 12, outline: 'none' }} />
                            <button onClick={() => markReturned(b.id, 'needs_maintenance', fixNote.trim() || undefined)}
                              style={{ padding: '6px 12px', background: T.amber, border: 'none', borderRadius: 7, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                              Report & Return
                            </button>
                            <button onClick={() => setAction(null)} style={{ padding: 6, background: 'none', border: 'none', color: T.faint, cursor: 'pointer' }}><X size={13} /></button>
                          </div>
                        )}
                        {action?.id === b.id && action.mode === 'deduct' && (
                          <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 11, color: T.red, fontWeight: 600 }}>
                              {odDays} day{odDays > 1 ? 's' : ''} overdue × {OVERDUE_RATE} cr/day = {suggested} cr suggested
                            </span>
                            <input type="number" min="1" value={deductAmount} onChange={e => setDeductAmount(e.target.value)}
                              style={{ width: 90, background: T.white, border: `1px solid ${T.border}`, borderRadius: 7, padding: '6px 10px', fontSize: 12, outline: 'none' }} />
                            <button onClick={() => deductCredits(b)}
                              style={{ padding: '6px 12px', background: T.red, border: 'none', borderRadius: 7, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                              Deduct {deductAmount || 0} cr
                            </button>
                            <button onClick={() => setAction(null)} style={{ padding: 6, background: 'none', border: 'none', color: T.faint, cursor: 'pointer' }}><X size={13} /></button>
                          </div>
                        )}
                        {action?.id === b.id && action.mode === 'edit' && (
                          <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>New return date:</span>
                            <input type="date" value={newDue} onChange={e => setNewDue(e.target.value)}
                              style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 7, padding: '6px 10px', fontSize: 12, outline: 'none' }} />
                            <button onClick={() => saveDueDate(b)}
                              style={{ padding: '6px 12px', background: '#0891b2', border: 'none', borderRadius: 7, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                              Save
                            </button>
                            <button onClick={() => setAction(null)} style={{ padding: 6, background: 'none', border: 'none', color: T.faint, cursor: 'pointer' }}><X size={13} /></button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )})}
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: `1px solid ${T.stone}` }}>
          <span style={{ fontSize: 12, color: T.faint }}>
            Showing {Math.min(filtered.length, page * PAGE_SIZE) - (page - 1) * PAGE_SIZE} of {filtered.length} transactions
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: '4px 10px', border: `1px solid ${T.border}`, borderRadius: 6, background: '#fff', fontSize: 12, color: T.muted, cursor: 'pointer', opacity: page === 1 ? 0.4 : 1 }}>Prev</button>
            <span style={{ padding: '0 8px', fontSize: 12, color: T.ink }}>{page} / {Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))}</span>
            <button onClick={() => setPage(p => Math.min(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)), p + 1))} disabled={page >= Math.ceil(filtered.length / PAGE_SIZE)}
              style={{ padding: '4px 10px', border: `1px solid ${T.border}`, borderRadius: 6, background: '#fff', fontSize: 12, color: T.muted, cursor: 'pointer', opacity: page >= Math.ceil(filtered.length / PAGE_SIZE) ? 0.4 : 1 }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
