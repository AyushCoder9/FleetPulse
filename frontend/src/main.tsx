import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClerkProvider } from '@clerk/clerk-react'
import { Toaster } from 'sonner'
import App from './App.tsx'
import { ThemeProvider } from './lib/theme.tsx'
import './index.css'

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined

if (!CLERK_KEY) {
  document.body.innerHTML =
    '<div style="color:#f59e0b;background:#0a0a0a;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:sans-serif;padding:2rem;text-align:center">' +
    '<p>Missing <code>VITE_CLERK_PUBLISHABLE_KEY</code> — add it to <code>frontend/.env.local</code> and restart the dev server.</p>' +
    '</div>'
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY is required')
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={CLERK_KEY} afterSignInUrl="/app/dashboard" afterSignUpUrl="/app/dashboard">
      <ThemeProvider>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <App />
            <Toaster richColors position="bottom-right" />
          </QueryClientProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ClerkProvider>
  </StrictMode>,
)
