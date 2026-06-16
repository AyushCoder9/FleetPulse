import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import App from './App.tsx'
import { ThemeProvider } from './lib/theme.tsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined

async function mount() {
  const root = document.getElementById('root')!

  let AppWithProviders = (
    <StrictMode>
      <ThemeProvider>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <App />
            <Toaster richColors position="bottom-right" />
          </QueryClientProvider>
        </BrowserRouter>
      </ThemeProvider>
    </StrictMode>
  )

  if (CLERK_KEY) {
    const { ClerkProvider } = await import('@clerk/clerk-react')
    AppWithProviders = (
      <StrictMode>
        <ThemeProvider>
          <ClerkProvider publishableKey={CLERK_KEY} afterSignInUrl="/app/dashboard" afterSignUpUrl="/app/dashboard">
            <BrowserRouter>
              <QueryClientProvider client={queryClient}>
                <App />
                <Toaster richColors position="bottom-right" />
              </QueryClientProvider>
            </BrowserRouter>
          </ClerkProvider>
        </ThemeProvider>
      </StrictMode>
    )
  }

  createRoot(root).render(AppWithProviders)
}

mount()
