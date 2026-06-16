import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import Logo from '@/components/Logo'

export default function DemoPage() {
  const { login, token } = useAuth()
  const navigate = useNavigate()
  const attempted = useRef(false)

  useEffect(() => {
    if (token) {
      navigate('/app/dashboard', { replace: true })
      return
    }
    if (attempted.current) return
    attempted.current = true

    login('admin', 'password')
      .then(() => navigate('/app/dashboard', { replace: true }))
      .catch(() => navigate('/login', { replace: true }))
  }, [token, login, navigate])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
      <Logo size={56} className="text-primary animate-pulse" />
      <div className="text-center space-y-2">
        <p className="text-foreground font-semibold text-lg" style={{ fontFamily: 'var(--font-display)' }}>
          Loading demo…
        </p>
        <p className="text-muted-foreground text-sm">
          Signing you in with demo credentials
        </p>
      </div>
    </div>
  )
}
