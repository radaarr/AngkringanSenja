import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { posApi, type PosOrderPayload } from '@/services/posApi'
import { pricingApi, type PricingPreview } from '@/services/pricingApi'
import { ErrorState } from '@/components/QueryState'
import type { Order, Payment, Product } from '@/types/menu'

function formatIdr(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

type CartLine = { product: Product; quantity: number; notes: string }

export function PosPage() {
  const qc = useQueryClient()
  const { data: products = [], isLoading, isError: productsError, refetch: refetchProducts } = useQuery({ queryKey: ['pos-products'], queryFn: posApi.products })
  const { data: tables = [], isError: tablesError, refetch: refetchTables } = useQuery({ queryKey: ['pos-tables'], queryFn: posApi.tables })

  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartLine[]>([])
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY'>('TAKEAWAY')
  const [tableId, setTableId] = useState<number | ''>('')
  const [customerName, setCustomerName] = useState('')
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null)
  const [payment, setPayment] = useState<Payment | null>(null)
  const [method, setMethod] = useState<'CASH' | 'QRIS_SIMULATED'>('CASH')
  const [cashReceived, setCashReceived] = useState('')
  const [error, setError] = useState('')
  const [payKey, setPayKey] = useState('')
  const [promoInput, setPromoInput] = useState('')
  const [appliedCode, setAppliedCode] = useState<string | null>(null)
  const [preview, setPreview] = useState<PricingPreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState('')
  const [previewNonce, setPreviewNonce] = useState(0)
  const [promoError, setPromoError] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [keyboardOpen, setKeyboardOpen] = useState(false)
  const previewRequest = useRef(0)

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return
    const onResize = () => setKeyboardOpen(window.innerHeight - viewport.height > 150)
    viewport.addEventListener('resize', onResize)
    onResize()
    return () => viewport.removeEventListener('resize', onResize)
  }, [])

  const filtered = useMemo(() => products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())), [products, search])
  const subtotal = cart.reduce((s, l) => s + l.product.price * l.quantity, 0)

  useEffect(() => {
    const request = ++previewRequest.current
    let active = true

    if (!cart.length) {
      setPreview(null)
      setPreviewError('')
      setPreviewLoading(false)
      return
    }

    setPreviewLoading(true)
    setPreviewError('')
    const timer = window.setTimeout(() => {
      void pricingApi.preview({
        items: cart.map(l => ({ product_id: l.product.id, quantity: l.quantity })),
        promo_code: null,
      }).then((res) => {
        if (active && request === previewRequest.current) setPreview(res)
      }).catch((err: any) => {
        if (active && request === previewRequest.current) {
          setPreview(null)
          setPreviewError(err?.response?.data?.message || 'Rincian harga gagal dimuat.')
        }
      }).finally(() => {
        if (active && request === previewRequest.current) setPreviewLoading(false)
      })
    }, 250)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [cart, previewNonce])

  function clearPromo() {
    setAppliedCode(null)
    setPreview(null)
    setPreviewError('')
    setPromoInput('')
    setPromoError('')
    setPreviewNonce(n => n + 1)
  }

  function add(p: Product) {
    clearPromo()
    setCart(c => {
      const ex = c.find(l => l.product.id === p.id)
      if (ex) return c.map(l => l.product.id === p.id ? { ...l, quantity: Math.min(99, l.quantity + 1) } : l)
      return [...c, { product: p, quantity: 1, notes: '' }]
    })
  }
  function updateQty(id: number, q: number) {
    clearPromo()
    setCart(c => q <= 0 ? c.filter(l => l.product.id !== id) : c.map(l => l.product.id === id ? { ...l, quantity: q } : l))
  }

  async function applyPromo() {
    if (!cart.length) { setPromoError('Tambahkan item terlebih dahulu.'); return }
    const code = promoInput.trim().toUpperCase()
    if (!code) { setPromoError('Masukkan kode promo.'); return }

    const request = ++previewRequest.current
    setPromoLoading(true)
    setPreviewError('')
    setPromoError('')

    try {
      const res = await pricingApi.preview({
        items: cart.map(l => ({ product_id: l.product.id, quantity: l.quantity })),
        promo_code: code,
      })
      if (request !== previewRequest.current) return
      if (!res.promotion) {
        setPromoError('Kode promo tidak ditemukan.')
        setAppliedCode(null)
        setPreviewNonce(n => n + 1)
        return
      }
      setPreview(res)
      setAppliedCode(res.promotion.code)
      setPromoInput(res.promotion.code)
    } catch (e: any) {
      if (request !== previewRequest.current) return
      setAppliedCode(null)
      setPromoError(e?.response?.data?.errors?.promo_code?.[0] || 'Kode promo tidak valid.')
      setPreviewNonce(n => n + 1)
    } finally {
      setPromoLoading(false)
    }
  }

  const createOrder = useMutation({
    mutationFn: (payload: PosOrderPayload) => posApi.createOrder(payload),
    onSuccess: (o) => { setCreatedOrder(o); setPayment(null); setError(''); setCashReceived(''); setPayKey(crypto.randomUUID()) },
    onError: (e: any) => setError(e?.response?.data?.errors?.promo_code?.[0] || e?.response?.data?.message || e?.response?.data?.errors?.items?.[0] || 'Gagal membuat pesanan'),
  })

  const pay = useMutation({
    mutationFn: () => posApi.pay(createdOrder!.id, {
      method,
      amount_received: method === 'CASH' ? Number(cashReceived || 0) : undefined,
      idempotency_key: payKey || undefined,
    }),
    onSuccess: (p) => { setPayment(p); setError(''); qc.invalidateQueries({ queryKey: ['pos-orders'] }) },
    onError: (e: any) => setError(e?.response?.data?.message || e?.response?.data?.errors?.amount_received?.[0] || 'Gagal memproses pembayaran'),
  })

  function showCart() {
    const panel = document.getElementById('pos-cart')
    if (!panel) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
    panel.focus({ preventScroll: true })
  }

  function submitOrder() {
    setError('')
    if (!cart.length) return setError('Keranjang kosong.')
    if (orderType === 'DINE_IN' && !tableId) return setError('Pilih meja untuk dine-in.')
    if (previewLoading || promoLoading || !preview) return setError('Rincian harga belum siap. Tunggu sebentar atau coba lagi.')
    createOrder.mutate({
      order_type: orderType,
      table_id: orderType === 'DINE_IN' ? Number(tableId) : null,
      customer_name: customerName || null,
      promo_code: appliedCode,
      items: cart.map(l => ({ product_id: l.product.id, quantity: l.quantity, notes: l.notes || undefined })),
    })
  }

  function resetAll() {
    setCart([]); setCreatedOrder(null); setPayment(null); setCashReceived(''); setCustomerName(''); setTableId(''); setOrderType('TAKEAWAY'); setError(''); clearPromo()
  }

  const change = method === 'CASH' ? Math.max(0, Number(cashReceived || 0) - (createdOrder?.total ?? 0)) : 0

  if (createdOrder) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="font-display text-3xl font-bold text-brand-900">Pembayaran</h1>
        <div className="mt-4 rounded-card border border-cream-200 bg-white p-5">
          <div className="flex justify-between"><span className="font-semibold">{createdOrder.order_number}</span><span className="font-bold text-brand-900">{formatIdr(createdOrder.total)}</span></div>
          <ul className="mt-3 space-y-1 text-sm">{createdOrder.items.map(i => <li key={i.product_id} className="flex justify-between"><span>{i.quantity}x {i.product_name}</span><span>{formatIdr(i.subtotal)}</span></li>)}</ul>
          <div className="mt-3 space-y-1 border-t border-cream-200 pt-3 text-sm">
            <div className="flex justify-between text-ink-600"><span>Subtotal</span><span>{formatIdr(createdOrder.subtotal)}</span></div>
            {createdOrder.discount_amount > 0 && <div className="flex justify-between text-success"><span>Diskon {createdOrder.promotion_code ? `(${createdOrder.promotion_code})` : ''}</span><span>-{formatIdr(createdOrder.discount_amount)}</span></div>}
            {createdOrder.service_charge_amount > 0 && <div className="flex justify-between text-ink-600"><span>Biaya layanan</span><span>{formatIdr(createdOrder.service_charge_amount)}</span></div>}
            {createdOrder.tax_amount > 0 && <div className="flex justify-between text-ink-600"><span>Pajak</span><span>{formatIdr(createdOrder.tax_amount)}</span></div>}
          </div>
        </div>

        {!payment ? (
          <div className="mt-4 rounded-card border border-cream-200 bg-white p-5 space-y-4">
            <div role="radiogroup" aria-label="Metode pembayaran">
              <div className="font-medium">Metode Pembayaran</div>
              <div className="mt-2 flex flex-wrap gap-4 text-sm">
                <label className="inline-flex min-h-11 items-center gap-2"><input type="radio" checked={method==='CASH'} onChange={()=>setMethod('CASH')} /> Tunai</label>
                <label className="inline-flex min-h-11 items-center gap-2"><input type="radio" checked={method==='QRIS_SIMULATED'} onChange={()=>setMethod('QRIS_SIMULATED')} /> QRIS <span className="rounded bg-warning/15 px-1.5 py-0.5 text-xs text-warning-700">Simulasi</span></label>
              </div>
              {method==='QRIS_SIMULATED' && <p className="mt-2 text-xs text-ink-600">Ini simulasi demo, bukan verifikasi pembayaran bank atau pihak ketiga.</p>}
            </div>
            {method==='CASH' && (
              <div>
                <label className="block text-sm">Uang diterima<input type="number" inputMode="numeric" value={cashReceived} onChange={e=>setCashReceived(e.target.value)} className="mt-1 min-h-11 w-full rounded-control border border-cream-200 px-3 py-2" /></label>
                <p className="mt-1 text-sm">Kembalian: <span className="font-semibold">{formatIdr(change)}</span></p>
              </div>
            )}
            {error && <p role="alert" className="text-sm text-danger">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={()=>pay.mutate()} disabled={pay.isPending || (method==='CASH' && Number(cashReceived||0) < createdOrder.total)} className="inline-flex min-h-11 items-center rounded-control bg-brand-900 px-4 py-2 font-semibold text-white disabled:opacity-50">{pay.isPending?'Memproses...': method==='QRIS_SIMULATED' ? 'Konfirmasi (Simulasi)' : 'Bayar'}</button>
              <button type="button" onClick={()=>setCreatedOrder(null)} className="inline-flex min-h-11 items-center rounded-control border border-cream-200 px-4 py-2">Kembali</button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="rounded-card border border-success/30 bg-white p-5 print:border-0">
              <div className="text-center">
                <div className="font-display text-xl font-bold text-brand-900">Angkringan Senja</div>
                <div className="text-sm text-ink-600">Struk Pembayaran</div>
              </div>
              <div className="mt-4 text-sm space-y-1">
                <div className="flex justify-between"><span>No. Pesanan</span><span className="font-medium">{createdOrder.order_number}</span></div>
                <div className="flex justify-between"><span>Tanggal</span><span>{new Date().toLocaleString('id-ID')}</span></div>
                {createdOrder.table && <div className="flex justify-between"><span>Meja</span><span>{createdOrder.table.name} ({createdOrder.table.code})</span></div>}
                <div className="flex justify-between"><span>Tipe</span><span>{createdOrder.order_type === 'DINE_IN' ? 'Makan di tempat' : 'Bawa pulang'}</span></div>
                <div className="flex justify-between"><span>Metode</span><span>{payment.method === 'QRIS_SIMULATED' ? 'QRIS (Simulasi)' : 'Tunai'}</span></div>
              </div>
              <ul className="mt-3 border-t border-cream-200 pt-3 text-sm space-y-1">{createdOrder.items.map(i => <li key={i.product_id} className="flex justify-between"><span>{i.quantity}x {i.product_name}</span><span>{formatIdr(i.subtotal)}</span></li>)}</ul>
              <div className="mt-3 border-t border-cream-200 pt-3 text-sm space-y-1">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatIdr(createdOrder.subtotal)}</span></div>
                {createdOrder.discount_amount > 0 && <div className="flex justify-between"><span>Diskon {createdOrder.promotion_code ? `(${createdOrder.promotion_code})` : ''}</span><span>-{formatIdr(createdOrder.discount_amount)}</span></div>}
                {createdOrder.service_charge_amount > 0 && <div className="flex justify-between"><span>Biaya layanan</span><span>{formatIdr(createdOrder.service_charge_amount)}</span></div>}
                {createdOrder.tax_amount > 0 && <div className="flex justify-between"><span>Pajak</span><span>{formatIdr(createdOrder.tax_amount)}</span></div>}
                <div className="flex justify-between font-semibold"><span>Total</span><span>{formatIdr(payment.amount)}</span></div>
                {payment.method==='CASH' && <><div className="flex justify-between"><span>Diterima</span><span>{formatIdr(payment.amount_received || 0)}</span></div><div className="flex justify-between"><span>Kembali</span><span>{formatIdr(payment.change_amount || 0)}</span></div></>}
                <div className="flex justify-between text-success font-medium"><span>Status</span><span>LUNAS {payment.meta?.simulated ? '(Simulasi)' : ''}</span></div>
              </div>
            </div>
            <div className="flex gap-2 print:hidden">
              <button type="button" onClick={()=>window.print()} className="inline-flex min-h-11 items-center rounded-control bg-brand-900 px-4 py-2 font-semibold text-white">Cetak Struk</button>
              <button type="button" onClick={resetAll} className="inline-flex min-h-11 items-center rounded-control border border-cream-200 px-4 py-2">Pesanan Baru</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="grid gap-4 pb-24 md:grid-cols-[minmax(0,1fr)_340px] md:items-start md:pb-0 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div>
        <h1 className="font-display text-3xl font-bold text-brand-900">POS Kasir</h1>
        <label htmlFor="pos-search" className="sr-only">Cari produk</label>
        <input id="pos-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari produk..." className="mt-4 min-h-11 w-full max-w-sm rounded-control border border-cream-200 bg-white px-3 py-2" />
        {productsError ? (
          <div className="mt-4">
            <ErrorState message="Produk gagal dimuat." onRetry={() => void refetchProducts()} />
          </div>
        ) : isLoading ? (
          <p role="status" className="mt-4 text-ink-600">Memuat produk...</p>
        ) : (
          <>
            {!filtered.length && <p className="mt-4 text-sm text-ink-600">Produk tidak ditemukan.</p>}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {filtered.map(p => (
                <button key={p.id} type="button" onClick={()=>add(p)} className="min-h-11 rounded-card border border-cream-200 bg-white p-3 text-left hover:border-brand-700">
                  <div className="font-medium leading-tight">{p.name}</div>
                  <div className="mt-1 text-sm font-semibold text-brand-900">{formatIdr(p.price)}</div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <div id="pos-cart" role="region" aria-labelledby="pos-cart-title" tabIndex={-1} className="h-fit scroll-mt-20 rounded-card border border-cream-200 bg-white p-4 md:sticky md:top-20 lg:top-4">
        <h2 id="pos-cart-title" className="font-semibold">Pesanan</h2>
        <div className="mt-2 flex flex-wrap gap-3 text-sm" role="radiogroup" aria-label="Tipe pesanan">
          <label className="inline-flex min-h-11 items-center gap-1"><input type="radio" checked={orderType==='TAKEAWAY'} onChange={()=>setOrderType('TAKEAWAY')} /> Takeaway</label>
          <label className="inline-flex min-h-11 items-center gap-1"><input type="radio" checked={orderType==='DINE_IN'} onChange={()=>setOrderType('DINE_IN')} /> Dine-in</label>
        </div>
        {orderType==='DINE_IN' && (
          <>
            <label htmlFor="pos-table" className="sr-only">Pilih meja</label>
            <select id="pos-table" value={tableId} onChange={e=>setTableId(e.target.value ? Number(e.target.value):'')} className="mt-2 min-h-11 w-full rounded-control border border-cream-200 px-2 py-2 text-sm">
              <option value="">Pilih meja</option>
              {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {tablesError && <p role="alert" className="mt-1 text-xs text-danger">Daftar meja gagal dimuat. <button type="button" onClick={() => void refetchTables()} className="font-semibold underline">Coba lagi</button></p>}
          </>
        )}
        <label htmlFor="pos-customer" className="sr-only">Nama pelanggan (opsional)</label>
        <input id="pos-customer" value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Nama pelanggan (opsional)" className="mt-2 min-h-11 w-full rounded-control border border-cream-200 px-2 py-2 text-sm" />
        <div className="mt-3 max-h-64 space-y-2 overflow-auto" aria-live="polite">
          {cart.map(l => (
            <div key={l.product.id} className="flex items-center justify-between gap-2 text-sm">
              <div className="min-w-0 flex-1"><div className="truncate font-medium">{l.product.name}</div><div className="text-ink-600">{formatIdr(l.product.price)}</div></div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={()=>updateQty(l.product.id,l.quantity-1)} className="h-11 w-11 rounded border border-cream-200" aria-label={`Kurangi jumlah ${l.product.name}`}>-</button>
                <span className="min-w-6 text-center">{l.quantity}</span>
                <button type="button" onClick={()=>updateQty(l.product.id,l.quantity+1)} className="h-11 w-11 rounded border border-cream-200" aria-label={`Tambah jumlah ${l.product.name}`}>+</button>
              </div>
            </div>
          ))}
          {!cart.length && <p className="text-sm text-ink-600">Belum ada item.</p>}
        </div>
        <div className="mt-3 border-t border-cream-200 pt-3">
          {!appliedCode ? (
            <div>
              <label htmlFor="pos-promo" className="sr-only">Kode promo</label>
              <div className="flex gap-2">
                <input id="pos-promo" value={promoInput} onChange={e => setPromoInput(e.target.value)} placeholder="Kode promo" aria-invalid={Boolean(promoError)} aria-describedby={promoError ? 'pos-promo-error' : undefined} className="min-h-11 w-full rounded-control border border-cream-200 px-2 py-2 text-sm uppercase" />
                <button type="button" onClick={applyPromo} disabled={promoLoading} className="inline-flex min-h-11 shrink-0 items-center rounded-control border border-cream-200 px-3 py-2 text-sm font-semibold disabled:opacity-50">{promoLoading ? '...' : 'Pakai'}</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-sm"><span className="font-medium text-success">Promo {appliedCode}</span><button type="button" onClick={clearPromo} className="inline-flex min-h-11 items-center text-xs font-semibold text-danger">Hapus</button></div>
          )}
          {promoError && <p id="pos-promo-error" role="alert" className="mt-1 text-xs text-danger">{promoError}</p>}
        </div>
        <div className="mt-3 space-y-1 border-t border-cream-200 pt-3 text-sm">
          <div className="flex justify-between text-ink-600"><span>Subtotal</span><span>{formatIdr(subtotal)}</span></div>
          {preview && preview.discount_amount > 0 && <div className="flex justify-between text-success"><span>Diskon</span><span>-{formatIdr(preview.discount_amount)}</span></div>}
          {preview && preview.service_charge_amount > 0 && <div className="flex justify-between text-ink-600"><span>Biaya layanan</span><span>{formatIdr(preview.service_charge_amount)}</span></div>}
          {preview && preview.tax_amount > 0 && <div className="flex justify-between text-ink-600"><span>Pajak ({preview.tax_rate}%)</span><span>{formatIdr(preview.tax_amount)}</span></div>}
          <div className="flex justify-between gap-2 font-semibold">
            <span>Total</span>
            <span className="text-right text-brand-900" aria-live="polite">
              {previewLoading || !preview ? <span className="text-sm font-medium text-ink-600">{previewError ? 'Belum tersedia' : 'Menghitung...'}</span> : formatIdr(preview.total)}
            </span>
          </div>
          {previewError && (
            <div role="alert" className="rounded-control border border-danger/20 bg-danger/5 px-3 py-2 text-xs text-danger">
              <p>{previewError}</p>
              <button type="button" onClick={() => setPreviewNonce(n => n + 1)} className="mt-1 inline-flex min-h-11 items-center font-semibold underline">Coba hitung ulang</button>
            </div>
          )}
        </div>
        {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
        <button type="button" onClick={submitOrder} disabled={createOrder.isPending || !cart.length || previewLoading || promoLoading || !preview} className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-control bg-brand-900 px-4 py-3 font-semibold text-white disabled:opacity-50">{createOrder.isPending?'Memproses...':'Buat Pesanan'}</button>
      </div>

      {cart.length > 0 && !keyboardOpen && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-cream-200 bg-white p-3 md:hidden">
          <button type="button" aria-label="Buka keranjang" onClick={showCart} className="flex min-h-12 w-full items-center justify-between gap-3 rounded-control bg-brand-900 px-4 py-2 text-left text-white">
            <span>
              <span className="block text-xs text-cream-100/90">{cart.reduce((sum, line) => sum + line.quantity, 0)} item</span>
              <span className="font-semibold">Lihat pesanan</span>
            </span>
            <span className="text-right font-semibold" aria-live="polite">{previewLoading || !preview ? 'Menghitung...' : formatIdr(preview.total)}</span>
          </button>
        </div>
      )}
    </div>
  )
}
