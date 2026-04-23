import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    if (isSignup && password !== confirm) return setError('Passwords do not match.')
    setLoading(true)
    const { error } = isSignup
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) return setError(error.message)
    if (isSignup) setMessage('Check your email to confirm your account.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 font-['DM_Sans',sans-serif]">
      <div className="flex w-full max-w-3xl min-h-125 rounded-2xl overflow-hidden shadow-lg">

        {/* Left panel */}
        <div className="flex-1 bg-blue-950 p-12 flex flex-col justify-between">
          <div className="font-['Syne',sans-serif] text-xl font-bold text-white tracking-tight">
            Post<span className="text-blue-500">Sync</span>
          </div>
          <div className="mt-auto pt-10">
            <h1 className="font-['Syne',sans-serif] text-3xl font-bold text-white leading-tight tracking-tight">
              Schedule &amp; publish to{' '}
              <span className="text-blue-500">LinkedIn</span>{' '}
              — on autopilot.
            </h1>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed font-light">
              Scrape, rewrite with AI, and schedule posts across your profile or company pages.
            </p>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-80 bg-blue-900 px-8 py-12 flex flex-col justify-center">
          <h2 className="font-['Syne',sans-serif] text-xl font-bold text-white mb-1.5">
            {isSignup ? 'Create account' : 'Welcome back'}
          </h2>
          <p className="text-sm text-gray-300 font-light mb-7">
            {isSignup ? 'Start scheduling today' : 'Sign in to your account'}
          </p>

          <form onSubmit={handleSubmit}>
            <Field label="Email">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-slate-200 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-black placeholder-slate-600 outline-none focus:border-blue-500 transition-colors"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-slate-200 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-black placeholder-slate-600 outline-none focus:border-blue-500 transition-colors"
              />
            </Field>
            {isSignup && (
              <Field label="Confirm password">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  className="w-full bg-slate-200 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-black placeholder-slate-600 outline-none focus:border-blue-500 transition-colors"
                />
              </Field>
            )}

            {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
            {message && <p className="text-xs text-emerald-400 mb-3">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium transition-colors cursor-pointer"
            >
              {loading ? 'Please wait...' : isSignup ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-300">
            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            <span
              onClick={() => { setIsSignup(!isSignup); setError('') }}
              className="text-blue-500 cursor-pointer hover:underline"
            >
              {isSignup ? 'Sign in' : 'Sign up'}
            </span>
          </p>
        </div>

      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="block text-[11px] text-slate-200 mb-1.5 tracking-widest uppercase">
        {label}
      </label>
      {children}
    </div>
  )
}