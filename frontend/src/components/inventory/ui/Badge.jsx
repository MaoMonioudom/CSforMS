import { statusConfig } from '../../../lib/inventory/theme'

export default function Badge({ status, small }) {
  const s = statusConfig[status] || { label: status, color: 'var(--color-inv-muted)', bg: 'var(--color-stone)' }
  return (
    <span
      className={small ? "badge badge-sm" : "badge"}
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  )
}
