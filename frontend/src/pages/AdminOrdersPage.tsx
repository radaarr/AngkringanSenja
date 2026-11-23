import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orderApi } from '@/services/posApi'
import { useAuthStore } from '@/stores/authStore'
import { ErrorState, LoadingState } from '@/components/QueryState'
import { Modal } from '@/components/Modal'
import type { Order } from '@/types/menu'

function formatIdr(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}
const statusLabel: Record<string, string> = { PENDING: 'Menunggu', CONFIRMED: 'Dikonfirmasi', PREPARING: 'Diproses', READY: 'Siap', COMPLETED: 'Selesai', CANCELLED: 'Dibatalkan' }
const sourceLabel: Record<string, string> = { POS: 'POS', QR_ORDERING: 'QR' }
const orderTypeLabel: Record<string, string> = { DINE_IN: 'Dine-in', TAKEAWAY: 'Takeaway' }
const nextByRole: Record<string, Record<string, string[]>> = {
  owner: { PENDING: ['CONFIRMED', 'CANCELLED'], CONFIRMED: ['PREPARING', 'CANCELLED'], PREPARING: ['READY', 'CANCELLED'], READY: ['COMPLETED'], COMPLETED: [], CANCELLED: [] },
  cashier: { PENDING: ['CONFIRMED', 'CANCELLED'], CONFIRMED: ['CANCELLED'], PREPARING: ['CANCELLED'], READY: ['COMPLETED'], COMPLETED: [], CANCELLED: [] },
  kitchen_staff: { PENDING: [], CONFIRMED: ['PREPARING'], PREPARING: ['READY'], READY: [], COMPLETED: [], CANCELLED: [] },
}

export function AdminOrdersPage({ role: roleProp }: { role?: string }) {
  const roleFromStore = useAuthStore(s => s.user?.role?.slug)
  const role = roleProp || roleFromStore || 'owner'
  const qc = useQueryClient()
  const [status, setStatus] = useState('')
  const [source, setSource] = useState('')
  const [cancelFor, setCancelFor] = useState<Order | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelError, setCancelError] = useState('')
  const { data: orders = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['orders', status, source],
    queryFn: () => orderApi.list({ status: status || undefined, source: source || undefined }),
    refetchInterval: 8000,
  })

  const update = useMutation({
    mutationFn: ({ id, to, reason }: { id: number; to: string; reason?: string }) => orderApi.updateStatus(id, { status: to, reason }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders'] }); qc.invalidateQueries({ queryKey: ['kitchen-orders'] }) },
  })

  function act(o: Order, to: string) {
    if (to === 'CANCELLED') {
      update.reset()
      setCancelFor(o)
      setCancelReason('')
      setCancelError('')
      return
    }
    update.mutate({ id: o.id, to })
  }

  function closeCancel() {
    update.reset()
    setCancelFor(null)
    setCancelError('')
  }

  function confirmCancel(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const reason = cancelReason.trim()
    if (!reason) {
      setCancelError('Alasan pembatalan wajib diisi.')
      return
    }
    if (!cancelFor) return
    update.mutate({ id: cancelFor.id, to: 'CANCELLED', reason }, { onSuccess: closeCancel })
  }

  const filtered = useMemo(() => orders, [orders])

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-brand-900">Pesanan</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <label className="text-sm">
          <span className="sr-only">Filter status</span>
          <select value={status} onChange={e => setStatus(e.target.value)} className="min-h-11 rounded-control border border-cream-200 px-3 py-2 text-sm">
            <option value="">Semua status</option>
            {Object.keys(statusLabel).map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="sr-only">Filter sumber pesanan</span>
          <select value={source} onChange={e => setSource(e.target.value)} className="min-h-11 rounded-control border border-cream-200 px-3 py-2 text-sm">
            <option value="">Semua sumber</option>
            <option value="POS">POS</option>
            <option value="QR_ORDERING">QR</option>
          </select>
        </label>
      </div>
      {isError ? (
        <div className="mt-4"><ErrorState message="Daftar pesanan gagal dimuat." onRetry={() => void refetch()} /></div>
      ) : isLoading ? (
        <div className="mt-4"><LoadingState label="Memuat pesanan..." /></div>
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.map(o => {
            const actions = (nextByRole[role] || {})[o.status] || []
            return (
              <div key={o.id} className="rounded-card border border-cream-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold">{o.order_number} <span className="ml-2 rounded bg-cream-100 px-2 py-0.5 text-xs">{sourceLabel[o.source] ?? o.source}</span></div>
                    <div className="text-sm text-ink-600">{new Date(o.created_at).toLocaleString('id-ID')} · {orderTypeLabel[o.order_type] ?? o.order_type}{o.table ? ` · ${o.table.name}` : ''}</div>
                  </div>
                  <div className="text-right"><div className="font-bold text-brand-900">{formatIdr(o.total)}</div><div className="text-sm">{statusLabel[o.status] || o.status}</div></div>
                </div>
                <div className="mt-2 text-sm text-ink-600">{o.items?.map(i => `${i.quantity}x ${i.product_name}`).join(', ')}</div>
                {actions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {actions.map(a => (
                      <button key={a} type="button" onClick={() => act(o, a)} disabled={update.isPending} aria-label={`Ubah status ${o.order_number} menjadi ${statusLabel[a] || a}`} className={`inline-flex min-h-11 items-center rounded-control px-3 py-2 text-sm font-medium ${a === 'CANCELLED' ? 'border border-danger text-danger' : 'bg-brand-900 text-white'} disabled:opacity-50`}>
                        {statusLabel[a] || a}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          {!filtered.length && <p className="text-ink-600">Tidak ada pesanan.</p>}
        </div>
      )}
      {update.isError && !cancelFor && <p role="alert" className="mt-3 rounded-control border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">Gagal memperbarui status pesanan. Coba lagi.</p>}

      <Modal open={Boolean(cancelFor)} onClose={closeCancel} title="Batalkan pesanan" description={cancelFor ? `Pesanan ${cancelFor.order_number} akan dibatalkan.` : undefined} size="md">
        <form onSubmit={confirmCancel} className="space-y-4">
          <div>
            <label htmlFor="cancel-reason" className="block text-sm">Alasan pembatalan</label>
            <textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={e => { setCancelReason(e.target.value); setCancelError('') }}
              rows={3}
              required
              data-autofocus
              aria-invalid={Boolean(cancelError)}
              aria-describedby={cancelError ? 'cancel-reason-error' : undefined}
              className="mt-1 w-full rounded-control border border-cream-200 px-3 py-2"
            />
          </div>
          {cancelError && <p id="cancel-reason-error" role="alert" className="text-sm text-danger">{cancelError}</p>}
          {update.isError && <p role="alert" className="text-sm text-danger">Gagal membatalkan pesanan. Coba lagi.</p>}
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={closeCancel} disabled={update.isPending} className="inline-flex min-h-11 items-center rounded-control border border-cream-200 px-4 py-2">Batal</button>
            <button type="submit" disabled={update.isPending || !cancelReason.trim()} className="inline-flex min-h-11 items-center rounded-control bg-danger px-4 py-2 font-semibold text-white disabled:opacity-50">{update.isPending ? 'Memproses...' : 'Batalkan Pesanan'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
