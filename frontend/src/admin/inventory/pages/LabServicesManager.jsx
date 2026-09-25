import { useState, useRef } from 'react'
import { Plus, Edit2, Printer, Box, Cog, ImagePlus } from 'lucide-react'
import { T } from '../../../lib/inventory/theme'
import { useInventory } from '../../../lib/inventory/InventoryContext'
import { uploadItemImage } from '../../../lib/inventory/api'

const PRICING_TYPES = [
  { value: 'per_page', label: 'Per Page (like Document Printing)', Icon: Printer },
  { value: 'material_hourly', label: 'Material + Hourly (like 3D Printing)', Icon: Box },
  { value: 'hourly', label: 'Hourly Machine Time (like CNC)', Icon: Cog },
]
const PRICING_BADGE = {
  per_page: { label: 'PER PAGE', bg: T.blueLight, fg: T.blue },
  material_hourly: { label: 'MATERIAL + HOURLY', bg: T.purpleLight, fg: T.purple },
  hourly: { label: 'HOURLY', bg: T.tealLight, fg: T.teal },
}
const PRICING_ICON = { per_page: Printer, material_hourly: Box, hourly: Cog }

const BLANK_CONFIG = { A4: { bw: 2, color: 4 }, A3: { bw: 4, color: 8 } }
const BLANK = { name: '', description: '', pricing_type: 'per_page', linked_item_id: '', config: BLANK_CONFIG, image_url: null, is_active: true, sort_order: 0 }

// Sits above "3D Print Filaments" on Manage Stock. What shows as a bookable
// service card on the Lab Service page — editable/addable here instead of
// hardcoded, per lab_services table (backend/supabase/004_lab_services.sql).
export default function LabServicesManager({ items = [] }) {
  const ctx = useInventory()
  const labServices = ctx.labServices || []
  const [editing, setEditing] = useState(null) // null = closed; {} = adding; {...svc} = editing
  const [form, setForm] = useState(BLANK)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)

  // Machines eligible to back a material_hourly/hourly service — only
  // "CNC Machines" category items (the Bambu 3D printer is filed under this
  // category too, so it still covers the 3D Printing service).
  const machineOptions = items.filter(i => i.type === 'Returnable' && i.category === 'cnc_machines')

  const openAdd = () => { setForm(BLANK); setEditing({}) }
  const openEdit = (svc) => {
    setForm({
      name: svc.name || '',
      description: svc.description || '',
      pricing_type: svc.pricing_type,
      linked_item_id: svc.linked_item_id || '',
      config: svc.pricing_type === 'per_page' ? { ...BLANK_CONFIG, ...svc.config } : svc.config || {},
      image_url: svc.image_url || null,
      is_active: svc.is_active,
      sort_order: svc.sort_order ?? 0,
    })
    setEditing(svc)
  }
  const close = () => setEditing(null)

  const setF = (field, value) => setForm(f => ({ ...f, [field]: value }))
  const setPaperRate = (size, mode, value) =>
    setForm(f => ({ ...f, config: { ...f.config, [size]: { ...f.config[size], [mode]: Number(value) } } }))

  const pickImage = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { ctx.showToast?.('Image must be under 5MB.', 'error'); return }
    setUploading(true)
    try {
      const url = await uploadItemImage(file)
      setF('image_url', url)
    } catch (err) {
      ctx.showToast?.(err.message || 'Upload failed.', 'error')
    } finally {
      setUploading(false)
    }
  }

  const toggleActive = async (svc) => {
    try {
      await ctx.saveLabService({ id: svc.service_id, is_active: !svc.is_active })
    } catch (err) {
      ctx.showToast?.(err.message || 'Could not update the service.', 'error')
    }
  }

  const save = async () => {
    if (!form.name.trim()) { ctx.showToast?.('Enter a service name.', 'error'); return }
    if (form.pricing_type !== 'per_page' && !form.linked_item_id) { ctx.showToast?.('Pick a linked machine.', 'error'); return }
    setSaving(true)
    try {
      const payload = {
        id: editing?.service_id,
        name: form.name.trim(),
        description: form.description.trim() || null,
        pricing_type: form.pricing_type,
        linked_item_id: form.pricing_type === 'per_page' ? null : Number(form.linked_item_id),
        config: form.pricing_type === 'per_page' ? form.config : {},
        image_url: form.image_url,
        is_active: form.is_active,
        sort_order: form.sort_order,
      }
      await ctx.saveLabService(payload)
      ctx.showToast?.(editing?.service_id ? 'Service updated.' : 'Service added.')
      close()
    } catch (err) {
      ctx.showToast?.(err.message || 'Could not save the service.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, padding: '1.25rem 1.4rem', marginBottom: 20 }}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3.5">
        <div className="flex items-start gap-2.5">
          <div style={{ width: 34, height: 34, borderRadius: 10, background: T.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
            <Printer size={17} color={T.accent} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: T.charcoal }}>Lab Services</p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: T.faint, maxWidth: 560, lineHeight: 1.5 }}>
              What shows up as a bookable service on the Lab Service page — Document Printing, 3D Printing, CNC machines. Toggle one off to hide it there without deleting it.
            </p>
          </div>
        </div>
        <button onClick={openAdd}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 15px', borderRadius: 8, fontSize: 12.5, fontWeight: 700, border: 'none', background: T.accent, color: '#fff', cursor: 'pointer', flexShrink: 0 }}>
          <Plus size={13} /> Add Service
        </button>
      </div>

      {labServices.length === 0 ? (
        <p style={{ color: T.faint, textAlign: 'center', padding: '1.5rem', margin: 0, fontSize: 13 }}>No lab services yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {labServices.map(svc => {
            const Icon = PRICING_ICON[svc.pricing_type] || Cog
            const badge = PRICING_BADGE[svc.pricing_type] || { label: svc.pricing_type, bg: T.stone, fg: T.muted }
            return (
              <div key={svc.service_id} className="flex items-center gap-3" style={{ padding: '12px 14px', border: `1px solid ${T.stone}`, borderRadius: 10, background: svc.is_active ? T.white : T.cream }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: svc.image_url ? 'transparent' : (svc.is_active ? T.accentLight : T.stone), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  {svc.image_url
                    ? <img src={svc.image_url} alt={svc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <Icon size={16} color={svc.is_active ? T.accent : T.faint} />}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2">
                    <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: T.charcoal }} className="truncate">{svc.name}</p>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: badge.bg, color: badge.fg, flexShrink: 0 }}>{badge.label}</span>
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: T.faint }} className="truncate">{svc.description}</p>
                </div>
                <button onClick={() => openEdit(svc)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 700, border: `1.5px solid ${T.border}`, background: '#fff', color: T.charcoal, cursor: 'pointer', flexShrink: 0 }}>
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => toggleActive(svc)} aria-label={svc.is_active ? 'Hide from Lab Service page' : 'Show on Lab Service page'}
                  style={{ width: 38, height: 21, borderRadius: 11, border: 'none', background: svc.is_active ? T.green : T.borderDark, position: 'relative', flexShrink: 0, padding: 0, cursor: 'pointer' }}>
                  <span style={{ position: 'absolute', top: 2, left: svc.is_active ? 19 : 2, width: 17, height: 17, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 2px rgba(15,23,42,.25)', transition: 'left .15s' }} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit modal */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: T.white, borderRadius: 16, padding: '1.6rem 1.75rem', width: 460, maxHeight: '88vh', overflowY: 'auto', boxSizing: 'border-box' }}>
            <p style={{ margin: '0 0 3px', fontSize: 16.5, fontWeight: 700, color: T.charcoal }}>{editing.service_id ? 'Edit Service' : 'Add Service'}</p>
            <p style={{ margin: '0 0 18px', fontSize: 12, color: T.faint }}>This is what shows on the Lab Service page's service card.</p>

            <div className="flex flex-col gap-3.5">
              <div>
                <label style={{ color: T.faint, fontSize: 12, display: 'block', marginBottom: 4 }}>Service Image</label>
                <div className="flex items-center gap-3">
                  <div style={{ width: 64, height: 64, borderRadius: 10, border: `1px solid ${T.border}`, background: T.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    {form.image_url
                      ? <img src={form.image_url} alt="Service" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <ImagePlus size={20} color={T.faint} />}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" style={{ display: 'none' }} onChange={pickImage} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    style={{ padding: '9px 16px', background: T.white, border: `1.5px solid ${T.border}`, borderRadius: 8, color: T.charcoal, fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: uploading ? 0.6 : 1 }}>
                    <ImagePlus size={14} /> {uploading ? 'Uploading…' : form.image_url ? 'Change Image' : 'Upload Image'}
                  </button>
                  {form.image_url && (
                    <button type="button" onClick={() => setF('image_url', null)}
                      style={{ padding: '9px 12px', background: 'none', border: 'none', color: T.red, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: T.faint, marginBottom: 5 }}>Service Name</label>
                <input type="text" value={form.name} onChange={e => setF('name', e.target.value)} placeholder="e.g. Laser Cutting"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 11px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.cream, fontSize: 13, color: T.charcoal, outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: T.faint, marginBottom: 5 }}>Description</label>
                <textarea rows={2} value={form.description} onChange={e => setF('description', e.target.value)} placeholder="Shown under the name on the service card"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 11px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.cream, fontSize: 13, color: T.charcoal, outline: 'none', resize: 'none', fontFamily: 'inherit' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: T.faint, marginBottom: 5 }}>Pricing Type</label>
                <select value={form.pricing_type} onChange={e => setF('pricing_type', e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 11px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.cream, fontSize: 13, color: T.charcoal, outline: 'none' }}>
                  {PRICING_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>

              {form.pricing_type === 'per_page' && (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: T.faint, marginBottom: 5 }}>Paper Rates (credits / page)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['A4', 'A3'].map(size => (
                      ['bw', 'color'].map(mode => (
                        <div key={`${size}-${mode}`} className="flex items-center gap-1.5" style={{ border: `1.5px solid ${T.border}`, background: T.cream, borderRadius: 8, padding: '7px 10px' }}>
                          <span style={{ fontSize: 11.5, color: T.faint, flexShrink: 0 }}>{size} {mode === 'bw' ? 'B&W' : 'Color'}</span>
                          <input type="number" value={form.config?.[size]?.[mode] ?? 0} onChange={e => setPaperRate(size, mode, e.target.value)}
                            style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'right', fontSize: 13, color: T.charcoal, outline: 'none' }} />
                        </div>
                      ))
                    ))}
                  </div>
                </div>
              )}

              {form.pricing_type !== 'per_page' && (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: T.faint, marginBottom: 5 }}>Linked Machine</label>
                  <select value={form.linked_item_id} onChange={e => setF('linked_item_id', e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 11px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.cream, fontSize: 13, color: T.charcoal, outline: 'none' }}>
                    <option value="">Select a machine…</option>
                    {machineOptions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                  <p style={{ margin: '6px 0 0', fontSize: 11, color: T.faint, lineHeight: 1.5 }}>Hourly rate comes from that machine's credit rate, set in Manage Stock — not edited here.</p>
                </div>
              )}

              <div className="flex items-center justify-between" style={{ paddingTop: 4, borderTop: `1px solid ${T.stone}` }}>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.charcoal }}>Show on Lab Service page</p>
                  <p style={{ margin: '2px 0 0', fontSize: 11.5, color: T.faint }}>Off hides this card without deleting it.</p>
                </div>
                <button onClick={() => setF('is_active', !form.is_active)}
                  style={{ width: 38, height: 21, borderRadius: 11, border: 'none', background: form.is_active ? T.green : T.borderDark, position: 'relative', flexShrink: 0, padding: 0, cursor: 'pointer' }}>
                  <span style={{ position: 'absolute', top: 2, left: form.is_active ? 19 : 2, width: 17, height: 17, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 2px rgba(15,23,42,.25)' }} />
                </button>
              </div>
            </div>

            <div className="flex gap-2.5 justify-end" style={{ marginTop: 22 }}>
              <button onClick={close} style={{ padding: '9px 18px', background: T.cream, border: 'none', borderRadius: 8, color: T.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{ padding: '9px 18px', background: T.accent, border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving…' : 'Save Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
