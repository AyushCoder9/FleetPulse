import { useEffect } from 'react'
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react'
import { tokenStore } from './tokenStore'

export function useAuth() {
  const { isSignedIn, isLoaded, signOut, getToken } = useClerkAuth()
  const { user: clerkUser } = useUser()

  // Wire Clerk's getToken into the module-level store so api.ts can call it
  useEffect(() => {
    tokenStore.set(getToken)
  }, [getToken])

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
