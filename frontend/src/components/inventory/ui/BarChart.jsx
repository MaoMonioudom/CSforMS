import { useState } from 'react'
import { T } from '../../../lib/inventory/theme'

// Lightweight dual-series bar chart — no chart library dependency.
// data: [{ label, a, b }]; seriesA/seriesB control color + legend labels.
export default function BarChart({ data, seriesA = 'A', seriesB = 'B', colorA = T.blue, colorB = T.green, height = 200 }) {
  const [hover, setHover] = useState(null)
  const max = Math.max(1, ...data.flatMap(d => [d.a, d.b]))
  const plotHeight = height - 28 // reserve room for the weekday label row below the bars

  return (
    <div>
      <div className="mb-3 flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-xs text-inv-muted"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: colorA }} />{seriesA}</span>
        <span className="flex items-center gap-1.5 text-xs text-inv-muted"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: colorB }} />{seriesB}</span>
      </div>
      <div className="flex items-end gap-3 sm:gap-5" style={{ height }}>
        {data.map((d, i) => (
          <div key={d.label} className="relative flex flex-1 flex-col items-center justify-end gap-1.5"
            style={{ height: '100%' }}
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            {hover === i && (
              <div className="absolute -top-9 z-10 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-semibold text-white shadow-lg" style={{ background: T.charcoal }}>
                {d.a} {seriesA} · {d.b} {seriesB}
              </div>
            )}
            <div className="flex w-full items-end justify-center gap-[3px]" style={{ height: plotHeight }}>
              <div className="w-2.5 rounded-t-[3px] transition-all duration-300 sm:w-3"
                style={{ height: Math.max(d.a > 0 ? 3 : 0, Math.round((d.a / max) * plotHeight)), background: colorA, opacity: hover === null || hover === i ? 1 : 0.5 }} />
              <div className="w-2.5 rounded-t-[3px] transition-all duration-300 sm:w-3"
                style={{ height: Math.max(d.b > 0 ? 3 : 0, Math.round((d.b / max) * plotHeight)), background: colorB, opacity: hover === null || hover === i ? 1 : 0.5 }} />
            </div>
            <span className="text-[10px] text-faint sm:text-[11px]">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
