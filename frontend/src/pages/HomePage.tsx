import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, Flame, UtensilsCrossed, QrCode, Timer } from 'lucide-react'
import { HeroCinematic } from '@/components/HeroCinematic'
import { Section } from '@/components/Section'
import { ProductCard } from '@/components/ProductCard'
import { Marquee } from '@/components/Marquee'
import { ErrorState } from '@/components/QueryState'
import { publicApi } from '@/services/publicApi'
import { useInView } from '@/hooks/useInView'
import type { Product } from '@/types/menu'

function FeaturedCard({ product, index }: { product: Product; index: number }) {
  const { ref, inView } = useInView<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={`h-full transition-all duration-500 ease-out motion-reduce:transition-none motion-reduce:transform-none ${inView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
      style={{ transitionDelay: inView ? `${index * 70}ms` : '0ms' }}
    >
      <ProductCard product={product} />
    </div>
  )
}

export function HomePage() {
  const { data: featured = [], isLoading, isError: featuredError, refetch: refetchFeatured } = useQuery({
    queryKey: ['products', { featured: true }],
    queryFn: () => publicApi.products({ featured: true }),
  })
  const { data: all = [], isLoading: allLoading, isError: allError, refetch: refetchAll } = useQuery({
    queryKey: ['products', 'all-home'],
    queryFn: () => publicApi.products(),
  })
  const menuError = !featured.length && featuredError && allError

  const showcase = useMemo(() => (featured.length ? featured : all).slice(0, 6), [featured, all])
  const categories = useMemo(() => {
    const map = new Map<string, string>()
    showcase.forEach((p) => { if (p.category) map.set(p.category.slug, p.category.name) })
    return Array.from(map, ([slug, name]) => ({ slug, name }))
  }, [showcase])
  const [filter, setFilter] = useState<string>('all')
  const filtered = useMemo(() => filter === 'all' ? showcase : showcase.filter((p) => p.category?.slug === filter), [showcase, filter])

  return (
    <>
      <HeroCinematic />

      <Section id="unggulan" className="relative overflow-hidden bg-cream-50 py-20 md:py-28">
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-terracotta-500/10 blur-3xl" aria-hidden="true" />
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h2 className="font-display text-4xl font-bold text-brand-900 md:text-6xl">Menu Unggulan</h2>
            <p className="mt-3 max-w-xl text-ink-600">Favorit pelanggan yang selalu menemani hangatnya malam. Siap dipesan dari meja atau dibawa pulang.</p>
          </div>
          <Link to="/menu" className="group inline-flex min-h-11 items-center gap-2 rounded-control border border-cream-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-900 transition hover:border-brand-900 hover:bg-brand-900 hover:text-white">
            Lihat semua menu <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {!isLoading && categories.length > 1 && (
          <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter kategori unggulan">
            <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')} className={`inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-medium transition ${filter === 'all' ? 'bg-brand-900 text-cream-50 shadow-sm' : 'border border-cream-200 bg-white text-ink-700 hover:border-brand-900/30 hover:text-brand-900'}`}>Semua</button>
            {categories.map((c) => (
              <button key={c.slug} type="button" aria-pressed={filter === c.slug} onClick={() => setFilter(c.slug)} className={`inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-medium transition ${filter === c.slug ? 'bg-brand-900 text-cream-50 shadow-sm' : 'border border-cream-200 bg-white text-ink-700 hover:border-brand-900/30 hover:text-brand-900'}`}>{c.name}</button>
            ))}
          </div>
        )}

        {menuError ? (
          <div className="mt-10">
            <ErrorState message="Menu unggulan gagal dimuat." onRetry={() => { void refetchFeatured(); void refetchAll() }} />
          </div>
        ) : isLoading || allLoading ? (
          <div className="mt-10">
            <p role="status" className="sr-only">Memuat menu unggulan...</p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-feature bg-cream-200" />)}</div>
          </div>
        ) : filtered.length ? (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {filtered.map((p, i) => (
              <FeaturedCard key={p.id} product={p} index={i} />
            ))}
          </div>
        ) : showcase.length ? (
          <div className="mt-10 rounded-feature border border-cream-200 bg-white p-10 text-center text-ink-600">Belum ada menu di kategori ini. <button type="button" onClick={() => setFilter('all')} className="inline-flex min-h-11 items-center font-semibold text-brand-900 underline">Lihat semua unggulan</button>.</div>
        ) : (
          <div className="mt-10 rounded-feature border border-cream-200 bg-white p-10 text-center text-ink-600">Menu unggulan segera hadir. <Link to="/menu" className="inline-flex min-h-11 items-center font-semibold text-brand-900 underline">Lihat semua menu</Link>.</div>
        )}
      </Section>

      <div className="bg-brand-900 text-cream-50">
        <Marquee className="border-cream-50/10" items={['Nasi Kucing', 'Sate Usus', 'Wedang Jahe', 'Nasi Bakar', 'Sate Telur Puyuh', 'Teh Hangat']} />
      </div>

      <Section className="relative bg-cream-100 py-20 md:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-terracotta-700">Cerita Kami</p>
            <h2 className="mt-3 font-display text-4xl font-bold leading-tight text-brand-900 md:text-6xl">Rasa Tradisi,<br />Kehangatan Setiap Malam</h2>
            <p className="mt-5 max-w-xl leading-relaxed text-ink-600">Angkringan Senja hadir untuk menjaga cita rasa khas angkringan - nasi kucing hangat, sate-satean, dan wedang yang menemani obrolan panjang. Kini pengalaman itu semakin mudah dengan pemesanan digital langsung dari meja.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/menu" className="inline-flex min-h-11 items-center gap-2 rounded-control bg-brand-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-800">Jelajahi Menu <ArrowRight size={16} aria-hidden="true" /></Link>
              <a href="#cara-pesan" className="inline-flex min-h-11 items-center gap-2 rounded-control border border-brand-900/20 px-6 py-3 text-sm font-semibold text-brand-900 hover:bg-white">Cara Pesan</a>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-cream-200 pt-8">
              {[{v: all.length ? String(all.length) : '-',l:'Menu Tersedia'},{v:'QR',l:'Pesan Meja'},{v:'Lacak',l:'Status Pesanan'}].map(s => (
                <div key={s.l}><div className="font-display text-3xl font-bold text-brand-900">{s.v}</div><div className="text-sm text-ink-600">{s.l}</div></div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Flame, title: 'Hangat & Autentik', desc: 'Rasa tradisional yang diracik setiap hari.' },
              { icon: UtensilsCrossed, title: 'Menu Variatif', desc: 'Nasi, sate-satean, hingga minuman hangat.' },
              { icon: QrCode, title: 'Pesan via QR', desc: 'Scan QR di meja, pesan tanpa antre.' },
              { icon: Timer, title: 'Cepat & Mudah', desc: 'Pantau status pesanan dari halaman pelacakan.' },
            ].map((f) => (
              <div key={f.title} className="group rounded-card border border-cream-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(73,51,35,0.1)] motion-reduce:hover:translate-y-0">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-control bg-terracotta-500/10 text-terracotta-700"><f.icon size={20} aria-hidden="true" /></div>
                <h3 className="mt-3 font-semibold text-brand-900">{f.title}</h3>
                <p className="mt-1 text-sm text-ink-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section id="cara-pesan" className="bg-cream-50 py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-terracotta-700">Mudah & Cepat</p>
          <h2 className="mt-2 font-display text-4xl font-bold text-brand-900 md:text-6xl">Cara Memesan</h2>
          <p className="mt-4 text-ink-600">Tiga langkah sederhana untuk menikmati sajian hangatmu.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            { step: '01', title: 'Pilih Menu', desc: 'Jelajahi menu dan tambahkan favoritmu ke keranjang.' },
            { step: '02', title: 'Scan & Checkout', desc: 'Scan QR di meja (dine-in) atau pilih bawa pulang, lalu konfirmasi pesanan.' },
            { step: '03', title: 'Nikmati', desc: 'Pantau status pesanan dan nikmati sajian hangatmu.' },
          ].map((s, i) => (
            <div key={s.step} className={`relative overflow-hidden rounded-feature border border-cream-200 p-6 ${i === 1 ? 'bg-brand-900 text-cream-50 md:-translate-y-3' : 'bg-white'}`}>
              <div className={`font-display text-5xl font-bold ${i === 1 ? 'text-cream-50/15' : 'text-terracotta-500/20'}`} aria-hidden="true">{s.step}</div>
              <h3 className={`mt-2 text-lg font-semibold ${i === 1 ? 'text-cream-50' : 'text-brand-900'}`}>{s.title}</h3>
              <p className={`mt-2 text-sm leading-relaxed ${i === 1 ? 'text-cream-100/90' : 'text-ink-600'}`}>{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <section className="relative overflow-hidden bg-[radial-gradient(900px_400px_at_80%_0%,#79543A_0%,#493323_40%,#1b1411_100%)] py-20 text-cream-50 md:py-28">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-terracotta-100">Angkringan Senja</p>
          <h2 className="mt-3 font-display text-4xl font-bold md:text-6xl">Siap Menemani Malam Ini?</h2>
          <p className="mx-auto mt-4 max-w-xl text-cream-100/85">Pesan sekarang dan rasakan hangatnya kebersamaan di Angkringan Senja.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/menu" className="inline-flex min-h-11 items-center gap-2 rounded-control bg-terracotta-600 px-7 py-3 font-semibold text-white transition hover:bg-terracotta-700">Pesan Sekarang <ArrowRight size={16} aria-hidden="true" /></Link>
            <Link to="/menu" className="inline-flex min-h-11 items-center rounded-control border border-cream-50/30 px-7 py-3 font-semibold text-cream-50 hover:bg-cream-50/10">Lihat Menu</Link>
          </div>
        </div>
      </section>
    </>
  )
}
