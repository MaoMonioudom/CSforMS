import { T } from '../../../lib/inventory/theme'

export default function StatCard({ label, value, sub, Icon, iconColor, iconBg }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border p-3 sm:gap-3.5 sm:rounded-2xl sm:p-5"
      style={{ background: T.white, borderColor: T.border }}>
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] sm:h-11 sm:w-11 sm:rounded-xl"
        style={{ background: iconBg || T.redLight }}>
        {Icon && <Icon size={18} color={iconColor || T.red} className="sm:!h-5 sm:!w-5" />}
      </div>
      <div className="min-w-0">
        <p className="m-0 truncate text-[10px] font-semibold uppercase tracking-wide sm:text-[11px]" style={{ color: T.faint }}>{label}</p>
        <p className="m-0 mt-0.5 text-xl font-bold tracking-tight sm:mt-1 sm:text-[26px]" style={{ color: T.charcoal }}>{value}</p>
        {sub && <p className="m-0 truncate text-[11px] sm:text-xs" style={{ color: T.faint }}>{sub}</p>}
      </div>
    </div>
  )
}
