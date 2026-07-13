import { useState } from 'react'
import { Search, Plus, Edit2, Trash2, AlertTriangle, ChevronDown, Box, Wrench, X, User, Calendar, FileText } from 'lucide-react'
import Badge from '../../../components/inventory/ui/Badge'
import { T } from '../../../lib/inventory/theme'
import { CATEGORIES } from '../../../lib/inventory/data'

const BLANK = { name: '', category: 'electronic_equipment', type: 'Returnable', credits: 0, zone: '', room: 'Makerspace Room', status: 'available', description: '', stock: 1, minStock: 2, condition: 'Good', borrowCount: 0 }
const FIL_BLANK = { name: 'PLA', color: '', hex: '#94A3B8', stockGrams: 0, rate: 4 }

const ROOMS = ['Makerspace Room', 'Mechanic Room', 'Fabrication Lab', 'Digital Lab', 'Storage Room']
const STATUS_FILTERS = ['All', 'Available', 'Borrowed', 'Maintenance', 'Low Stock', 'Unavailable']
const PAGE_SIZE = 10
export default function InventoryManager({ items, setItems, user, filaments = [], setFilaments }) {
  const [search,  setSearch]  = useState('')
  const [cat,     setCat]     = useState('all')
  const [statusTab, setStatusTab] = useState('All')
  const [page,    setPage]    = useState(1)
  const [modal,   setModal]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState(BLANK)
  const [delId,   setDelId]   = useState(null)
  const [expanded, setExpanded] = useState(null)
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // ── Filament inventory (used for 3D print job pricing) ───────────────────────
  const [filModal,   setFilModal]   = useState(false)
  const [filEditing, setFilEditing] = useState(null)
  const [filForm,    setFilForm]    = useState(FIL_BLANK)
  const [filDelId,   setFilDelId]   = useState(null)
  const setFF = (k, v) => setFilForm(f => ({ ...f, [k]: v }))

  const saveFilament = () => {
    if (filEditing) setFilaments(p => p.map(f => f.id === filEditing ? { ...f, ...filForm } : f))
    else setFilaments(p => [...p, { ...filForm, id: Date.now() }])
    setFilModal(false)
  }

  // "Low Stock" is derived (stock at/below minimum) rather than a stored status.
  const matchesStatus = (i) => {
    if (statusTab === 'All') return true
    if (statusTab === 'Low Stock') return i.stock <= i.minStock
    return i.status === statusTab.toLowerCase()
  }

  const filtered = items.filter(i => (cat === 'all' || i.category === cat) && matchesStatus(i) && i.name.toLowerCase().includes(search.toLowerCase()))
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visibleItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const save = () => {
    if (editing) setItems(p => p.map(i => i.id === editing ? { ...i, ...form } : i))
    else setItems(p => [...p, { ...form, id: Date.now() }])
    setModal(false)
  }

  const inp = { width: '100%', background: T.cream, border: `1px solid ${T.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 14, color: T.charcoal, outline: 'none', boxSizing: 'border-box' }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, flex: 1, minWidth: 240 }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
            <Search size={14} color={T.faint} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input placeholder="Search items…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              style={{ width: '100%', background: T.white, border: `1px solid ${T.border}`, borderRadius: 10, padding: '9px 14px 9px 36px', fontSize: 14, color: T.charcoal, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <select value={cat} onChange={e => { setCat(e.target.value); setPage(1) }}
            style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 10, padding: '9px 14px', fontSize: 14, color: T.muted }}>
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        {user.role !== 'user' && (
          <button onClick={() => { setForm(BLANK); setEditing(null); setModal(true) }}
            style={{ background: T.red, color: '#fff', border: 'none', borderRadius: 10, padding: '9px 18px', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', flexShrink: 0 }}>
            <Plus size={15} /> Add Item
          </button>
        )}
      </div>

      {/* Status filter pills */}
      <div className="inv-hscroll" style={{ display: 'flex', gap: 6, marginBottom: '1rem', overflowX: 'auto', paddingBottom: 2 }}>
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => { setStatusTab(s); setPage(1) }}
            style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              ...(s === statusTab
                ? { background: '#0891b2', color: '#fff', border: 'none' }
                : { background: '#fff', color: T.muted, border: `1px solid ${T.border}` }) }}>
            {s}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', flexShrink: 0, alignSelf: 'center', fontSize: 12, color: T.faint }}>{filtered.length} items</span>
      </div>

      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'auto' }}>
        <div style={{ minWidth: 820 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1.1fr 0.8fr 0.7fr 0.6fr 0.9fr 1.5fr', gap: 10, padding: '10px 16px', background: T.cream, borderBottom: `1px solid ${T.stone}` }}>
          {['Item', 'Category', 'Type', 'Credits', 'Stock', 'Status', 'Actions'].map((h, i) => (
            <span key={h} style={{ color: T.faint, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: i === 6 ? 'right' : 'left' }}>{h}</span>
          ))}
        </div>
        {visibleItems.length === 0 && <p style={{ color: T.faint, textAlign: 'center', padding: '2rem', margin: 0 }}>No items match this filter.</p>}
        {visibleItems.map(item => {
          const c    = CATEGORIES.find(c => c.id === item.category)
          const isLow = item.stock <= item.minStock
          const isOpen = expanded === item.id
          return (
            <div key={item.id} style={{ borderBottom: `1px solid ${T.stone}` }}>
            <div className="trow" style={{ display: 'grid', gridTemplateColumns: '2.2fr 1.1fr 0.8fr 0.7fr 0.6fr 0.9fr 1.5fr', gap: 10, padding: '12px 16px', alignItems: 'center', transition: 'background 0.1s', cursor: 'pointer' }}
              onClick={() => setExpanded(isOpen ? null : item.id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 7, background: c?.color || T.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {c && <c.Icon size={14} color={c.iconColor} />}
                </div>
                <div>
                  <p style={{ margin: 0, color: T.charcoal, fontWeight: 500, fontSize: 13 }}>{item.name}</p>
                  <p style={{ margin: 0, color: T.faint, fontSize: 11 }}>{item.room}</p>
                </div>
              </div>
              <span style={{ color: T.muted, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c?.label}</span>
              <span style={{
                fontSize: 10, fontWeight: 700, color: item.type === 'Returnable' ? T.blue : T.amber,
                background: item.type === 'Returnable' ? T.blueLight : T.amberLight, padding: '3px 9px',
                borderRadius: 999, display: 'inline-block', width: 'fit-content', textTransform: 'uppercase', letterSpacing: '0.03em',
              }}>{item.type === 'Returnable' ? 'Borrow' : 'Purchase'}</span>
              <span style={{ color: T.charcoal, fontWeight: 600, fontSize: 13 }}>{item.credits > 0 ? `${item.credits}cr` : 'Free'}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {isLow && <AlertTriangle size={12} color={T.amber} />}
                <span style={{ fontWeight: 600, fontSize: 13, color: isLow ? T.amber : T.charcoal }}>{item.stock}</span>
              </div>
              <div><Badge status={item.status} small /></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                {user.role !== 'user' && (
                  <>
                    <button onClick={() => { setForm({ ...item }); setEditing(item.id); setModal(true) }}
                      style={{ padding: '5px 10px', background: T.cream, border: 'none', borderRadius: 7, color: T.muted, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', flexShrink: 0 }}>
                      <Edit2 size={10} /> Edit
                    </button>
                    <select value={item.status} onChange={e => setItems(p => p.map(i => i.id === item.id ? { ...i, status: e.target.value } : i))}
                      style={{ padding: '5px 8px', background: T.cream, border: 'none', borderRadius: 7, color: T.muted, fontSize: 12, flexShrink: 0, maxWidth: 100 }}>
                      <option>available</option><option>borrowed</option><option>maintenance</option><option>unavailable</option>
                    </select>
                    {(user.role === 'admin' || user.role === 'staff') && (
                      <button onClick={() => setDelId(item.id)} style={{ padding: '5px 8px', background: T.redLight, border: 'none', borderRadius: 7, color: T.red, cursor: 'pointer', flexShrink: 0 }}>
                        <Trash2 size={11} />
                      </button>
                    )}
                  </>
                )}
                <ChevronDown size={14} color={T.faint} style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none', flexShrink: 0 }} />
              </div>
            </div>
            <div className="grid overflow-hidden transition-all duration-200" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
              <div style={{ overflow: 'hidden' }}>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4" style={{ padding: '0 16px 14px 56px' }}>
                  {[['Description', item.description], ['Zone', `${item.zone} · ${item.room}`], ['Condition', item.condition], ['Borrow Count', item.borrowCount ?? 0],
                    ...(item.status === 'maintenance' && item.issue ? [['Reported Issue', item.issue]] : [])].map(([k, v]) => (
                    <div key={k} style={{ background: T.cream, borderRadius: 8, padding: '8px 10px' }}>
                      <p style={{ margin: 0, color: T.faint, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k}</p>
                      <p style={{ margin: '3px 0 0', color: T.charcoal, fontSize: 12, fontWeight: 600 }}>{String(v)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </div>
          )
        })}
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: `1px solid ${T.stone}` }}>
          <span style={{ fontSize: 12, color: T.faint }}>Showing {visibleItems.length} of {filtered.length} items</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: '4px 10px', border: `1px solid ${T.border}`, borderRadius: 6, background: '#fff', fontSize: 12, color: T.muted, cursor: 'pointer', opacity: page === 1 ? 0.4 : 1 }}>Prev</button>
            <span style={{ padding: '0 8px', fontSize: 12, color: T.ink }}>{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ padding: '4px 10px', border: `1px solid ${T.border}`, borderRadius: 6, background: '#fff', fontSize: 12, color: T.muted, cursor: 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>Next</button>
          </div>
        </div>
      </div>

      {/* Filament inventory — used to price & stock 3D print jobs */}
      <div style={{ marginTop: '1.5rem', background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${T.stone}`, background: T.cream, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box size={15} color={T.purple} />
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: T.charcoal }}>3D Print Filaments</h3>
          </div>
          {user.role !== 'user' && (
            <button onClick={() => { setFilForm(FIL_BLANK); setFilEditing(null); setFilModal(true) }}
              style={{ background: T.purple, color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
              <Plus size={13} /> Add Filament
            </button>
          )}
        </div>
        {filaments.length === 0 ? (
          <p style={{ color: T.faint, textAlign: 'center', padding: '2rem', margin: 0 }}>No filaments yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3" style={{ padding: '1rem 1.5rem' }}>
            {filaments.map(f => (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: f.hex, border: `1px solid ${T.border}`, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.charcoal }}>{f.name} — {f.color}</p>
                  <p style={{ margin: 0, fontSize: 11, color: T.faint }}>{f.stockGrams}g in stock · {f.rate ?? 0} cr/g</p>
                </div>
                {user.role !== 'user' && (
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button onClick={() => { setFilForm({ ...f }); setFilEditing(f.id); setFilModal(true) }}
                      style={{ padding: '5px 7px', background: T.cream, border: 'none', borderRadius: 6, color: T.muted, cursor: 'pointer' }}>
                      <Edit2 size={11} />
                    </button>
                    {(user.role === 'admin' || user.role === 'staff') && (
                      <button onClick={() => setFilDelId(f.id)} style={{ padding: '5px 7px', background: T.redLight, border: 'none', borderRadius: 6, color: T.red, cursor: 'pointer' }}>
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filament Add/Edit Modal */}
      {filModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: T.white, borderRadius: 18, padding: '2rem', width: '100%', maxWidth: 420, boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 1.5rem', fontSize: 18, fontWeight: 700, color: T.charcoal }}>{filEditing ? 'Edit Filament' : 'Add Filament'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 12 }}>
              <div>
                <label style={{ color: T.faint, fontSize: 12, display: 'block', marginBottom: 4 }}>Material</label>
                <select value={filForm.name} onChange={e => setFF('name', e.target.value)} style={inp}>
                  <option>PLA</option><option>PETG</option><option>ABS</option><option>TPU</option>
                </select>
              </div>
              <div>
                <label style={{ color: T.faint, fontSize: 12, display: 'block', marginBottom: 4 }}>Color Name</label>
                <input value={filForm.color} onChange={e => setFF('color', e.target.value)} style={inp} />
              </div>
              <div>
                <label style={{ color: T.faint, fontSize: 12, display: 'block', marginBottom: 4 }}>Swatch Color</label>
                <input type="color" value={filForm.hex} onChange={e => setFF('hex', e.target.value)} style={{ ...inp, padding: 4, height: 38 }} />
              </div>
              <div>
                <label style={{ color: T.faint, fontSize: 12, display: 'block', marginBottom: 4 }}>Stock (grams)</label>
                <input type="number" min="0" value={filForm.stockGrams} onChange={e => setFF('stockGrams', +e.target.value)} style={inp} />
              </div>
              <div>
                <label style={{ color: T.faint, fontSize: 12, display: 'block', marginBottom: 4 }}>Credit per Gram</label>
                <input type="number" min="0" step="0.5" value={filForm.rate} onChange={e => setFF('rate', +e.target.value)} style={inp} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setFilModal(false)} style={{ padding: '9px 20px', background: T.cream, border: 'none', borderRadius: 8, color: T.muted, cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveFilament} style={{ padding: '9px 20px', background: T.purple, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Save Filament</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm filament delete */}
      {filDelId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: T.white, borderRadius: 16, padding: '2rem', width: 340, textAlign: 'center' }}>
            <AlertTriangle size={34} color={T.red} style={{ marginBottom: 12 }} />
            <p style={{ color: T.charcoal, fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Delete this filament?</p>
            <p style={{ color: T.muted, fontSize: 14, marginBottom: '1.5rem' }}>This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setFilDelId(null)} style={{ padding: '9px 20px', background: T.cream, border: 'none', borderRadius: 8, color: T.muted, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => { setFilaments(p => p.filter(f => f.id !== filDelId)); setFilDelId(null) }} style={{ padding: '9px 20px', background: T.red, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: T.white, borderRadius: 18, padding: '2rem', width: '100%', maxWidth: 540, maxHeight: '85vh', overflowY: 'auto', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 1.5rem', fontSize: 18, fontWeight: 700, color: T.charcoal }}>{editing ? 'Edit Item' : 'Add New Item'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 12 }}>
              {/* No price field — everything is credit-based. */}
              {[['name','Item Name'],['zone','Zone Code'],['credits','Credits'],['stock','Stock Qty'],['minStock','Min Stock']].map(([k, label]) => (
                <div key={k}>
                  <label style={{ color: T.faint, fontSize: 12, display: 'block', marginBottom: 4 }}>{label}</label>
                  <input value={form[k]} onChange={e => setF(k, ['credits','stock','minStock'].includes(k) ? +e.target.value : e.target.value)} style={inp} />
                </div>
              ))}
              <div>
                <label style={{ color: T.faint, fontSize: 12, display: 'block', marginBottom: 4 }}>Room</label>
                <select value={form.room} onChange={e => setF('room', e.target.value)} style={inp}>
                  {ROOMS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: T.faint, fontSize: 12, display: 'block', marginBottom: 4 }}>Category</label>
                <select value={form.category} onChange={e => setF('category', e.target.value)} style={inp}>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: T.faint, fontSize: 12, display: 'block', marginBottom: 4 }}>Type</label>
                <select value={form.type} onChange={e => setF('type', e.target.value)} style={inp}>
                  <option>Returnable</option><option>Consumable</option>
                </select>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ color: T.faint, fontSize: 12, display: 'block', marginBottom: 4 }}>Description</label>
                <textarea value={form.description} onChange={e => setF('description', e.target.value)} rows={3} style={{ ...inp, resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(false)} style={{ padding: '9px 20px', background: T.cream, border: 'none', borderRadius: 8, color: T.muted, cursor: 'pointer' }}>Cancel</button>
              <button onClick={save} style={{ padding: '9px 20px', background: T.red, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Save Item</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {delId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: T.white, borderRadius: 16, padding: '2rem', width: 340, textAlign: 'center' }}>
            <AlertTriangle size={34} color={T.red} style={{ marginBottom: 12 }} />
            <p style={{ color: T.charcoal, fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Delete this item?</p>
            <p style={{ color: T.muted, fontSize: 14, marginBottom: '1.5rem' }}>This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setDelId(null)} style={{ padding: '9px 20px', background: T.cream, border: 'none', borderRadius: 8, color: T.muted, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => { setItems(p => p.filter(i => i.id !== delId)); setDelId(null) }} style={{ padding: '9px 20px', background: T.red, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
