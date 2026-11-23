import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, ShoppingBag, ArrowUpRight } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const items = useCartStore(s => s.items)
  const count = items.reduce((n, i) => n + i.quantity, 0)
  const isHome = location.pathname === '/'
  const darkHero = isHome && !scrolled

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [location.pathname])

  const linkBase = `group relative inline-flex min-h-11 items-center text-sm font-medium tracking-wide transition ${darkHero ? 'text-cream-50/90 hover:text-cream-50' : 'text-ink-600 hover:text-brand-900'}`
  const active = (isActive: boolean) => isActive ? (darkHero ? 'text-cream-50' : 'text-brand-900') : ''

  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${darkHero ? 'bg-transparent' : 'border-b border-cream-200 bg-cream-50'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6 md:py-5">
        <Link to="/" className="group flex min-h-11 items-center">
          <span className={`font-display text-lg font-bold tracking-tight md:text-xl ${darkHero ? 'text-cream-50' : 'text-brand-900'}`}>Angkringan Senja</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/" end className={({ isActive }) => `${linkBase} ${active(isActive)}`}>
            {({ isActive }) => <><span>Beranda</span><span className={`absolute -bottom-1 left-0 h-px bg-current transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} /></>}
          </NavLink>
          <NavLink to="/menu" className={({ isActive }) => `${linkBase} ${active(isActive)}`}>
            {({ isActive }) => <><span>Menu</span><span className={`absolute -bottom-1 left-0 h-px bg-current transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} /></>}
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => `relative inline-flex items-center gap-2 ${linkBase} ${active(isActive)}`}>
            {({ isActive }) => <><ShoppingBag size={16} aria-hidden="true" /><span>Keranjang</span>{count > 0 && <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta-600 px-1.5 text-[11px] font-semibold text-white">{count}</span>}<span className={`absolute -bottom-1 left-0 h-px bg-current transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} /></>}
          </NavLink>
          <Link to="/menu" className={`group inline-flex min-h-11 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${darkHero ? 'bg-cream-50 text-brand-900 hover:bg-terracotta-600 hover:text-white' : 'bg-brand-900 text-cream-50 hover:bg-terracotta-600'}`}>
            Pesan Sekarang <ArrowUpRight size={15} aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <Link to="/cart" className={`relative inline-flex h-11 w-11 items-center justify-center rounded-control ${darkHero ? 'text-cream-50' : 'text-brand-900'}`} aria-label={`Keranjang${count > 0 ? `, ${count} item` : ''}`}>
            <ShoppingBag size={20} aria-hidden="true" />
            {count > 0 && <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-terracotta-600 px-1 text-[10px] font-semibold text-white">{count}</span>}
          </Link>
          <button type="button" onClick={() => setOpen(o => !o)} className={`inline-flex h-11 w-11 items-center justify-center rounded-control ${darkHero ? 'text-cream-50' : 'text-brand-900'}`} aria-label={open ? 'Tutup menu' : 'Buka menu'} aria-expanded={open} aria-controls="mobile-navigation">
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div id="mobile-navigation" className={`overflow-hidden transition-all duration-500 motion-reduce:transition-none md:hidden ${open ? 'visible max-h-96 border-t border-cream-200 bg-cream-50' : 'invisible max-h-0'}`}>
        <nav className="flex flex-col gap-1 px-4 py-4 text-base font-medium text-ink-600" aria-label="Navigasi utama">
          <NavLink to="/" end className={({ isActive }) => `inline-flex min-h-11 items-center rounded-control px-3 py-3 ${isActive ? 'bg-cream-100 text-brand-900' : 'hover:bg-cream-100'}`}>Beranda</NavLink>
          <NavLink to="/menu" className={({ isActive }) => `inline-flex min-h-11 items-center rounded-control px-3 py-3 ${isActive ? 'bg-cream-100 text-brand-900' : 'hover:bg-cream-100'}`}>Menu</NavLink>
          <NavLink to="/cart" className={({ isActive }) => `inline-flex min-h-11 items-center rounded-control px-3 py-3 ${isActive ? 'bg-cream-100 text-brand-900' : 'hover:bg-cream-100'}`}>Keranjang {count > 0 ? `(${count})` : ''}</NavLink>
          <Link to="/menu" className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand-900 px-4 py-3 font-semibold text-white">Pesan Sekarang <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </nav>
      </div>
    </header>
  )
}
