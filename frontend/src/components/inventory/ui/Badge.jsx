import { statusConfig } from '../../../lib/inventory/theme'

export default function Badge({ status, small }) {
  const s = statusConfig[status] || { label: status, color: '#6B6A66', bg: '#E8E5DF' }
  return (
    <span
      className="badge"
      style={{
        background: s.bg,
        color: s.color,
        padding: small ? '2px 8px' : '4px 10px',
        fontSize: small ? 10 : 11,
      }}
    >
      {s.label}
    </span>
  )
}
