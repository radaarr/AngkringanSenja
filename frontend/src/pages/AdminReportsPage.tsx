import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportApi } from '@/services/adminExtraApi'
import { ErrorState, LoadingState } from '@/components/QueryState'

function formatIdr(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export function AdminReportsPage() {
  const [range, setRange] = useState(() => ({ from: new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10), to: new Date().toISOString().slice(0, 10) }))
  const sales = useQuery({ queryKey: ['report-sales', range], queryFn: () => reportApi.sales(range) })
  const products = useQuery({ queryKey: ['report-products', range], queryFn: () => reportApi.products(range) })
  const inventory = useQuery({ queryKey: ['report-inventory'], queryFn: () => reportApi.inventory() })
  const expenses = useQuery({ queryKey: ['report-expenses', range], queryFn: () => reportApi.expenses(range) })

  const expenseRows = expenses.data?.data || expenses.data || []
  const expenseSummary = expenses.data?.summary || []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="font-display text-3xl font-bold text-brand-900">Laporan</h1><p className="text-ink-600">Ringkasan penjualan, produk, inventaris, dan pengeluaran. Ekspor CSV tersedia.</p></div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label>Dari <input type="date" value={range.from} onChange={e => setRange({ ...range, from: e.target.value })} className="ml-1 min-h-11 rounded-control border border-cream-200 px-2 py-1" /></label>
          <label>Sampai <input type="date" value={range.to} onChange={e => setRange({ ...range, to: e.target.value })} className="ml-1 min-h-11 rounded-control border border-cream-200 px-2 py-1" /></label>
        </div>
      </div>

      <section className="rounded-card border border-cream-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Laporan Penjualan (lunas)</h2>
          <button type="button" onClick={() => reportApi.download('/admin/reports/sales', range)} aria-label="Ekspor CSV laporan penjualan" className="inline-flex min-h-11 items-center rounded-control border border-cream-200 px-3 py-2 text-sm">Ekspor CSV</button>
        </div>
        {sales.isError ? (
          <div className="mt-3"><ErrorState message="Laporan penjualan gagal dimuat." onRetry={() => void sales.refetch()} /></div>
        ) : sales.isLoading ? (
          <div className="mt-3"><LoadingState label="Memuat laporan penjualan..." compact /></div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <p className="px-3 pt-2 text-xs text-ink-600 md:hidden">Geser tabel untuk melihat semua kolom.</p>
            <table className="min-w-[620px] w-full text-sm">
              <thead className="text-left text-ink-600"><tr><th scope="col" className="p-2">No. Pesanan</th><th scope="col" className="p-2">Tanggal</th><th scope="col" className="p-2">Tipe/Sumber</th><th scope="col" className="p-2">Total</th></tr></thead>
              <tbody>
                {(sales.data || []).slice(0, 20).map((o: { id: number; order_number: string; created_at: string; order_type: string; source: string; total: number }) => <tr key={o.id} className="border-t border-cream-200"><td className="p-2 font-medium">{o.order_number}</td><td className="p-2">{new Date(o.created_at).toLocaleString('id-ID')}</td><td className="p-2">{o.order_type} / {o.source}</td><td className="p-2">{formatIdr(Number(o.total))}</td></tr>)}
                {!(sales.data || []).length && <tr><td className="p-2 text-ink-600" colSpan={4}>Tidak ada data.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-card border border-cream-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Performa Produk</h2>
          <button type="button" onClick={() => reportApi.download('/admin/reports/products', range)} aria-label="Ekspor CSV performa produk" className="inline-flex min-h-11 items-center rounded-control border border-cream-200 px-3 py-2 text-sm">Ekspor CSV</button>
        </div>
        {products.isError ? (
          <div className="mt-3"><ErrorState message="Laporan produk gagal dimuat." onRetry={() => void products.refetch()} /></div>
        ) : products.isLoading ? (
          <div className="mt-3"><LoadingState label="Memuat laporan produk..." compact /></div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <p className="px-3 pt-2 text-xs text-ink-600 md:hidden">Geser tabel untuk melihat semua kolom.</p>
            <table className="min-w-[480px] w-full text-sm">
              <thead className="text-left text-ink-600"><tr><th scope="col" className="p-2">Produk</th><th scope="col" className="p-2">Terjual</th><th scope="col" className="p-2">Pendapatan</th></tr></thead>
              <tbody>
                {(products.data || []).map((r: { product_name: string; qty: number; revenue: number }, i: number) => <tr key={`${r.product_name}-${i}`} className="border-t border-cream-200"><td className="p-2">{r.product_name}</td><td className="p-2">{r.qty}</td><td className="p-2">{formatIdr(Number(r.revenue))}</td></tr>)}
                {!(products.data || []).length && <tr><td className="p-2 text-ink-600" colSpan={3}>Tidak ada data.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-card border border-cream-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Laporan Inventaris</h2>
          <button type="button" onClick={() => reportApi.download('/admin/reports/inventory')} aria-label="Ekspor CSV laporan inventaris" className="inline-flex min-h-11 items-center rounded-control border border-cream-200 px-3 py-2 text-sm">Ekspor CSV</button>
        </div>
        {inventory.isError ? (
          <div className="mt-3"><ErrorState message="Laporan inventaris gagal dimuat." onRetry={() => void inventory.refetch()} /></div>
        ) : inventory.isLoading ? (
          <div className="mt-3"><LoadingState label="Memuat laporan inventaris..." compact /></div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <p className="px-3 pt-2 text-xs text-ink-600 md:hidden">Geser tabel untuk melihat semua kolom.</p>
            <table className="min-w-[520px] w-full text-sm">
              <thead className="text-left text-ink-600"><tr><th scope="col" className="p-2">Bahan</th><th scope="col" className="p-2">Stok</th><th scope="col" className="p-2">Min</th><th scope="col" className="p-2">Status</th></tr></thead>
              <tbody>
                {(inventory.data || []).map((i: { id: number; name: string; current_stock: number; min_stock: number; unit: string; is_active: boolean }) => <tr key={i.id} className="border-t border-cream-200"><td className="p-2">{i.name}</td><td className="p-2">{i.current_stock} {i.unit}</td><td className="p-2">{i.min_stock} {i.unit}</td><td className="p-2">{i.is_active && Number(i.current_stock) <= Number(i.min_stock) ? <span className="text-warning-700">Rendah</span> : <span className="text-success">OK</span>}</td></tr>)}
                {!(inventory.data || []).length && <tr><td className="p-2 text-ink-600" colSpan={4}>Tidak ada data.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-card border border-cream-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Laporan Pengeluaran</h2>
          <button type="button" onClick={() => reportApi.download('/admin/reports/expenses', range)} aria-label="Ekspor CSV laporan pengeluaran" className="inline-flex min-h-11 items-center rounded-control border border-cream-200 px-3 py-2 text-sm">Ekspor CSV</button>
        </div>
        {expenses.isError ? (
          <div className="mt-3"><ErrorState message="Laporan pengeluaran gagal dimuat." onRetry={() => void expenses.refetch()} /></div>
        ) : expenses.isLoading ? (
          <div className="mt-3"><LoadingState label="Memuat laporan pengeluaran..." compact /></div>
        ) : (
          <>
            <div className="mt-3 overflow-x-auto">
              <p className="px-3 pt-2 text-xs text-ink-600 md:hidden">Geser tabel untuk melihat semua kolom.</p>
              <table className="min-w-[620px] w-full text-sm">
                <thead className="text-left text-ink-600"><tr><th scope="col" className="p-2">Tanggal</th><th scope="col" className="p-2">Kategori</th><th scope="col" className="p-2">Deskripsi</th><th scope="col" className="p-2">Jumlah</th></tr></thead>
                <tbody>
                  {expenseRows.slice(0, 20).map((e: { id: number; expense_date: string; category: string; description: string; amount: number }) => <tr key={e.id} className="border-t border-cream-200"><td className="p-2">{String(e.expense_date).slice(0, 10)}</td><td className="p-2">{e.category}</td><td className="p-2">{e.description}</td><td className="p-2">{formatIdr(Number(e.amount))}</td></tr>)}
                  {!expenseRows.length && <tr><td className="p-2 text-ink-600" colSpan={4}>Tidak ada data.</td></tr>}
                </tbody>
              </table>
            </div>
            {expenseSummary.length ? <div className="mt-3 text-sm"><span className="font-medium">Ringkasan per kategori: </span>{expenseSummary.map((s: { category: string; total: number }) => `${s.category}: ${formatIdr(Number(s.total))}`).join(' | ')}</div> : null}
          </>
        )}
      </section>
    </div>
  )
}
