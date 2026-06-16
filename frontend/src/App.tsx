import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import InvoicesPage from '@/pages/InvoicesPage'
import VehiclesPage from '@/pages/VehiclesPage'
import SuppliersPage from '@/pages/SuppliersPage'
import Layout from '@/components/Layout'
import { useAuth } from '@/lib/auth'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
      </Route>
    </Routes>
  )
}
