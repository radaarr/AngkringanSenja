import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { expenseApi, type Expense } from '@/services/adminExtraApi'
import { ErrorState, LoadingState } from '@/components/QueryState'
import { Modal } from '@/components/Modal'

function formatIdr(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

type ExpenseForm = { category: string; description: string; amount: string; expense_date: string }

const empty: ExpenseForm = { category: '', description: '', amount: '', expense_date: new Date().toISOString().slice(0, 10) }

export function AdminExpensesPage() {
  const qc = useQueryClient()
  const [filters, setFilters] = useState({ category: '', from: '', to: '' })
  const { data: expenses = [], isLoading, isError, refetch } = useQuery({ queryKey: ['expenses', filters], queryFn: () => expenseApi.list(filters) })
  const [form, setForm] = useState<ExpenseForm>(empty)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [open, setOpen] = useState(false)

  const save = useMutation({
    mutationFn: () => editing ? expenseApi.update(editing.id, { ...form, amount: Number(form.amount) }) : expenseApi.create({ ...form, amount: Number(form.amount) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); setOpen(false); setEditing(null); setForm(empty) },
  })
  const remove = useMutation({ mutationFn: (id: number) => expenseApi.remove(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }) })

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0)

  function close() {
    setOpen(false)
    setEditing(null)
  }

  function startEdit(e: Expense) {
    setEditing(e)
    setForm({ category: e.category, description: e.description, amount: String(e.amount), expense_date: String(e.expense_date).slice(0, 10) })
    setOpen(true)
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    save.mutate()
  }

  const saveError = save.error as { response?: { data?: { message?: string } } } | null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-900">Pengeluaran</h1>
          <p className="text-ink-600">Catat dan pantau biaya operasional.</p>
        </div>
        <button type="button" onClick={() => { setEditing(null); setForm(empty); setOpen(true) }} className="inline-flex min-h-11 items-center rounded-control bg-brand-900 px-4 py-2 font-semibold text-white">Tambah Pengeluaran</button>
      </div>

      <div className="flex flex-wrap items-end gap-2 rounded-card border border-cream-200 bg-white p-4">
        <label className="text-sm">Kategori
          <input placeholder="Filter kategori" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })} className="mt-1 block min-h-11 rounded-control border border-cream-200 px-3 py-2 text-sm" />
        </label>
        <label className="text-sm">Dari
          <input type="date" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })} className="mt-1 block min-h-11 rounded-control border border-cream-200 px-3 py-2 text-sm" />
        </label>
        <label className="text-sm">Sampai
          <input type="date" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })} className="mt-1 block min-h-11 rounded-control border border-cream-200 px-3 py-2 text-sm" />
        </label>
        <div className="ml-auto text-sm font-medium">Total: <span className="text-brand-900">{isError ? '-' : formatIdr(total)}</span></div>
      </div>

      {isError ? (
        <ErrorState message="Pengeluaran gagal dimuat." onRetry={() => void refetch()} />
      ) : isLoading ? (
        <LoadingState label="Memuat pengeluaran..." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-cream-200 bg-white">
          <p className="px-3 pt-2 text-xs text-ink-600 md:hidden">Geser tabel untuk melihat semua kolom.</p>
          <table className="min-w-[680px] w-full text-sm">
            <thead className="bg-cream-50 text-left text-ink-600">
              <tr>
                <th scope="col" className="p-3">Tanggal</th>
                <th scope="col" className="p-3">Kategori</th>
                <th scope="col" className="p-3">Deskripsi</th>
                <th scope="col" className="p-3">Jumlah</th>
                <th scope="col" className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e.id} className="border-t border-cream-200">
                  <td className="p-3">{String(e.expense_date).slice(0, 10)}</td>
                  <td className="p-3">{e.category}</td>
                  <td className="p-3">{e.description}</td>
                  <td className="p-3 font-medium">{formatIdr(Number(e.amount))}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-x-3">
                      <button type="button" onClick={() => startEdit(e)} className="inline-flex min-h-11 items-center text-brand-900 underline">Edit</button>
                      <button type="button" onClick={() => { if (confirm('Hapus pengeluaran ini?')) remove.mutate(e.id) }} className="inline-flex min-h-11 items-center text-danger underline">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!expenses.length && <tr><td colSpan={5} className="p-4 text-ink-600">Belum ada data pengeluaran.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {remove.isError && <p role="alert" className="text-sm text-danger">Gagal menghapus pengeluaran. Coba lagi.</p>}

      <Modal open={open} onClose={close} title={`${editing ? 'Edit' : 'Tambah'} Pengeluaran`} size="md">
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm">Kategori
            <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required autoComplete="off" data-autofocus placeholder="Mis. Bahan, Operasional" className="mt-1 min-h-11 w-full rounded-control border border-cream-200 px-3 py-2" />
          </label>
          <label className="block text-sm">Deskripsi
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required autoComplete="off" className="mt-1 min-h-11 w-full rounded-control border border-cream-200 px-3 py-2" />
          </label>
          <label className="block text-sm">Jumlah
            <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required className="mt-1 min-h-11 w-full rounded-control border border-cream-200 px-3 py-2" />
          </label>
          <label className="block text-sm">Tanggal
            <input type="date" value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })} required className="mt-1 min-h-11 w-full rounded-control border border-cream-200 px-3 py-2" />
          </label>
          {save.isError && <p role="alert" className="text-sm text-danger">{saveError?.response?.data?.message || 'Gagal menyimpan pengeluaran.'}</p>}
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button type="button" onClick={close} className="inline-flex min-h-11 items-center rounded-control border border-cream-200 px-4 py-2">Batal</button>
            <button type="submit" disabled={save.isPending || !form.category || !form.description || !form.amount} className="inline-flex min-h-11 items-center rounded-control bg-brand-900 px-4 py-2 font-semibold text-white disabled:opacity-50">{save.isPending ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
