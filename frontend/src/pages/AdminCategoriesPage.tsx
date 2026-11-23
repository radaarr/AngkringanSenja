import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/services/adminApi'
import { ErrorState, LoadingState } from '@/components/QueryState'
import { Modal } from '@/components/Modal'
import type { Category } from '@/types/menu'

export function AdminCategoriesPage() {
  const qc = useQueryClient()
  const { data: categories = [], isLoading, isError, refetch } = useQuery({ queryKey: ['admin-categories'], queryFn: adminApi.categories })
  const [editing, setEditing] = useState<Category | null>(null)
  const [open, setOpen] = useState(false)

  const save = useMutation({
    mutationFn: async (payload: Partial<Category>) => editing ? adminApi.updateCategory(editing.id, payload) : adminApi.createCategory(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); qc.invalidateQueries({ queryKey: ['categories'] }); setOpen(false); setEditing(null) },
  })
  const del = useMutation({ mutationFn: (id: number) => adminApi.deleteCategory(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); qc.invalidateQueries({ queryKey: ['categories'] }) } })

  function close() {
    setOpen(false)
    setEditing(null)
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    save.mutate({ name: String(fd.get('name')), description: String(fd.get('description') || ''), sort_order: Number(fd.get('sort_order') || 0), is_active: fd.get('is_active') === '1' })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-brand-900">Kategori</h1>
        <button type="button" onClick={() => { setEditing(null); setOpen(true) }} className="inline-flex min-h-11 items-center rounded-control bg-brand-900 px-4 py-2 text-sm font-semibold text-white">Tambah Kategori</button>
      </div>

      {isError ? (
        <div className="mt-6"><ErrorState message="Kategori gagal dimuat." onRetry={() => void refetch()} /></div>
      ) : isLoading ? (
        <div className="mt-6"><LoadingState label="Memuat kategori..." /></div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-card border border-cream-200 bg-white">
          <p className="px-3 pt-2 text-xs text-ink-600 md:hidden">Geser tabel untuk melihat semua kolom.</p>
          <table className="min-w-[560px] w-full text-sm">
            <thead className="bg-cream-100 text-left text-ink-600">
              <tr>
                <th scope="col" className="p-3">Nama</th>
                <th scope="col" className="p-3">Slug</th>
                <th scope="col" className="p-3">Aktif</th>
                <th scope="col" className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id} className="border-t border-cream-200">
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3 text-ink-600">{c.slug}</td>
                  <td className="p-3">{c.is_active ? <span className="text-success">Ya</span> : <span className="text-ink-600">Tidak</span>}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-x-3">
                      <button type="button" onClick={() => { setEditing(c); setOpen(true) }} className="inline-flex min-h-11 items-center text-brand-900 underline">Edit</button>
                      <button type="button" onClick={() => { if (confirm('Nonaktifkan kategori ini?')) del.mutate(c.id) }} className="inline-flex min-h-11 items-center text-danger underline">Nonaktifkan</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!categories.length && <tr><td colSpan={4} className="p-6 text-center text-ink-600">Belum ada kategori.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {del.isError && <p role="alert" className="mt-3 text-sm text-danger">Gagal menonaktifkan kategori. Coba lagi.</p>}

      <Modal open={open} onClose={close} title={editing ? 'Edit Kategori' : 'Tambah Kategori'} size="md">
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm">Nama
            <input name="name" defaultValue={editing?.name} required autoComplete="off" data-autofocus className="mt-1 min-h-11 w-full rounded-control border border-cream-200 px-3 py-2" />
          </label>
          <label className="block text-sm">Deskripsi
            <textarea name="description" defaultValue={editing?.description || ''} rows={3} className="mt-1 w-full rounded-control border border-cream-200 px-3 py-2" />
          </label>
          <label className="block text-sm">Urutan
            <input name="sort_order" type="number" min="0" defaultValue={editing?.sort_order ?? 0} className="mt-1 min-h-11 w-full rounded-control border border-cream-200 px-3 py-2" />
          </label>
          <label className="inline-flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="is_active" value="1" defaultChecked={editing ? editing.is_active !== false : true} /> Aktif</label>
          {save.isError && <p role="alert" className="text-sm text-danger">Gagal menyimpan kategori. Periksa input lalu coba lagi.</p>}
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button type="button" onClick={close} className="inline-flex min-h-11 items-center rounded-control border border-cream-200 px-4 py-2">Batal</button>
            <button type="submit" disabled={save.isPending} className="inline-flex min-h-11 items-center rounded-control bg-brand-900 px-4 py-2 font-semibold text-white disabled:opacity-50">{save.isPending ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
