import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { login } from '@/services/adminApi'
import { useAuthStore } from '@/stores/authStore'

type ApiError = { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const setUser = useAuthStore((s) => s.setUser)
  const nav = useNavigate()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email.trim(), password)
      setUser(user)
      const slug = user.role?.slug
      if (slug === 'kitchen_staff') nav('/kitchen', { replace: true })
      else if (slug === 'cashier') nav('/cashier/pos', { replace: true })
      else nav('/admin/dashboard', { replace: true })
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.response?.data?.message || apiError.response?.data?.errors?.email?.[0] || 'Gagal masuk. Periksa email dan kata sandi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-900">Masuk Staf</h1>
      <p className="mt-1 text-sm text-ink-600">Angkringan Senja</p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit} aria-busy={loading}>
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium">Email</label>
          <input
            id="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-control border border-cream-200 px-3 py-2"
            type="email"
            autoComplete="username"
            inputMode="email"
            required
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'login-error' : undefined}
          />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-sm font-medium">Kata sandi</label>
          <div className="relative mt-1">
            <input
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-h-11 w-full rounded-control border border-cream-200 px-3 py-2 pr-12"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'login-error' : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-control text-ink-600 hover:text-brand-900"
              aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          </div>
        </div>
        {error && <p id="login-error" role="alert" className="rounded-control border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p>}
        <button type="submit" disabled={loading} className="inline-flex min-h-11 w-full items-center justify-center rounded-control bg-brand-900 px-4 py-2 font-semibold text-white hover:bg-brand-800 disabled:opacity-50">
          {loading ? 'Masuk...' : 'Masuk'}
        </button>
      </form>
    </div>
  )
}
