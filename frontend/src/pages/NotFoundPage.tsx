import { Link } from 'react-router-dom'
import { PageHero } from '@/components/PageHero'

export function NotFoundPage() {
  return (
    <div className="bg-cream-50">
      <PageHero eyebrow="404" title="Halaman tidak ditemukan" description="Alamat yang kamu buka tidak tersedia atau sudah dipindahkan." />
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-ink-600">Periksa kembali tautan, atau kembali ke halaman utama.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/" className="inline-flex min-h-11 items-center rounded-control bg-brand-900 px-5 py-3 font-semibold text-white hover:bg-brand-800">Kembali ke beranda</Link>
          <Link to="/menu" className="inline-flex min-h-11 items-center rounded-control border border-cream-200 bg-white px-5 py-3 font-semibold text-brand-900 hover:bg-cream-100">Lihat menu</Link>
        </div>
      </div>
    </div>
  )
}
