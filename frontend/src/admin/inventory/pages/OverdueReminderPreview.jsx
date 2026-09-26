import { useState } from 'react'
import { Mail, ChevronDown, RefreshCw, Send, AlertTriangle } from 'lucide-react'
import { T } from '../../../lib/inventory/theme'
import { api } from '../../../lib/api/client'

// Lets the makerspace team see exactly what the daily reminder job would
// email — overdue items, items due today, items due tomorrow (one email
// per student per bucket), plus one combined digest to every admin/staff
// account (Check now, always a dry run) — and optionally fire a real send
// immediately instead of waiting for the 8am cron (Send now, with a
// confirm step since it emails real people).
// See backend/src/modules/notifications/overdueEmailReminders.js.
export default function OverdueReminderPreview() {
  const [loading, setLoading] = useState(false)
  const [candidates, setCandidates] = useState(null)
  const [error, setError] = useState(null)
  // All rows start expanded right after a check; clicking a row collapses
  // just that one back to its normal (closed) summary line.
  const [openIds, setOpenIds] = useState(new Set())

  const [sending, setSending] = useState(false)
  const [confirmSend, setConfirmSend] = useState(false)
  const [sentResult, setSentResult] = useState(null)

  // Second click while the list is already showing just collapses it back
  // to the normal header-only view, instead of re-fetching.
  const check = async () => {
    if (candidates) {
      setCandidates(null); setSentResult(null); setError(null)
      return
    }
    setLoading(true); setError(null); setSentResult(null)
    try {
      const { data } = await api.get('/api/notifications/overdue-reminders/preview')
      setCandidates(data.candidates)
      setOpenIds(new Set(data.candidates.map(c => c.userId)))
    } catch (err) {
      setError(err.message || 'Could not load overdue reminders.')
    } finally {
      setLoading(false)
    }
  }

  const sendNow = async () => {
    setConfirmSend(false)
    setSending(true); setError(null)
    try {
      const { data } = await api.post('/api/notifications/overdue-reminders/send-now')
      setSentResult(data)
      setCandidates(data.candidates)
      setOpenIds(new Set(data.candidates.map(c => c.userId)))
    } catch (err) {
      setError(err.message || 'Could not send the reminder emails.')
    } finally {
      setSending(false)
    }
  }

  const toggle = (userId) => {
    setOpenIds(prev => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  return (
    <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, padding: '1rem 1.25rem' }} className="mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Mail size={16} color={T.accent} />
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.charcoal }}>Due-date reminder emails</p>
            <p style={{ margin: 0, fontSize: 11.5, color: T.faint }}>
              Covers overdue items, items due today, items due tomorrow, and a daily digest to admin/staff. Check now is preview only; real emails go out automatically every day at 8:00 AM.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={check} disabled={loading || sending}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, border: `1px solid ${T.border}`, background: T.white, color: T.charcoal, cursor: (loading || sending) ? 'default' : 'pointer', opacity: (loading || sending) ? 0.6 : 1 }}>
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> {loading ? 'Checking…' : candidates ? 'Hide' : 'Check now'}
          </button>
          <button onClick={() => setConfirmSend(true)} disabled={loading || sending}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, border: 'none', background: T.red, color: '#fff', cursor: (loading || sending) ? 'default' : 'pointer', opacity: (loading || sending) ? 0.6 : 1 }}>
            <Send size={13} /> {sending ? 'Sending…' : 'Send now'}
          </button>
        </div>
      </div>

      {error && <p style={{ margin: '10px 0 0', fontSize: 12, color: T.red }}>{error}</p>}
      {sentResult && (
        <p style={{ margin: '10px 0 0', fontSize: 12, color: T.accent, fontWeight: 600 }}>
          Sent {sentResult.candidates.filter(c => c.toEmail).length} real reminder email{sentResult.candidates.filter(c => c.toEmail).length === 1 ? '' : 's'} just now.
        </p>
      )}

      {confirmSend && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: T.white, borderRadius: 16, padding: '2rem', width: 380 }}>
            <AlertTriangle size={30} color={T.red} style={{ marginBottom: 10 }} />
            <p style={{ color: T.charcoal, fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Send real emails now?</p>
            <p style={{ color: T.muted, fontSize: 13, marginBottom: 16 }}>
              This immediately emails every student with an overdue item, an item due today, or an item due tomorrow, plus a digest to admin/staff — not a preview. This is separate from the automatic 8:00 AM run, so if today's run already happened, sending now emails them again.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmSend(false)} style={{ padding: '9px 20px', background: T.cream, border: 'none', borderRadius: 8, color: T.muted, cursor: 'pointer' }}>Cancel</button>
              <button onClick={sendNow} style={{ padding: '9px 20px', background: T.red, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Send now</button>
            </div>
          </div>
        </div>
      )}

      {candidates && (
        candidates.length === 0 ? (
          <p style={{ margin: '12px 0 0', fontSize: 12.5, color: T.muted }}>Nothing overdue right now.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {candidates.map(c => {
              const open = openIds.has(c.userId)
              return (
                <div key={c.userId} style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
                  <button onClick={() => toggle(c.userId)}
                    className="flex w-full items-center justify-between gap-3 text-left"
                    style={{ padding: '10px 12px', background: T.cream, border: 'none', cursor: 'pointer' }}>
                    <div className="min-w-0">
                      <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: T.charcoal }} className="truncate">{c.studentName}: {c.toEmail || 'no email on file'}</p>
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
