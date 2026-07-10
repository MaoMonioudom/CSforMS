import { useState } from 'react'

// Lightweight SVG donut chart — no chart library dependency.
export default function DonutChart({ data, size = 160, thickness = 26 }) {
  const [hover, setHover] = useState(null)
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const r = (size - thickness) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r

  let offset = 0
  const segments = data.map((d, i) => {
    const fraction = d.value / total
    const dash = fraction * circumference
    const seg = { ...d, dash, offset, i }
    offset += dash
    return seg
  })

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EEF2F6" strokeWidth={thickness} />
        {segments.map((seg) => (
          <circle key={seg.i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth={hover === seg.i ? thickness + 4 : thickness}
            strokeDasharray={`${seg.dash} ${circumference - seg.dash}`} strokeDashoffset={-seg.offset}
            style={{ transition: 'stroke-width 0.2s ease, opacity 0.2s ease', opacity: hover === null || hover === seg.i ? 1 : 0.45, cursor: 'pointer' }}
            onMouseEnter={() => setHover(seg.i)} onMouseLeave={() => setHover(null)} />
        ))}
      </svg>
    </div>
  )
}
