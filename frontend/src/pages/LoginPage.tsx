import { Link, Navigate } from 'react-router-dom'
import { SignIn, useAuth as useClerkAuth } from '@clerk/clerk-react'
import Logo from '@/components/Logo'
import { ArrowLeft } from 'lucide-react'

const clerkAppearance = {
  variables: {
    colorPrimary: '#f59e0b',
    colorBackground: '#0f0f0f',
    colorInputBackground: '#1a1a1a',
    colorText: '#e5e5e5',
    colorTextSecondary: '#737373',
    colorTextOnPrimaryBackground: '#000000',
    colorInputText: '#e5e5e5',
    colorNeutral: '#737373',
    borderRadius: '0.5rem',
    fontSize: '14px',
  },
  elements: {
    card: {
      backgroundColor: 'transparent',
      border: 'none',
      boxShadow: 'none',
      padding: 0,
      width: '100%',
    },
    rootBox: { width: '100%' },
    headerTitle: {
      color: '#fafafa',
      fontSize: '1.5rem',
      fontWeight: '700',
      fontFamily: 'Space Grotesk, sans-serif',
    },
    headerSubtitle: { color: '#737373' },
    socialButtonsBlockButton: {
      backgroundColor: '#1a1a1a',
      border: '1px solid #262626',
      color: '#e5e5e5',
    },
    socialButtonsBlockButtonText: { color: '#e5e5e5', fontWeight: '500' },
    formButtonPrimary: {
      backgroundColor: '#f59e0b',
      color: '#000000',
      fontWeight: '600',
    },
    formFieldInput: {
      backgroundColor: '#1a1a1a',
      border: '1px solid #262626',
      color: '#e5e5e5',
    },
    formFieldLabel: { color: '#a3a3a3' },
    footerActionLink: { color: '#f59e0b' },
    footerAction: { color: '#737373' },
    dividerLine: { backgroundColor: '#262626' },
    dividerText: { color: '#737373' },
    identityPreviewText: { color: '#e5e5e5' },
    identityPreviewEditButtonIcon: { color: '#f59e0b' },
    alternativeMethodsBlockButton: {
      backgroundColor: '#1a1a1a',
      border: '1px solid #262626',
      color: '#e5e5e5',
    },
    otpCodeFieldInput: {
      backgroundColor: '#1a1a1a',
      border: '1px solid #262626',
      color: '#e5e5e5',
    },
  },
}

export default function LoginPage() {
  const { isSignedIn, isLoaded } = useClerkAuth()
  if (isLoaded && isSignedIn) return <Navigate to="/app/dashboard" replace />

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-card border-r border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dots opacity-30" />
        <div className="absolute inset-0 bg-amber-glow" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5">
            <Logo size={32} className="text-primary" />
            <span className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              FleetPulse
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-sm">
          <blockquote className="space-y-4">
            <p
              className="text-2xl font-bold leading-snug text-foreground"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              "We caught $47k in overcharges in the first month alone."
            </p>
            <footer className="text-sm text-muted-foreground">
              — Fleet Operations Manager, logistics company
            </footer>
          </blockquote>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { val: '$148k', label: 'Saved avg/yr' },
              { val: '14%',   label: 'Invoice flag rate' },
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
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <Logo size={28} className="text-primary" />
            <span
              className="text-lg font-semibold"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              FleetPulse
            </span>
          </div>

          {/* Clerk handles all auth: Google OAuth + email/password */}
          <SignIn
            routing="virtual"
            afterSignInUrl="/app/dashboard"
            afterSignUpUrl="/app/dashboard"
            appearance={clerkAppearance}
          />

          <div className="mt-6 pt-6 border-t border-border">
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
