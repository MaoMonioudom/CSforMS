import { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'

export const RANGE_OPTIONS = [
  { id: 'today',     label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'thisWeek',  label: 'This Week' },
  { id: 'thisMonth', label: 'This Month' },
  { id: 'year',      label: 'Last Year' },
  { id: 'all',       label: 'All Time' },
]

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

// Checks whether a yyyy-mm-dd date string falls within the given range, relative to
// today — shared by every dashboard that offers a period filter. `range` is either
// one of RANGE_OPTIONS' ids, or a custom range in the form "custom:FROM:TO".
export function inRange(dateStr, range) {
  if (!range || range === 'all') return true
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return false

  if (range.startsWith('custom:')) {
    const [, from, to] = range.split(':')
    if (from && d < new Date(from)) return false
    if (to && d > new Date(`${to}T23:59:59`)) return false
    return true
  }

  const today0 = startOfDay(new Date())
  if (range === 'today') return startOfDay(d).getTime() === today0.getTime()
  if (range === 'yesterday') {
    const y = new Date(today0); y.setDate(y.getDate() - 1)
    return startOfDay(d).getTime() === y.getTime()
  }
  if (range === 'thisWeek') {
    const from = new Date(today0); from.setDate(from.getDate() - today0.getDay()) // back to Sunday
    return d >= from
  }
  if (range === 'thisMonth') {
    const from = new Date(today0.getFullYear(), today0.getMonth(), 1)
    return d >= from
  }
  if (range === 'year') { const from = new Date(today0); from.setFullYear(from.getFullYear() - 1); return d >= from }
  return true
}

function labelFor(value) {
  if (value?.startsWith('custom:')) {
    const [, from, to] = value.split(':')
    return from && to ? `${from} → ${to}` : 'Custom Range'
  }
  return RANGE_OPTIONS.find(o => o.id === value)?.label || RANGE_OPTIONS[0].label
}

// Small dropdown pill used on dashboards/reports to switch the active date range —
// includes a "Custom Range" option that reveals a from/to date picker.
export default function DateRangeFilter({ value, onChange }) {
  const [open,   setOpen]   = useState(false)
  const [custom, setCustom] = useState(false)
  const [from,   setFrom]   = useState('')
  const [to,     setTo]     = useState('')

  const applyCustom = () => { if (from || to) { onChange(`custom:${from}:${to}`); setOpen(false) } }

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-inv-muted"
        style={{ background: '#fff', cursor: 'pointer' }}>
        <Calendar size={12} /> {labelFor(value)} <ChevronDown size={12} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
          <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 8px 24px rgba(15,23,42,0.12)', zIndex: 20, overflow: 'hidden', minWidth: 190 }}>
            {!custom ? (
              <>
                {RANGE_OPTIONS.map(o => (
                  <button key={o.id} onClick={() => { onChange(o.id); setOpen(false) }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none',
                      background: o.id === value ? '#f0fdff' : '#fff', fontSize: 12, cursor: 'pointer',
                      color: o.id === value ? '#0891b2' : '#334155', fontWeight: o.id === value ? 700 : 500,
                    }}>
                    {o.label}
                  </button>
                ))}
                <button onClick={() => setCustom(true)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', borderTop: '1px solid #f1f5f9', background: '#fff', fontSize: 12, cursor: 'pointer', color: '#334155', fontWeight: 500 }}>
                  Custom Range…
                </button>
              </>
            ) : (
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>From</label>
                <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                  style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '5px 8px', fontSize: 12, outline: 'none' }} />
                <label style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>To</label>
                <input type="date" value={to} onChange={e => setTo(e.target.value)}
                  style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '5px 8px', fontSize: 12, outline: 'none' }} />
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <button onClick={() => setCustom(false)} style={{ flex: 1, padding: '6px 0', border: 'none', borderRadius: 6, background: '#f1f5f9', color: '#64748b', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Back</button>
                  <button onClick={applyCustom} style={{ flex: 1, padding: '6px 0', border: 'none', borderRadius: 6, background: '#0891b2', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Apply</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
