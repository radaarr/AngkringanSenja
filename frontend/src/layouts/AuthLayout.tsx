import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-50 px-4">
      <div className="w-full max-w-md rounded-feature border border-cream-200 bg-white p-8 shadow-[var(--shadow-card)]">
        <Outlet />
      </div>
    </div>
  )
}
