import { useState, useEffect } from 'react'

const TOKEN_KEY = 'fleetpulse_token'
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

  function login(email: string, _password: string) {
    const fakeToken = btoa(`${email}:${Date.now()}`)
    const fakeUser = { name: email.split('@')[0], org: 'Acme Fleet' }
    localStorage.setItem(TOKEN_KEY, fakeToken)
    localStorage.setItem(USER_KEY, JSON.stringify(fakeUser))
    setToken(fakeToken)
    setUser(fakeUser)
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }

  return { token, user, login, logout }
}
