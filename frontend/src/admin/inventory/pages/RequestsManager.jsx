import { useState, useMemo } from 'react'
import {
  Search, ChevronLeft, ChevronRight, X, Check, Ban, User, Package,
  FileText, History, CheckCircle2, XCircle, AlertCircle, Eye, Tag,
  CreditCard, Printer, Box, Package2,
} from 'lucide-react'
import { T } from '../../../lib/inventory/theme'
import { CREDIT_RATE, PRINT_SERVICES, CATEGORIES } from '../../../lib/inventory/data'
import { useInventory } from '../../../lib/inventory/InventoryContext'
import { fmtDateTime } from '../../../lib/inventory/datetime'

const PRINT_RATE = PRINT_SERVICES.find(s => s.id === 'printing').rate
const PAGE_SIZE = 10

const STATUS_STYLE = {
  Pending:  { bg: T.amberLight, fg: T.amber, icon: AlertCircle },
  Approved: { bg: T.greenLight, fg: T.green, icon: CheckCircle2 },
  Declined: { bg: T.redLight,   fg: T.red,   icon: XCircle },
}

function StatusPill({ status }) {
  const s = STATUS_STYLE[status]
  const Icon = s.icon
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: s.bg, color: s.fg }}>
      <Icon size={11} /> {status}
    </span>
  )
}

function SectionLabel({ icon: Icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: T.faint }}>
      <Icon size={12} /> {text}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: T.faint, marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 600, color: T.charcoal }}>{value}</div>
    </div>
  )
}

// ── Requests Manager (staff/admin approve) — handles borrow requests, credit
// top-ups, document printing, and 3D print jobs (which need a weight entered
// by staff before they can be charged) in one queue ───────────────────────────
export default function RequestsManager({ requests, borrows, items, users, user, showToast, filaments = [] }) {
  const ctx = useInventory()
  const [gramsInput, setGramsInput] = useState({})
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [detail, setDetail] = useState(null)

  const getLabel = (id) => { const u = users.find(x => x.id === id); return u ? u.name + (u.studentId ? ` (${u.studentId})` : '') : `User #${id}` }
  const getUser  = (id) => users.find(u => u.id === id)
  const getCategory = (itemId) => { const p = items.find(i => i.id === itemId); return p ? CATEGORIES.find(c => c.id === p.category)?.label : null }

  // All mutations go through the backend now — these wrappers just add toasts.
  const tryAction = async (fn, successMsg) => {
    try {
      await fn()
      if (successMsg) showToast(successMsg)
    } catch (err) {
      showToast(err.message || 'Action failed. Please try again.', 'error')
    }
  }

  // Approve or decline every request in a multi-item borrow transaction together —
  // the backend creates the borrow rows, adjusts stock, and notifies the student.
  const approveGroup = (group) =>
    tryAction(() => ctx.approveBorrowGroup(group.map(r => r.id)),
      group.length === 1 ? `Approved: ${group[0].itemName}` : `Approved ${group.length} items`)

  const denyGroup = (group) =>
    tryAction(() => ctx.denyRequests(group.map(r => r.id)), 'Declined request')

  const approveTopUp = (req) => {
    const student = getUser(req.userId)
    const creditsToAdd = Math.round(req.amountUSD * CREDIT_RATE)
    return tryAction(() => ctx.approveTopUp(req.id), `Approved top-up: +${creditsToAdd} credits for ${student?.name || `user #${req.userId}`}`)
  }

  const approvePrinting = (req) => {
    const student = getUser(req.userId)
    if (student && student.credits < req.credits) { showToast('Student has insufficient credits for this print job.', 'error'); return }
    return tryAction(() => ctx.approvePrinting(req.id), `Approved printing — ${req.credits} cr`)
  }

  // Staff weigh the finished 3D print and enter grams here — cost is computed
  // by the backend from the assigned filament's credit-per-gram rate.
  const confirm3DWeight = (req) => {
    const grams = Number(gramsInput[req.id])
    if (!grams || grams <= 0) { showToast('Enter the print weight in grams.', 'error'); return }
    const filament = filaments.find(f => f.id === req.filamentId)
    const credits = Math.round(grams * (filament?.rate ?? 4))
    return tryAction(() => ctx.confirm3DWeight(req.id, grams), `Charged ~${credits} cr for ${grams}g`)
  }

  // Only credit top-up, printing, and 3D print jobs route here — borrow requests
  // are always approved/declined as a whole transaction via approveGroup/denyGroup.
  const approve = (req) => {
    if (req.type === 'credit_topup') return approveTopUp(req)
    if (req.type === 'printing') return approvePrinting(req)
    if (req.type === '3d_printing') return confirm3DWeight(req)
  }

  const deny = (req) => tryAction(() => ctx.denyRequests([req.id]), 'Declined request')

  const rowMeta = (req) => {
    if (req.type === 'credit_topup') return { icon: <CreditCard size={14} color={T.amber} />, title: `Credit Top-Up — $${req.amountUSD} (${Math.round(req.amountUSD * CREDIT_RATE)} cr)`, category: 'Credit Top-Up' }
    if (req.type === 'printing') return { icon: <Printer size={14} color={T.blue} />, title: `Document Printing — ${req.pages} page${req.pages === 1 ? '' : 's'} (${req.credits} cr)`, category: 'Lab Service' }
    if (req.type === '3d_printing') return { icon: <Box size={14} color={T.purple} />, title: `3D Print Job — ${req.filamentName || 'filament TBD'}`, category: 'Lab Service' }
    return { icon: <Package2 size={14} color={T.blue} />, title: req.itemName, category: getCategory(req.itemId) }
  }

  // Group every borrow request sharing an orderId into one transaction entry
  // (pending AND handled, so the same grouping applies everywhere); credit
  // top-up / printing / 3D print requests stay as individual entries.
  const entries = useMemo(() => {
    const groups = []
    const index = new Map()
    const others = []
    requests.forEach(req => {
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
  }, [requests])

  const statusLabel = (raw) => raw === 'approved' ? 'Approved' : raw === 'denied' ? 'Declined' : 'Pending'

  const withMeta = entries.map(entry => {
    const isBorrow = entry.kind === 'borrow'
    const first = isBorrow ? entry.group[0] : entry.req
    const student = getUser(first.userId)
    const status = statusLabel(first.status)
    const itemsList = isBorrow
      ? entry.group.map(r => ({ id: r.id, name: r.itemName, qty: r.qty || 1, category: getCategory(r.itemId) }))
      : [{ id: first.id, name: rowMeta(first).title, qty: first.qty || 1, category: rowMeta(first).category }]
    const totalQty = itemsList.reduce((s, it) => s + it.qty, 0)
    return { ...entry, isBorrow, first, student, status, itemsList, totalQty }
  })

  const filtered = withMeta.filter(e =>
    (statusFilter === 'All' || e.status === statusFilter) &&
    (!query ||
      (e.student?.name || '').toLowerCase().includes(query.toLowerCase()) ||
      (e.student?.studentId || '').toLowerCase().includes(query.toLowerCase()) ||
      e.itemsList.some(it => it.name.toLowerCase().includes(query.toLowerCase())))
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const buildHistory = (e) => {
    const h = [{ action: 'Request submitted', by: e.student?.name || `User #${e.first.userId}`, date: e.first.date }]
    if (e.status === 'Approved') h.push({ action: 'Approved', by: `Staff — ${user.name}`, date: e.first.date })
    if (e.status === 'Declined') h.push({ action: 'Declined', by: `Staff — ${user.name}`, date: e.first.date })
    return h
  }

  const inp = { flex: 1, minWidth: 140, background: T.cream, border: `1px solid ${T.border}`, borderRadius: 8, padding: '7px 10px', fontSize: 13, outline: 'none' }

  return (
    <div className="p-4 sm:p-8">
      <style>{`
        .req-row { transition: background .12s; }
        .req-row:hover { background: ${T.cream}; }
        .req-btn { display:inline-flex; align-items:center; gap:5px; padding:7px 12px; border-radius:8px; font-size:12px; font-weight:700; border:none; cursor:pointer; transition:opacity .12s, transform .1s; }
        .req-btn:hover { transform:translateY(-1px); }
        .req-btn-approve { background:${T.green}; color:#fff; }
        .req-btn-decline { background:#fff; color:${T.red}; border:1.5px solid ${T.red}33; }
        .req-btn-view { background:#fff; color:${T.charcoal}; border:1.5px solid ${T.border}; }
        .req-chip { padding:7px 14px; border-radius:20px; font-size:12px; font-weight:700; border:1px solid ${T.border}; background:#fff; color:${T.muted}; cursor:pointer; transition:all .15s; }
        .req-chip.active { background:${T.charcoal}; color:#fff; border-color:transparent; }
        .req-grid { grid-template-columns: 1.4fr 1.8fr 0.5fr 1.2fr 0.9fr 1.4fr; }
        .req-truncate { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .req-items-pill { display:inline-flex; align-items:center; gap:5px; font-size:11.5px; font-weight:700; color:#0891b2; background:#0891b214; padding:4px 10px; border-radius:20px; }

        .req-actions { display: flex; gap: 6px; justify-content: flex-end; flex-wrap: nowrap; }

        @media (max-width: 1180px) and (min-width: 701px) {
          .req-grid { grid-template-columns: 1.2fr 1.6fr 0.4fr 1fr 0.8fr 0.85fr; column-gap: 8px; }
          .req-table-row, .req-table-head { padding-left: 16px !important; padding-right: 16px !important; }
          .req-btn { padding: 7px 8px !important; font-size: 11px !important; }
          .req-btn .req-btn-label { display: none; }
        }
        @media (max-width: 700px) {
          .req-table-head, .req-table-row { display: none !important; }
          .req-cards { display: flex !important; }
          .req-cards .req-btn .req-btn-label { display: none; }
          .req-cards .req-actions { flex-wrap: nowrap; }
        }
      `}</style>

      <div className="mb-2">
        <h1 className="m-0 font-heading text-xl font-bold text-charcoal">Request Management</h1>
        <p className="m-0 mt-0.5 text-sm text-faint">Review and approve student requests — borrow items, credit top-ups, and print jobs.</p>
      </div>

      {/* toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, margin: '18px 0', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['All', 'Pending', 'Approved', 'Declined'].map(s => (
            <button key={s} className={`req-chip ${statusFilter === s ? 'active' : ''}`} onClick={() => { setStatusFilter(s); setPage(1) }}>
              {s}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 12, top: 11, color: T.faint }} />
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1) }}
            placeholder="Search student, ID, or item…"
            style={{ padding: '9px 14px 9px 32px', borderRadius: 20, border: `1px solid ${T.border}`, fontSize: 12.5, outline: 'none', width: 240, background: '#fff' }}
          />
        </div>
      </div>

      {/* table */}
      <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
        <div className="req-table-head req-grid" style={{
          display: 'grid', padding: '12px 20px', fontSize: 10.5, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase',
          color: T.faint, background: T.cream, borderBottom: `1px solid ${T.stone}`,
        }}>
          <span>Student</span>
          <span>Items</span>
          <span>Qty</span>
          <span>Dates</span>
          <span>Status</span>
          <span style={{ textAlign: 'right' }}>Actions</span>
        </div>

        {paged.length === 0 ? (
          <div style={{ padding: '50px 0', textAlign: 'center', color: T.faint }}>
            <Package size={26} style={{ opacity: 0.4, marginBottom: 8 }} />
            <p style={{ fontSize: 13 }}>No requests match your filters.</p>
          </div>
        ) : paged.map(e => {
          const needsWeight = !e.isBorrow && e.first.type === '3d_printing' && e.status === 'Pending'
          return (
            <div key={e.key}>
              <div className="req-row req-table-row req-grid" style={{ display: 'grid', padding: '16px 20px', alignItems: 'center', borderBottom: `1px solid ${T.stone}`, cursor: 'pointer' }}
                onClick={() => setDetail(e)}>
                <div style={{ minWidth: 0 }}>
                  <div className="req-truncate" style={{ fontSize: 13.5, fontWeight: 700, color: T.ink }}>{e.student?.name || `User #${e.first.userId}`}</div>
                  <div className="req-truncate" style={{ fontSize: 11, color: T.faint }}>{e.student?.studentId || ''}</div>
                </div>
                <div>
                  <span className="req-items-pill" title={e.itemsList.map(it => `${it.name} (${it.qty})`).join(', ')}>
                    <Package size={11} /> {e.itemsList.length} {e.itemsList.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: T.muted }}>{e.totalQty}</span>
                <div style={{ fontSize: 12, color: '#444', lineHeight: 1.5 }}>
                  <div className="req-truncate">{fmtDateTime(e.first.date)}</div>
                  {e.first.dueDate && <div className="req-truncate" style={{ color: T.faint, fontSize: 11 }}>→ {fmtDateTime(e.first.dueDate)}</div>}
                </div>
                <div><StatusPill status={e.status} /></div>
                {/* 3D print jobs need a weight entered before they can be charged —
                    that control lives here in Actions only, not as a separate
                    full-width strip under the row. */}
                <div className="req-actions" onClick={ev => ev.stopPropagation()} style={needsWeight ? { flexDirection: 'column', alignItems: 'flex-end', gap: 4 } : undefined}>
                  {needsWeight ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <input type="number" min="0" step="0.1" placeholder="Grams" value={gramsInput[e.first.id] || ''}
                          onChange={ev => setGramsInput(p => ({ ...p, [e.first.id]: ev.target.value }))}
                          style={{ width: 70, background: T.cream, border: `1px solid ${T.border}`, borderRadius: 7, padding: '6px 8px', fontSize: 12, outline: 'none' }} />
                        <button className="req-btn req-btn-approve" title="Confirm weight & charge" onClick={() => confirm3DWeight(e.first)}><Check size={12} /></button>
                        <button className="req-btn req-btn-decline" title="Decline" onClick={() => deny(e.first)}><Ban size={12} /></button>
                      </div>
                      {gramsInput[e.first.id] > 0 && (() => {
                        const rate = filaments.find(f => f.id === e.first.filamentId)?.rate ?? 4
                        return <span style={{ fontSize: 10.5, color: T.muted }}>= <strong style={{ color: T.charcoal }}>{Math.round(gramsInput[e.first.id] * rate)} cr</strong></span>
                      })()}
                    </>
                  ) : (
                    <>
                      {e.status === 'Pending' && (
                        <>
                          <button className="req-btn req-btn-decline" onClick={() => e.isBorrow ? denyGroup(e.group) : deny(e.first)}><Ban size={12} /> <span className="req-btn-label">Decline</span></button>
                          <button className="req-btn req-btn-approve" onClick={() => e.isBorrow ? approveGroup(e.group) : approve(e.first)}><Check size={12} /> <span className="req-btn-label">Approve</span></button>
                        </>
                      )}
                      <button className="req-btn req-btn-view" onClick={() => setDetail(e)}><Eye size={12} /> <span className="req-btn-label">View</span></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* mobile cards */}
        <div className="req-cards" style={{ display: 'none', flexDirection: 'column' }}>
          {paged.map(e => (
            <div key={e.key} style={{ padding: '16px 20px', borderBottom: `1px solid ${T.stone}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink }}>{e.student?.name || `User #${e.first.userId}`}</div>
                  <div style={{ fontSize: 11, color: T.faint }}>{e.student?.studentId}</div>
                </div>
                <StatusPill status={e.status} />
              </div>
              <div style={{ marginBottom: 6 }}>
                <span className="req-items-pill"><Package size={11} /> {e.itemsList.length} {e.itemsList.length === 1 ? 'item' : 'items'} · Qty {e.totalQty}</span>
              </div>
              <div style={{ fontSize: 11.5, color: T.faint, marginBottom: 10 }}>{fmtDateTime(e.first.date)}{e.first.dueDate ? ` → ${fmtDateTime(e.first.dueDate)}` : ''}</div>
              <div className="req-actions">
                {e.status === 'Pending' && !(!e.isBorrow && e.first.type === '3d_printing') && (
                  <>
                    <button className="req-btn req-btn-decline" onClick={() => e.isBorrow ? denyGroup(e.group) : deny(e.first)}><Ban size={12} /> <span className="req-btn-label">Decline</span></button>
                    <button className="req-btn req-btn-approve" onClick={() => e.isBorrow ? approveGroup(e.group) : approve(e.first)}><Check size={12} /> <span className="req-btn-label">Approve</span></button>
                  </>
                )}
                <button className="req-btn req-btn-view" onClick={() => setDetail(e)}><Eye size={12} /> <span className="req-btn-label">View</span></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
        <span style={{ fontSize: 12, color: T.faint }}>
          Showing {paged.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + paged.length} of {filtered.length}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="req-btn req-btn-view" disabled={page === 1} style={{ opacity: page === 1 ? 0.4 : 1 }} onClick={() => setPage(p => Math.max(1, p - 1))}>
            <ChevronLeft size={13} />
          </button>
          <span style={{ fontSize: 12, fontWeight: 700, padding: '7px 4px' }}>{page} / {totalPages}</span>
          <button className="req-btn req-btn-view" disabled={page === totalPages} style={{ opacity: page === totalPages ? 0.4 : 1 }} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Detail modal */}
      {detail && (
        <div onClick={() => setDetail(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 900, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.white, borderRadius: 16, maxWidth: 480, width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,.28)' }}>
            <div style={{ padding: '22px 24px', borderBottom: `1px solid ${T.border}`, position: 'relative' }}>
              <button onClick={() => setDetail(null)} style={{ position: 'absolute', top: 16, right: 16, background: T.cream, border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer' }}>
                <X size={16} />
              </button>
              <span style={{ fontSize: 11, color: T.faint }}>{detail.isBorrow ? detail.key : `REQ-${detail.first.id}`}</span>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 2, marginBottom: 8, color: T.charcoal }}>{detail.student?.name || `User #${detail.first.userId}`}</h2>
              <StatusPill status={detail.status} />
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <SectionLabel icon={User} text="Student Information" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12.5 }}>
                  <InfoRow label="Name" value={detail.student?.name || `User #${detail.first.userId}`} />
                  <InfoRow label="Student ID" value={detail.student?.studentId || '—'} />
                  <InfoRow label="Request Date" value={fmtDateTime(detail.first.date)} />
                  <InfoRow label="Return Date" value={detail.first.dueDate ? fmtDateTime(detail.first.dueDate) : '—'} />
                </div>
              </div>

              <div>
                <SectionLabel icon={Package} text="Items Requested" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {detail.itemsList.map((it) => (
                    <div key={it.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: T.cream, borderRadius: 8, fontSize: 12.5, gap: 10 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, marginBottom: 3, color: T.charcoal }}>{it.name}</div>
                        {it.category && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 700, color: T.charcoal, background: '#fff', border: `1px solid ${T.border}`, padding: '2px 8px', borderRadius: 20 }}>
                            <Tag size={9} /> {it.category}
                          </span>
                        )}
                      </div>
                      <span style={{ color: T.faint, flexShrink: 0, fontWeight: 600 }}>Qty: {it.qty}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <SectionLabel icon={FileText} text={detail.isBorrow ? 'Borrow Notes' : 'Notes'} />
                <p style={{ fontSize: 12.5, color: '#444', lineHeight: 1.6, background: T.cream, borderRadius: 8, padding: '10px 12px', margin: 0 }}>
                  {detail.first.note || 'No notes provided.'}
                </p>
              </div>

              <div>
                <SectionLabel icon={History} text="Approval History" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {buildHistory(detail).map((h, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0891b2', marginTop: 5, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: T.charcoal }}>{h.action}</div>
                        <div style={{ fontSize: 11, color: T.faint }}>{h.by} · {fmtDateTime(h.date)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {detail.status === 'Pending' && !(!detail.isBorrow && detail.first.type === '3d_printing') && (
                <div style={{ display: 'flex', gap: 10, paddingTop: 6 }}>
                  <button className="req-btn req-btn-approve" style={{ flex: 1, justifyContent: 'center', padding: '10px 0' }}
                    onClick={() => { (detail.isBorrow ? approveGroup(detail.group) : approve(detail.first)); setDetail(null) }}>
                    <Check size={13} /> Approve
                  </button>
                  <button className="req-btn req-btn-decline" style={{ flex: 1, justifyContent: 'center', padding: '10px 0' }}
                    onClick={() => { (detail.isBorrow ? denyGroup(detail.group) : deny(detail.first)); setDetail(null) }}>
                    <Ban size={13} /> Decline
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
