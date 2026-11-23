import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts'
import { reportApi } from '@/services/adminExtraApi'
import { ErrorState, LoadingState } from '@/components/QueryState'
import { Banknote, ShoppingBag, TrendingUp, AlertTriangle, Receipt } from 'lucide-react'

function formatIdr(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export function DashboardPage() {
  const [range, setRange] = useState(() => ({ from: new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10), to: new Date().toISOString().slice(0, 10) }))
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['dashboard', range], queryFn: () => reportApi.dashboard(range) })

  const cards = [
    { label: 'Penjualan (lunas)', value: formatIdr(data?.sales_total || 0), icon: Banknote },
    { label: 'Pesanan dibayar', value: String(data?.orders_count || 0), icon: ShoppingBag },
    { label: 'Rata-rata order', value: formatIdr(data?.avg_order || 0), icon: TrendingUp },
    { label: 'Pengeluaran', value: formatIdr(data?.expenses_total || 0), icon: Receipt },
    { label: 'Estimasi laba operasional', value: formatIdr(data?.profit_estimate || 0), icon: TrendingUp },
    { label: 'Stok rendah', value: String(data?.low_stock_count || 0), icon: AlertTriangle },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-900">Dashboard</h1>
          <p className="text-ink-600">Ringkasan operasional berdasarkan transaksi lunas pada rentang terpilih.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label>Dari <input type="date" value={range.from} onChange={e => setRange({ ...range, from: e.target.value })} className="ml-1 min-h-11 rounded-control border border-cream-200 px-2 py-1" /></label>
          <label>Sampai <input type="date" value={range.to} onChange={e => setRange({ ...range, to: e.target.value })} className="ml-1 min-h-11 rounded-control border border-cream-200 px-2 py-1" /></label>
        </div>
      </div>

      {isError ? (
        <ErrorState message="Metrik dashboard gagal dimuat." onRetry={() => void refetch()} />
      ) : isLoading ? (
        <LoadingState label="Memuat metrik..." />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map(c => (
              <div key={c.label} className="rounded-card border border-cream-200 bg-white p-4">
                <div className="flex items-center justify-between text-ink-600"><span className="text-sm">{c.label}</span><c.icon size={18} aria-hidden="true" /></div>
                <div className="mt-2 text-2xl font-bold text-brand-900">{c.value}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-card border border-cream-200 bg-white p-4">
              <h2 className="font-semibold">Penjualan Harian (14 hari terakhir)</h2>
              <div className="mt-3 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.daily_sales || []}>
                    <CartesianGrid stroke="#EADCC5" strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v: any) => formatIdr(Number(v))} />
                    <Line type="monotone" dataKey="total" stroke="#493323" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-card border border-cream-200 bg-white p-4">
              <h2 className="font-semibold">Produk Terlaris (qty, rentang terpilih)</h2>
              <div className="mt-3 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.top_products || []} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid stroke="#EADCC5" strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="product_name" width={120} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="qty" fill="#A95D36" radius={[0,4,4,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {!(data?.top_products || []).length && <p className="text-sm text-ink-600">Belum ada data penjualan.</p>}
            </div>
          </div>

          <div className="rounded-card border border-cream-200 bg-white p-4">
            <h2 className="font-semibold">Pesanan per Status (rentang terpilih)</h2>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {Object.entries(data?.orders_by_status || {}).map(([s, c]) => (
                <span key={s} className="rounded-full bg-cream-100 px-3 py-1">{s}: <b>{String(c)}</b></span>
              ))}
              {!Object.keys(data?.orders_by_status || {}).length && <span className="text-ink-600">Belum ada pesanan.</span>}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
