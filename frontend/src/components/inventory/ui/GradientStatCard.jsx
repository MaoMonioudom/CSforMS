import { TrendingUp, TrendingDown } from 'lucide-react'

// Pastel-gradient stat card with a trend pill and period label — used on dashboard overviews.
export default function GradientStatCard({ label, value, period = 'Today', trend, gradient }) {
  const isUp = trend === undefined ? null : trend >= 0
  return (
    <div className="rounded-2xl p-4 sm:p-5" style={{ background: gradient }}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-charcoal/70">{label}</span>
        <span className="rounded-md bg-white/50 px-2 py-0.5 text-[10px] font-semibold text-charcoal/60">{period}</span>
      </div>
      <p className="m-0 text-2xl font-bold tracking-tight text-charcoal sm:text-[28px]">{value}</p>
      {isUp !== null && (
        <div className={`mt-1.5 flex items-center gap-1 text-xs font-semibold ${isUp ? 'text-green' : 'text-red'}`}>
          {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
  )
}
