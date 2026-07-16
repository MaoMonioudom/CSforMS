import { useState } from 'react'
import { T } from '../../../lib/inventory/theme'

// Small square item thumbnail for table rows and activity lists — shows the
// item's uploaded photo, falling back to the category icon when the item has
// no image (or the URL is broken). Mirrors ItemImage in Catalog.jsx, sized
// for compact rows instead of cards.
export default function ItemThumb({ item, cat, size = 30, iconSize = 14 }) {
  const [broken, setBroken] = useState(false)
  const showPhoto = item?.image && !broken

  return (
    <div style={{
      width: size, height: size, borderRadius: Math.round(size / 4),
      background: cat?.color || T.cream, overflow: 'hidden', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {showPhoto
        ? <img src={item.image} alt={item.name} onError={() => setBroken(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : cat && <cat.Icon size={iconSize} color={cat.iconColor} />}
    </div>
  )
}
