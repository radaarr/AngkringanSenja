import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { promotionApi, type Promotion } from '@/services/adminExtraApi'
import { ErrorState, LoadingState } from '@/components/QueryState'
import { Modal } from '@/components/Modal'

type PromotionForm = {
  name: string
  code: string
  type: 'PERCENTAGE' | 'FIXED'
  value: string
  min_order: string
  starts_at: string
  ends_at: string
  is_active: boolean
}

const empty: PromotionForm = { name: '', code: '', type: 'PERCENTAGE', value: '', min_order: '0', starts_at: '', ends_at: '', is_active: true }

export function AdminPromotionsPage() {
  const qc = useQueryClient()
  const { data: items = [], isLoading, isError, refetch } = useQuery({ queryKey: ['promotions'], queryFn: promotionApi.list })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Promotion | null>(null)
  const [form, setForm] = useState<PromotionForm>(empty)

  const save = useMutation({
    mutationFn: () => {
      const payload = { ...form, value: Number(form.value), min_order: Number(form.min_order || 0), starts_at: form.starts_at || null, ends_at: form.ends_at || null }
      return editing ? promotionApi.update(editing.id, payload) : promotionApi.create(payload)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['promotions'] }); setOpen(false); setEditing(null); setForm(empty) },
  })
  const remove = useMutation({ mutationFn: (id: number) => promotionApi.remove(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['promotions'] }) })

  function close() {
    setOpen(false)
    setEditing(null)
  }

  function edit(p: Promotion) {
    setEditing(p)
    setForm({ name: p.name, code: p.code, type: p.type, value: String(p.value), min_order: String(p.min_order ?? 0), starts_at: p.starts_at ? String(p.starts_at).slice(0, 16) : '', ends_at: p.ends_at ? String(p.ends_at).slice(0, 16) : '', is_active: p.is_active })
    setOpen(true)
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    save.mutate()
  }

  const saveError = save.error as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } } | null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-900">Promosi</h1>
          <p className="text-ink-600">Kelola kode promo dan diskon (validasi backend saat diterapkan).</p>
        </div>
        <button type="button" onClick={() => { setEditing(null); setForm(empty); setOpen(true) }} className="inline-flex min-h-11 items-center rounded-control bg-brand-900 px-4 py-2 font-semibold text-white">Tambah Promosi</button>
      </div>

      {isError ? (
        <ErrorState message="Promosi gagal dimuat." onRetry={() => void refetch()} />
      ) : isLoading ? (
        <LoadingState label="Memuat promosi..." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-cream-200 bg-white">
          <p className="px-3 pt-2 text-xs text-ink-600 md:hidden">Geser tabel untuk melihat semua kolom.</p>
          <table className="min-w-[760px] w-full text-sm">
            <thead className="bg-cream-50 text-left text-ink-600">
              <tr>
                <th scope="col" className="p-3">Nama/Kode</th>
                <th scope="col" className="p-3">Diskon</th>
                <th scope="col" className="p-3">Min. Order</th>
                <th scope="col" className="p-3">Periode</th>
                <th scope="col" className="p-3">Status</th>
                <th scope="col" className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map(p => (
                <tr key={p.id} className="border-t border-cream-200">
                  <td className="p-3"><div className="font-medium">{p.name}</div><div className="text-xs text-ink-600">{p.code}</div></td>
                  <td className="p-3">{p.type === 'PERCENTAGE' ? `${p.value}%` : `Rp ${Number(p.value).toLocaleString('id-ID')}`}</td>
                  <td className="p-3">Rp {Number(p.min_order).toLocaleString('id-ID')}</td>
                  <td className="p-3 text-xs text-ink-600">{p.starts_at ? String(p.starts_at).slice(0, 10) : '-'} s/d {p.ends_at ? String(p.ends_at).slice(0, 10) : '-'}</td>
                  <td className="p-3">{p.is_currently_active ? <span className="text-success">Aktif</span> : <span className="text-ink-600">Nonaktif/di luar periode</span>}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-x-3">
                      <button type="button" onClick={() => edit(p)} className="inline-flex min-h-11 items-center text-brand-900 underline">Edit</button>
                      <button type="button" onClick={() => { if (confirm('Hapus promosi?')) remove.mutate(p.id) }} className="inline-flex min-h-11 items-center text-danger underline">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!items.length && <tr><td className="p-4 text-ink-600" colSpan={6}>Belum ada promosi.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {remove.isError && <p role="alert" className="text-sm text-danger">Gagal menghapus promosi. Coba lagi.</p>}

      <Modal open={open} onClose={close} title={`${editing ? 'Edit' : 'Tambah'} Promosi`} size="md">
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm">Nama
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required autoComplete="off" data-autofocus className="mt-1 min-h-11 w-full rounded-control border border-cream-200 px-3 py-2" />
          </label>
          <label className="block text-sm">Kode
            <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required autoComplete="off" className="mt-1 min-h-11 w-full rounded-control border border-cream-200 px-3 py-2 uppercase" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">Tipe
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as PromotionForm['type'] })} className="mt-1 min-h-11 w-full rounded-control border border-cream-200 px-3 py-2">
                <option value="PERCENTAGE">Persentase (%)</option>
                <option value="FIXED">Nominal (Rp)</option>
              </select>
            </label>
            <label className="block text-sm">Nilai
              <input type="number" min="0" step="0.01" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} required className="mt-1 min-h-11 w-full rounded-control border border-cream-200 px-3 py-2" />
            </label>
          </div>
          <label className="block text-sm">Minimum order
            <input type="number" min="0" step="0.01" value={form.min_order} onChange={e => setForm({ ...form, min_order: e.target.value })} className="mt-1 min-h-11 w-full rounded-control border border-cream-200 px-3 py-2" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">Mulai
              <input type="datetime-local" value={form.starts_at} onChange={e => setForm({ ...form, starts_at: e.target.value })} className="mt-1 min-h-11 w-full rounded-control border border-cream-200 px-3 py-2" />
            </label>
            <label className="block text-sm">Selesai
              <input type="datetime-local" value={form.ends_at} onChange={e => setForm({ ...form, ends_at: e.target.value })} className="mt-1 min-h-11 w-full rounded-control border border-cream-200 px-3 py-2" />
            </label>
          </div>
          <label className="inline-flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> Aktif</label>
          {save.isError && <p role="alert" className="text-sm text-danger">{saveError?.response?.data?.errors?.value?.[0] || saveError?.response?.data?.message || 'Gagal menyimpan promosi.'}</p>}
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button type="button" onClick={close} className="inline-flex min-h-11 items-center rounded-control border border-cream-200 px-4 py-2">Batal</button>
            <button type="submit" disabled={save.isPending || !form.name || !form.code || !form.value} className="inline-flex min-h-11 items-center rounded-control bg-brand-900 px-4 py-2 font-semibold text-white disabled:opacity-50">{save.isPending ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
