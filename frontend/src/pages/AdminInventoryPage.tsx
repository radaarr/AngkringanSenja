import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { inventoryApi, type Ingredient } from '@/services/adminExtraApi'
import { ErrorState, LoadingState } from '@/components/QueryState'

export function AdminInventoryPage() {
  const qc = useQueryClient()
  const { data: items = [], isLoading, isError, refetch } = useQuery({ queryKey: ['ingredients'], queryFn: inventoryApi.ingredients })
  const [form, setForm] = useState({ name: '', unit: '', current_stock: '0', min_stock: '0' })
  const [adjustFor, setAdjustFor] = useState<Ingredient | null>(null)
  const [adj, setAdj] = useState({ type: 'IN', quantity: '', balance_after: '', reason: '', notes: '' })
  const [viewId, setViewId] = useState<number | null>(null)

  const create = useMutation({ mutationFn: () => inventoryApi.createIngredient({ name: form.name, unit: form.unit, current_stock: Number(form.current_stock), min_stock: Number(form.min_stock) }), onSuccess: () => { setForm({ name: '', unit: '', current_stock: '0', min_stock: '0' }); qc.invalidateQueries({ queryKey: ['ingredients'] }) } })
  const adjust = useMutation({ mutationFn: () => inventoryApi.adjust(adjustFor!.id, { type: adj.type, quantity: adj.quantity ? Number(adj.quantity) : undefined, balance_after: adj.balance_after !== '' ? Number(adj.balance_after) : undefined, reason: adj.reason, notes: adj.notes }), onSuccess: () => { setAdjustFor(null); setAdj({ type: 'IN', quantity: '', balance_after: '', reason: '', notes: '' }); qc.invalidateQueries({ queryKey: ['ingredients'] }); qc.invalidateQueries({ queryKey: ['movements', viewId] }) } })
  const remove = useMutation({ mutationFn: (id: number) => inventoryApi.deleteIngredient(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['ingredients'] }) })
  const movements = useQuery({ queryKey: ['movements', viewId], queryFn: () => inventoryApi.movements(viewId!), enabled: !!viewId })

  const lowCount = items.filter(i => i.is_low_stock).length
  const adjustError = adjust.error as { response?: { data?: { message?: string } } } | null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-brand-900">Inventaris</h1>
        <p className="text-ink-600">Bahan baku, stok, dan riwayat pergerakan.</p>
        {lowCount > 0 && <div role="status" className="mt-3 rounded-control border border-warning/30 bg-warning/10 px-4 py-2 text-sm text-warning-700">{lowCount} bahan berada di bawah/minimum stok.</div>}
      </div>

      <div className="rounded-card border border-cream-200 bg-white p-4">
        <h2 className="font-semibold">Tambah Bahan</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-5">
          <label className="text-sm">
            <span className="sr-only">Nama bahan</span>
            <input placeholder="Nama" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="min-h-11 w-full rounded-control border border-cream-200 px-3 py-2" />
          </label>
          <label className="text-sm">
            <span className="sr-only">Satuan</span>
            <input placeholder="Satuan (kg/pcs/ltr)" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="min-h-11 w-full rounded-control border border-cream-200 px-3 py-2" />
          </label>
          <label className="text-sm">
            <span className="sr-only">Stok awal</span>
            <input type="number" step="0.001" placeholder="Stok awal" value={form.current_stock} onChange={e => setForm({ ...form, current_stock: e.target.value })} className="min-h-11 w-full rounded-control border border-cream-200 px-3 py-2" />
          </label>
          <label className="text-sm">
            <span className="sr-only">Minimum stok</span>
            <input type="number" step="0.001" placeholder="Min stok" value={form.min_stock} onChange={e => setForm({ ...form, min_stock: e.target.value })} className="min-h-11 w-full rounded-control border border-cream-200 px-3 py-2" />
          </label>
          <button type="button" onClick={() => create.mutate()} disabled={!form.name || !form.unit || create.isPending} className="inline-flex min-h-11 items-center justify-center rounded-control bg-brand-900 px-4 py-2 font-semibold text-white disabled:opacity-50">{create.isPending ? 'Menyimpan...' : 'Simpan'}</button>
        </div>
        {create.isError && <p role="alert" className="mt-2 text-sm text-danger">Gagal menyimpan bahan. Periksa input lalu coba lagi.</p>}
      </div>

      {isError ? (
        <ErrorState message="Data inventaris gagal dimuat." onRetry={() => void refetch()} />
      ) : isLoading ? (
        <LoadingState label="Memuat inventaris..." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-cream-200 bg-white">
          <p className="px-3 pt-2 text-xs text-ink-600 md:hidden">Geser tabel untuk melihat semua kolom.</p>
          <table className="min-w-[720px] w-full text-sm">
            <thead className="bg-cream-50 text-left text-ink-600">
              <tr>
                <th scope="col" className="p-3">Nama</th>
                <th scope="col" className="p-3">Stok</th>
                <th scope="col" className="p-3">Min</th>
                <th scope="col" className="p-3">Status</th>
                <th scope="col" className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i.id} className="border-t border-cream-200">
                  <td className="p-3 font-medium">{i.name}</td>
                  <td className="p-3">{i.current_stock} {i.unit}</td>
                  <td className="p-3">{i.min_stock} {i.unit}</td>
                  <td className="p-3">{i.is_low_stock ? <span className="rounded bg-warning/15 px-2 py-0.5 text-xs text-warning-700">Stok rendah</span> : <span className="rounded bg-success/15 px-2 py-0.5 text-xs text-success">Aman</span>}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => { setAdjustFor(i); setAdj({ type: 'IN', quantity: '', balance_after: String(i.current_stock), reason: '', notes: '' }) }} className="inline-flex min-h-11 items-center rounded-control border border-cream-200 px-3 py-1">Sesuaikan</button>
                      <button type="button" onClick={() => setViewId(viewId === i.id ? null : i.id)} aria-expanded={viewId === i.id} className="inline-flex min-h-11 items-center rounded-control border border-cream-200 px-3 py-1">Riwayat</button>
                      <button type="button" onClick={() => { if (confirm('Hapus/nonaktifkan bahan ini?')) remove.mutate(i.id) }} className="inline-flex min-h-11 items-center rounded-control border border-danger/30 px-3 py-1 text-danger">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!items.length && <tr><td className="p-4 text-ink-600" colSpan={5}>Belum ada bahan.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {remove.isError && <p role="alert" className="text-sm text-danger">Gagal menghapus bahan. Coba lagi.</p>}

      {adjustFor && (
        <div className="rounded-card border border-cream-200 bg-white p-4">
          <h2 className="font-semibold">Penyesuaian Stok: {adjustFor.name}</h2>
          <div className="mt-3 grid gap-2 md:grid-cols-5">
            <label className="text-sm">
              <span className="sr-only">Tipe penyesuaian</span>
              <select value={adj.type} onChange={e => setAdj({ ...adj, type: e.target.value })} className="min-h-11 w-full rounded-control border border-cream-200 px-3 py-2">
                <option value="IN">Masuk (IN)</option>
                <option value="OUT">Keluar (OUT)</option>
                <option value="ADJUSTMENT">Koreksi (set saldo)</option>
              </select>
            </label>
            {adj.type === 'ADJUSTMENT' ? (
              <label className="text-sm">
                <span className="sr-only">Saldo baru</span>
                <input type="number" step="0.001" placeholder="Saldo baru" value={adj.balance_after} onChange={e => setAdj({ ...adj, balance_after: e.target.value })} className="min-h-11 w-full rounded-control border border-cream-200 px-3 py-2" />
              </label>
            ) : (
              <label className="text-sm">
                <span className="sr-only">Jumlah penyesuaian</span>
                <input type="number" step="0.001" placeholder="Jumlah" value={adj.quantity} onChange={e => setAdj({ ...adj, quantity: e.target.value })} className="min-h-11 w-full rounded-control border border-cream-200 px-3 py-2" />
              </label>
            )}
            <label className="text-sm">
              <span className="sr-only">Alasan</span>
              <input placeholder="Alasan" value={adj.reason} onChange={e => setAdj({ ...adj, reason: e.target.value })} className="min-h-11 w-full rounded-control border border-cream-200 px-3 py-2" />
            </label>
            <label className="text-sm">
              <span className="sr-only">Catatan</span>
              <input placeholder="Catatan" value={adj.notes} onChange={e => setAdj({ ...adj, notes: e.target.value })} className="min-h-11 w-full rounded-control border border-cream-200 px-3 py-2" />
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => adjust.mutate()} disabled={adjust.isPending} className="inline-flex min-h-11 items-center rounded-control bg-brand-900 px-4 py-2 font-semibold text-white disabled:opacity-50">{adjust.isPending ? 'Menyimpan...' : 'Simpan'}</button>
              <button type="button" onClick={() => setAdjustFor(null)} className="inline-flex min-h-11 items-center rounded-control border border-cream-200 px-4 py-2">Batal</button>
            </div>
          </div>
          {adjust.isError && <p role="alert" className="mt-2 text-sm text-danger">{adjustError?.response?.data?.message || 'Gagal menyesuaikan stok.'}</p>}
        </div>
      )}

      {viewId && (
        <div className="rounded-card border border-cream-200 bg-white p-4">
          <h2 className="font-semibold">Riwayat Pergerakan</h2>
          {movements.isError ? (
            <div className="mt-2"><ErrorState message="Riwayat gagal dimuat." onRetry={() => void movements.refetch()} /></div>
          ) : movements.isLoading ? (
            <p role="status" className="mt-2 text-ink-600">Memuat riwayat...</p>
          ) : (
            <div className="mt-2 overflow-x-auto">
              <p className="px-3 pt-2 text-xs text-ink-600 md:hidden">Geser tabel untuk melihat semua kolom.</p>
              <table className="min-w-[640px] w-full text-sm">
                <thead className="text-left text-ink-600">
                  <tr>
                    <th scope="col" className="p-2">Waktu</th>
                    <th scope="col" className="p-2">Tipe</th>
                    <th scope="col" className="p-2">Qty</th>
                    <th scope="col" className="p-2">Saldo</th>
                    <th scope="col" className="p-2">Alasan</th>
                  </tr>
                </thead>
                <tbody>
                  {(movements.data || []).map(m => (
                    <tr key={m.id} className="border-t border-cream-200">
                      <td className="p-2">{new Date(m.created_at).toLocaleString('id-ID')}</td>
                      <td className="p-2">{m.type}</td>
                      <td className="p-2">{m.quantity}</td>
                      <td className="p-2">{m.balance_before} → {m.balance_after}</td>
                      <td className="p-2">{m.reason}{m.notes ? ` - ${m.notes}` : ''}</td>
                    </tr>
                  ))}
                  {!(movements.data || []).length && <tr><td className="p-2 text-ink-600" colSpan={5}>Belum ada riwayat.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
