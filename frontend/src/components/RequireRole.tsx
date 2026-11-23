import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

export function RequireRole({ roles, children }: { roles: string[]; children: ReactNode }) {
  const user = useAuthStore(s => s.user)
  const isReady = useAuthStore(s => s.isReady)
  const role = user?.role?.slug
  if (!isReady) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream-50 px-4">
        <p role="status" className="flex items-center gap-2 text-sm text-ink-600">
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          Memeriksa sesi...
        </p>
      </div>
    )
  }
  if (!role) return <Navigate to="/login" replace />
  if (!roles.includes(role)) {
    if (role === 'kitchen_staff') return <Navigate to="/kitchen" replace />
    if (role === 'cashier') return <Navigate to="/cashier/pos" replace />
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}
