import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'
import Logo from '@/components/Logo'
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined

function ClerkSignInWrapper() {
  return (
    <div id="clerk-sign-in" />
  )
}

function ClerkMount() {
  const [mounted, setMounted] = useState(false)

  useState(() => {
    import('@clerk/clerk-react').then(({ SignIn }) => {
      setMounted(true)
      void SignIn
    })
    setMounted(true)
  })

  if (!mounted) return null

  return <ClerkSignInWrapper />
}

function UsernamePasswordForm() {
  const [username, setUsername] = useState(import.meta.env.VITE_DEMO_USERNAME ?? 'admin')
  const [password, setPassword] = useState(import.meta.env.VITE_DEMO_PASSWORD ?? 'password')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await login(username, password)
      toast.success('Signed in')
      navigate('/app/dashboard')
    } catch {
      toast.error('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          autoComplete="username"
          className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors font-data"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-border bg-secondary px-4 py-3 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors font-data"
          />
          <button
            type="button"
            onClick={() => setShowPw(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50 transition-all glow-amber"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in…
          </>
        ) : (
          'Sign in'
        )}
      </button>

      <p className="text-center text-xs text-muted-foreground pt-1">
        Demo credentials pre-filled — click Sign in
      </p>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — visual */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-card border-r border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dots opacity-30" />
        <div className="absolute inset-0 bg-amber-glow" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5">
            <Logo size={32} className="text-primary" />
            <span className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>FleetPulse</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-sm">
          <blockquote className="space-y-4">
            <p className="text-2xl font-bold leading-snug text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
              "We caught $47k in overcharges in the first month alone."
            </p>
            <footer className="text-sm text-muted-foreground">
              — Fleet Operations Manager, logistics company
            </footer>
          </blockquote>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { val: '$148k', label: 'Saved avg/yr' },
              { val: '14%', label: 'Invoice flag rate' },
              { val: '5 min', label: 'Setup time' },
            ].map(({ val, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold font-data text-primary">{val}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-muted-foreground">
          Fleet Spend & Operations Intelligence
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <Logo size={28} className="text-primary" />
            <span className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>FleetPulse</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-1" style={{ fontFamily: 'var(--font-display)' }}>
              Sign in to your fleet
            </h1>
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/" className="text-primary hover:text-primary/80 transition-colors">
                Start free
              </Link>
            </p>
          </div>

          {CLERK_KEY ? <ClerkMount /> : <UsernamePasswordForm />}

          <div className="mt-8 pt-6 border-t border-border">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
