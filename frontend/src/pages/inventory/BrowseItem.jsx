import { Navigate, useNavigate } from 'react-router-dom'
import Catalog from '../../components/inventory/Catalog'
import { useInventory } from '../../lib/inventory/InventoryContext'
import { useAuth } from '../../hub/AuthContext'

// Renders the item catalog for both /inventory/browse (guest, read-only
// preview) and /inventory/catalog (signed-in, interactive) — same Catalog
// component underneath, gated by which mode owns the route so each URL
// always shows the right one and a stray visit to the other gets bounced.
export default function BrowseItem({ mode }) {
  const navigate = useNavigate()
  const { user: hubUser } = useAuth()
  const { items, user, cart, setCart, showToast, setCartOpen, borrows } = useInventory()

  if (mode === 'browse' && hubUser) return <Navigate to="/inventory/catalog" replace />
  if (mode === 'catalog' && !hubUser) return <Navigate to="/inventory/browse" replace />

  if (mode === 'browse') {
    return (
      <Catalog items={items} user={null} cart={cart} setCart={setCart} showToast={showToast}
        onRequireAuth={() => navigate('/login', { state: { from: '/inventory' } })} />
    )
  }

  return (
    <Catalog items={items} user={user} cart={cart} setCart={setCart} showToast={showToast}
      onCartOpen={() => setCartOpen(true)} borrows={borrows} />
  )
}
