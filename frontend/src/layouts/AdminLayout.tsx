import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BadgePercent,
  BarChart3,
  BookOpen,
  Boxes,
  ChefHat,
  History,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  QrCode,
  Receipt,
  ShoppingCart,
  Tags,
  UtensilsCrossed,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react'
import { logout } from '@/services/adminApi'
import { useAuthStore } from '@/stores/authStore'

type NavItem = { to: string; label: string; icon: LucideIcon; roles: string[] }

const nav: NavItem[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner'] },
  { to: '/admin/products', label: 'Produk', icon: UtensilsCrossed, roles: ['owner'] },
  { to: '/admin/categories', label: 'Kategori', icon: Tags, roles: ['owner'] },
  { to: '/admin/orders', label: 'Pesanan', icon: Receipt, roles: ['owner', 'cashier'] },
  { to: '/admin/inventory', label: 'Inventaris', icon: Boxes, roles: ['owner'] },
  { to: '/admin/recipes', label: 'Resep', icon: BookOpen, roles: ['owner'] },
  { to: '/admin/expenses', label: 'Pengeluaran', icon: Wallet, roles: ['owner'] },
  { to: '/admin/promotions', label: 'Promosi', icon: BadgePercent, roles: ['owner'] },
  { to: '/admin/reports', label: 'Laporan', icon: BarChart3, roles: ['owner'] },
  { to: '/admin/tables', label: 'Meja & QR', icon: QrCode, roles: ['owner', 'cashier'] },
  { to: '/cashier/pos', label: 'Kasir / POS', icon: ShoppingCart, roles: ['owner', 'cashier'] },
  { to: '/cashier/orders', label: 'Riwayat Kasir', icon: History, roles: ['owner', 'cashier'] },
  { to: '/kitchen', label: 'Dapur', icon: ChefHat, roles: ['owner', 'cashier', 'kitchen_staff'] },
]

export function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore(s => s.user)
  const isReady = useAuthStore(s => s.isReady)
  const setUser = useAuthStore(s => s.setUser)
  const [mobileOpen, setMobileOpen] = useState(false)
  const role = user?.role?.slug || ''
  const items = role ? nav.filter(i => i.roles.includes(role)) : []
  const currentLabel = nav.find(i => i.to === location.pathname)?.label || 'Admin'

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!mobileOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    const desktop = window.matchMedia('(min-width: 1024px)')
    const onDesktop = () => {
      if (desktop.matches) setMobileOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    desktop.addEventListener('change', onDesktop)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      desktop.removeEventListener('change', onDesktop)
      document.body.style.overflow = previousOverflow
    }
  }, [mobileOpen])

  async function onLogout() {
    try { await logout() } catch { /* ignore */ }
    setUser(null)
    navigate('/login')
  }

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

  if (!user) return <Outlet />

  const home = role === 'owner' ? '/admin/dashboard' : role === 'cashier' ? '/cashier/pos' : '/kitchen'

  return (
    <div className="min-h-screen bg-cream-50 text-ink-900 lg:flex">
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-control focus:bg-brand-900 focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-cream-50">
        Lewati ke konten
      </a>

      {mobileOpen ? (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 cursor-default bg-ink-900/40 lg:hidden"
        />
      ) : null}

      <aside
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-cream-200 bg-white p-4 transition-transform duration-200 motion-reduce:transition-none lg:static lg:z-auto lg:w-60 lg:translate-x-0 lg:visible ${mobileOpen ? 'visible translate-x-0' : 'invisible -translate-x-full'} print:hidden`}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <Link to={home} className="min-h-11 truncate font-display text-lg font-bold text-brand-900">
            Angkringan Senja
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-control text-ink-600 hover:bg-cream-100 hover:text-brand-900 lg:hidden"
            aria-label="Tutup menu admin"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="mb-4 truncate text-xs text-ink-600">
          {user.name}{user.role?.name ? ` / ${user.role.name}` : ''}
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto" aria-label="Navigasi admin">
          {items.map((item) => {
            const active = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                onClick={() => setMobileOpen(false)}
                className={`flex min-h-11 items-center gap-2 rounded-control px-3 py-2 text-sm ${active ? 'bg-cream-100 font-medium text-brand-900' : 'text-ink-600 hover:bg-cream-100 hover:text-brand-900'}`}
              >
                <item.icon size={16} aria-hidden="true" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <button type="button" onClick={onLogout} className="mt-4 flex min-h-11 items-center gap-2 rounded-control px-3 py-2 text-left text-sm text-ink-600 hover:bg-cream-100 hover:text-danger">
          <LogOut size={16} aria-hidden="true" />
          Keluar
        </button>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-cream-200 bg-cream-50 px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-control border border-cream-200 bg-white text-brand-900"
            aria-label="Buka menu admin"
            aria-expanded={mobileOpen}
            aria-controls="admin-sidebar"
          >
            <Menu size={20} aria-hidden="true" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-brand-900">{currentLabel}</p>
            <p className="truncate text-xs text-ink-600">{user.name}</p>
          </div>
          <Link to="/" className="inline-flex min-h-11 items-center rounded-control px-3 text-sm font-medium text-brand-700 hover:bg-cream-100">
            Lihat toko
          </Link>
        </header>
        <main id="admin-main" tabIndex={-1} className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
