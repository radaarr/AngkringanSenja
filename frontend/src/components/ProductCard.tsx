import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Plus, ShoppingBag } from 'lucide-react'
import type { Product } from '@/types/menu'
import { getProductImage } from '@/lib/images'
import { useCartStore } from '@/stores/cartStore'

function formatIdr(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export function ProductCard({ product }: { product: Product }) {
  const img = getProductImage(product.slug, product.image_url, product.id)
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current) }, [])

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!product.is_available || added) return
    addItem({ product_id: product.id, slug: product.slug, name: product.name, price: product.price, image_url: img }, 1)
    setAdded(true)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setAdded(false), 1400)
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-feature border border-cream-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-terracotta-500/30 hover:shadow-[0_20px_44px_rgba(73,51,35,0.14)] focus-within:ring-2 focus-within:ring-brand-700 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <Link to={`/menu/${product.slug}`} className="absolute inset-0 z-[1] rounded-feature" aria-label={`Lihat detail ${product.name}`}><span className="sr-only">Lihat detail {product.name}</span></Link>

      <div className="relative aspect-[4/3] overflow-hidden bg-cream-100">
        <img src={img} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0 opacity-70 transition group-hover:opacity-90" />
        <div className="absolute left-3 top-3 z-[2] flex flex-wrap gap-2">
          {product.is_featured && <span className="rounded-full bg-terracotta-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">Favorit</span>}
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${product.is_available ? 'bg-cream-50 text-brand-900' : 'bg-ink-900 text-white'}`}>{product.is_available ? 'Tersedia' : 'Habis'}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 md:p-5">
        <h3 className="font-display text-xl font-semibold leading-snug text-ink-900 transition group-hover:text-brand-900">{product.name}</h3>
        <p className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-ink-600">{product.description || '\u00A0'}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <span className="block text-lg font-bold text-brand-900">{formatIdr(product.price)}</span>
            <span className="text-xs font-medium uppercase tracking-wider text-terracotta-600">Lihat detail</span>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!product.is_available}
            className={`relative z-[2] inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-control px-3 py-2 text-xs font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 disabled:cursor-not-allowed disabled:opacity-50 ${added ? 'bg-success text-white' : 'bg-brand-900 text-white hover:bg-brand-800'} motion-reduce:transition-none`}
            aria-label={product.is_available ? `Tambah ${product.name} ke keranjang` : `${product.name} tidak tersedia`}
          >
            <span aria-live="polite" className="inline-flex items-center gap-1.5">
              {added ? <><Check size={14} aria-hidden="true" /> Ditambah</> : <><ShoppingBag size={14} aria-hidden="true" /> <span className="hidden sm:inline">Keranjang</span><Plus size={14} aria-hidden="true" className="sm:hidden" /></>}
            </span>
          </button>
        </div>
      </div>
    </article>
  )
}
