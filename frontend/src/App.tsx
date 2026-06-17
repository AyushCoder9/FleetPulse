import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import DemoPage from '@/pages/DemoPage'
import DemoInvoicesPage from '@/pages/DemoInvoicesPage'
import DemoVehiclesPage from '@/pages/DemoVehiclesPage'
import DemoSuppliersPage from '@/pages/DemoSuppliersPage'
import DemoLayout from '@/components/DemoLayout'
import DashboardPage from '@/pages/DashboardPage'
import InvoicesPage from '@/pages/InvoicesPage'
import VehiclesPage from '@/pages/VehiclesPage'
import SuppliersPage from '@/pages/SuppliersPage'
import AppLayout from '@/components/AppLayout'
import { useAuth } from '@/lib/auth'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoaded } = useAuth()
  if (!isLoaded) return <div className="min-h-screen bg-background" />
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Demo — public, nested under shared DemoLayout */}
      <Route path="/demo" element={<DemoLayout />}>
        <Route index element={<DemoPage />} />
        <Route path="invoices" element={<DemoInvoicesPage />} />
        <Route path="vehicles" element={<DemoVehiclesPage />} />
        <Route path="suppliers" element={<DemoSuppliersPage />} />
      </Route>

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
      <Route path="/dashboard"  element={<Navigate to="/app/dashboard" replace />} />
      <Route path="/invoices"   element={<Navigate to="/app/invoices"  replace />} />
      <Route path="/vehicles"   element={<Navigate to="/app/vehicles"  replace />} />
      <Route path="/suppliers"  element={<Navigate to="/app/suppliers" replace />} />
    </Routes>
  )
}
