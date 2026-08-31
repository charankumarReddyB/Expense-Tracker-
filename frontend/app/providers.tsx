'use client'

import { AuthProvider } from '@/lib/contexts/AuthContext'
import { ToastContainer } from '@/lib/hooks/useToast'
import ErrorBoundary from '@/components/ErrorBoundary'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        {children}
        <ToastContainer />
      </AuthProvider>
    </ErrorBoundary>
  )
}
