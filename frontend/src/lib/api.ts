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
  is_deleted: boolean
  approved_at: string | null
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

export interface SpendTrendItem {
  month: string
  service_type: string
  total: string
}

export interface FleetHealth {
  status_counts: Record<string, number>
  idle_cost_total: string
}

export interface ImportResult {
  created: number
  skipped: number
  errors: Array<{ row: number; reason: string }>
}

import { tokenStore } from './tokenStore'

async function getToken(): Promise<string | null> {
  return tokenStore.get()
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })
  if (res.status === 401) {
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  if (!res.ok) throw new Error(`API error ${res.status}`)
  if (res.status === 204) return undefined as T
  return res.json()
}

interface Paginated<T> { count: number; results: T[] }

export const api = {
  dashboard: () => request<DashboardSummary>('/api/v1/dashboard/summary/'),

  invoices: async (status?: string): Promise<Invoice[]> => {
    const res = await request<Paginated<Invoice>>(`/api/v1/invoices/${status ? `?status=${status}` : ''}`)
    return res.results
  },

  approveInvoice: (id: number) =>
    request<void>(`/api/v1/invoices/${id}/approve/`, { method: 'POST' }),

  flagInvoice: (id: number) =>
    request<void>(`/api/v1/invoices/${id}/flag/`, { method: 'POST' }),

  bulkApproveInvoices: (ids: number[]) =>
    request<{ approved: number }>('/api/v1/invoices/bulk-approve/', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),

  importInvoices: async (file: File): Promise<ImportResult> => {
    const token = await getToken()
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${BASE_URL}/api/v1/invoices/import/`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
    if (res.status === 401) {
      window.location.href = '/login'
      throw new Error('Unauthorized')
    }
    if (!res.ok) throw new Error(`API error ${res.status}`)
    return res.json()
  },

  vehicles: async (): Promise<Vehicle[]> => {
    const res = await request<Paginated<Vehicle>>('/api/v1/vehicles/')
    return res.results
  },

  suppliers: async (): Promise<Supplier[]> => {
    const res = await request<Paginated<{ id: number; name: string; region: string }>>('/api/v1/suppliers/')
    const scorecards = await Promise.all(
      res.results.map(s => request<Supplier>(`/api/v1/suppliers/${s.id}/scorecard/`))
    )
    return scorecards
  },

  spendTrend: () => request<SpendTrendItem[]>('/api/v1/analytics/spend-trend/'),

  fleetHealth: () => request<FleetHealth>('/api/v1/analytics/fleet-health/'),
}
