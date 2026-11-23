import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, Minus, Plus, ShoppingBag, Check, Flame } from 'lucide-react'
import { publicApi } from '@/services/publicApi'
import { useCartStore } from '@/stores/cartStore'
import { getProductImage } from '@/lib/images'
import { PageHero } from '@/components/PageHero'

function formatIdr(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export function MenuDetailPage() {
  const { slug = '' } = useParams()
  const { data: p, isLoading, isError } = useQuery({ queryKey: ['product', slug], queryFn: () => publicApi.product(slug), enabled: !!slug })
  const [qty, setQty] = useState(1)
  const [notes, setNotes] = useState('')
  const [added, setAdded] = useState(false)
  const timer = useRef<number | null>(null)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current)
  }, [])

  if (isLoading) return <div className="min-h-screen bg-cream-50"><PageHero eyebrow="Memuat" title="Menu" description="Menyiapkan detail menu..." /><div className="mx-auto max-w-6xl px-4 py-16"><div className="h-96 animate-pulse rounded-feature bg-cream-200" /></div></div>
  if (isError || !p) {
    return (
      <div className="min-h-screen bg-cream-50">
        <PageHero eyebrow="Tidak ditemukan" title="Menu" description="Produk yang kamu cari tidak tersedia." />
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <p className="text-ink-600">Coba pilih menu lain dari daftar kami.</p>
          <Link to="/menu" className="mt-5 inline-flex items-center gap-2 rounded-control bg-brand-900 px-5 py-3 font-semibold text-white"><ChevronLeft size={16} /> Kembali ke menu</Link>
        </div>
      </div>
    )
  }

  const img = getProductImage(p.slug, p.image_url, p.id)
  function add() {
    if (!p) return
    addItem({ product_id: p.id, slug: p.slug, name: p.name, price: p.price, notes, image_url: img }, qty)
    setAdded(true)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div className="bg-cream-50">
      <div className="relative overflow-hidden bg-[radial-gradient(1100px_520px_at_10%_0%,#79543A_0%,#493323_38%,#140f0c_100%)] pb-10 pt-24 text-cream-50 md:pb-16 md:pt-28">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" aria-hidden="true" />
        <div className="mx-auto max-w-6xl px-4">
          <Link to="/menu" className="inline-flex min-h-11 items-center gap-1 text-sm text-cream-100/85 transition hover:text-cream-50"><ChevronLeft size={16} aria-hidden="true" /> Kembali ke menu</Link>
        </div>
      </div>

      <div className="mx-auto -mt-6 max-w-6xl px-4 pb-20 md:-mt-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <div className="mt-5 sm:mt-6 lg:sticky lg:top-28 lg:mt-10 lg:self-start">
            <div className="overflow-hidden rounded-feature border border-cream-200 bg-white p-2.5 shadow-[0_18px_50px_rgba(41,35,31,0.12)] sm:p-3">
              <div className="group relative aspect-[4/3] overflow-hidden rounded-[14px] bg-cream-100 sm:rounded-[16px]">
                <img
                  src={img}
                  alt={p.name}
                  className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                <div className="absolute left-3 top-3 flex flex-wrap gap-2 sm:left-4 sm:top-4">
                  {p.is_featured && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-terracotta-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                      <Flame size={12} aria-hidden="true" /> Favorit
                    </span>
                  )}
                  <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${p.is_available ? 'bg-cream-50 text-brand-900' : 'bg-ink-900/85 text-white'}`}>
                    {p.is_available ? 'Tersedia' : 'Tidak tersedia'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-feature border border-cream-200 bg-white p-6 shadow-[0_10px_40px_rgba(73,51,35,0.06)] md:p-8 lg:mt-8">
            {p.category && <p className="text-xs font-semibold uppercase tracking-[0.25em] text-terracotta-600">{p.category.name}</p>}
            <h1 className="mt-2 font-display text-4xl font-bold leading-[1.05] text-brand-900 md:text-6xl">{p.name}</h1>
            <div className="mt-5 flex flex-wrap items-end gap-3">
              <p className="font-display text-4xl font-bold text-brand-900">{formatIdr(p.price)}</p>
              <span className="mb-1 text-sm text-ink-600">/ porsi</span>
            </div>
            {p.description && <p className="mt-6 text-base leading-relaxed text-ink-600">{p.description}</p>}

            <div className="mt-8 space-y-6 border-t border-cream-200 pt-8">
              <div>
                <span className="block text-sm font-semibold text-ink-900">Jumlah</span>
                <div className="mt-3 inline-flex items-center rounded-full border border-cream-200 bg-cream-50 p-1">
                  <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="flex h-11 w-11 items-center justify-center rounded-full text-ink-600 transition hover:bg-white hover:text-brand-900" aria-label="Kurangi jumlah"><Minus size={16} aria-hidden="true" /></button>
                  <span className="w-12 text-center text-base font-bold" aria-live="polite">{qty}</span>
                  <button type="button" onClick={() => setQty(Math.min(99, qty + 1))} className="flex h-11 w-11 items-center justify-center rounded-full text-ink-600 transition hover:bg-white hover:text-brand-900" aria-label="Tambah jumlah"><Plus size={16} aria-hidden="true" /></button>
                </div>
              </div>
              <label className="block">
                <span className="text-sm font-semibold text-ink-900">Catatan (opsional)</span>
                <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Mis. pedas, tanpa bawang, ekstra sambal" className="mt-2 w-full rounded-control border border-cream-200 bg-cream-50/40 px-4 py-3 text-sm focus:border-brand-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-700/20" />
              </label>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={add} disabled={!p.is_available} className={`inline-flex flex-1 items-center justify-center gap-2 rounded-control px-6 py-4 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${added ? 'bg-success' : 'bg-brand-900 hover:bg-brand-800'}`}>
                <span aria-live="polite" className="inline-flex items-center gap-2">
                  {added ? <><Check size={18} aria-hidden="true" /> Ditambahkan ke keranjang</> : <><ShoppingBag size={18} aria-hidden="true" /> Tambah - {formatIdr(p.price * qty)}</>}
                </span>
              </button>
              <Link to="/cart" className="inline-flex min-h-11 items-center justify-center rounded-control border border-cream-200 px-6 py-4 font-semibold text-brand-900 transition hover:bg-cream-100">Lihat Keranjang</Link>
            </div>
            <p className="mt-4 text-center text-xs text-ink-600">Harga total menyesuaikan jumlah. Pembayaran dipilih saat checkout.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
