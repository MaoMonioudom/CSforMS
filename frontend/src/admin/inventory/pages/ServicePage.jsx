import { useState } from 'react'
import { Search, Printer, BadgeCheck, Box } from 'lucide-react'
import Badge from '../../../components/inventory/ui/Badge'
import { T } from '../../../lib/inventory/theme'
import { PRINT_SERVICES } from '../../../lib/inventory/data'
import { useInventory } from '../../../lib/inventory/InventoryContext'

const PRINT_RATE = PRINT_SERVICES.find(s => s.id === 'printing').rate

// ── Lab Services — walk-up print & 3D print fulfillment. Staff find a student by
// name or ID, enter pages or grams, and charge credits directly — no request/
// approval step needed since the student is standing at the counter. 3D print
// cost is driven entirely by the selected filament's own credit-per-gram rate,
// so editing that rate in Manage Stock changes the price here immediately.
export default function ServicePage({ users = [], filaments = [], showToast, user }) {
  const ctx = useInventory()
  const [query,      setQuery]      = useState('')
  const [student,    setStudent]    = useState(null)
  const [pages,      setPages]      = useState('')
  const [filamentId, setFilamentId] = useState(filaments[0]?.id || '')
  const [grams,      setGrams]      = useState('')

  const results = query.trim()
    ? users.filter(u => u.role === 'user' && (
        u.studentId?.toLowerCase().includes(query.toLowerCase()) ||
        u.name.toLowerCase().includes(query.toLowerCase())
      ))
    : []

  const filament     = filaments.find(f => f.id === Number(filamentId))
  // 3D printing deducts the filament's own credit-per-gram rate; 4 cr/g default.
  const filamentRate  = filament?.rate ?? 4
  const printCredits = Math.round(Number(pages || 0) * PRINT_RATE)
  const printCost3D  = Math.round(Number(grams || 0) * filamentRate)

  const chargePrinting = async () => {
    const p = Number(pages)
    if (!p || p <= 0) { showToast?.('Enter how many pages.', 'error'); return }
    if (student.credits < printCredits) { showToast?.(`${student.name} needs ${printCredits} cr but only has ${student.credits}.`, 'error'); return }
    try {
      await ctx.chargePrint({ studentId: student.id, pages: p, rate: PRINT_RATE })
      setStudent(prev => ({ ...prev, credits: prev.credits - printCredits }))
      showToast?.(`Charged ${printCredits} cr for ${p} page(s) — ${student.name}`)
      setPages('')
    } catch (err) {
      showToast?.(err.message || 'Charge failed.', 'error')
    }
  }

  const charge3D = async () => {
    const g = Number(grams)
    if (!g || g <= 0) { showToast?.('Enter the print weight in grams.', 'error'); return }
    if (!filament) { showToast?.('Select a filament first.', 'error'); return }
    if (student.credits < printCost3D) { showToast?.(`${student.name} needs ${printCost3D} cr but only has ${student.credits}.`, 'error'); return }
    try {
      await ctx.charge3D({ studentId: student.id, filamentId: filament.id, grams: g })
      setStudent(prev => ({ ...prev, credits: prev.credits - printCost3D }))
      showToast?.(`Charged ${printCost3D} cr for ${g}g (${filament.name} ${filament.color}) — ${student.name}`)
      setGrams('')
    } catch (err) {
      showToast?.(err.message || 'Charge failed.', 'error')
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: T.charcoal }}>Lab Services</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: T.faint }}>Fulfill walk-up print and 3D print jobs — find a student, charge credits directly.</p>
      </div>

      {/* ── What the service lab offers ─────────────────────────────────────── */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PRINT_SERVICES.map(svc => {
          const isDoc = svc.id === 'printing'
          return (
            <div key={svc.id} style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, padding: '1rem 1.25rem', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: isDoc ? T.blueLight : T.purpleLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svc.Icon size={17} color={isDoc ? T.blue : T.purple} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.charcoal }}>{svc.label}</p>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{svc.desc}</p>
                <p style={{ margin: '6px 0 0', fontSize: 12, fontWeight: 700, color: isDoc ? T.blue : T.purple }}>
                  {isDoc ? `${PRINT_RATE} credits / page` : 'Deducted per gram at the filament’s rate (default 4 cr/g)'}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Available 3D filaments — rate editable by admin/staff ───────────── */}
      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: '1.25rem' }}>
        <div style={{ padding: '0.85rem 1.5rem', borderBottom: `1px solid ${T.stone}`, background: T.cream, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Box size={15} color={T.purple} />
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.charcoal }}>Available Filaments</h3>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: T.faint }}>Credits per gram can be updated here</span>
        </div>
        {filaments.length === 0 ? (
          <p style={{ color: T.faint, textAlign: 'center', padding: '1.5rem', margin: 0, fontSize: 13 }}>No filaments configured — add them in Manage Stock.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4" style={{ padding: '0.85rem 1.5rem' }}>
            {filaments.map(f => (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, border: `1px solid ${T.border}`, borderRadius: 10, padding: '9px 12px' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: f.hex, border: `1px solid ${T.border}`, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: T.charcoal, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name} — {f.color}</p>
                  <p style={{ margin: 0, fontSize: 11, color: T.faint }}>{f.stockGrams}g in stock</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <input type="number" min="0" step="0.5" value={f.rate ?? 4}
                    onChange={e => setFilaments?.(prev => prev.map(x => x.id === f.id ? { ...x, rate: +e.target.value } : x))}
                    style={{ width: 48, background: T.cream, border: `1px solid ${T.border}`, borderRadius: 6, padding: '4px 6px', fontSize: 12, textAlign: 'right', outline: 'none' }} />
                  <span style={{ fontSize: 10, color: T.faint }}>cr/g</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${T.stone}`, background: T.cream, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Printer size={15} color={T.blue} />
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: T.charcoal }}>Print &amp; 3D Print Service</h3>
        </div>

        <div style={{ padding: '1.25rem 1.5rem' }}>
          {!student ? (
            <>
              <div style={{ position: 'relative', marginBottom: 10 }}>
                <Search size={14} color={T.faint} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input placeholder="Search student by name or ID…" value={query} onChange={e => setQuery(e.target.value)}
                  style={{ width: '100%', background: T.cream, border: `1px solid ${T.border}`, borderRadius: 10, padding: '9px 14px 9px 36px', fontSize: 14, color: T.charcoal, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              {query.trim() && (
                results.length === 0
                  ? <p style={{ color: T.faint, fontSize: 13, margin: 0 }}>No matching student.</p>
                  : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {results.map(u => (
                        <button key={u.id} onClick={() => { setStudent(u); setQuery('') }}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, border: `1px solid ${T.border}`, background: '#fff', borderRadius: 8, padding: '8px 12px', textAlign: 'left', cursor: 'pointer' }}>
                          <div>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.charcoal }}>{u.name}</p>
                            <p style={{ margin: '2px 0 0', fontSize: 11, color: T.faint }}>{u.studentId} · {u.credits} cr</p>
                          </div>
                          <Badge status={u.membership === 'active' ? 'approved' : 'denied'} small />
                        </button>
                      ))}
                    </div>
                  )
              )}
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 16, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: T.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                    {student.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.charcoal }}>{student.name}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: T.faint }}>{student.studentId} · {student.credits} cr available</p>
                  </div>
                </div>
                <button onClick={() => setStudent(null)} style={{ padding: '5px 10px', background: T.cream, border: 'none', borderRadius: 6, color: T.muted, fontSize: 11, cursor: 'pointer' }}>Change</button>
              </div>

              {student.membership !== 'active' ? (
                <p style={{ color: T.red, fontSize: 13, margin: 0 }}>This student doesn't have an active membership.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* Document printing — flex column so both Charge buttons align on the same line */}
                  <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column' }}>
                    <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: T.charcoal, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Printer size={13} color={T.blue} /> Document Printing
                    </p>
                    <input type="number" min="1" placeholder="Number of pages" value={pages} onChange={e => setPages(e.target.value)}
                      style={{ width: '100%', background: T.cream, border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none', boxSizing: 'border-box', marginBottom: 8 }} />
                    {pages > 0 && <p style={{ margin: '0 0 8px', fontSize: 12, color: T.muted }}>= <strong style={{ color: T.charcoal }}>{printCredits} cr</strong> at {PRINT_RATE}cr/page</p>}
                    <button onClick={chargePrinting} style={{ width: '100%', marginTop: 'auto', padding: '8px 0', background: T.blue, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, cursor: 'pointer' }}>
                      <BadgeCheck size={13} /> Charge & Print
                    </button>
                  </div>

                  {/* 3D printing */}
                  <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column' }}>
                    <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: T.charcoal, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Box size={13} color={T.purple} /> 3D Printing
                    </p>
                    <select value={filamentId} onChange={e => setFilamentId(e.target.value)}
                      style={{ width: '100%', background: T.cream, border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}>
                      {filaments.length === 0 && <option value="">No filament configured</option>}
                      {filaments.map(f => <option key={f.id} value={f.id}>{f.name} — {f.color} ({f.stockGrams}g, {f.rate ?? 4}cr/g)</option>)}
                    </select>
                    <input type="number" min="1" step="0.1" placeholder="Weight in grams" value={grams} onChange={e => setGrams(e.target.value)}
                      style={{ width: '100%', background: T.cream, border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none', boxSizing: 'border-box', marginBottom: 8 }} />
                    {grams > 0 && <p style={{ margin: '0 0 8px', fontSize: 12, color: T.muted }}>= <strong style={{ color: T.charcoal }}>{printCost3D} cr</strong> at {filamentRate}cr/g</p>}
                    <button onClick={charge3D} style={{ width: '100%', marginTop: 'auto', padding: '8px 0', background: T.purple, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, cursor: 'pointer' }}>
                      <BadgeCheck size={13} /> Charge & Print
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
