import { useState } from 'react'
import { T } from '../../lib/inventory/theme'

// Falls back to the category icon if the item has no photo, or its photo fails to load.
// fit: 'cover' (default, crops to fill — grid/list thumbnails) or 'contain'
// (letterboxed, shows the whole photo uncropped — big single-item previews).
// plainBg: skip the category-color gradient behind the image, plain white
// instead — for contexts (Lab Services) that want a clean, uncolored frame.
export default function ItemImage({ item, cat, size = 48, className = '', fit = 'cover', plainBg = false }) {
  const [broken, setBroken] = useState(false)
  const showPhoto = item.image && !broken

  return (
    <div className={`flex items-center justify-center ${className}`}
      style={{ background: plainBg ? T.white : `linear-gradient(160deg, ${cat?.color || T.stone} 0%, ${T.white} 100%)` }}>
      {showPhoto
        ? <img src={item.image} alt={item.name} onError={() => setBroken(true)} className={`h-full w-full ${fit === 'contain' ? 'object-contain' : 'object-cover'}`} />
        : cat && <cat.Icon size={size} color={cat.iconColor} strokeWidth={1.5} className="opacity-85" />
      }
    </div>
  )
}
