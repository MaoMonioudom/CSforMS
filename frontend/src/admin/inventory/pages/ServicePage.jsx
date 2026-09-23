import { useState, useRef } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, Search, Printer, BadgeCheck, Box, Cog } from 'lucide-react'
import Badge from '../../../components/inventory/ui/Badge'
import ItemImage from '../../../components/inventory/ItemImage'
import { T } from '../../../lib/inventory/theme'
import { PRINT_SERVICES, CATEGORIES, DOCUMENT_PRINTER, PAPER_PRICING } from '../../../lib/inventory/data'
import { useInventory } from '../../../lib/inventory/InventoryContext'

const CNC_CAT = CATEGORIES.find(c => c.id === 'cnc_machines')
const PAPER_SIZES = Object.keys(PAPER_PRICING)

// Plus/minus quantity control, standing in for a plain number input wherever
// the amount being charged (pages/grams/hours) is the main thing staff set.
function QtyStepper({ value, onChange, step = 1, min = 0, suffix = '' }) {
  const num = Number(value) || 0
  const dec = String(step).includes('.') ? String(step).split('.')[1].length : 0
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid ${T.border}`, borderRadius: 9, padding: '4px 6px' }}>
      <button type="button" onClick={() => onChange(Math.max(min, +(num - step).toFixed(dec)))}
        style={{ width: 22, height: 22, borderRadius: 6, border: 'none', background: T.cream, fontSize: 14, fontWeight: 700, cursor: 'pointer', color: T.charcoal, lineHeight: 1 }}>−</button>
      <span style={{ minWidth: 34, textAlign: 'center', fontSize: 13, fontWeight: 700, color: T.charcoal }}>{value || 0}{suffix}</span>
      <button type="button" onClick={() => onChange(+(num + step).toFixed(dec))}
        style={{ width: 22, height: 22, borderRadius: 6, border: 'none', background: T.cream, fontSize: 14, fontWeight: 700, cursor: 'pointer', color: T.charcoal, lineHeight: 1 }}>+</button>
    </div>
  )
}

// ── Lab Services: walk-up print, 3D print, and CNC machine-time fulfillment.
// Staff pick ONE service card, see only the info relevant to that service,
// find a student, and charge credits directly — no request/approval step,
// the student is standing at the counter. All prices/stock/availability
// shown here are read straight from Manage Stock (items/filaments); nothing
// on this page is hard-coded or editable here — edit it in Manage Stock and
// it shows up here immediately. Every CNC machine gets its own service card
// (no grouping) so staff pick the exact physical machine they're charging for.
export default function ServicePage({ users = [], items = [], filaments = [], showToast, user }) {
  const ctx = useInventory()
  const [selectedService, setSelectedService] = useState(null) // null = card grid
  const [query,      setQuery]      = useState('')
  const [student,    setStudent]    = useState(null)
  const [pages,      setPages]      = useState('')
  const [paperSize,  setPaperSize]  = useState('A4')
  const [colorMode,  setColorMode]  = useState('bw') // 'bw' | 'color'
  const [duplex,     setDuplex]     = useState('single') // 'single' | 'double' — informational only, doesn't change price
  const [filamentId, setFilamentId] = useState(filaments[0]?.id || '')
  const [filamentType, setFilamentType] = useState('')
  const [grams,      setGrams]      = useState('')
  const [hours,        setHours]        = useState('')
  const [materialCost, setMaterialCost] = useState('')
  const moreServicesRef = useRef(null)

  // The Bambu Lab 3D printer got filed under "CNC Machines" in the source
  // data even though it's a 3D printer — it represents the 3D Printing
  // service card (photo + info) instead of getting its own CNC card.
  const bambuMachine = items.find(i => i.category === 'cnc_machines' && i.name.toLowerCase().includes('bambu'))
  const cncMachines = items.filter(i => i.category === 'cnc_machines' && i.id !== bambuMachine?.id)

  // Filament "type" (PLA/PETG/...) is the Size-style picker, colors within
  // that type are the swatches — both drawn from the same filaments list,
  // just grouped by name instead of the flat dropdown this used to be.
  const filamentTypes = [...new Set(filaments.map(f => f.name))]
  const activeFilamentType = filamentType || filamentTypes[0] || ''
  const colorsForType = filaments.filter(f => f.name === activeFilamentType)
  const pickFilamentType = (type) => {
    setFilamentType(type)
    const firstColor = filaments.find(f => f.name === type)
    if (firstColor) setFilamentId(firstColor.id)
  }

  // One card per machine — no grouping into Router/Lathe/Milling/etc. Same
  // blue theme for every service now (was blue/purple/red per service type).
  const serviceCards = [
    { id: 'printing', label: PRINT_SERVICES[0].label, desc: PRINT_SERVICES[0].desc, Icon: Printer, color: T.blue, bg: T.blueLight },
    { id: '3d_printing', label: PRINT_SERVICES[1].label, desc: PRINT_SERVICES[1].desc, Icon: Box, color: T.blue, bg: T.blueLight, machine: bambuMachine },
    ...cncMachines.map(m => ({
      id: `machine_${m.id}`, label: m.name, desc: m.description || 'CNC machine time, billed per hour of use.',
      Icon: Cog, color: T.blue, bg: T.blueLight, machine: m,
    })),
  ]
  const activeCard = serviceCards.find(s => s.id === selectedService)
  const isMachineCard = selectedService?.startsWith('machine_')
  const activeMachine = activeCard?.machine

  const results = query.trim()
    ? users.filter(u => u.role === 'user' && (
        u.studentId?.toLowerCase().includes(query.toLowerCase()) ||
        u.name.toLowerCase().includes(query.toLowerCase())
      ))
    : []

  const filament     = filaments.find(f => f.id === Number(filamentId))
  // 3D printing deducts the filament's own credit-per-gram rate; 4 cr/g default.
  const filamentRate  = filament?.rate ?? 4
  const printRate     = PAPER_PRICING[paperSize]?.[colorMode] ?? 2
  const printCredits  = Math.round(Number(pages || 0) * printRate)
  const machineRate = activeMachine?.credits ?? 0
  // 3D print cost = filament (grams × cr/g) + machine time (hours × cr/hr),
  // same two-part logic as CNC machine time — the printer is a machine too.
  const printCost3D = Math.round(Number(grams || 0) * filamentRate + Number(hours || 0) * machineRate)
  const machineCost = Math.round(Number(hours || 0) * machineRate + Number(materialCost || 0))

  const chargePrinting = async () => {
    const p = Number(pages)
    if (!p || p <= 0) { showToast?.('Enter how many pages.', 'error'); return }
    if (student.credits < printCredits) { showToast?.(`${student.name} needs ${printCredits} cr but only has ${student.credits}.`, 'error'); return }
    try {
      await ctx.chargePrint({ studentId: student.id, pages: p, rate: printRate })
      setStudent(prev => ({ ...prev, credits: prev.credits - printCredits }))
      showToast?.(`Charged ${printCredits} cr for ${p} page(s) (${paperSize}, ${colorMode === 'bw' ? 'B&W' : 'Color'}): ${student.name}`)
      setPages('')
    } catch (err) {
      showToast?.(err.message || 'Charge failed.', 'error')
    }
  }

  const charge3D = async () => {
    const g = Number(grams)
    const h = Number(hours) || 0
    if (!g || g <= 0) { showToast?.('Enter the print weight in grams.', 'error'); return }
    if (!filament) { showToast?.('Select a filament first.', 'error'); return }
    if (student.credits < printCost3D) { showToast?.(`${student.name} needs ${printCost3D} cr but only has ${student.credits}.`, 'error'); return }
    try {
      await ctx.charge3D({ studentId: student.id, filamentId: filament.id, grams: g, machineId: activeMachine?.id, hours: h })
      setStudent(prev => ({ ...prev, credits: prev.credits - printCost3D }))
      showToast?.(`Charged ${printCost3D} cr for ${g}g${h > 0 ? ` + ${h}h` : ''} (${filament.name} ${filament.color}): ${student.name}`)
      setGrams('')
      setHours('')
    } catch (err) {
      showToast?.(err.message || 'Charge failed.', 'error')
    }
  }

  const chargeMachine = async () => {
    const h = Number(hours)
    if (!h || h <= 0) { showToast?.('Enter how many hours it ran.', 'error'); return }
    if (!activeMachine) { showToast?.('This service has no machine configured.', 'error'); return }
    if (student.credits < machineCost) { showToast?.(`${student.name} needs ${machineCost} cr but only has ${student.credits}.`, 'error'); return }
    try {
      await ctx.chargeMachineTime({ studentId: student.id, itemId: activeMachine.id, hours: h, materialCost: Number(materialCost) || 0 })
      setStudent(prev => ({ ...prev, credits: prev.credits - machineCost }))
      showToast?.(`Charged ${machineCost} cr for ${h}h on ${activeMachine.name}: ${student.name}`)
      setHours('')
      setMaterialCost('')
    } catch (err) {
      showToast?.(err.message || 'Charge failed.', 'error')
    }
  }

  const openService = (id) => setSelectedService(id)
  const scrollMoreServices = (dir) => moreServicesRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })

  // Results drop down OVER the page (absolute), not inline — so opening the
  // list never pushes the price/options/charge button further down.
  const studentPicker = (
    !student ? (
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} color={T.faint} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input placeholder="Search student by name or ID…" value={query} onChange={e => setQuery(e.target.value)}
            style={{ width: '100%', background: T.cream, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px 10px 36px', fontSize: 14, color: T.charcoal, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        {query.trim() && (
          <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 20, background: '#fff', border: `1px solid ${T.border}`, borderRadius: 10, boxShadow: '0 8px 24px rgba(15,23,42,0.12)', maxHeight: 240, overflowY: 'auto', padding: 6 }}>
            {results.length === 0
              ? <p style={{ color: T.faint, fontSize: 13, margin: '6px 8px' }}>No matching student.</p>
              : results.map(u => (
                <button key={u.id} onClick={() => { setStudent(u); setQuery('') }}
                  style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: 8, border: 'none', background: '#fff', borderRadius: 8, padding: '8px 10px', textAlign: 'left', cursor: 'pointer' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.charcoal }}>{u.name}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: T.faint }}>{u.studentId} · {u.credits} cr</p>
                  </div>
                  <Badge status={u.membership === 'active' ? 'approved' : 'denied'} small />
                </button>
              ))}
          </div>
        )}
      </div>
    ) : (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px' }}>
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
    )
  )

  const moreServicesRow = (
    <div style={{ marginTop: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.charcoal }}>More Services</h3>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => scrollMoreServices(-1)} style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${T.border}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronLeft size={15} color={T.muted} />
          </button>
          <button onClick={() => scrollMoreServices(1)} style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${T.border}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronRight size={15} color={T.muted} />
          </button>
        </div>
      </div>
      {/* Fixed width/height on every card and image frame — no grid/auto-cols
          sizing quirks, every tile is identical regardless of its content. */}
      <div ref={moreServicesRef} className="inv-hscroll flex gap-3 overflow-x-auto pb-1">
        {serviceCards.filter(s => s.id !== selectedService).map(svc => (
          <button key={svc.id} onClick={() => openService(svc.id)}
            style={{ display: 'flex', flexDirection: 'column', flexShrink: 0, width: 200, overflow: 'hidden', background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ position: 'relative', width: 200, height: 110, flexShrink: 0 }}>
              {svc.machine
                ? <ItemImage item={svc.machine} cat={CNC_CAT} size={30} plainBg className="h-full w-full" />
                : <div className="flex h-full w-full items-center justify-center" style={{ background: T.white }}>
                    <svc.Icon size={28} color={svc.color} strokeWidth={1.5} className="opacity-85" />
                  </div>}
            </div>
            <p style={{ margin: 0, padding: '8px 10px', fontSize: 12.5, fontWeight: 700, color: T.charcoal, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{svc.label}</p>
          </button>
        ))}
      </div>
    </div>
  )

  // ── Card grid: pick a service — whole card is clickable (no separate
  // "View Service" button), square corners, hover lift, full uncropped
  // image. ─────────────────────────────────────────────────────────────
  if (!activeCard) {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ margin: '0 0 1rem', fontSize: 13, color: T.faint }}>Pick a service to see only the info and charge form relevant to it.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serviceCards.map(svc => (
            <button key={svc.id} onClick={() => openService(svc.id)}
              className="flex cursor-pointer flex-col overflow-hidden text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
              style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 0 }}>
              <div className="relative h-[160px] flex-shrink-0">
                {svc.machine
                  ? <ItemImage item={svc.machine} cat={CNC_CAT} size={44} fit="contain" plainBg className="h-full w-full" />
                  : <div className="flex h-full w-full items-center justify-center" style={{ background: T.white }}>
                      <svc.Icon size={44} color={svc.color} strokeWidth={1.5} className="opacity-85" />
                    </div>}
              </div>
              <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.charcoal }}>{svc.label}</p>
                <p style={{ margin: '6px 0 0', fontSize: 14, color: T.muted, lineHeight: 1.5, flex: 1 }}>{svc.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Detail view: e-commerce product-page layout (image on the left,
  // title/options/price/action on the right), wired to our real walk-up
  // charge process instead of an actual cart. ─────────────────────────────
  const estimate = selectedService === 'printing' ? printCredits
    : selectedService === '3d_printing' ? printCost3D
    : machineCost
  const estimateNote = selectedService === 'printing'
    ? `${pages || 0} page(s) · ${paperSize} ${colorMode === 'bw' ? 'B&W' : 'Color'} at ${printRate} cr/page`
    : selectedService === '3d_printing'
    ? `${grams || 0} g at ${filamentRate} cr/g${Number(hours) > 0 ? ` + ${hours}h × ${machineRate} cr/hr` : ''}`
    : `${hours || 0} h × ${machineRate} cr/hr${Number(materialCost) > 0 ? ` + ${materialCost} cr material` : ''}`

  const optionBtn = (active) => ({
    padding: '5px 11px', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer',
    border: active ? 'none' : `1.5px solid ${T.border}`,
    background: active ? activeCard.color : '#fff', color: active ? '#fff' : T.charcoal,
  })
  const swatchStyle = (active, bg) => ({
    width: 24, height: 24, borderRadius: '50%', background: bg, cursor: 'pointer', flexShrink: 0,
    border: active ? `2px solid ${T.charcoal}` : `1px solid ${T.border}`,
    boxShadow: active ? `0 0 0 2px #fff, 0 0 0 3px ${activeCard.color}` : 'none',
  })

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={() => setSelectedService(null)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 0, marginBottom: 20, color: T.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
        <ArrowLeft size={14} /> Back to Services
      </button>

      {/* Fixed image height, same on every service page — matching the right
          column's height instead made the frame a different size per page
          (a 2-line title made a taller right column, and a taller image with
          it), which is the opposite of consistent. */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* ── Left: image, same fixed size on every service ── */}
        <div className="relative h-[320px] w-full overflow-hidden lg:h-[480px]" style={{ borderRadius: 18, border: `1px solid ${T.border}` }}>
          {activeMachine
            ? <ItemImage item={activeMachine} cat={CNC_CAT} size={80} fit="contain" plainBg className="h-full w-full" />
            : <div className="flex h-full w-full items-center justify-center" style={{ background: T.white }}>
                <activeCard.Icon size={80} color={activeCard.color} strokeWidth={1.2} className="opacity-80" />
              </div>}
        </div>

        {/* ── Right: title, options, price, charge form — tighter line
            spacing and bigger type than the left column's plain image ── */}
        <div>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: T.faint, textTransform: 'uppercase', letterSpacing: '.08em' }}>Lab Services</p>
          <h2 style={{ margin: '4px 0 6px', fontSize: 28, fontWeight: 800, color: T.charcoal, lineHeight: 1.15 }}>{activeCard.label}</h2>
          <p style={{ margin: '0 0 10px', fontSize: 14, color: T.muted, lineHeight: 1.45 }}>{activeCard.desc}</p>
          {selectedService === 'printing' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 13, color: T.charcoal, fontWeight: 600 }}>{DOCUMENT_PRINTER.name}</span>
              <Badge status="available" small />
            </div>
          )}
          {activeMachine && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Badge status={activeMachine.stock > 0 ? 'available' : 'out_of_stock'} small />
              {isMachineCard && <span style={{ fontSize: 13, color: T.faint }}>{activeMachine.credits ?? 0} cr/hour</span>}
            </div>
          )}

          {/* Student search first — but the full form (options, price,
              Charge button) is always visible now; only the Charge button
              itself is disabled until a valid student is selected. */}
          <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: T.charcoal }}>Student</p>
          <div style={{ marginBottom: 14 }}>{studentPicker}</div>

          {student && student.membership !== 'active' && (
            <p style={{ color: T.red, fontSize: 13, margin: '-6px 0 14px' }}>This student doesn't have an active membership.</p>
          )}

          {(() => {
            const canCharge = !!student && student.membership === 'active'
            return (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${T.stone}` }}>
                  <span style={{ fontSize: 30, fontWeight: 800, color: activeCard.color }}>{estimate} cr</span>
                  <span style={{ fontSize: 13, color: T.faint }}>{estimateNote}</span>
                </div>

                {/* ── Document Printing options — Size+Color paired, Sides+Pages paired ── */}
                {selectedService === 'printing' && (
                  <>
                    <div className="grid grid-cols-2 gap-4" style={{ marginBottom: 9 }}>
                      <div>
                        <p style={{ margin: '0 0 5px', fontSize: 13, fontWeight: 700, color: T.charcoal }}>Size : <span style={{ fontWeight: 400, color: T.muted }}>{paperSize}</span></p>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {PAPER_SIZES.map(size => (
                            <button key={size} onClick={() => setPaperSize(size)} style={optionBtn(paperSize === size)}>{size}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 5px', fontSize: 13, fontWeight: 700, color: T.charcoal }}>Color : <span style={{ fontWeight: 400, color: T.muted }}>{colorMode === 'bw' ? 'Black & White' : 'Color'}</span></p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button onClick={() => setColorMode('bw')} title="Black & White" style={swatchStyle(colorMode === 'bw', 'linear-gradient(135deg,#4b5563,#111827)')} />
                          <button onClick={() => setColorMode('color')} title="Color" style={swatchStyle(colorMode === 'color', 'conic-gradient(red,orange,#eab308,green,blue,purple,red)')} />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4" style={{ marginBottom: 9 }}>
                      <div>
                        <p style={{ margin: '0 0 5px', fontSize: 13, fontWeight: 700, color: T.charcoal }}>Sides</p>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button onClick={() => setDuplex('single')} style={optionBtn(duplex === 'single')}>Single-sided</button>
                          <button onClick={() => setDuplex('double')} style={optionBtn(duplex === 'double')}>Double-sided</button>
                        </div>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 5px', fontSize: 13, fontWeight: 700, color: T.charcoal }}>Pages</p>
                        <QtyStepper value={pages} onChange={setPages} min={0} />
                      </div>
                    </div>
                  </>
                )}

                {/* ── 3D Printing options ── */}
                {selectedService === '3d_printing' && (
                  filaments.length === 0 ? (
                    <p style={{ color: T.faint, fontSize: 13, margin: '0 0 9px' }}>No filaments configured. Add them in Manage Stock.</p>
                  ) : (
                    <>
                      {/* Filament type + color side by side, same row */}
                      <div className="grid grid-cols-2 gap-4" style={{ marginBottom: 9 }}>
                        <div>
                          <p style={{ margin: '0 0 5px', fontSize: 13, fontWeight: 700, color: T.charcoal }}>Filament : <span style={{ fontWeight: 400, color: T.muted }}>{activeFilamentType}</span></p>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {filamentTypes.map(type => (
                              <button key={type} onClick={() => pickFilamentType(type)} style={optionBtn(activeFilamentType === type)}>{type}</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p style={{ margin: '0 0 5px', fontSize: 13, fontWeight: 700, color: T.charcoal }}>Color : <span style={{ fontWeight: 400, color: T.muted }}>{filament?.color || ''}</span></p>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {colorsForType.map(f => (
                              <button key={f.id} onClick={() => setFilamentId(f.id)} title={`${f.color} · ${f.stockGrams}g`} style={swatchStyle(Number(filamentId) === f.id, f.hex)} />
                            ))}
                          </div>
                        </div>
                      </div>
                      {filament && <p style={{ margin: '0 0 9px', fontSize: 12, color: T.faint }}>{filament.stockGrams}g in stock · {filament.rate ?? 4} cr/g</p>}

                      {/* Weight + printer Hours side by side, same row. Weight
                          is free-typed (the actual scale reading, not a round
                          number); Hours stays the same 0.5-step stepper the
                          CNC machine cards use. */}
                      <div className="grid grid-cols-2 gap-4" style={{ marginBottom: 9 }}>
                        <div>
                          <p style={{ margin: '0 0 5px', fontSize: 13, fontWeight: 700, color: T.charcoal }}>Weight</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <input type="number" min="0" step="0.1" placeholder="0" value={grams} onChange={e => setGrams(e.target.value)}
                              style={{ width: 90, background: T.cream, border: `1px solid ${T.border}`, borderRadius: 8, padding: '6px 10px', fontSize: 13, fontWeight: 700, color: T.charcoal, outline: 'none', boxSizing: 'border-box' }} />
                            <span style={{ fontSize: 13, color: T.muted }}>g</span>
                          </div>
                        </div>
                        <div>
                          <p style={{ margin: '0 0 5px', fontSize: 13, fontWeight: 700, color: T.charcoal }}>Hours</p>
                          <QtyStepper value={hours} onChange={setHours} step={0.5} min={0} suffix="h" />
                        </div>
                      </div>
                    </>
                  )
                )}

                {/* ── Individual CNC machine options ── */}
                {isMachineCard && (
                  <>
                    <p style={{ margin: '0 0 5px', fontSize: 13, fontWeight: 700, color: T.charcoal }}>Hours</p>
                    <div style={{ marginBottom: 9 }}><QtyStepper value={hours} onChange={setHours} step={0.5} min={0} suffix="h" /></div>
                    <p style={{ margin: '0 0 5px', fontSize: 13, fontWeight: 700, color: T.charcoal }}>Material cost (optional)</p>
                    <input type="number" min="0" placeholder="Credits for material used" value={materialCost} onChange={e => setMaterialCost(e.target.value)}
                      style={{ width: '100%', maxWidth: 260, background: T.cream, border: `1px solid ${T.border}`, borderRadius: 8, padding: '7px 10px', fontSize: 13, outline: 'none', boxSizing: 'border-box', marginBottom: 9 }} />
                  </>
                )}

                <button
                  disabled={!canCharge}
                  onClick={selectedService === 'printing' ? chargePrinting : selectedService === '3d_printing' ? charge3D : chargeMachine}
                  title={canCharge ? undefined : 'Select a student with an active membership first'}
                  style={{ width: '100%', maxWidth: 340, padding: '11px 0', background: canCharge ? activeCard.color : '#e2e8f0', border: 'none', borderRadius: 8, color: canCharge ? '#fff' : '#94a3b8', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: canCharge ? 'pointer' : 'not-allowed' }}>
                  <BadgeCheck size={15} /> {selectedService === 'printing' ? 'Charge & Print' : selectedService === '3d_printing' ? 'Charge & Print' : 'Charge'}
                </button>
              </>
            )
          })()}
        </div>
      </div>

      {moreServicesRow}
    </div>
  )
}
