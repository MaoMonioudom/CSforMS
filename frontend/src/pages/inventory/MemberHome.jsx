import { useState, useEffect } from 'react'
import {
  ArrowRight, CreditCard, Bell, Package2, ChevronRight, BadgeCheck,
  X, Printer, Box, Zap, Layers, MapPin, Clock, Users, Star,
  FileText, Cpu, Wrench, CheckCircle2, RotateCcw, ShoppingBag,
} from 'lucide-react'
import { T as THEME } from '../../lib/inventory/theme'
import { CATEGORIES, PRINT_SERVICES, BROWSE_LANDING_IMAGE } from '../../lib/inventory/data'
import PageBreadcrumb from '../../components/inventory/layout/PageBreadcrumb'
import CreditInfoModal from '../../components/inventory/ui/CreditInfoModal'
import { useAuth } from '../../hub/AuthContext'
import { useInventory } from '../../lib/inventory/InventoryContext'

const NAVY   = '#0e7490' // teal-700 — primary accent (kept name to avoid touching every usage)
const TEAL   = '#0891b2'
const CYAN   = '#67e8f9'
const CREAM  = THEME.cream
const BORDER = THEME.border

// ── Small section label ────────────────────────────────────────────────────────
function Tag({ children, color = NAVY }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: `${color}18`, color, fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 100 }}>
      {children}
    </span>
  )
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
function StatPill({ value, label, color = THEME.charcoal }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: THEME.muted, marginTop: 4 }}>{label}</div>
    </div>
  )
}

export default function UserHome({ user: invUser, items, borrows, notifications, setPage, filaments = [], setRequests, showToast }) {
  // Credits/membership now come from the real database (useAuth), not the
  // Inventory module's own local copy — everything else about this "user"
  // (id, name, matching borrow/request records) still comes from Inventory's
  // local state, since borrow/purchase logic isn't wired to the real backend yet.
  const { user: hubUser } = useAuth()
  const { submitTopUpRequest, submit3DPrintRequest } = useInventory()
  const user = { ...invUser, credits: hubUser?.credits ?? 0, membership: hubUser?.isMember ? 'active' : 'inactive' }

  const [activeCat, setActiveCat]   = useState('all')
  const [printModal, setPrintModal] = useState(null)
  const [filamentId, setFilamentId] = useState(filaments[0]?.id || '')
  const [notes,      setNotes]      = useState('')

  const activeLoans = borrows.filter(b => b.userId === user.id && b.action !== 'purchased' && b.status === 'active').length
  const unread      = notifications.filter(n => !n.read && (n.forRoles?.includes('user') || n.userId === user.id)).length
  const available   = items.filter(i => i.status === 'available').length
  const totalItems  = items.length

  // Membership & credits now live in the "Your Credits" panel (same one the
  // top-nav credits pill opens) instead of a big section on this page.
  const [creditOpen, setCreditOpen] = useState(false)
  const scrollToCredits = () => setCreditOpen(true)

  const requestTopUp = async (amountUSD) => {
    try {
      await submitTopUpRequest({ amountUSD })
      showToast?.('Top-up request sent to the makerspace team.')
    } catch (err) {
      showToast?.(err.message || 'Could not send the top-up request.', 'error')
    }
  }

  // Due-date reminder — briefly toast once per visit if the student has a borrow
  // due soon or overdue, so they don't find out only after a late fee.
  useEffect(() => {
    const today = new Date()
    const dueSoon = borrows.find(b => {
      if (b.userId !== user.id || b.action === 'purchased' || b.status !== 'active' || !b.dueDate) return false
      const daysLeft = Math.ceil((new Date(b.dueDate) - today) / 86400000)
      return daysLeft <= 1
    })
    if (!dueSoon) return
    const daysLeft = Math.ceil((new Date(dueSoon.dueDate) - today) / 86400000)
    const msg = daysLeft < 0 ? `Overdue: "${dueSoon.itemName}" was due ${dueSoon.dueDate}.`
      : daysLeft === 0 ? `Reminder: "${dueSoon.itemName}" is due today.`
      : `Reminder: "${dueSoon.itemName}" is due tomorrow.`
    const t = setTimeout(() => showToast(msg, daysLeft < 0 ? 'error' : 'success'), 600)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const catItems    = activeCat === 'all' ? items : items.filter(i => i.category === activeCat)
  const visibleItems = catItems.slice(0, 8)

  // Document printing is walk-up only (staff charge it instantly at the front
  // desk) — students can't queue a remote request for it, unlike 3D printing.
  const openPrintModal = () => { setPrintModal('3d_printing'); setNotes(''); setFilamentId(filaments[0]?.id || '') }

  const submitPrintRequest = async () => {
    try {
      if (!filamentId) { showToast('Choose a filament first.', 'error'); return }
      await submit3DPrintRequest({ filamentId: Number(filamentId), note: notes })
      showToast('3D print request sent — staff will weigh your print and confirm the cost.')
      setPrintModal(null)
    } catch (err) {
      showToast(err.message || 'Could not send the request.', 'error')
    }
  }

  return (
    <div style={{ background: CREAM, minHeight: '100%' }}>

      {/* ── HERO — lighter teal gradient ── */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg, #0c4a6e 0%, #0e7490 55%, #0891b2 100%)' }}>
        {/* Grid overlay */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="relative z-10 mx-auto max-w-[1280px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1.05fr] xl:grid-cols-[1fr_1.2fr]">

            {/* Left */}
            <div>
              <PageBreadcrumb current="/home" />
              <h1 className="font-display leading-[1.1] tracking-tight" style={{ fontSize: 'clamp(30px,5vw,58px)', margin: '8px 0 0', color: '#fff' }}>
                Welcome back,<br />
                <span style={{ color: CYAN }}>{user.name.split(' ')[0]}.</span>
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed sm:text-base" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Your makerspace hub — borrow equipment, print documents, run 3D prints, and manage your credits all in one place.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={() => setPage('/catalog')}
                  className="flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-xs font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-md sm:px-5 sm:py-3 sm:text-sm"
                  style={{ background: TEAL }}>
                  Browse Equipment <ArrowRight size={15} />
                </button>
                <button onClick={scrollToCredits}
                  className="flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-xs font-semibold text-white transition-colors sm:px-5 sm:py-3 sm:text-sm"
                  style={{ border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.04)' }}>
                  <CreditCard size={15} /> Manage Credits
                </button>
              </div>

              {/* Stats row */}
              <div className="mt-8 flex flex-wrap items-center gap-4 pt-6 sm:gap-6" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                <StatPill value={user.credits} label="Credits" color={CYAN} />
                <div className="hidden sm:block" style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.2)' }} />
                <button onClick={() => setPage('/notifications')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                  <StatPill value={activeLoans} label="Active borrows" color="#fbbf24" />
                </button>
                <div className="hidden sm:block" style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.2)' }} />
                <StatPill value={available} label="Items available" color="#34d399" />
                <button onClick={() => setPage('/notifications')}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors sm:ml-auto"
                  style={{ border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.12)' }}>
                  <Bell size={14} style={{ color: '#fff' }} />
                  <span className="text-xs font-semibold" style={{ color: '#fff' }}>{unread} unread</span>
                  <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.5)' }} />
                </button>
              </div>
            </div>

            {/* Right — hero image */}
            <div className="mx-auto hidden w-full max-w-[420px] sm:block lg:max-w-[560px] xl:max-w-[640px]">
              <img src={BROWSE_LANDING_IMAGE} alt="CADT Makerspace" className="w-full object-contain" style={{ filter: 'drop-shadow(0 16px 48px rgba(8,145,178,0.3))' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── MAKERSPACE INFO STRIP ── */}
      <section style={{ background: '#0c4a6e', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-0 px-5 sm:px-8 md:grid-cols-4 lg:px-12">
          {[
            { Icon: MapPin,  label: 'Location',    value: 'CADT Campus, Room MS-01' },
            { Icon: Clock,   label: 'Open Hours',  value: 'Mon – Fri · 8am – 5pm'  },
            { Icon: Users,   label: 'Members',     value: `${items.filter(i=>i.status!=='maintenance').length} items ready` },
            { Icon: Star,    label: 'Membership',  value: user.membership === 'active' ? 'Active ✓' : 'Inactive — renew' },
          ].map(({ Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-5" style={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}>
              <Icon size={18} color="rgba(255,255,255,0.7)" strokeWidth={1.5} />
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: 12, color: '#fff', fontWeight: 600, marginTop: 2 }}>{value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="mx-auto max-w-[1280px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Tag color={THEME.purple}>Services</Tag>
            <h2 className="inv-sec-h mt-3 text-3xl font-bold text-charcoal sm:text-4xl lg:text-[44px]">What We Offer</h2>
            <p className="mt-2 max-w-lg text-sm text-inv-muted">Submit a request and our staff will handle the rest — pay with your makerspace credits.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Document Printing */}
          <div className="group relative flex overflow-hidden rounded-2xl border bg-white" style={{ borderColor: BORDER }}>
            <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl" style={{ background: THEME.blue }} />
            <div className="flex flex-1 flex-col p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: THEME.blueLight }}>
                  <Printer size={22} color={THEME.blue} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: THEME.blue, background: THEME.blueLight, padding: '4px 10px', borderRadius: 100 }}>Document</span>
              </div>
              <h3 className="text-lg font-bold text-charcoal">Document Printing</h3>
              <p className="mt-1 text-sm leading-relaxed text-inv-muted">Black & white or color printing at the makerspace front desk. Staff will print your file on request.</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span style={{ fontSize: 36, fontWeight: 800, color: NAVY, lineHeight: 1 }}>2</span>
                <span className="text-sm font-bold text-inv-muted">credits / page</span>
              </div>

              <ul className="mt-4 space-y-2">
                {['Black & white or color', 'A4 / Letter format', 'Submit file + page count'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-inv-muted">
                    <CheckCircle2 size={13} color={THEME.green} /> {f}
                  </li>
                ))}
              </ul>

              {/* Walk-up only — staff charge this instantly at the front desk,
                  so there's no remote request to submit. */}
              <div className="mt-auto flex items-center gap-2 rounded-xl py-3 text-center text-xs font-semibold" style={{ background: THEME.cream, color: THEME.muted, justifyContent: 'center' }}>
                <MapPin size={13} /> Available at the front desk — visit in person
              </div>
            </div>
          </div>

          {/* 3D Printing */}
          <div className="group relative flex overflow-hidden rounded-2xl border bg-white" style={{ borderColor: BORDER }}>
            <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl" style={{ background: THEME.purple }} />
            <div className="flex flex-1 flex-col p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: THEME.purpleLight }}>
                  <Box size={22} color={THEME.purple} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: THEME.purple, background: THEME.purpleLight, padding: '4px 10px', borderRadius: 100 }}>3D Print</span>
              </div>
              <h3 className="text-lg font-bold text-charcoal">3D Printing</h3>
              <p className="mt-1 text-sm leading-relaxed text-inv-muted">Submit your model file and choose a filament. Staff will print and weigh it — you pay based on filament used.</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span style={{ fontSize: 36, fontWeight: 800, color: NAVY, lineHeight: 1 }}>4</span>
                <span className="text-sm font-bold text-inv-muted">credits / gram</span>
              </div>

              <ul className="mt-4 space-y-2">
                {['PLA, PETG, ABS, TPU', 'Staff weigh finished print', 'Credits charged post-print'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-inv-muted">
                    <CheckCircle2 size={13} color={THEME.purple} /> {f}
                  </li>
                ))}
              </ul>

              {/* Filament swatches */}
              {filaments.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-semibold text-inv-muted uppercase tracking-wider">Available:</span>
                  {filaments.map(f => (
                    <div key={f.id} title={`${f.name} ${f.color} · ${f.stockGrams}g`}
                      style={{ width: 18, height: 18, borderRadius: '50%', background: f.hex, border: `2px solid ${BORDER}` }} />
                  ))}
                </div>
              )}

              <button onClick={() => openPrintModal('3d_printing')}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                style={{ background: THEME.purple, marginTop: 'auto' }}>
                Request 3D Print <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── EQUIPMENT CATEGORIES ── */}
      <section style={{ background: '#fff', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div className="mx-auto max-w-[1280px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Tag color={THEME.amber}>Equipment</Tag>
              <h2 className="inv-sec-h mt-3 text-3xl font-bold text-charcoal sm:text-4xl lg:text-[44px]">Browse by Category</h2>
              <p className="mt-2 text-sm text-inv-muted">{totalItems} items across {CATEGORIES.length} categories — borrow with your membership credits.</p>
            </div>
            <button onClick={() => setPage('/catalog')}
              className="flex shrink-0 items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-cream"
              style={{ borderColor: BORDER, color: NAVY }}>
              View All <ArrowRight size={13} />
            </button>
          </div>

          {/* Item type explainer — Returnable vs Consumable */}
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { Icon: RotateCcw,   label: 'Returnable', color: TEAL,           bg: '#e0f9fe', desc: "Borrow and return by your due date — no charge unless it's late or damaged." },
              { Icon: ShoppingBag, label: 'Consumable',  color: THEME.green,   bg: THEME.greenLight, desc: 'Materials you keep — purchased outright with your credits.' },
            ].map(({ Icon, label, color, bg, desc }) => (
              <div key={label} className="flex items-start gap-3 rounded-xl p-3.5" style={{ border: `1px solid ${BORDER}`, background: THEME.cream }}>
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: bg }}>
                  <Icon size={16} color={color} />
                </div>
                <div>
                  <p className="m-0 text-xs font-bold text-charcoal">{label}</p>
                  <p className="m-0 mt-0.5 text-xs leading-relaxed text-inv-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Category filter chips */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button onClick={() => setActiveCat('all')}
              className="rounded-full border px-4 py-1.5 text-xs font-bold transition-all"
              style={{ background: activeCat === 'all' ? NAVY : '#fff', color: activeCat === 'all' ? '#fff' : THEME.charcoal, borderColor: activeCat === 'all' ? NAVY : BORDER }}>
              All Items
            </button>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setActiveCat(c.id)}
                className="flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold transition-all"
                style={{ background: activeCat === c.id ? c.iconColor : '#fff', color: activeCat === c.id ? '#fff' : THEME.charcoal, borderColor: activeCat === c.id ? c.iconColor : BORDER }}>
                <c.Icon size={12} color={activeCat === c.id ? '#fff' : c.iconColor} />
                {c.label}
              </button>
            ))}
          </div>

          {/* Item grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-4">
            {visibleItems.map(item => {
              const cat = CATEGORIES.find(c => c.id === item.category)
              const isAvail = item.status === 'available'
              return (
                <button key={item.id} onClick={() => setPage('/catalog')}
                  className="group flex flex-col overflow-hidden rounded-2xl border bg-white text-left transition-all hover:-translate-y-1 hover:shadow-lg"
                  style={{ borderColor: BORDER }}>
                  {/* Icon area */}
                  <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden"
                    style={{ background: `linear-gradient(145deg, ${cat?.color || CREAM} 0%, #fff 70%)` }}>
                    {cat && <cat.Icon size={38} color={cat.iconColor} strokeWidth={1.4} />}
                    <span className="absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ background: isAvail ? THEME.greenLight : THEME.amberLight, color: isAvail ? THEME.green : THEME.amber }}>
                      {isAvail ? 'Available' : item.status}
                    </span>
                  </div>
                  {/* Details */}
                  <div className="flex flex-1 flex-col gap-1.5 p-3">
                    <p className="m-0 truncate text-[13px] font-semibold text-charcoal leading-snug">{item.name}</p>
                    <p className="m-0 text-[10px] text-inv-muted truncate">{cat?.label}</p>
                    <div className="mt-auto flex items-center justify-between pt-2" style={{ borderTop: `1px solid ${BORDER}` }}>
                      <span className="text-xs font-bold" style={{ color: NAVY }}>{item.credits > 0 ? `${item.credits} cr` : 'Free'}</span>
                      <span className="text-[10px] text-inv-muted">{item.type}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {catItems.length > 8 && (
            <div className="mt-6 text-center">
              <button onClick={() => setPage('/catalog')}
                className="rounded-xl border px-6 py-2.5 text-sm font-semibold text-charcoal transition-colors hover:bg-cream"
                style={{ borderColor: BORDER }}>
                See all {catItems.length} items <ArrowRight size={13} className="inline ml-1" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── CATEGORY INFO CARDS ── */}
      <section className="mx-auto max-w-[1280px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <Tag color={THEME.teal}>What's Here</Tag>
        <h2 className="inv-sec-h mt-3 mb-2 text-3xl font-bold text-charcoal sm:text-4xl lg:text-[44px]">Equipment Rooms</h2>
        <p className="mb-8 max-w-lg text-sm text-inv-muted">The makerspace is organized into dedicated rooms for each discipline. You'll need a valid membership to borrow.</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map(c => {
            const roomItems = items.filter(i => i.category === c.id)
            const avail = roomItems.filter(i => i.status === 'available').length
            const DESC_MAP = {
              electronic_equipment: 'Power supplies, oscilloscopes, signal generators & lab instruments.',
              electronic_component: 'Arduino, ESP32, sensors, ICs, resistors, capacitors & modules.',
              cnc_machines:         'Laser cutters, 3-axis routers & CNC plotters for fabrication.',
              manual_mechanical:    'Drill press, bench grinder, angle grinder & hand tools.',
              mechanical_fasteners: 'Bolts, nuts, screws, standoffs, washers & hardware kits.',
              digital_device:       'Raspberry Pi, logic analyzers, cameras & compute peripherals.',
              raw_material:         'PLA filament, acrylic sheets, plywood, foam & craft materials.',
              electronic_tool:      'Soldering stations, multimeters, wire strippers & PCB tools.',
            }
            return (
              <button key={c.id} onClick={() => { setActiveCat(c.id); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                className="group flex flex-col rounded-2xl border bg-white p-5 text-left transition-all hover:-translate-y-1 hover:shadow-md"
                style={{ borderColor: BORDER }}>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: c.color }}>
                  <c.Icon size={20} color={c.iconColor} />
                </div>
                <h3 className="m-0 text-sm font-bold text-charcoal">{c.label}</h3>
                <p className="m-0 mt-1 text-[11px] leading-relaxed text-inv-muted">{DESC_MAP[c.id] || c.room}</p>
                <div className="mt-4 flex items-center justify-between" style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}>
                  <span className="text-[11px] font-medium text-inv-muted">{c.room}</span>
                  <span className="text-[11px] font-bold" style={{ color: avail > 0 ? THEME.green : THEME.red }}>{avail} ready</span>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── HOW TO USE ── */}
      <section style={{ background: '#fff', borderTop: `1px solid ${BORDER}` }}>
        <div className="mx-auto max-w-[1280px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <Tag color={THEME.green}>Get Started</Tag>
            <h2 className="inv-sec-h mt-3 text-3xl font-bold text-charcoal sm:text-4xl lg:text-[44px]">How It Works</h2>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { num: '01', Icon: CreditCard,   color: NAVY,          title: 'Top up credits',         desc: 'Tap the credits pill in the top bar (or Manage Credits) to view plans and top up at the front desk.' },
              { num: '02', Icon: Package2,     color: THEME.blue,    title: 'Browse & request',        desc: 'Find tools in the catalog. Borrow returnables or buy consumables with credits.' },
              { num: '03', Icon: Cpu,          color: THEME.purple,  title: 'Staff approves',          desc: 'Lab staff confirm your request and prepare the item for pick-up.' },
              { num: '04', Icon: CheckCircle2, color: THEME.green,   title: 'Use & return',            desc: 'Use the equipment and return borrowed items within 7 days.' },
            ].map(({ num, Icon, color, title, desc }) => (
              <div key={num} className="flex flex-col gap-4 rounded-2xl border p-5" style={{ borderColor: BORDER }}>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}18` }}>
                    <Icon size={18} color={color} />
                  </div>
                  <span style={{ fontSize: 22, fontWeight: 800, color: BORDER }}>{num}</span>
                </div>
                <div>
                  <h3 className="m-0 text-sm font-bold text-charcoal">{title}</h3>
                  <p className="m-0 mt-1.5 text-xs leading-relaxed text-inv-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATUS BANNER ── */}
      <section className="mx-auto max-w-[1280px] px-5 pb-12 pt-8 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-2xl border p-5"
            style={{ background: user.membership === 'active' ? THEME.greenLight : THEME.redLight, borderColor: user.membership === 'active' ? THEME.green + '40' : THEME.red + '40' }}>
            <BadgeCheck size={28} color={user.membership === 'active' ? THEME.green : THEME.red} />
            <div>
              <p className="m-0 text-sm font-bold text-charcoal">{user.membership === 'active' ? 'Membership Active' : 'Membership Inactive'}</p>
              <p className="m-0 mt-0.5 text-xs text-inv-muted">{user.membership === 'active' ? 'Full access to borrow and purchase items.' : 'Activate to start borrowing tools.'}</p>
            </div>
            {user.membership !== 'active' && (
              <button onClick={scrollToCredits} className="ml-auto shrink-0 rounded-lg border-none px-3 py-2 text-xs font-bold text-white" style={{ background: NAVY }}>
                Activate
              </button>
            )}
          </div>
          <div className="flex items-center gap-4 rounded-2xl border p-5" style={{ background: '#DBEAFE', borderColor: THEME.blue + '40' }}>
            <Package2 size={28} color={THEME.blue} />
            <div>
              <p className="m-0 text-sm font-bold text-charcoal">{available} items available right now</p>
              <p className="m-0 mt-0.5 text-xs text-inv-muted">Ready to borrow or purchase with your credits.</p>
            </div>
            <button onClick={() => setPage('/catalog')} className="ml-auto shrink-0 rounded-lg border-none px-3 py-2 text-xs font-bold text-white" style={{ background: THEME.blue }}>
              Browse
            </button>
          </div>
        </div>
      </section>

      {/* ── 3D PRINT REQUEST MODAL — document printing is walk-up only ── */}
      {printModal && (() => {
        const service = PRINT_SERVICES.find(s => s.id === '3d_printing')
        return (
          <div className="fixed inset-0 z-[900] flex items-center justify-center bg-charcoal/40 p-4" onClick={() => setPrintModal(null)}>
            <div onClick={e => e.stopPropagation()} className="w-full max-w-[420px] rounded-2xl bg-white shadow-2xl">
              {/* Modal header */}
              <div className="flex items-center justify-between border-b p-5" style={{ borderColor: BORDER }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: service.color }}>
                    <service.Icon size={18} color={service.iconColor} />
                  </div>
                  <div>
                    <h2 className="m-0 text-sm font-bold text-charcoal">Request {service.label}</h2>
                    <p className="m-0 text-xs text-inv-muted">{service.rate} credits / {service.unit}</p>
                  </div>
                </div>
                <button onClick={() => setPrintModal(null)} className="flex h-8 w-8 items-center justify-center rounded-lg border-none bg-cream text-inv-muted">
                  <X size={15} />
                </button>
              </div>

              {/* Modal body */}
              <div className="p-5">
                <label className="mb-1.5 block text-xs font-semibold text-inv-muted">Choose filament</label>
                <select value={filamentId} onChange={e => setFilamentId(e.target.value)}
                  className="mb-3 w-full rounded-xl border border-border bg-cream px-3 py-2.5 text-sm outline-none">
                  {filaments.length === 0 && <option value="">No filament configured yet</option>}
                  {filaments.map(f => (
                    <option key={f.id} value={f.id}>{f.name} — {f.color} ({f.stockGrams}g in stock)</option>
                  ))}
                </select>
                <label className="mb-1.5 block text-xs font-semibold text-inv-muted">Notes for staff (optional)</label>
                <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="What are you printing? Any special instructions?"
                  className="mb-3 w-full resize-none rounded-xl border border-border bg-cream px-3 py-2.5 text-sm outline-none" />
                <div className="mb-4 flex items-center justify-between rounded-xl p-3" style={{ background: THEME.purpleLight }}>
                  <span className="text-xs text-inv-muted">Charged after weighing</span>
                  <span className="text-sm font-bold" style={{ color: THEME.purple }}>4 cr / gram</span>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setPrintModal(null)}
                    className="flex-1 rounded-xl border py-2.5 text-sm font-semibold text-inv-muted transition-colors hover:bg-cream"
                    style={{ borderColor: BORDER }}>
                    Cancel
                  </button>
                  <button onClick={submitPrintRequest}
                    className="flex-1 rounded-xl border-none py-2.5 text-sm font-bold text-white"
                    style={{ background: THEME.purple }}>
                    Submit Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {creditOpen && (
        <CreditInfoModal user={user} onClose={() => setCreditOpen(false)} onRequestTopUp={requestTopUp} />
      )}
    </div>
  )
}
