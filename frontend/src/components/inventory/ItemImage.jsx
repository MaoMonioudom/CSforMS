import { useState } from 'react'
import { T } from '../../lib/inventory/theme'

// Falls back to the category icon if the item has no photo, or its photo fails to load.
export default function ItemImage({ item, cat, size = 48, className = '' }) {
  const [broken, setBroken] = useState(false)
  const showPhoto = item.image && !broken

  return (
    <div className={`flex items-center justify-center ${className}`}
      style={{ background: `linear-gradient(160deg, ${cat?.color || T.stone} 0%, ${T.white} 100%)` }}>
      {showPhoto
        ? <img src={item.image} alt={item.name} onError={() => setBroken(true)} className="h-full w-full object-cover" />
        : cat && <cat.Icon size={size} color={cat.iconColor} strokeWidth={1.5} className="opacity-85" />
      }
    </div>
  )
}
