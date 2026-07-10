import { useEffect } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { T } from '../../../lib/inventory/theme'

const VARIANTS = {
  success: { Icon: CheckCircle2, color: T.green },
  error:   { Icon: XCircle,      color: T.red   },
  info:    { Icon: Info,         color: T.blue  },
}

export default function Toast({ msg, type = 'success', onClose }) {
  const { Icon, color } = VARIANTS[type] || VARIANTS.success

  useEffect(() => {
    const t = setTimeout(onClose, 3400)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28,
      background: T.charcoal, color: '#fff',
      padding: '14px 18px', borderRadius: 12,
      fontSize: 14, fontWeight: 500, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)', maxWidth: 360,
      animation: 'slideUp 0.2s ease',
    }}>
      <Icon size={17} color={color} />
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', padding: 0 }}>
        <X size={14} />
      </button>
      <style>{`@keyframes slideUp { from { transform: translateY(12px); opacity:0 } to { transform: none; opacity:1 } }`}</style>
    </div>
  )
}
