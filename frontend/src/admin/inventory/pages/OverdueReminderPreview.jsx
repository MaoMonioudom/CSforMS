import { useState } from 'react'
import { Mail, ChevronDown, RefreshCw } from 'lucide-react'
import { T } from '../../../lib/inventory/theme'
import { api } from '../../../lib/api/client'

// Lets the makerspace team see exactly what the daily overdue-reminder job
// would email, without needing DevTools or Postman. Nothing is actually
// sent — see backend/src/modules/notifications/overdueEmailReminders.js.
export default function OverdueReminderPreview() {
  const [loading, setLoading] = useState(false)
  const [candidates, setCandidates] = useState(null)
  const [error, setError] = useState(null)
  const [openId, setOpenId] = useState(null)

  const check = async () => {
    setLoading(true); setError(null)
    try {
      const { data } = await api.get('/api/notifications/overdue-reminders/preview')
      setCandidates(data.candidates)
    } catch (err) {
      setError(err.message || 'Could not load overdue reminders.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, padding: '1rem 1.25rem' }} className="mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Mail size={16} color={T.accent} />
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.charcoal }}>Overdue reminder emails</p>
            <p style={{ margin: 0, fontSize: 11.5, color: T.faint }}>
              Preview only — nothing sends until Microsoft email is wired up.
            </p>
          </div>
        </div>
        <button onClick={check} disabled={loading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, border: 'none', background: T.charcoal, color: '#fff', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1 }}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> {loading ? 'Checking…' : 'Check now'}
        </button>
      </div>

      {error && <p style={{ margin: '10px 0 0', fontSize: 12, color: T.red }}>{error}</p>}

      {candidates && (
        candidates.length === 0 ? (
          <p style={{ margin: '12px 0 0', fontSize: 12.5, color: T.muted }}>Nothing overdue right now.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {candidates.map(c => {
              const open = openId === c.userId
              return (
                <div key={c.userId} style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
                  <button onClick={() => setOpenId(open ? null : c.userId)}
                    className="flex w-full items-center justify-between gap-3 text-left"
                    style={{ padding: '10px 12px', background: T.cream, border: 'none', cursor: 'pointer' }}>
                    <div className="min-w-0">
                      <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: T.charcoal }} className="truncate">{c.studentName} — {c.toEmail || 'no email on file'}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 11.5, color: T.faint }} className="truncate">{c.subject}</p>
                    </div>
                    <ChevronDown size={14} color={T.faint} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s', flexShrink: 0 }} />
                  </button>
                  {open && (
                    <pre style={{ margin: 0, padding: '10px 12px', fontSize: 12, color: T.charcoal, whiteSpace: 'pre-wrap', fontFamily: 'inherit', background: '#fff' }}>{c.body}</pre>
                  )}
                </div>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}
