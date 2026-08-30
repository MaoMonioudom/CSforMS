import { X, Info } from 'lucide-react'
import Badge from './ui/Badge'
import ItemImage from './ItemImage'
import { CATEGORIES } from '../../lib/inventory/data'

// Shared item detail view — used by the Catalog page (with a Borrow/Purchase
// CTA passed in as `footer`) and by the Notifications panel (no footer, it's
// just showing what a pending/past request was for). Keeping this in one
// place means both surfaces always look identical and stay in sync.
export default function ItemDetailModal({ item, onClose, footer }) {
  const cat = CATEGORIES.find(c => c.id === item.category)

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()}
        className="relative overflow-y-auto"
        style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 780, maxHeight: '90vh', boxShadow: '0 24px 64px rgba(15,23,42,0.18)' }}>

        {/* Close — anchored to the card itself (not the image), so it always
            sits in the plain top-right corner regardless of column widths */}
        <button onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 3px rgba(15,23,42,0.08)' }}>
          <X size={14} color="#0f172a" />
        </button>

        {/* Both columns stretch to match whichever is taller (grid rows
            stretch by default) — so the image always fills the info
            column's real height instead of the modal being pinned to a
            fixed size that leaves dead space for short-content items. */}
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(260px,46%)_1fr]" style={{ minHeight: 0 }}>

          {/* Image panel */}
          <div className="relative h-40 sm:h-auto" style={{ minHeight: 160 }}>
            <ItemImage item={item} cat={cat} size={60}
              className="h-full w-full rounded-t-[24px] sm:rounded-tr-none sm:rounded-l-[24px]" />
            {/* Status + type badges — stacked top-left, same on both student and staff views */}
            <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
              <Badge status={item.status === 'available' && item.stock <= 0 ? 'out_of_stock' : item.status} small />
              <span className="badge badge-sm"
                style={item.type === 'Returnable'
                  ? { background: '#dbeafe', color: '#2563eb' }
                  : { background: '#dcfce7', color: '#16a34a' }}>
                {item.type === 'Returnable' ? 'Borrowable' : 'Purchasable'}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-3 p-4 sm:gap-4 sm:p-6" style={{ minHeight: 0 }}>
            {/* Title */}
            <div>
              {cat && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <cat.Icon size={13} color={cat.iconColor} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-foreground)', letterSpacing: '.04em', textTransform: 'uppercase' }}>{cat.label}</span>
                </div>
              )}
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--color-charcoal)', lineHeight: 1.2 }}>{item.name}</h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>{item.room} · Zone {item.zone}</p>
            </div>

            {/* Price — shown as a plain, prominent line rather than a chip on the image */}
            <p style={{ margin: 0, lineHeight: 1 }}>
              {item.credits > 0
                ? <>
                    <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-inv-accent)' }}>{item.credits}</span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--muted-foreground)', marginLeft: 6 }}>{item.credits === 1 ? 'credit' : 'credits'}</span>
                  </>
                : <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-inv-accent)' }}>Free</span>}
            </p>

            <div style={{ borderTop: '1px solid var(--border)' }} />

            {/* Description */}
            {item.description && (
              <p style={{ margin: 0, fontSize: 13, color: 'var(--color-inv-muted)', lineHeight: 1.65 }}>{item.description}</p>
            )}

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, alignItems: 'stretch' }}>
              {[
                ['Stock', item.stock],
                ['Room',  item.room],
                ['Zone',  item.zone],
              ].map(([k, v]) => (
                <div key={k} style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 12px', border: '1.5px solid #e2e8f0', minHeight: 56, boxSizing: 'border-box' }}>
                  <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em' }}>{k}</p>
                  <p style={{ margin: '3px 0 0', fontSize: 13, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={String(v)}>{String(v)}</p>
                </div>
              ))}
            </div>

            {/* Usage note */}
            {item.usage && (
              <div style={{ background: 'var(--color-inv-accent-light)', borderRadius: 10, padding: '10px 14px', display: 'flex', gap: 10, border: '1px solid color-mix(in oklch, var(--color-inv-accent) 20%, transparent)' }}>
                <Info size={13} color="var(--color-inv-accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ margin: 0, fontSize: 12, color: 'var(--color-inv-accent-text)', lineHeight: 1.55 }}>{item.usage}</p>
              </div>
            )}

            {footer && (
              <>
                <div style={{ height: 1, background: '#f1f5f9', marginTop: 4 }} />
                <div style={{ marginTop: 'auto' }}>{footer}</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
