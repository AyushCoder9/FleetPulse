import { lazy, Suspense, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'
import Logo from '@/components/Logo'
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined

// Lazy-loaded only when Clerk key present — always inside ClerkProvider at that point
const GoogleButton = CLERK_KEY
  ? lazy(() =>
      import('@clerk/clerk-react').then(({ useSignIn }) => ({
        default: function ClerkGoogleButton() {
          const { signIn, isLoaded } = useSignIn()
          async function handle() {
            if (!signIn || !isLoaded) return
            try {
              await signIn.authenticateWithRedirect({
                strategy: 'oauth_google',
                redirectUrl: `${window.location.origin}/sso-callback`,
                redirectUrlComplete: '/app/dashboard',
              })
            } catch {
              toast.error('Google sign-in failed')
            }
          }
          return (
            <button
              type="button"
              onClick={handle}
              disabled={!isLoaded}
              className="w-full flex items-center justify-center gap-3 border border-border bg-secondary hover:bg-secondary/70 text-foreground text-sm font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          )
        },
      }))
    )
  : null

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
      {/* Left panel */}
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

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <Logo size={28} className="text-primary" />
            <span className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>FleetPulse</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-1" style={{ fontFamily: 'var(--font-display)' }}>
              Sign in to your fleet
            </h1>
            <p className="text-sm text-muted-foreground">
              Use demo credentials or sign in with Google.
            </p>
          </div>

          <div className="space-y-4">
            {/* Google OAuth button — only when Clerk is configured */}
            {CLERK_KEY && GoogleButton && (
              <>
                <Suspense fallback={
                  <button disabled className="w-full flex items-center justify-center gap-3 border border-border bg-secondary text-muted-foreground text-sm py-3 rounded-lg opacity-50">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading…
                  </button>
                }>
                  <GoogleButton />
                </Suspense>

                <div className="relative flex items-center gap-3">
                  <div className="flex-1 border-t border-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="flex-1 border-t border-border" />
                </div>
              </>
            )}

            {/* Always-visible username/password form */}
            <UsernamePasswordForm />
          </div>

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
