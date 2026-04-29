import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function Login() {
  const { login, signup } = useAuth()
  const nav = useNavigate()
  const [mode, setMode] = useState('login')  // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    const fn = mode === 'login' ? login : signup
    const r = await fn(email, password)
    setBusy(false)
    if (r.error) { setErr(r.error); return }
    nav(`/faculty/${r.faculty.id}`)
  }

  return (
    <div className="max-w-md mx-auto px-6 pt-24 pb-16">
      <Link to="/" className="text-xs text-ink/50 hover:text-maroon">← Back to directory</Link>
      <div className="eyebrow mt-6 mb-3">Faculty Portal</div>
      <h1 className="display text-4xl font-semibold mb-2">
        {mode === 'login' ? 'Sign in to your profile' : 'Create your account'}
      </h1>
      <p className="text-sm text-ink/60 mb-10">
        {mode === 'login'
          ? 'Only faculty need to sign in. Public visitors can browse the directory without an account.'
          : 'Your email must match the one on file with administration. Contact SCIS admin if you need to be added.'}
      </p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-xs text-ink/60 mb-1 block">Institutional email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full border hairline bg-white px-3 py-2 focus:outline-none focus:border-maroon"
            placeholder="you@uohyd.ac.in" />
        </div>
        <div>
          <label className="text-xs text-ink/60 mb-1 block">
            Password {mode === 'signup' && <span className="text-ink/40">(minimum 8 characters)</span>}
          </label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
            className="w-full border hairline bg-white px-3 py-2 focus:outline-none focus:border-maroon" />
        </div>

        {err && <div className="text-sm text-maroon bg-maroon/5 border border-maroon/20 px-3 py-2">{err}</div>}

        <button type="submit" disabled={busy}
          className="w-full bg-maroon text-white py-3 hover:bg-maroon-dark transition disabled:opacity-50">
          {busy ? 'Please wait…' : (mode === 'login' ? 'Sign in' : 'Create account')}
        </button>
      </form>

      <div className="mt-6 text-sm text-ink/60">
        {mode === 'login' ? (
          <>New here? <button onClick={() => setMode('signup')} className="text-maroon hover:underline">Create an account</button></>
        ) : (
          <>Already have an account? <button onClick={() => setMode('login')} className="text-maroon hover:underline">Sign in</button></>
        )}
      </div>
    </div>
  )
}