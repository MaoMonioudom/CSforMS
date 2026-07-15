import { useState } from 'react'
import { Users, CheckCircle2, XCircle } from 'lucide-react'
import { api } from '../../../lib/api/client'
import { useInventory } from '../../../lib/inventory/InventoryContext'

const PERMS = ['manage_items', 'track_borrows', 'view_dashboard', 'approve_borrows', 'manage_maintenance']
const roleStyles = {
  admin: { text: 'text-red', bg: 'bg-red-light' },
  staff: { text: 'text-amber', bg: 'bg-amber-light' },
  user:  { text: 'text-blue', bg: 'bg-blue-light' },
}

export default function UserManager({ users, setUsers }) {
  const ctx = useInventory()
  const [sel, setSel] = useState(null)
  const pendingMembers = users.filter((u) => u.membership === 'pending')

  // Permissions are a UI-only concept for now (no backend column) — local toggle.
  const togglePerm = (uid, perm) => setUsers((p) => p.map((u) => {
    if (u.id !== uid) return u
    const perms = u.permissions || []
    return { ...u, permissions: perms.includes(perm) ? perms.filter((x) => x !== perm) : [...perms, perm] }
  }))

  // Legacy pending-approval buttons — real memberships are only ever
  // active/inactive, so this list stays empty; kept for compile safety.
  const setMembership = (uid, m) => {
    if (m === 'active') return toggleMembership(uid)
    ctx?.showToast?.('Denying membership requests is not supported.', 'error')
  }

  // Activation goes through the membership module (upserts the memberships row).
  // Deactivation isn't supported server-side, so the toggle only activates.
  const toggleMembership = async (uid) => {
    const current = users.find((u) => u.id === uid)
    if (current?.membership === 'active') {
      ctx?.showToast?.('Memberships expire on their own — deactivation is not supported.', 'error')
      return
    }
    try {
      await api.post(`/api/membership/${uid}/activate`)
      await ctx?.refreshUsers?.()
      setSel((u) => (u && u.id === uid ? { ...u, membership: 'active' } : u))
      ctx?.showToast?.('Membership activated.')
    } catch (err) {
      ctx?.showToast?.(err.message || 'Activation failed.', 'error')
    }
  }

  return (
    <div className="p-8">
      {pendingMembers.length > 0 && (
        <div className="mb-5 overflow-hidden rounded-2xl border border-border bg-white">
          <div className="border-b border-stone bg-amber-light px-6 py-3.5">
            <h3 className="m-0 text-[15px] font-semibold text-charcoal">Pending Membership Approvals ({pendingMembers.length})</h3>
          </div>
          {pendingMembers.map((u) => (
            <div key={u.id} className="flex items-center justify-between gap-3 border-b border-stone px-6 py-3.5 last:border-b-0">
              <div>
                <p className="m-0 text-sm font-semibold text-charcoal">{u.name}</p>
                <p className="m-0 mt-0.5 text-xs text-faint">{u.email} {u.studentId ? `· ${u.studentId}` : ''}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setMembership(u.id, 'denied')} className="flex items-center gap-1 rounded-lg bg-red-light px-3 py-1.5 text-xs font-semibold text-red">
                  <XCircle size={13} /> Deny
                </button>
                <button onClick={() => setMembership(u.id, 'active')} className="flex items-center gap-1 rounded-lg bg-green px-3 py-1.5 text-xs font-semibold text-white">
                  <CheckCircle2 size={13} /> Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* User list */}
        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          <div className="border-b border-stone bg-cream px-6 py-4">
            <h3 className="m-0 text-[15px] font-semibold text-charcoal">All Users</h3>
          </div>
          {users.map((u) => (
            <div key={u.id} onClick={() => setSel(u)}
              className={`flex items-center gap-3 border-b border-stone px-6 py-3 ${sel?.id === u.id ? 'bg-cream' : ''}`}>
              <div className={`flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${roleStyles[u.role].bg} ${roleStyles[u.role].text}`}>
                {u.name[0]}
              </div>
              <div className="flex-1">
                <p className="m-0 text-sm font-medium text-ink">{u.name}</p>
                <p className="m-0 text-xs text-faint">{u.email}</p>
              </div>
              <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${roleStyles[u.role].bg} ${roleStyles[u.role].text}`}>{u.role.toUpperCase()}</span>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        <div className="rounded-2xl border border-border bg-white p-6">
          {!sel ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-faint">
              <Users size={32} strokeWidth={1} className="text-border-dark" />
              <p className="m-0 text-sm">Select a user to manage</p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center gap-3">
                <div className={`flex h-[46px] w-[46px] items-center justify-center rounded-full text-[17px] font-bold ${roleStyles[sel.role].bg} ${roleStyles[sel.role].text}`}>
                  {sel.name[0]}
                </div>
                <div>
                  <p className="m-0 text-base font-semibold text-charcoal">{sel.name}</p>
                  <p className="m-0 text-[13px] text-faint">{sel.email}</p>
                </div>
              </div>

              {sel.role === 'user' && (
                <div className="mb-6 rounded-[10px] border border-border bg-cream p-4">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink">Membership</span>
                    <button onClick={() => toggleMembership(sel.id)}
                      className={`rounded-md px-3 py-1 text-[13px] font-semibold ${sel.membership === 'active' ? 'bg-red-light text-red' : 'bg-green-light text-green'}`}>
                      {sel.membership === 'active' ? 'Revoke' : 'Activate'}
                    </button>
                  </div>
                  <p className="m-0 text-[13px] text-faint">
                    Status: <span className={`font-semibold ${sel.membership === 'active' ? 'text-green' : 'text-red'}`}>{sel.membership === 'active' ? 'Active' : sel.membership || 'Inactive'}</span>
                  </p>
                  {sel.studentId && <p className="m-0 mt-1 text-[13px] text-faint">ID: {sel.studentId}</p>}
                </div>
              )}

              {sel.role === 'staff' && (
                <div>
                  <p className="m-0 mb-2.5 text-sm font-semibold text-ink">Permissions</p>
                  {PERMS.map((perm) => {
                    const on = sel.permissions?.includes(perm)
                    return (
                      <div key={perm} className="mb-2.5 flex items-center justify-between">
                        <span className="text-[13px] text-inv-muted">{perm.replace(/_/g, ' ')}</span>
                        <div onClick={() => togglePerm(sel.id, perm)} className={`relative h-[22px] w-10 rounded-full transition-colors ${on ? 'bg-red' : 'bg-stone'}`}>
                          <div className={`absolute top-[3px] h-4 w-4 rounded-full bg-white transition-all ${on ? 'left-[21px]' : 'left-[3px]'}`} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
