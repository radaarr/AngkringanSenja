import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, CheckCircle2, MapPin, ShoppingBag, User, StickyNote, CreditCard, Banknote, QrCode, Tag, X } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { orderApi } from '@/services/orderApi'
import { pricingApi, type PricingPreview } from '@/services/pricingApi'
import { PageHero } from '@/components/PageHero'
import { getProductImage } from '@/lib/images'

function formatIdr(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export function CheckoutPage() {
  const { items, subtotal, tableToken, tableName, clear, setTable } = useCartStore()
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY'>(tableToken ? 'DINE_IN' : 'TAKEAWAY')
  const [paymentMethod, setPaymentMethod] = useState<'QRIS_SIMULATED' | 'CASH'>(tableToken ? 'QRIS_SIMULATED' : 'CASH')
  const [customerName, setCustomerName] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [promoInput, setPromoInput] = useState('')
  const [appliedCode, setAppliedCode] = useState<string | null>(null)
  const [pricing, setPricing] = useState<PricingPreview | null>(null)
  const [pricingLoading, setPricingLoading] = useState(true)
  const [pricingError, setPricingError] = useState('')
  const [promoError, setPromoError] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const previewRequest = useRef(0)
  const nav = useNavigate()

  async function loadPreview(code: string | null) {
    if (!items.length) {
      setPricingLoading(false)
      return
    }

    const request = ++previewRequest.current
    setPricingLoading(true)
    setPricingError('')

    try {
      const res = await pricingApi.preview({
        items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
        promo_code: code,
      })
      if (request === previewRequest.current) setPricing(res)
    } catch (err: any) {
      if (request === previewRequest.current) {
        setPricing(null)
        setPricingError(err?.response?.data?.message || 'Rincian harga gagal dimuat.')
      }
    } finally {
      if (request === previewRequest.current) setPricingLoading(false)
    }
  }

  useEffect(() => {
    void loadPreview(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function applyPromo() {
    const code = promoInput.trim().toUpperCase()
    if (!code) { setPromoError('Masukkan kode promo.'); return }

    const request = ++previewRequest.current
    setPromoLoading(true)
    setPricingLoading(true)
    setPromoError('')
    setPricingError('')

    try {
      const res = await pricingApi.preview({
        items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
        promo_code: code,
      })
      if (request !== previewRequest.current) return
      if (!res.promotion) {
        setPromoError('Kode promo tidak ditemukan.')
        setAppliedCode(null)
        void loadPreview(null)
        return
      }
      setPricing(res)
      setAppliedCode(res.promotion.code)
      setPromoInput(res.promotion.code)
    } catch (err: any) {
      if (request !== previewRequest.current) return
      setPromoError(err?.response?.data?.errors?.promo_code?.[0] || err?.response?.data?.message || 'Kode promo tidak valid.')
      setAppliedCode(null)
      void loadPreview(null)
    } finally {
      setPromoLoading(false)
      if (request === previewRequest.current) setPricingLoading(false)
    }
  }

  function clearPromo() {
    setAppliedCode(null)
    setPromoInput('')
    setPromoError('')
    setPricing(null)
    void loadPreview(null)
  }

  if (!items.length) {
    return (
      <div className="min-h-screen bg-cream-50">
        <PageHero eyebrow="Langkah Terakhir" title="Checkout" description="Keranjangmu masih kosong." />
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <Link to="/menu" className="inline-flex min-h-11 items-center gap-2 rounded-control bg-brand-900 px-5 py-3 font-semibold text-white"><ChevronLeft size={16} aria-hidden="true" /> Ke menu</Link>
        </div>
      </div>
    )
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (orderType === 'DINE_IN' && !tableToken) { setError('Pesanan dine-in memerlukan token meja (scan QR di meja).'); return }
    if (pricingLoading || !pricing) { setError('Rincian harga belum siap. Tunggu sebentar atau coba lagi.'); return }
    setLoading(true)
    try {
      const res = await orderApi.create({
        order_type: orderType,
        table_token: orderType === 'DINE_IN' ? tableToken : null,
        customer_name: customerName || null,
        notes: notes || null,
        payment_method: paymentMethod === 'QRIS_SIMULATED' ? 'QRIS_SIMULATED' : null,
        promo_code: appliedCode,
        idempotency_key: paymentMethod === 'QRIS_SIMULATED' ? `qris-${Date.now()}-${Math.random().toString(36).slice(2)}` : null,
        items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity, notes: i.notes })),
      })
      clear()
      setTable(null, null)
      nav(`/order/${res.tracking_token}`)
    } catch (err: any) {
      setError(err?.response?.data?.errors?.promo_code?.[0] || err?.response?.data?.message || err?.response?.data?.errors?.items?.[0] || err?.response?.data?.errors?.table_token?.[0] || 'Gagal membuat pesanan.')
    } finally { setLoading(false) }
  }

  return (
    <div className="bg-cream-50">
      <PageHero eyebrow="Langkah Terakhir" title="Checkout" description="Bayar langsung via QRIS (simulasi) atau tunai di kasir. Pesanan langsung tercatat." />

      <div className="mx-auto max-w-6xl px-4 py-10 lg:py-14">
        <Link to="/cart" className="mb-6 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-ink-600 transition hover:text-brand-900"><ChevronLeft size={16} aria-hidden="true" /> Kembali ke keranjang</Link>
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <div className="overflow-hidden rounded-feature border border-cream-200 bg-white shadow-[0_8px_30px_rgba(73,51,35,0.05)]">
              <div className="flex items-center gap-2 border-b border-cream-200 bg-cream-50 px-5 py-4"><MapPin size={18} className="text-terracotta-700" aria-hidden="true" /><h2 id="order-type-title" className="font-display text-xl font-semibold text-brand-900">Tipe Pesanan</h2></div>
              <div className="p-5">
                <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-labelledby="order-type-title">
                  <label className={`flex cursor-pointer items-start gap-3 rounded-control border-2 p-4 transition ${orderType === 'DINE_IN' ? 'border-brand-900 bg-cream-50' : 'border-cream-200 hover:border-cream-300 hover:bg-cream-50/60'}`}>
                    <input type="radio" checked={orderType === 'DINE_IN'} onChange={() => setOrderType('DINE_IN')} className="mt-1 accent-brand-900" />
                    <span><span className="block font-semibold text-brand-900">Makan di tempat</span><span className="mt-0.5 block text-sm text-ink-600">Dari meja, scan QR meja</span></span>
                  </label>
                  <label className={`flex cursor-pointer items-start gap-3 rounded-control border-2 p-4 transition ${orderType === 'TAKEAWAY' ? 'border-brand-900 bg-cream-50' : 'border-cream-200 hover:border-cream-300 hover:bg-cream-50/60'}`}>
                    <input type="radio" checked={orderType === 'TAKEAWAY'} onChange={() => setOrderType('TAKEAWAY')} className="mt-1 accent-brand-900" />
                    <span><span className="block font-semibold text-brand-900">Bawa pulang</span><span className="mt-0.5 block text-sm text-ink-600">Ambil pesanan di kasir</span></span>
                  </label>
                </div>
                {orderType === 'DINE_IN' && (
                  <div className={`mt-4 rounded-control px-4 py-3 text-sm font-medium ${tableName ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning-700'}`}>
                    {tableName ? `Meja terdeteksi: ${tableName}` : 'Scan QR di meja untuk memesan dine-in.'}
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-feature border border-cream-200 bg-white shadow-[0_8px_30px_rgba(73,51,35,0.05)]">
              <div className="flex items-center gap-2 border-b border-cream-200 bg-cream-50 px-5 py-4"><CreditCard size={18} className="text-terracotta-700" aria-hidden="true" /><h2 id="payment-method-title" className="font-display text-xl font-semibold text-brand-900">Metode Pembayaran</h2></div>
              <div className="space-y-3 p-5" role="radiogroup" aria-labelledby="payment-method-title">
                <label className={`flex cursor-pointer items-start gap-3 rounded-control border-2 p-4 transition ${paymentMethod === 'QRIS_SIMULATED' ? 'border-brand-900 bg-cream-50' : 'border-cream-200 hover:border-cream-300'}`}>
                  <input type="radio" checked={paymentMethod === 'QRIS_SIMULATED'} onChange={() => setPaymentMethod('QRIS_SIMULATED')} className="mt-1 accent-brand-900" />
                  <span className="flex-1"><span className="flex items-center gap-2 font-semibold text-brand-900"><QrCode size={16} aria-hidden="true" /> QRIS (Simulasi)</span><span className="mt-0.5 block text-sm text-ink-600">Bayar langsung, pesanan langsung tercatat dan masuk dapur.</span></span>
                </label>
                {paymentMethod === 'QRIS_SIMULATED' && (
                  <div className="rounded-control border border-cream-200 bg-cream-50 px-4 py-3 text-sm text-ink-700">
                    <div className="font-medium text-brand-900">Simulasi demo (bukan verifikasi bank)</div>
                    <div className="mt-1 text-ink-600">Klik "Buat Pesanan" untuk mengonfirmasi pembayaran simulasi dan mencatat pesanan sebagai lunas.</div>
                  </div>
                )}
                <label className={`flex cursor-pointer items-start gap-3 rounded-control border-2 p-4 transition ${paymentMethod === 'CASH' ? 'border-brand-900 bg-cream-50' : 'border-cream-200 hover:border-cream-300'}`}>
                  <input type="radio" checked={paymentMethod === 'CASH'} onChange={() => setPaymentMethod('CASH')} className="mt-1 accent-brand-900" />
                  <span><span className="flex items-center gap-2 font-semibold text-brand-900"><Banknote size={16} aria-hidden="true" /> Tunai (bayar di kasir)</span><span className="mt-0.5 block text-sm text-ink-600">Pesanan dibuat dulu, pembayaran dan konfirmasi dilakukan di kasir.</span></span>
                </label>
              </div>
            </div>

            <div className="overflow-hidden rounded-feature border border-cream-200 bg-white shadow-[0_8px_30px_rgba(73,51,35,0.05)]">
              <div className="flex items-center gap-2 border-b border-cream-200 bg-cream-50 px-5 py-4"><User size={18} className="text-terracotta-700" aria-hidden="true" /><h2 className="font-display text-xl font-semibold text-brand-900">Detail Pemesan</h2></div>
              <div className="space-y-4 p-5">
                <label className="block text-sm font-medium text-ink-900">Nama (opsional)
                  <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nama panggilan" className="mt-1.5 w-full rounded-control border border-cream-200 bg-cream-50/30 px-4 py-3 focus:border-brand-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-700/20" />
                </label>
                <label className="block text-sm font-medium text-ink-900"><span className="inline-flex items-center gap-1"><StickyNote size={14} aria-hidden="true" /> Catatan pesanan</span>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Catatan untuk dapur/kasir (opsional)" rows={3} className="mt-1.5 w-full rounded-control border border-cream-200 bg-cream-50/30 px-4 py-3 focus:border-brand-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-700/20" />
                </label>
              </div>
            </div>
          </div>

          <aside className="h-fit lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-feature border border-cream-200 bg-white shadow-[0_14px_40px_rgba(73,51,35,0.1)]">
              <div className="flex items-center gap-2 bg-[radial-gradient(600px_220px_at_20%_0%,#79543A,#493323)] px-5 py-4 text-cream-50"><ShoppingBag size={18} className="text-terracotta-100" aria-hidden="true" /><h2 className="font-display text-xl font-semibold">Ringkasan Pesanan</h2></div>
              <div className="p-5">
                <ul className="space-y-3">
                  {items.map(i => (
                    <li key={i.product_id} className="flex items-center gap-3">
                      <img src={getProductImage(i.slug, i.image_url, i.product_id)} alt="" className="h-12 w-12 rounded-control object-cover" />
                      <span className="min-w-0 flex-1 text-sm"><span className="block truncate font-medium text-ink-900">{i.name}</span><span className="text-ink-600">{i.quantity} x {formatIdr(i.price)}</span></span>
                      <span className="shrink-0 text-sm font-semibold text-brand-900">{formatIdr(i.price * i.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 space-y-2 border-t border-cream-200 pt-4 text-sm">
                  {!appliedCode ? (
                    <div>
                      <label htmlFor="promo-code" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-600"><Tag size={13} aria-hidden="true" /> Kode promo</label>
                      <div className="mt-1.5 flex gap-2">
                        <input
                          id="promo-code"
                          value={promoInput}
                          onChange={e => setPromoInput(e.target.value)}
                          placeholder="Contoh: HEMAT10"
                          aria-invalid={Boolean(promoError)}
                          aria-describedby={promoError ? 'promo-error' : undefined}
                          className="w-full rounded-control border border-cream-200 bg-cream-50/30 px-3 py-2.5 text-sm uppercase focus:border-brand-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-700/20"
                        />
                        <button type="button" onClick={applyPromo} disabled={promoLoading} className="inline-flex min-h-11 shrink-0 items-center rounded-control bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:opacity-50">
                          {promoLoading ? '...' : 'Terapkan'}
                        </button>
                      </div>
                      {promoError && <p id="promo-error" role="alert" className="mt-1.5 text-xs text-danger">{promoError}</p>}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-control bg-success/10 px-3 py-2">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success"><Tag size={13} aria-hidden="true" /> {appliedCode} diterapkan</span>
                      <button type="button" onClick={clearPromo} className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-danger hover:underline"><X size={12} aria-hidden="true" /> Hapus</button>
                    </div>
                  )}
                  <div className="flex justify-between text-ink-600"><span>Subtotal</span><span>{formatIdr(subtotal())}</span></div>
                  {pricing && pricing.discount_amount > 0 && <div className="flex justify-between text-success"><span>Diskon</span><span>-{formatIdr(pricing.discount_amount)}</span></div>}
                  {pricing && pricing.service_charge_amount > 0 && <div className="flex justify-between text-ink-600"><span>Biaya layanan</span><span>{formatIdr(pricing.service_charge_amount)}</span></div>}
                  {pricing && pricing.tax_amount > 0 && <div className="flex justify-between text-ink-600"><span>Pajak ({pricing.tax_rate}%)</span><span>{formatIdr(pricing.tax_amount)}</span></div>}
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-cream-200 pt-3">
                  <span className="font-medium text-ink-600">Total</span>
                  <span aria-live="polite" className="text-right">
                    {pricingLoading ? <span className="text-sm font-medium text-ink-600">Menghitung...</span> : pricing ? <span className="font-display text-3xl font-bold text-brand-900">{formatIdr(pricing.total)}</span> : <span className="text-sm font-medium text-danger">Belum tersedia</span>}
                  </span>
                </div>
                {pricingError && (
                  <div role="alert" className="mt-3 rounded-control border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
                    <p>{pricingError}</p>
                    <button type="button" onClick={() => void loadPreview(appliedCode)} className="mt-2 inline-flex min-h-11 items-center font-semibold underline">
                      Coba hitung ulang
                    </button>
                  </div>
                )}
                {error && <p className="mt-4 rounded-control border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">{error}</p>}
                <button type="submit" disabled={loading || pricingLoading || !pricing} aria-busy={loading || pricingLoading} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-control bg-terracotta-600 px-5 py-4 text-base font-semibold text-white shadow-[0_10px_24px_rgba(169,93,54,0.3)] transition hover:-translate-y-0.5 hover:bg-terracotta-700 disabled:translate-y-0 disabled:opacity-50">
                  <CheckCircle2 size={18} aria-hidden="true" /> {pricingLoading ? 'Menghitung...' : loading ? 'Memproses...' : paymentMethod === 'QRIS_SIMULATED' ? 'Bayar & Buat Pesanan' : 'Buat Pesanan'}
                </button>
                <p className="mt-3 text-center text-xs text-ink-600">{paymentMethod === 'QRIS_SIMULATED' ? 'Pembayaran QRIS simulasi: pesanan langsung lunas & tercatat.' : 'Pesanan dibuat, bayar tunai di kasir. Kamu akan mendapat tautan pelacakan.'}</p>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  )
}
