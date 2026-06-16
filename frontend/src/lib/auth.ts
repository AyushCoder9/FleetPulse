import { useState, useEffect } from 'react'
import { api } from './api'

const TOKEN_KEY = 'fleetpulse_token'
const REFRESH_KEY = 'fleetpulse_refresh'
const USER_KEY = 'fleetpulse_user'

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<{ name: string; org: string } | null>(() => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    const handler = () => {
      setToken(localStorage.getItem(TOKEN_KEY))
      const raw = localStorage.getItem(USER_KEY)
      setUser(raw ? JSON.parse(raw) : null)
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  async function login(username: string, password: string): Promise<void> {
    const { access, refresh } = await api.login(username, password)
    const payload = JSON.parse(atob(access.split('.')[1])) as { username?: string }
    const derivedUser = { name: payload.username ?? username, org: 'FleetPulse' }
    localStorage.setItem(TOKEN_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
    localStorage.setItem(USER_KEY, JSON.stringify(derivedUser))
    setToken(access)
    setUser(derivedUser)
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }

  return { token, user, login, logout }
}
