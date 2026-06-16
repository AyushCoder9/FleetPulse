import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import DemoPage from '@/pages/DemoPage'
import DashboardPage from '@/pages/DashboardPage'
import InvoicesPage from '@/pages/InvoicesPage'
import VehiclesPage from '@/pages/VehiclesPage'
import SuppliersPage from '@/pages/SuppliersPage'
import AppLayout from '@/components/AppLayout'
import { useAuth } from '@/lib/auth'

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined

// Clerk SSO callback — only loaded when Clerk is configured
const SsoCallback = CLERK_KEY
  ? lazy(() =>
      import('@clerk/clerk-react').then(({ AuthenticateWithRedirectCallback }) => ({
        default: function SsoCallbackPage() {
          return (
            <div className="min-h-screen bg-background flex items-center justify-center">
              <AuthenticateWithRedirectCallback
                afterSignInUrl="/app/dashboard"
                afterSignUpUrl="/app/dashboard"
              />
            </div>
          )
        },
      }))
    )
  : null

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/demo" element={<DemoPage />} />

      {/* Clerk OAuth callback */}
      {CLERK_KEY && SsoCallback && (
        <Route
          path="/sso-callback"
          element={
            <Suspense fallback={<div className="min-h-screen bg-background" />}>
              <SsoCallback />
            </Suspense>
          }
        />
      )}

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
      </Route>

      {/* legacy redirects */}
      <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="/invoices" element={<Navigate to="/app/invoices" replace />} />
      <Route path="/vehicles" element={<Navigate to="/app/vehicles" replace />} />
      <Route path="/suppliers" element={<Navigate to="/app/suppliers" replace />} />
    </Routes>
  )
}
