import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, Truck, Users, LogOut, Moon, Sun } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/lib/theme'
import Logo from '@/components/Logo'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/invoices', icon: FileText, label: 'Invoices' },
  { to: '/app/vehicles', icon: Truck, label: 'Vehicles' },
  { to: '/app/suppliers', icon: Users, label: 'Suppliers' },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 h-14 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center h-full px-6 gap-8">
          {/* Logo + wordmark */}
          <NavLink to="/app/dashboard" className="flex items-center gap-2.5 shrink-0 mr-2">
            <Logo size={28} className="text-primary" />
            <span
              className="text-lg font-semibold tracking-tight text-foreground"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              FleetPulse
            </span>
          </NavLink>

          {/* Nav links — horizontal */}
          <nav className="flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                  )
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="ml-auto flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* User info + logout */}
            <div className="flex items-center gap-3 pl-3 border-l border-border">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-foreground leading-tight">{user?.name}</p>
                <p className="text-xs text-muted-foreground leading-tight">{user?.org}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1.5 rounded-md hover:bg-secondary"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
