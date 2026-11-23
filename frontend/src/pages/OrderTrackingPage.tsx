import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Clock3, ChefHat, BellRing, PartyPopper, XCircle, Copy, Check, CreditCard, QrCode } from 'lucide-react'
import { orderApi } from '@/services/orderApi'
import { PageHero } from '@/components/PageHero'
import { ErrorState } from '@/components/QueryState'

function formatIdr(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

const steps = [
  { key: 'PENDING', label: 'Menunggu', icon: Clock3 },
  { key: 'CONFIRMED', label: 'Dikonfirmasi', icon: CheckCircle2 },
  { key: 'PREPARING', label: 'Diproses', icon: ChefHat },
  { key: 'READY', label: 'Siap', icon: BellRing },
  { key: 'COMPLETED', label: 'Selesai', icon: PartyPopper },
]

export function OrderTrackingPage() {
  const { token = '' } = useParams()
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef<number | null>(null)
  const qc = useQueryClient()
  const { data: o, isLoading, isError, refetch } = useQuery({ queryKey: ['track', token], queryFn: () => orderApi.track(token), enabled: !!token, refetchInterval: 5000 })

  useEffect(() => {
    return () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current)
    }
  }, [])

  const payMut = useMutation({
    mutationFn: () => orderApi.pay(token, { method: 'QRIS_SIMULATED', idempotency_key: `pay-${token}` }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['track', token] }),
  })

  if (isLoading) return (
    <div className="min-h-screen bg-cream-50">
      <PageHero eyebrow="Lacak" title="Pesanan" description="Memuat status pesananmu..." />
      <div className="mx-auto max-w-3xl px-4 py-16" role="status">
        <span className="sr-only">Memuat status pesanan...</span>
        <div className="h-64 animate-pulse rounded-feature bg-cream-200" />
      </div>
    </div>
  )

  if (isError || !o) return (
    <div className="min-h-screen bg-cream-50">
      <PageHero eyebrow="Lacak" title="Pesanan" description="Pesanan tidak ditemukan atau gagal dimuat." />
      <div className="mx-auto max-w-3xl space-y-5 px-4 py-16">
        <ErrorState message="Tautan pelacakan tidak dapat dibuka saat ini." onRetry={() => void refetch()} />
        <div className="text-center"><Link to="/menu" className="inline-flex min-h-11 items-center rounded-control bg-brand-900 px-5 py-3 font-semibold text-white">Kembali ke menu</Link></div>
      </div>
    </div>
  )

  const cancelled = o.status === 'CANCELLED'
  const currentIdx = steps.findIndex(s => s.key === o.status)
  const paid = !!o.paid
  const paidPayment = o.payments?.find(p => p.status === 'PAID')

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      if (copyTimer.current) window.clearTimeout(copyTimer.current)
      copyTimer.current = window.setTimeout(() => setCopied(false), 1500)
    } catch { /* ignore */ }
  }

  return (
    <div className="bg-cream-50">
      <PageHero
        eyebrow="Lacak Pesanan"
        title={o.order_number}
        description={`${o.order_type === 'DINE_IN' ? `Makan di tempat${o.table ? ' - ' + o.table.name : ''}` : 'Bawa pulang'} · ${new Date(o.created_at).toLocaleString('id-ID')}`}
        right={<button type="button" onClick={copyLink} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-cream-50/30 bg-white/10 px-4 py-2 text-sm font-medium text-cream-50 transition hover:bg-white/20">{copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />} <span aria-live="polite">{copied ? 'Tersalin' : 'Salin tautan'}</span></button>}
      />

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:py-14">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-feature border border-cream-200 bg-white p-5 shadow-[0_10px_30px_rgba(73,51,35,0.06)] md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-semibold text-brand-900">Status Pesanan</h2>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${paid ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning-700'}`}>
                <CreditCard size={13} aria-hidden="true" /> {paid ? `Lunas${paidPayment ? ` · ${paidPayment.method === 'QRIS_SIMULATED' ? 'QRIS' : 'Tunai'}` : ''}` : 'Belum dibayar'}
              </span>
            </div>
            {cancelled ? (
              <div className="mt-6 flex items-center gap-3 rounded-control border border-danger/20 bg-danger/10 px-4 py-4 text-danger"><XCircle aria-hidden="true" /><div><div className="font-semibold">Pesanan dibatalkan</div><div className="text-sm">Silakan hubungi kasir jika ini tidak sesuai.</div></div></div>
            ) : (
              <ol className="mt-6 space-y-0">
                {steps.map((s, i) => {
                  const done = i <= currentIdx
                  const active = i === currentIdx
                  const Icon = s.icon
                  return (
                    <li key={s.key} aria-current={active ? 'step' : undefined} className="relative flex gap-4 pb-6 last:pb-0">
                      {i < steps.length - 1 && <span aria-hidden="true" className={`absolute left-5 top-10 h-[calc(100%-1.5rem)] w-px ${i < currentIdx ? 'bg-success' : 'bg-cream-200'}`} />}
                      <span className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition ${done ? 'border-success bg-success text-white' : 'border-cream-200 bg-cream-50 text-ink-600'} ${active ? 'ring-4 ring-success/15' : ''}`}><Icon size={17} aria-hidden="true" /></span>
                      <div className="pt-1.5">
                        <div className={`font-semibold ${done ? 'text-brand-900' : 'text-ink-600'}`}>{s.label}</div>
                        {!(active && o.status === 'COMPLETED') && <div className="text-sm text-ink-600">{active ? 'Sedang berlangsung' : done ? 'Selesai' : 'Menunggu'}</div>}
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}

            {!cancelled && !paid && (
              <div className="mt-6 rounded-control border border-warning/30 bg-warning/10 p-4">
                <div className="font-semibold text-ink-900">Belum dibayar</div>
                <p className="mt-1 text-sm text-ink-700">Silakan bayar di kasir (tunai) atau bayar langsung via QRIS (simulasi) di bawah ini.</p>
                <button type="button" onClick={() => payMut.mutate()} disabled={payMut.isPending} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-control bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:opacity-50">
                  <QrCode size={16} aria-hidden="true" /> {payMut.isPending ? 'Memproses...' : 'Bayar via QRIS (Simulasi)'}
                </button>
                {payMut.isError && <p role="alert" className="mt-2 text-sm text-danger">Gagal memproses pembayaran. Coba lagi.</p>}
              </div>
            )}
            {paid && paidPayment && (
              <div role="status" className="mt-6 rounded-control border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
                Pembayaran diterima: {paidPayment.method === 'QRIS_SIMULATED' ? 'QRIS (Simulasi)' : 'Tunai'}{paidPayment.paid_at ? ` · ${new Date(paidPayment.paid_at).toLocaleString('id-ID')}` : ''}
              </div>
            )}
            <p className="mt-6 rounded-control bg-cream-50 px-4 py-3 text-sm text-ink-600">Halaman ini diperbarui otomatis setiap beberapa detik.</p>
          </div>
        </div>

        <aside className="h-fit lg:sticky lg:top-28">
          <div className="overflow-hidden rounded-feature border border-cream-200 bg-white shadow-[0_14px_40px_rgba(73,51,35,0.1)]">
            <div className="bg-[radial-gradient(600px_220px_at_20%_0%,#79543A,#493323)] px-5 py-4 text-cream-50">
              <h2 className="font-display text-xl font-semibold">Rincian Pesanan</h2>
              <p className="text-sm text-cream-100/85">
                {o.items.length} item
                {o.table && (
                  <>
                    <span className="mx-1.5 font-bold" aria-hidden="true">&bull;</span>
                    {o.table.name}
                  </>
                )}
              </p>
            </div>
            <div className="p-5">
              <ul className="space-y-3 text-sm">
                {o.items.map(i => (
                  <li key={i.id} className="flex items-start justify-between gap-4">
                    <span className="text-ink-600"><span className="font-medium text-ink-900">{i.quantity}x</span> {i.product_name}{i.notes ? <span className="block text-xs text-ink-600">Catatan: {i.notes}</span> : null}</span>
                    <span className="shrink-0 font-medium text-brand-900">{formatIdr(i.subtotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 space-y-2 border-t border-cream-200 pt-4 text-sm">
                <div className="flex justify-between text-ink-600"><span>Subtotal</span><span>{formatIdr(o.subtotal)}</span></div>
                {Number(o.discount_amount) > 0 && <div className="flex justify-between text-success"><span>Diskon{o.promotion_code ? ` (${o.promotion_code})` : ''}</span><span>-{formatIdr(o.discount_amount)}</span></div>}
                {Number(o.service_charge_amount) > 0 && <div className="flex justify-between text-ink-600"><span>Biaya layanan</span><span>{formatIdr(o.service_charge_amount)}</span></div>}
                {Number(o.tax_amount) > 0 && <div className="flex justify-between text-ink-600"><span>Pajak</span><span>{formatIdr(o.tax_amount)}</span></div>}
                <div className="flex justify-between pt-1 text-lg font-bold text-brand-900"><span>Total</span><span>{formatIdr(o.total)}</span></div>
              </div>
              <Link to="/menu" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-control border border-cream-200 px-5 py-3 font-semibold text-brand-900 hover:bg-cream-100">Pesan lagi</Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
