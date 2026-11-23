import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import { adminApi } from '@/services/adminApi'
import { publicApi } from '@/services/publicApi'
import { ErrorState, LoadingState } from '@/components/QueryState'
import { Modal } from '@/components/Modal'
import type { Product } from '@/types/menu'

function formatIdr(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export function AdminProductsPage() {
  const qc = useQueryClient()
  const { data: products = [], isLoading, isError, refetch } = useQuery({ queryKey: ['admin-products'], queryFn: adminApi.products })
  const { data: categories = [], isError: categoriesError, refetch: refetchCategories } = useQuery({ queryKey: ['categories'], queryFn: publicApi.categories })
  const [editing, setEditing] = useState<Product | null>(null)
  const [open, setOpen] = useState(false)

  const save = useMutation({
    mutationFn: async (fd: FormData) => editing ? adminApi.updateProduct(editing.id, fd) : adminApi.createProduct(fd),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); setOpen(false); setEditing(null) },
  })
  const archive = useMutation({ mutationFn: (id: number) => adminApi.archiveProduct(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }) })
  const restore = useMutation({ mutationFn: (id: number) => adminApi.restoreProduct(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }) })

  function close() {
    setOpen(false)
    setEditing(null)
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    if (!fd.get('is_available')) fd.append('is_available', '0')
    if (!fd.get('is_featured')) fd.append('is_featured', '0')
    save.mutate(fd)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-brand-900">Produk</h1>
        <button type="button" onClick={() => { setEditing(null); setOpen(true) }} className="inline-flex min-h-11 items-center rounded-control bg-brand-900 px-4 py-2 text-sm font-semibold text-white">Tambah Produk</button>
      </div>

      {isError ? (
        <div className="mt-6"><ErrorState message="Produk gagal dimuat." onRetry={() => void refetch()} /></div>
      ) : isLoading ? (
        <div className="mt-6"><LoadingState label="Memuat produk..." /></div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-card border border-cream-200 bg-white">
          <p className="px-3 pt-2 text-xs text-ink-600 md:hidden">Geser tabel untuk melihat semua kolom.</p>
          <table className="min-w-[640px] w-full text-sm">
            <thead className="bg-cream-100 text-left text-ink-600">
              <tr>
                <th scope="col" className="p-3">Nama</th>
                <th scope="col" className="p-3">Kategori</th>
                <th scope="col" className="p-3">Harga</th>
                <th scope="col" className="p-3">Status</th>
                <th scope="col" className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-t border-cream-200">
                  <td className="p-3 font-medium">
                    {p.name}
                    {p.is_featured && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs text-terracotta-700">
                        <Star size={12} fill="currentColor" aria-hidden="true" />
                        Unggulan
                      </span>
                    )}
                  </td>
                  <td className="p-3">{p.category?.name || '-'}</td>
                  <td className="p-3">{formatIdr(p.price)}</td>
                  <td className="p-3">{p.archived_at ? <span className="text-ink-600">Diarsipkan</span> : p.is_available ? <span className="text-success">Tersedia</span> : <span className="text-danger">Habis</span>}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-x-3">
                      <button type="button" onClick={() => { setEditing(p); setOpen(true) }} className="inline-flex min-h-11 items-center text-brand-900 underline">Edit</button>
                      {p.archived_at
                        ? <button type="button" onClick={() => restore.mutate(p.id)} className="inline-flex min-h-11 items-center text-info underline">Pulihkan</button>
                        : <button type="button" onClick={() => archive.mutate(p.id)} className="inline-flex min-h-11 items-center text-danger underline">Arsipkan</button>}
                    </div>
                  </td>
                </tr>
              ))}
              {!products.length && <tr><td colSpan={5} className="p-6 text-center text-ink-600">Belum ada produk.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {archive.isError && <p role="alert" className="mt-3 text-sm text-danger">Gagal mengarsipkan produk. Coba lagi.</p>}
      {restore.isError && <p role="alert" className="mt-3 text-sm text-danger">Gagal memulihkan produk. Coba lagi.</p>}

      <Modal open={open} onClose={close} title={editing ? 'Edit Produk' : 'Tambah Produk'} size="md">
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm">Nama
            <input name="name" defaultValue={editing?.name} required autoComplete="off" data-autofocus className="mt-1 min-h-11 w-full rounded-control border border-cream-200 px-3 py-2" />
          </label>
          <label className="block text-sm">Kategori
            <select name="category_id" defaultValue={editing?.category_id} required className="mt-1 min-h-11 w-full rounded-control border border-cream-200 px-3 py-2">
              <option value="">Pilih</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          {categoriesError && (
            <p role="alert" className="text-sm text-danger">Kategori gagal dimuat. <button type="button" onClick={() => void refetchCategories()} className="font-semibold underline">Coba lagi</button></p>
          )}
          <label className="block text-sm">Harga
            <input name="price" type="number" min="0" step="0.01" defaultValue={editing?.price} required className="mt-1 min-h-11 w-full rounded-control border border-cream-200 px-3 py-2" />
          </label>
          <label className="block text-sm">Deskripsi
            <textarea name="description" defaultValue={editing?.description || ''} rows={3} className="mt-1 w-full rounded-control border border-cream-200 px-3 py-2" />
          </label>
          <label className="block text-sm">Gambar
            <input name="image" type="file" accept="image/*" className="mt-1 min-h-11 w-full text-sm" />
          </label>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="inline-flex min-h-11 items-center gap-2"><input type="checkbox" name="is_available" value="1" defaultChecked={editing ? editing.is_available : true} /> Tersedia</label>
            <label className="inline-flex min-h-11 items-center gap-2"><input type="checkbox" name="is_featured" value="1" defaultChecked={editing?.is_featured} /> Unggulan</label>
          </div>
          {save.isError && <p role="alert" className="text-sm text-danger">Gagal menyimpan produk. Periksa input lalu coba lagi.</p>}
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button type="button" onClick={close} className="inline-flex min-h-11 items-center rounded-control border border-cream-200 px-4 py-2">Batal</button>
            <button type="submit" disabled={save.isPending} className="inline-flex min-h-11 items-center rounded-control bg-brand-900 px-4 py-2 font-semibold text-white disabled:opacity-50">{save.isPending ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
