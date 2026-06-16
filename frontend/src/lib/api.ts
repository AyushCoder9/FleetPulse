const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000'

export interface DashboardSummary {
  overcharges_caught: number
  idle_cost_saved: number
  flagged_invoice_count: number
  avg_supplier_score: number
}

export interface InvoiceLineItem {
  id: number
  description: string
  amount: string
}

export interface Invoice {
  id: number
  supplier_name: string
  vehicle_vin: string
  service_type: string
  total_amount: string
  status: 'pending' | 'flagged' | 'approved'
  created_at: string
  line_items?: InvoiceLineItem[]
}

export interface Vehicle {
  id: number
  organization: number
  vin: string
  make: string
  model: string
  status: 'active' | 'idle' | 'maintenance'
  odometer: number
  created_at: string
}

export interface Supplier {
  id: number
  name: string
  region: string
  score: number
  invoice_count: number
  flagged_count: number
  total_spend: number
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('fleetpulse_token')
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })
  if (res.status === 401) {
    localStorage.removeItem('fleetpulse_token')
    localStorage.removeItem('fleetpulse_refresh')
    localStorage.removeItem('fleetpulse_user')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  if (!res.ok) throw new Error(`API error ${res.status}`)
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  login: (username: string, password: string) =>
    request<{ access: string; refresh: string }>('/api/v1/auth/token/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  dashboard: () => request<DashboardSummary>('/api/v1/dashboard/summary/'),

  invoices: (status?: string) =>
    request<Invoice[]>(`/api/v1/invoices/${status ? `?status=${status}` : ''}`),

  approveInvoice: (id: number) =>
    request<void>(`/api/v1/invoices/${id}/approve/`, { method: 'POST' }),

  flagInvoice: (id: number) =>
    request<void>(`/api/v1/invoices/${id}/flag/`, { method: 'POST' }),

  vehicles: () => request<Vehicle[]>('/api/v1/vehicles/'),

  suppliers: async (): Promise<Supplier[]> => {
    const list = await request<{ id: number; name: string; region: string }[]>('/api/v1/suppliers/')
    const scorecards = await Promise.all(
      list.map(s => request<Supplier>(`/api/v1/suppliers/${s.id}/scorecard/`))
    )
    return scorecards
  },
}
