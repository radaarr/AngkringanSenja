import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ReceiptText } from 'lucide-react'
import { orderApi } from '@/services/orderApi'
import { useCartStore } from '@/stores/cartStore'
import { PageHero } from '@/components/PageHero'
import { getProductImage } from '@/lib/images'

function formatIdr(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export function CartPage() {
  const [sp] = useSearchParams()
  const tableParam = sp.get('table')
  const { items, updateQty, updateNotes, removeItem, subtotal, tableName, setTable } = useCartStore()
  const [tableMsg, setTableMsg] = useState('')

  useEffect(() => {
    if (!tableParam) return
    orderApi.resolveTable(tableParam)
      .then(t => { setTable(t.qr_token, t.name); setTableMsg(`Meja: ${t.name}`) })
      .catch(() => setTableMsg('Token meja tidak valid.'))
  }, [tableParam, setTable])

  const count = useMemo(() => items.reduce((n, i) => n + i.quantity, 0), [items])

  if (!items.length) {
    return (
      <div className="bg-cream-50">
        <PageHero eyebrow="Pesanan Anda" title="Keranjang" description="Belum ada menu yang dipilih. Jelajahi menu hangat kami dan mulai pesan." />
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_20%,#F5EBD9,#EADCC5)] shadow-inner"><ShoppingBag size={30} className="text-brand-900" aria-hidden="true" /></div>
          <h2 className="mt-6 font-display text-3xl font-bold text-brand-900">Keranjang masih kosong</h2>
          <p className="mt-2 text-ink-600">Pilih nasi kucing, sate-satean, atau minuman hangat favoritmu.</p>
          <Link to="/menu" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-control bg-brand-900 px-6 py-3 font-semibold text-white transition hover:bg-brand-800">Lihat Menu <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-cream-50">
      <PageHero
        eyebrow="Pesanan Anda"
        title="Keranjang"
        description={`${count} item siap dipesan. Periksa catatan dan jumlah sebelum checkout.`}
        right={(tableMsg || tableName) ? <div className="inline-flex rounded-full border border-cream-50/20 bg-white/10 px-4 py-2 text-sm font-medium text-cream-50">{tableMsg || `Meja: ${tableName}`}</div> : null}
      />

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[1.4fr_0.9fr] lg:py-14">
        <div className="space-y-4">
          {items.map((i, idx) => (
            <div key={i.product_id} className="group flex flex-col gap-4 rounded-feature border border-cream-200 bg-white p-4 shadow-[0_6px_20px_rgba(73,51,35,0.04)] transition hover:shadow-[0_14px_34px_rgba(73,51,35,0.1)] sm:flex-row sm:items-center">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-control bg-cream-100">
                <img src={getProductImage(i.slug, i.image_url, i.product_id)} alt={i.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <span className="absolute left-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-900/90 text-xs font-semibold text-white">{idx + 1}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-display text-xl font-semibold text-ink-900">{i.name}</div>
                    <div className="text-sm text-ink-600">{formatIdr(i.price)} / item</div>
                  </div>
                  <button type="button" onClick={() => removeItem(i.product_id)} className="inline-flex min-h-11 items-center gap-1 rounded-control px-2 py-1 text-xs font-medium text-danger hover:bg-danger/10" aria-label={`Hapus ${i.name}`}><Trash2 size={13} aria-hidden="true" /> Hapus</button>
                </div>
                <input value={i.notes || ''} onChange={(e) => updateNotes(i.product_id, e.target.value)} placeholder="Catatan (opsional), mis. pedas / tanpa bawang" aria-label={`Catatan untuk ${i.name}`} className="mt-3 w-full rounded-control border border-cream-200 bg-cream-50/40 px-3 py-2 text-sm focus:border-brand-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-700/20" />
              </div>
              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
                <div className="inline-flex items-center rounded-full border border-cream-200 bg-white p-1">
                  <button type="button" onClick={() => updateQty(i.product_id, i.quantity - 1)} className="flex h-11 w-11 items-center justify-center rounded-full text-ink-600 transition hover:bg-cream-100 hover:text-brand-900" aria-label={`Kurangi jumlah ${i.name}`}><Minus size={14} aria-hidden="true" /></button>
                  <span className="w-9 text-center text-sm font-semibold" aria-live="polite">{i.quantity}</span>
                  <button type="button" onClick={() => updateQty(i.product_id, i.quantity + 1)} className="flex h-11 w-11 items-center justify-center rounded-full text-ink-600 transition hover:bg-cream-100 hover:text-brand-900" aria-label={`Tambah jumlah ${i.name}`}><Plus size={14} aria-hidden="true" /></button>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-brand-900">{formatIdr(i.price * i.quantity)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit space-y-4 lg:sticky lg:top-28">
          <div className="overflow-hidden rounded-feature border border-cream-200 bg-white shadow-[0_10px_30px_rgba(73,51,35,0.08)]">
            <div className="flex items-center gap-2 border-b border-cream-200 bg-[radial-gradient(500px_200px_at_20%_0%,#79543A,#493323)] px-5 py-4 text-cream-50">
              <ReceiptText size={18} className="text-terracotta-100" aria-hidden="true" />
              <h2 className="font-display text-xl font-semibold">Ringkasan</h2>
            </div>
            <div className="p-5">
              <ul className="space-y-2 text-sm">
                {items.map(i => (
                  <li key={i.product_id} className="flex justify-between gap-4 text-ink-600"><span className="truncate"><span className="font-medium text-ink-900">{i.quantity}x</span> {i.name}</span><span className="shrink-0 font-medium text-ink-900">{formatIdr(i.price * i.quantity)}</span></li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between border-t border-cream-200 pt-4">
                <span className="font-medium text-ink-600">Subtotal</span>
                <span className="text-2xl font-bold text-brand-900">{formatIdr(subtotal())}</span>
              </div>
              <p className="mt-1 text-xs text-ink-600">Harga final dihitung saat checkout. Pembayaran dipilih pada langkah berikutnya.</p>
              <div className="mt-5 space-y-3">
                <Link to="/checkout" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-control bg-terracotta-600 px-6 py-3 font-semibold text-white transition hover:bg-terracotta-700">Lanjut Checkout <ArrowRight size={16} aria-hidden="true" /></Link>
                <Link to="/menu" className="inline-flex min-h-11 w-full items-center justify-center rounded-control border border-cream-200 px-5 py-3 font-semibold text-brand-900 hover:bg-cream-100">Tambah Menu Lain</Link>
              </div>
            </div>
          </div>
          <div className="rounded-card border border-cream-200 bg-cream-100/60 p-4 text-sm text-ink-600">Scan QR di meja untuk menghubungkan pesanan dine-in secara otomatis.</div>
        </aside>
      </div>
    </div>
  )
}
