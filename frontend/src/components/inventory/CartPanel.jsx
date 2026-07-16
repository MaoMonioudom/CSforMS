import { useState } from 'react'
import { ShoppingCart, X, Minus, Plus, RotateCcw, ShoppingBag, ArrowRight, Info } from 'lucide-react'
import { T } from '../../lib/inventory/theme'
import { CATEGORIES, OVERDUE_RATE } from '../../lib/inventory/data'
import { useInventory } from '../../lib/inventory/InventoryContext'

const LOAN_DAYS = 7 // fallback borrow period if an item somehow has no chosen due date

export default function CartPanel({ cart, setCart, user, showToast, onClose }) {
  const { submitBorrowRequests, purchaseItems } = useInventory()
  const [busy, setBusy] = useState(false)

  const updateQty = (id, delta) => setCart(prev => prev.map(ci => ci.item.id === id ? { ...ci, qty: Math.max(1, ci.qty + delta) } : ci))
  const remove    = (id) => setCart(prev => prev.filter(ci => ci.item.id !== id))

  const borrowItems  = cart.filter(ci => ci.item.type === 'Returnable')
  const buyItems      = cart.filter(ci => ci.item.type === 'Consumable')
  const totalCr        = cart.reduce((s, ci) => s + ci.item.credits * ci.qty, 0)
  const buyCr          = buyItems.reduce((s, ci) => s + ci.item.credits * ci.qty, 0)

  const placeOrder = async () => {
    if (user.membership !== 'active') { showToast('Active membership required.', 'error'); return }
    if (buyItems.length > 0 && user.credits < buyCr) { showToast('Insufficient credits.', 'error'); return }
    const fallbackDue = new Date(); fallbackDue.setDate(fallbackDue.getDate() + LOAN_DAYS)
    setBusy(true)
    try {
      if (borrowItems.length > 0) {
        // One request per item, grouped under a shared order id server-side.
        await submitBorrowRequests(borrowItems.map(ci => ({
          itemId: ci.item.id, qty: ci.qty,
          dueDate: ci.dueDate || fallbackDue.toISOString().split('T')[0],
          note: ci.purpose || null,
        })))
      }
      if (buyItems.length > 0) {
        await purchaseItems(buyItems.map(ci => ({ itemId: ci.item.id, qty: ci.qty })))
      }
      setCart([])
      onClose()
      showToast(borrowItems.length > 0 ? `${borrowItems.length} borrow request(s) submitted for staff approval.` : 'Purchase complete!')
    } catch (err) {
      showToast(err.message || 'Checkout failed. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    // Overlay drawer — slides in from the right without pushing the page content.
    <div style={{
      width: 'min(380px, 100vw)', maxWidth: '100vw', background: T.white,
      borderLeft: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 62, right: 0, bottom: 0, zIndex: 300,
      boxShadow: '-12px 0 40px rgba(15,23,42,0.12)',
      animation: 'inv-drawer-in .25s ease',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.charcoal, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingCart size={18} color={T.accent} /> Cart ({cart.length})
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.muted }}><X size={20} /></button>
        </div>

        {cart.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: T.faint, gap: 12 }}>
            <ShoppingCart size={42} strokeWidth={1.2} />
            <p style={{ margin: 0, fontSize: 14 }}>Your cart is empty</p>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {/* Borrow section */}
            {borrowItems.length > 0 && (
              <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${T.stone}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.75rem' }}>
                  <RotateCcw size={13} color={T.blue} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.blue, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Borrow — Returnable</span>
                </div>
                {borrowItems.map(ci => <CartRow key={ci.item.id} ci={ci} onQty={updateQty} onRemove={remove} />)}
              </div>
            )}

            {/* Purchase section */}
            {buyItems.length > 0 && (
              <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${T.stone}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.75rem' }}>
                  <ShoppingBag size={13} color={T.amber} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.amber, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Purchase — Consumable</span>
                </div>
                {buyItems.map(ci => <CartRow key={ci.item.id} ci={ci} onQty={updateQty} onRemove={remove} />)}
              </div>
            )}

            {/* Summary + checkout */}
            <div style={{ padding: '1.25rem 1.5rem', marginTop: 'auto' }}>
              <div style={{ background: T.cream, borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
                {borrowItems.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: buyItems.length > 0 ? 4 : 0 }}>
                    <span style={{ fontSize: 13, color: T.muted }}>Borrow (credit cost on approval)</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.blue }}>{totalCr - buyCr} cr</span>
                  </div>
                )}
                {buyItems.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: T.muted }}>Purchase total</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.charcoal }}>{buyCr} cr</span>
                  </div>
                )}
              </div>

              {borrowItems.length > 0 && (
                <div style={{ background: T.blueLight, borderRadius: 8, padding: '8px 12px', marginBottom: '1rem', display: 'flex', gap: 8 }}>
                  <Info size={13} color={T.blue} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 12, color: T.blue }}>
                    Borrow requests need staff approval. Your chosen return date will be confirmed once approved.
                    {' '}<strong>Late returns are charged {OVERDUE_RATE} credits per day.</strong>
                  </span>
                </div>
              )}

              <button onClick={placeOrder} disabled={busy}
                style={{ width: '100%', background: T.charcoal, color: '#fff', border: 'none', borderRadius: 10, padding: 13, fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: busy ? 0.6 : 1 }}>
                {borrowItems.length > 0 && buyItems.length === 0 ? 'Submit Borrow Requests' : buyItems.length > 0 && borrowItems.length === 0 ? 'Confirm Purchase' : 'Submit All'}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CartRow({ ci, onQty, onRemove }) {
  const cat = CATEGORIES.find(c => c.id === ci.item.category)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
      <div style={{ width: 42, height: 42, borderRadius: 10, background: cat?.color || T.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
        {ci.item.image
          ? <img src={ci.item.image} alt={ci.item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : cat && <cat.Icon size={17} color={cat.iconColor} />
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ci.item.name}</p>
        <p style={{ margin: 0, fontSize: 12, color: T.faint }}>
          {ci.item.credits > 0 ? `${ci.item.credits * ci.qty} credits` : 'Free'}
        </p>
        {ci.item.type === 'Returnable' && ci.dueDate && (
          <p style={{ margin: '2px 0 0', fontSize: 11, color: T.blue }}>Return by {ci.dueDate}</p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
        <button onClick={() => onQty(ci.item.id, -1)} style={{ width: 22, height: 22, borderRadius: '50%', border: `1px solid ${T.border}`, background: T.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Minus size={11} /></button>
        <span style={{ fontSize: 13, fontWeight: 600, minWidth: 18, textAlign: 'center' }}>{ci.qty}</span>
        <button onClick={() => onQty(ci.item.id, 1)} style={{ width: 22, height: 22, borderRadius: '50%', border: `1px solid ${T.border}`, background: T.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Plus size={11} /></button>
        <button onClick={() => onRemove(ci.item.id)} style={{ background: 'none', border: 'none', color: T.faint, marginLeft: 2, cursor: 'pointer' }}><X size={13} /></button>
      </div>
    </div>
  )
}
