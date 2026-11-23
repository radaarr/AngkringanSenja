import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orderApi } from '@/services/posApi'
import { ErrorState, LoadingState } from '@/components/QueryState'
import type { Order } from '@/types/menu'

const next: Record<string, string> = { CONFIRMED: 'PREPARING', PREPARING: 'READY' }
const orderTypeLabel: Record<string, string> = { DINE_IN: 'Dine-in', TAKEAWAY: 'Takeaway' }

function minutesAgo(iso: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000))
}

export function KitchenPage() {
  const qc = useQueryClient()
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false)
    window.addEventListener('online', on); window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  const { data: orders = [], isLoading, isError, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['kitchen-orders'],
    queryFn: orderApi.kitchen,
    refetchInterval: online ? 5000 : 15000,
  })

  const update = useMutation({
    mutationFn: ({ id, to }: { id: number; to: string }) => orderApi.updateStatus(id, { status: to }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kitchen-orders'] }),
  })

  const groups: { key: string; title: string }[] = [
    { key: 'CONFIRMED', title: 'Menunggu' },
    { key: 'PREPARING', title: 'Diproses' },
    { key: 'READY', title: 'Siap' },
  ]

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-3xl font-bold text-brand-900">Kitchen Display</h1>
        <div role="status" aria-live="polite" className={`text-sm ${online ? 'text-success' : 'text-warning-700'}`}>{online ? 'Terhubung (auto-refresh)' : 'Offline - refresh terbatas'}</div>
      </div>
      {update.isError && <p role="alert" className="mt-3 rounded-control border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">Status pesanan gagal diperbarui. Coba lagi.</p>}
      {isError ? (
        <div className="mt-4"><ErrorState message="Pesanan dapur gagal dimuat." onRetry={() => void refetch()} /></div>
      ) : isLoading ? (
        <div className="mt-4"><LoadingState label="Memuat pesanan..." /></div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {groups.map(g => {
            const list = orders.filter(o => o.status === g.key)
            return (
              <div key={g.key} className="rounded-card border border-cream-200 bg-cream-50 p-3">
                <div className="mb-2 flex items-center justify-between"><h2 className="font-semibold">{g.title}</h2><span className="rounded-full bg-cream-200 px-2 text-xs">{list.length}</span></div>
                <div className="space-y-2">
                  {list.map((o: Order) => (
                    <div key={o.id} className="rounded-card border border-cream-200 bg-white p-3">
                      <div className="flex items-start justify-between"><div className="font-bold">{o.order_number}</div><div className="text-xs text-ink-600">{minutesAgo(o.created_at)} mnt</div></div>
                      <div className="text-xs text-ink-600">{orderTypeLabel[o.order_type] ?? o.order_type}{o.table ? ` · ${o.table.name}` : ''}</div>
                      <ul className="mt-2 space-y-1 text-sm">
                        {o.items?.map(i => <li key={i.id || i.product_id}><span className="font-medium">{i.quantity}x</span> {i.product_name}{i.notes ? <span className="text-warning-700"> · {i.notes}</span> : null}</li>)}
                      </ul>
                      {next[o.status] && (
                        <button type="button" onClick={() => update.mutate({ id: o.id, to: next[o.status] })} disabled={update.isPending} className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-control bg-brand-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
                          {next[o.status] === 'PREPARING' ? 'Mulai Diproses' : 'Tandai Siap'}
                        </button>
                      )}
                    </div>
                  ))}
                  {!list.length && <p className="p-2 text-sm text-ink-600">Kosong</p>}
                </div>
              </div>
            )
          })}
        </div>
      )}
      <p className="mt-3 text-xs text-ink-600">Pembaruan terakhir: {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString('id-ID') : '-'}</p>
    </div>
  )
}
