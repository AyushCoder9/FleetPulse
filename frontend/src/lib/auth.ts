import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react'

export function useAuth() {
  const { isSignedIn, isLoaded, signOut } = useClerkAuth()
  const { user: clerkUser } = useUser()

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
