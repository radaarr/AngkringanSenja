import { useQuery } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { posApi } from '@/services/posApi'
import { ErrorState, LoadingState } from '@/components/QueryState'

function formatIdr(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

const orderTypeLabel: Record<string, string> = { DINE_IN: 'Dine-in', TAKEAWAY: 'Takeaway' }

export function CashierOrdersPage() {
  const { data: orders = [], isLoading, isError, isFetching, refetch } = useQuery({ queryKey: ['pos-orders'], queryFn: posApi.orders })

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-brand-900">Riwayat Pesanan Kasir</h1>
        <button type="button" onClick={() => void refetch()} disabled={isFetching} className="inline-flex min-h-11 items-center gap-2 rounded-control border border-cream-200 bg-white px-4 py-2 text-sm font-semibold text-brand-900 disabled:opacity-50">
          <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} aria-hidden="true" />
          {isFetching ? 'Memuat...' : 'Muat ulang'}
        </button>
      </div>

      {isError ? (
        <div className="mt-6"><ErrorState message="Riwayat pesanan gagal dimuat." onRetry={() => void refetch()} /></div>
      ) : isLoading ? (
        <div className="mt-6"><LoadingState label="Memuat riwayat pesanan..." /></div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map(o => {
            const paid = o.payments?.some(p => p.status === 'PAID')
            const pay = o.payments?.find(p => p.status === 'PAID')
            return (
              <div key={o.id} className="rounded-card border border-cream-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold">{o.order_number}</div>
                    <div className="text-sm text-ink-600">{new Date(o.created_at).toLocaleString('id-ID')} · {orderTypeLabel[o.order_type] ?? o.order_type}{o.table ? ` · ${o.table.name}` : ''}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-brand-900">{formatIdr(o.total)}</div>
                    <div className={`text-sm ${paid ? 'text-success' : 'text-warning-700'}`}>{paid ? `Lunas (${pay?.method === 'QRIS_SIMULATED' ? 'QRIS Simulasi' : 'Tunai'})` : 'Belum bayar'}</div>
                  </div>
                </div>
                <div className="mt-2 text-sm text-ink-600">{o.items.map(i => `${i.quantity}x ${i.product_name}`).join(', ')}</div>
              </div>
            )
          })}
          {!orders.length && <p className="text-ink-600">Belum ada pesanan.</p>}
        </div>
      )}
    </div>
  )
}
