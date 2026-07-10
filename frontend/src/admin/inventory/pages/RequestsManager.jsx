import { useState } from 'react'
import { CheckCircle2, XCircle, Clock, CreditCard, Package2, Printer, Box } from 'lucide-react'
import Badge from '../../../components/inventory/ui/Badge'
import { T } from '../../../lib/inventory/theme'
import { CREDIT_RATE, PRINT_SERVICES } from '../../../lib/inventory/data'

const PRINT_RATE = PRINT_SERVICES.find(s => s.id === 'printing').rate

// ── Requests Manager (staff/admin approve) — handles borrow requests, credit
// top-ups, document printing, and 3D print jobs (which need a weight entered
// by staff before they can be charged) in one queue ───────────────────────────
export default function RequestsManager({ requests, setRequests, borrows, setBorrows, items, setItems, users, setUsers, user, setNotifications, setPayments, showToast, filaments = [], setFilaments }) {
  const [gramsInput, setGramsInput] = useState({})
  const pending = requests.filter(r => r.status === 'pending' || r.status === 'awaiting_weight')
  const handled = requests.filter(r => r.status === 'approved' || r.status === 'denied')
  const getName = (id) => users.find(u => u.id === id)?.name || `User #${id}`
  // Student name + ID label for request rows.
  const getLabel = (id) => { const u = users.find(x => x.id === id); return u ? u.name + (u.studentId ? ` (${u.studentId})` : '') : `User #${id}` }
  const today = () => new Date().toISOString().split('T')[0]

  const approveBorrow = (req) => {
    const d = today()
    const fallbackDue = new Date(); fallbackDue.setDate(fallbackDue.getDate() + 7)
    const dueDate = req.dueDate || fallbackDue.toISOString().split('T')[0]
    setRequests(p => p.map(r => r.id === req.id ? { ...r, status: 'approved', approvedBy: user.id } : r))
    // req.id is already unique per item — safer than Date.now() when approving
    // several items from the same transaction in one synchronous loop.
    setBorrows(p => [...p, { id: Date.now() + req.id, userId: req.userId, itemId: req.itemId, itemName: req.itemName, action: 'borrowed', date: d, dueDate, returnDate: null, status: 'active', approvedBy: user.id, orderId: req.orderId }])
    setItems(p => p.map(i => i.id === req.itemId ? { ...i, status: 'borrowed', stock: Math.max(0, i.stock - 1) } : i))
  }

  // Approve or decline every request in a multi-item borrow transaction together,
  // then send exactly one notification covering the whole transaction.
  const approveGroup = (group) => {
    group.forEach(approveBorrow)
    const d = today()
    const items = group.map(r => r.itemName).join(', ')
    setNotifications(p => [{ id: Date.now(), type: 'approved', message: group.length === 1
      ? `Your borrowing request has been approved — ${group[0].itemName}, due back ${group[0].dueDate}.`
      : `Your borrowing request has been approved — ${items}.`, read: false, date: d, userId: group[0].userId }, ...p])
    showToast(group.length === 1 ? `Approved: ${group[0].itemName}` : `Approved ${group.length} items`)
  }

  const denyGroup = (group) => {
    group.forEach(req => setRequests(p => p.map(r => r.id === req.id ? { ...r, status: 'denied' } : r)))
    const d = today()
    setNotifications(p => [{ id: Date.now(), type: 'denied', message: 'Your borrowing request has been rejected.', read: false, date: d, userId: group[0].userId }, ...p])
    showToast('Declined request')
  }

  const approveTopUp = (req) => {
    const d = today()
    const creditsToAdd = Math.round(req.amountUSD * CREDIT_RATE)
    const student = users.find(u => u.id === req.userId)
    setRequests(p => p.map(r => r.id === req.id ? { ...r, status: 'approved', approvedBy: user.id } : r))
    setUsers(p => p.map(u => u.id === req.userId ? { ...u, credits: u.credits + creditsToAdd } : u))
    setPayments?.(prev => [{
      id: req.id, customerName: student?.name || `User #${req.userId}`, customerId: student?.studentId,
      date: d, amount: req.amountUSD, currency: 'USD', status: 'Completed',
      method: 'Cash', orderId: `TOPUP-${req.id}`, type: 'Membership Credit Top-Up', handledBy: user.id,
    }, ...prev])
    setNotifications(p => [{ id: Date.now(), type: 'approved', message: `Your payment has been completed — $${req.amountUSD} → +${creditsToAdd} credits.`, read: false, date: d, userId: req.userId }, ...p])
    showToast(`Approved top-up: +${creditsToAdd} credits for ${student?.name}`)
  }

  const approvePrinting = (req) => {
    const d = today()
    const student = users.find(u => u.id === req.userId)
    if (!student || student.credits < req.credits) { showToast('Student has insufficient credits for this print job.', 'error'); return }
    setRequests(p => p.map(r => r.id === req.id ? { ...r, status: 'approved', approvedBy: user.id } : r))
    setUsers(p => p.map(u => u.id === req.userId ? { ...u, credits: u.credits - req.credits } : u))
    setPayments?.(prev => [{
      id: req.id, customerName: student.name, customerId: student.studentId, date: d, amount: req.credits, currency: 'CR',
      status: 'Completed', method: 'Credit', orderId: `PRINT-${req.id}`, type: 'Document Printing', handledBy: user.id,
    }, ...prev])
    setNotifications(p => [{ id: Date.now(), type: 'approved', message: `Your purchased items are ready for pickup — ${req.pages} page${req.pages === 1 ? '' : 's'} printed, ${req.credits} cr charged.`, read: false, date: d, userId: req.userId }, ...p])
    showToast(`Approved printing for ${student.name} — ${req.credits} cr`)
  }

  // Staff weigh the finished 3D print and enter grams here — cost is computed live
  // from the assigned filament's own credit-per-gram rate.
  const confirm3DWeight = (req) => {
    const grams = Number(gramsInput[req.id])
    if (!grams || grams <= 0) { showToast('Enter the print weight in grams.', 'error'); return }
    const filament = filaments.find(f => f.id === req.filamentId)
    const rate = filament?.rate ?? 4
    const credits = Math.round(grams * rate)
    const student = users.find(u => u.id === req.userId)
    if (!student || student.credits < credits) { showToast(`Student needs ${credits} cr but only has ${student?.credits ?? 0}.`, 'error'); return }
    const d = today()
    setRequests(p => p.map(r => r.id === req.id ? { ...r, status: 'approved', approvedBy: user.id, grams, credits } : r))
    setUsers(p => p.map(u => u.id === req.userId ? { ...u, credits: u.credits - credits } : u))
    if (req.filamentId) setFilaments?.(p => p.map(f => f.id === req.filamentId ? { ...f, stockGrams: Math.max(0, f.stockGrams - grams) } : f))
    setPayments?.(prev => [{
      id: req.id, customerName: student.name, customerId: student.studentId, date: d, amount: credits, currency: 'CR',
      status: 'Completed', method: 'Credit', orderId: `3DP-${req.id}`, type: '3D Printing', handledBy: user.id,
    }, ...prev])
    setNotifications(p => [{ id: Date.now(), type: 'approved', message: `Your purchased items are ready for pickup — 3D print, ${grams}g used, ${credits} cr charged.`, read: false, date: d, userId: req.userId }, ...p])
    showToast(`Charged ${credits} cr for ${grams}g (${student.name})`)
  }

  // Only credit top-up, printing, and 3D print jobs route here — borrow requests
  // are always approved/declined as a whole transaction via approveGroup/denyGroup.
  const approve = (req) => {
    if (req.type === 'credit_topup') return approveTopUp(req)
    if (req.type === 'printing') return approvePrinting(req)
    if (req.type === '3d_printing') return confirm3DWeight(req)
  }

  const deny = (req) => {
    setRequests(p => p.map(r => r.id === req.id ? { ...r, status: 'denied' } : r))
    const message = req.type === 'credit_topup' ? `Your $${req.amountUSD} credit top-up request has been rejected.`
      : req.type === 'printing' ? 'Your printing request has been rejected.'
      : 'Your 3D print job request has been rejected.'
    setNotifications(p => [{ id: Date.now(), type: 'denied', message, read: false, date: today(), userId: req.userId }, ...p])
    showToast('Declined request')
  }

  const rowMeta = (req) => {
    if (req.type === 'credit_topup') return { icon: <CreditCard size={14} color={T.amber} />, bg: T.amberLight, title: `Credit Top-Up — $${req.amountUSD} (${Math.round(req.amountUSD * CREDIT_RATE)} cr)` }
    if (req.type === 'printing') return { icon: <Printer size={14} color={T.blue} />, bg: T.blueLight, title: `Document Printing — ${req.pages} page${req.pages === 1 ? '' : 's'} (${req.credits} cr)` }
    if (req.type === '3d_printing') return { icon: <Box size={14} color={T.purple} />, bg: T.purpleLight, title: `3D Print Job — ${req.filamentName || 'filament TBD'}` }
    return { icon: <Package2 size={14} color={T.blue} />, bg: T.blueLight, title: req.itemName }
  }

  // Group pending borrow requests sharing an orderId into one transaction entry;
  // credit top-up / printing / 3D print requests stay as individual entries since
  // each is already a single, self-contained item.
  const pendingEntries = (() => {
    const groups = []
    const index = new Map()
    const others = []
    pending.forEach(req => {
      if (req.type === 'borrow') {
        const key = req.orderId || `single-${req.id}`
        if (index.has(key)) { groups[index.get(key)].group.push(req); return }
        index.set(key, groups.length)
        groups.push({ kind: 'borrow', key, group: [req], date: req.date })
      } else {
        others.push({ kind: 'other', key: `req-${req.id}`, req, date: req.date })
      }
    })
    return [...groups, ...others].sort((a, b) => new Date(b.date) - new Date(a.date))
  })()

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'auto', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${T.stone}`, background: T.cream, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={15} color={T.amber} />
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: T.charcoal }}>Pending Approval ({pendingEntries.length})</h3>
        </div>

        <div style={{ minWidth: 920 }}>
        {/* Same table shape as the Borrow Tracker */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 2fr 0.9fr 0.9fr 0.7fr 1.6fr', gap: 10, padding: '10px 16px', background: T.cream, borderBottom: `1px solid ${T.stone}` }}>
          {['Student', 'Items', 'Borrow Date', 'Return Date', 'Status', 'Actions'].map((h, i) => (
            <span key={h} style={{ color: T.faint, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: i === 5 ? 'right' : 'left' }}>{h}</span>
          ))}
        </div>
        {pendingEntries.length === 0
          ? <p style={{ color: T.faint, textAlign: 'center', padding: '2rem', margin: 0 }}>No pending requests.</p>
          : pendingEntries.map(entry => {
            const isBorrow = entry.kind === 'borrow'
            const first = isBorrow ? entry.group[0] : entry.req
            const u = users.find(x => x.id === first.userId)
            const itemsLabel = isBorrow
              ? entry.group.map(r => r.itemName + (r.qty > 1 ? ` ×${r.qty}` : '')).join(', ')
              : rowMeta(entry.req).title
            const needsWeight = !isBorrow && entry.req.type === '3d_printing'
            return (
              <div key={entry.key} style={{ borderBottom: `1px solid ${T.stone}` }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 2fr 0.9fr 0.9fr 0.7fr 1.6fr', gap: 10, padding: '12px 16px', alignItems: 'center' }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, color: T.ink, fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u?.name || `User #${first.userId}`}</p>
                    {u?.studentId && <p style={{ margin: 0, color: T.faint, fontSize: 10 }}>{u.studentId}</p>}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, color: T.charcoal, fontWeight: 500, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{itemsLabel}</p>
                    {first.note && <p style={{ margin: 0, color: T.faint, fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{first.note}"</p>}
                  </div>
                  <span style={{ color: T.muted, fontSize: 12 }}>{first.date}</span>
                  <span style={{ color: T.muted, fontSize: 12 }}>{first.dueDate || '—'}</span>
                  <div><Badge status="pending" small /></div>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    {!needsWeight ? (
                      <>
                        <button onClick={() => isBorrow ? denyGroup(entry.group) : deny(entry.req)}
                          style={{ padding: '6px 12px', background: T.redLight, border: 'none', borderRadius: 8, color: T.red, fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                          <XCircle size={12} /> Decline
                        </button>
                        <button onClick={() => isBorrow ? approveGroup(entry.group) : approve(entry.req)}
                          style={{ padding: '6px 12px', background: T.green, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                          <CheckCircle2 size={12} /> Approve
                        </button>
                      </>
                    ) : (
                      <span style={{ fontSize: 11, color: T.faint }}>Enter weight below</span>
                    )}
                  </div>
                </div>

                {/* 3D print jobs — weigh the finished print, then charge */}
                {needsWeight && (
                  <div style={{ padding: '0 16px 12px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <input type="number" min="0" step="0.1" placeholder="Weight in grams" value={gramsInput[entry.req.id] || ''}
                      onChange={e => setGramsInput(p => ({ ...p, [entry.req.id]: e.target.value }))}
                      style={{ width: 140, background: T.cream, border: `1px solid ${T.border}`, borderRadius: 8, padding: '7px 10px', fontSize: 13, outline: 'none' }} />
                    {gramsInput[entry.req.id] > 0 && (() => {
                      const rate = filaments.find(f => f.id === entry.req.filamentId)?.rate ?? 4
                      return <span style={{ fontSize: 12, color: T.muted }}>= <strong style={{ color: T.charcoal }}>{Math.round(gramsInput[entry.req.id] * rate)} cr</strong> at {rate}cr/g</span>
                    })()}
                    <button onClick={() => deny(entry.req)} style={{ padding: '6px 12px', background: T.redLight, border: 'none', borderRadius: 8, color: T.red, fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                      <XCircle size={12} /> Decline
                    </button>
                    <button onClick={() => confirm3DWeight(entry.req)} style={{ padding: '6px 12px', background: T.green, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                      <CheckCircle2 size={12} /> Confirm Weight & Charge
                    </button>
                  </div>
                )}
              </div>
            )
          })
        }
        </div>
      </div>

      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${T.stone}`, background: T.cream }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: T.charcoal }}>Handled Requests</h3>
        </div>
        {handled.length === 0
          ? <p style={{ color: T.faint, textAlign: 'center', padding: '2rem', margin: 0 }}>None yet.</p>
          : handled.map(req => {
            const meta = rowMeta(req)
            return (
            <div key={req.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0.9rem 1.5rem', borderBottom: `1px solid ${T.stone}` }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 500, color: T.ink, fontSize: 14 }}>
                  {meta.title}{req.type === '3d_printing' && req.grams ? ` — ${req.grams}g, ${req.credits} cr` : ''}
                </p>
                <p style={{ margin: '2px 0 0', color: T.faint, fontSize: 12 }}>{getName(req.userId)} · {req.date}</p>
              </div>
              <Badge status={req.status === 'approved' ? 'approved' : 'denied'} small />
            </div>
          )})
        }
      </div>
    </div>
  )
}
