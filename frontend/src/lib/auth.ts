import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react'
import { tokenStore } from './tokenStore'

export function useAuth() {
  const { isSignedIn, isLoaded, signOut, getToken } = useClerkAuth()
  const { user: clerkUser } = useUser()

  // Synchronous assignment during render — runs before any child component renders,
  // so tokenStore is ready before DashboardPage's useQuery fires its first request.
  // useEffect fires *after* child effects (bottom-up), so it was always too late.
  tokenStore.set(getToken)

  const user = clerkUser
    ? {
        name:
          clerkUser.fullName ??
          clerkUser.primaryEmailAddress?.emailAddress ??
          'User',
        org: 'FleetPulse',
      }
    : null

  async function logout() {
    await signOut()
  }

  return {
    token: isSignedIn ? 'clerk' : null,
    isLoaded,
    user,
    logout,
  }
}
