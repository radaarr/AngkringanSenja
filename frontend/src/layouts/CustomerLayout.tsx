import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { useTableFromUrl } from '@/hooks/useTableFromUrl'

export function CustomerLayout() {
  useTableFromUrl()
  return (
    <div className="min-h-screen bg-cream-50 text-ink-900">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-control focus:bg-brand-900 focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-cream-50">
        Lewati ke konten
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="scroll-mt-24"><Outlet /></main>
      <Footer />
    </div>
  )
}
