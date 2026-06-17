import { Link, NavLink, Outlet } from 'react-router-dom'
import { Zap, ArrowRight } from 'lucide-react'
import Logo from '@/components/Logo'

const NAV = [
  { label: 'Dashboard', to: '/demo',           end: true },
  { label: 'Invoices',  to: '/demo/invoices',  end: false },
  { label: 'Vehicles',  to: '/demo/vehicles',  end: false },
  { label: 'Suppliers', to: '/demo/suppliers', end: false },
]

export default function DemoLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto flex items-center h-14 px-6 gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <Logo size={26} className="text-primary" />
            <span className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
              FleetPulse
            </span>
          </Link>

          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full shrink-0">
            <Zap className="h-3 w-3" />
            Demo Mode
          </span>

          {/* Nav tabs */}
          <nav className="hidden sm:flex items-center gap-1 ml-4">
            {NAV.map(({ label, to, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-secondary text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:inline">
              Back to home
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-all"
            >
              Sign up free <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto">
          {NAV.map(({ label, to, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `shrink-0 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-secondary text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto p-6 space-y-6">
        {/* Demo banner */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">You're viewing demo data</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              All numbers are illustrative but calculated from a realistic 100-vehicle fleet dataset.
              Sign up to connect your real invoices.
            </p>
          </div>
          <Link
            to="/login"
            className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Start with your data <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <Outlet />
      </div>
    </div>
  )
}
