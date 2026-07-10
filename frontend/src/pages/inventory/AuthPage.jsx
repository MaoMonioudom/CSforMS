import { useState } from 'react'
import { Package2, ShoppingCart, BadgeCheck, ArrowRight, AlertCircle, Clock } from 'lucide-react'
import { LOGO_IMAGE } from '../../lib/inventory/data'
import { login, register } from '../../lib/inventory/api'

const inputClass = 'w-full rounded-[10px] border border-border bg-cream px-3.5 py-[11px] text-sm text-charcoal outline-none focus:border-inv-accent'

export default function AuthPage({ onLogin, onSignup, users }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', studentId: '', password: '' })
  const [error, setError] = useState('')
  const [pendingNotice, setPendingNotice] = useState(false)
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleLogin = async () => {
    setError(''); setBusy(true)
    try {
      const found = await login(form, users)
      onLogin(found)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const handleSignup = async () => {
    setError(''); setBusy(true)
    try {
      const newUser = await register(form, users)
      onSignup(newUser)
      setPendingNotice(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  if (pendingNotice) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream p-8">
        <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-border bg-white p-10 text-center">
          <Clock size={36} className="text-amber" />
          <h2 className="font-heading text-xl font-bold text-charcoal">Registration submitted</h2>
          <p className="text-sm leading-relaxed text-inv-muted">
            Your membership request is pending staff review. You'll be able to log in once it's approved.
          </p>
          <button onClick={() => { setPendingNotice(false); setMode('login') }} className="mt-2 rounded-[10px] bg-charcoal px-5 py-2.5 text-sm font-semibold text-white">
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-8">
      <div className="flex w-full max-w-[920px] min-h-[540px] overflow-hidden rounded-[20px] border border-border bg-white">

        {/* Left — brand */}
        <div className="hidden w-[360px] flex-shrink-0 flex-col justify-between bg-charcoal p-12 md:flex">
          <div>
            <img src={LOGO_IMAGE} alt="MakerVault" className="mb-10 h-10 w-auto object-contain" />
            <h2 className="mb-4 font-heading text-[30px] font-bold leading-tight tracking-tight text-white">
              Build anything.<br />Borrow the tools.
            </h2>
            <p className="text-sm leading-7 text-faint">
              Access 100+ tools, components and materials from your campus makerspace — all in one place.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { Icon: Package2, text: 'Borrow & return tools seamlessly' },
              { Icon: ShoppingCart, text: 'Purchase consumables with credits' },
              { Icon: BadgeCheck, text: 'Staff-approved borrowing workflow' },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 text-[13px] text-faint">
                <Icon size={16} className="text-inv-accent" />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div className="flex flex-1 flex-col justify-center p-12">
          <div className="mb-8 flex rounded-[10px] bg-cream p-1">
            {['login', 'signup'].map((m) => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                className={`flex-1 rounded-lg py-2.5 text-sm transition-all ${mode === m ? 'bg-white font-semibold text-charcoal shadow-sm' : 'bg-transparent font-normal text-inv-muted'}`}>
                {m === 'login' ? 'Sign in' : 'Register'}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {mode === 'signup' && <input placeholder="Full name" value={form.name} onChange={(e) => set('name', e.target.value)} className={inputClass} />}
            <input placeholder="Email address" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputClass} />
            {mode === 'signup' && (
              <input placeholder="Student ID (e.g. CADT2024001) — or use a CADT email" value={form.studentId} onChange={(e) => set('studentId', e.target.value)} className={inputClass} />
            )}
            <input type="password" placeholder="Password" value={form.password} onChange={(e) => set('password', e.target.value)} className={inputClass} />

            {error && (
              <p className="m-0 flex items-center gap-1.5 text-[13px] text-red">
                <AlertCircle size={14} /> {error}
              </p>
            )}

            <button
              disabled={busy}
              onClick={mode === 'login' ? handleLogin : handleSignup}
              className="mt-1 flex items-center justify-center gap-2 rounded-[10px] bg-charcoal py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-inv-accent disabled:opacity-60"
            >
              {mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={16} />
            </button>

            {mode === 'login' && (
              <p className="m-0 text-center text-xs leading-loose text-faint">
                Demo: admin@cadt.edu.kh · staff@cadt.edu.kh · sophea@student.cadt.edu.kh
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
