import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { publicApi } from '@/services/publicApi'
import { ProductCard } from '@/components/ProductCard'
import { ErrorState } from '@/components/QueryState'
import { getProductImage } from '@/lib/images'

export function MenuPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('')
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: publicApi.categories })
  const { data: products = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['products', { category, search }],
    queryFn: () => publicApi.products({ category: category || undefined, search: search || undefined }),
  })

  const heroProduct = useMemo(() => products.find(p => p.is_featured) || products[0], [products])
  const listProducts = useMemo(() => (heroProduct && !search && !category ? products.filter(p => p.id !== heroProduct.id) : products), [products, heroProduct, search, category])

  return (
    <div className="bg-cream-50">
      <section className="relative overflow-hidden bg-[radial-gradient(1000px_500px_at_10%_0%,#79543A_0%,#493323_40%,#1b1411_100%)] pb-16 pt-28 text-cream-50 md:pb-24 md:pt-32">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-terracotta-500/20 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl items-end gap-10 px-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-terracotta-100">Angkringan Senja</p>
            <h1 className="mt-3 font-display text-5xl font-bold leading-[1.05] md:text-7xl">Menu Kami</h1>
            <p className="mt-5 max-w-xl text-cream-100/90">Pilih menu favoritmu - hangat, nikmat, dan siap menemani malammu. Pesan dari meja atau bawa pulang.</p>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-cream-100/90">
              <div><span className="block font-display text-2xl font-bold text-cream-50">{isLoading ? '...' : products.length}</span>{search || category ? 'Hasil filter' : 'Menu tersedia'}</div>
              <div><span className="block font-display text-2xl font-bold text-cream-50">{categories.length || '...'}</span>Kategori</div>
              <div><span className="block font-display text-2xl font-bold text-cream-50">QR</span>Pesan di meja</div>
            </div>
          </div>
          {heroProduct && !search && !category && (
            <Link to={`/menu/${heroProduct.slug}`} className="group relative block overflow-hidden rounded-feature border border-cream-50/10 bg-white/5">
              <img src={getProductImage(heroProduct.slug, heroProduct.image_url, heroProduct.id)} alt={heroProduct.name} className="h-64 w-full object-cover transition duration-700 group-hover:scale-105 motion-reduce:transition-none md:h-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="inline-flex rounded-full bg-terracotta-600 px-2.5 py-1 text-xs font-semibold text-white">Rekomendasi</span>
                <div className="mt-2 font-display text-2xl font-bold text-cream-50">{heroProduct.name}</div>
                <div className="text-sm text-cream-100/90">Harga Rp {Number(heroProduct.price).toLocaleString('id-ID')}</div>
              </div>
            </Link>
          )}
        </div>
      </section>

      <section className="sticky top-[76px] z-20 border-b border-cream-200 bg-cream-50 md:top-[84px]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
          <div className="relative max-w-sm flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-600" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari menu..."
              aria-label="Cari menu"
              className="w-full rounded-control border border-cream-200 bg-white py-2.5 pl-9 pr-12 text-sm focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-700/20"
            />
            {search && <button type="button" onClick={() => setSearch('')} aria-label="Hapus pencarian" className="absolute right-1 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-control text-ink-600 hover:bg-cream-100"><X size={14} aria-hidden="true" /></button>}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Kategori">
            <button type="button" onClick={() => setCategory('')} aria-pressed={category === ''} className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${category === '' ? 'bg-brand-900 text-white shadow-sm' : 'bg-white text-ink-900 ring-1 ring-cream-200 hover:bg-cream-100'}`}>Semua</button>
            {categories.map((c) => (
              <button key={c.id} type="button" onClick={() => setCategory(c.slug)} aria-pressed={category === c.slug} className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${category === c.slug ? 'bg-brand-900 text-white shadow-sm' : 'bg-white text-ink-900 ring-1 ring-cream-200 hover:bg-cream-100'}`}>{c.name}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        {isLoading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <p role="status" className="sr-only">Memuat menu...</p>
            {[1,2,3,4,5,6].map(i => <div key={i} className="overflow-hidden rounded-card border border-cream-200 bg-white"><div className="aspect-[4/3] animate-pulse bg-cream-200" /><div className="space-y-2 p-4"><div className="h-4 w-2/3 animate-pulse rounded bg-cream-200" /><div className="h-3 w-full animate-pulse rounded bg-cream-100" /></div></div>)}
          </div>
        )}
        {isError && <ErrorState message="Menu gagal dimuat." onRetry={() => void refetch()} />}
        {!isLoading && !isError && (
          products.length ? (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-ink-600">Menampilkan <span className="font-semibold text-brand-900">{products.length}</span> menu{search ? ` untuk "${search}"` : ''}</p>
                {(search || category) && <button type="button" onClick={() => { setSearch(''); setCategory('') }} className="inline-flex min-h-11 items-center text-sm font-medium text-terracotta-700 hover:underline">Reset filter</button>}
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {listProducts.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </>
          ) : (
            <div className="rounded-feature border border-cream-200 bg-white p-12 text-center">
              <h2 className="font-display text-2xl font-bold text-brand-900">Menu tidak ditemukan</h2>
              <p className="mt-2 text-ink-600">Coba kata kunci atau kategori lain.</p>
              <button type="button" onClick={() => { setSearch(''); setCategory('') }} className="mt-5 inline-flex min-h-11 items-center rounded-control bg-brand-900 px-5 py-2.5 font-semibold text-white hover:bg-brand-800">Lihat semua menu</button>
            </div>
          )
        )}
      </section>
    </div>
  )
}
