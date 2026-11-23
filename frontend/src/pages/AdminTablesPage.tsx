import { useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QRCodeCanvas } from 'qrcode.react'
import { Printer, RefreshCw, Plus, Trash2, Edit2, Download } from 'lucide-react'
import { adminExtraApi, type AdminTable } from '@/services/adminExtraApi'
import { ErrorState, LoadingState } from '@/components/QueryState'

export function AdminTablesPage() {
  const qc = useQueryClient()
  const { data = [], isLoading, isError, refetch } = useQuery({ queryKey: ['admin-tables'], queryFn: adminExtraApi.tables })
  const [editing, setEditing] = useState<AdminTable | null>(null)
  const [form, setForm] = useState({ name: '', code: '', is_active: true })
  const [qrTable, setQrTable] = useState<AdminTable | null>(null)
  const qrRef = useRef<HTMLDivElement>(null)

  const origin = window.location.origin

  function escapeHtml(value: string) {
    const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
    return value.replace(/[&<>"']/g, char => entities[char] ?? char)
  }

  const saveMut = useMutation({
    mutationFn: () => editing ? adminExtraApi.updateTable(editing.id, form) : adminExtraApi.createTable(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tables'] }); setEditing(null); setForm({ name: '', code: '', is_active: true }) },
  })
  const delMut = useMutation({ mutationFn: (id: number) => adminExtraApi.deleteTable(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-tables'] }) })
  const regenMut = useMutation({ mutationFn: (id: number) => adminExtraApi.regenerateTable(id), onSuccess: (t: AdminTable) => { qc.invalidateQueries({ queryKey: ['admin-tables'] }); setQrTable(t) } })

  function openNew() { setEditing(null); setForm({ name: '', code: '', is_active: true }) }
  function openEdit(t: AdminTable) { setEditing(t); setForm({ name: t.name, code: t.code, is_active: t.is_active }) }

  function printQr() {
    const canvas = qrRef.current?.querySelector('canvas') as HTMLCanvasElement | null
    if (!canvas || !qrTable) return
    const dataUrl = canvas.toDataURL('image/png')
    const w = window.open('', '_blank', 'width=420,height=560')
    if (!w) return
    const name = escapeHtml(qrTable.name)
    const code = escapeHtml(qrTable.code)
    const url = escapeHtml(`${origin}/?table=${qrTable.qr_token}`)
    w.document.write(`<!doctype html><html><head><title>QR ${name}</title><style>body{font-family:Arial,sans-serif;text-align:center;padding:24px}img{width:280px;height:280px}h1{margin:8px 0 4px;font-size:22px}p{margin:4px 0;color:#555;word-break:break-all}</style></head><body><h1>${name}</h1><p>Kode: ${code}</p><img src="${dataUrl}"/><p>${url}</p><script>window.onload=()=>{window.print();window.close();}</script></body></html>`)
    w.document.close()
  }

  function downloadQr() {
    const canvas = qrRef.current?.querySelector('canvas') as HTMLCanvasElement | null
    if (!canvas || !qrTable) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `qr-${qrTable.code}.png`
    a.click()
  }

  const qrUrl = useMemo(() => qrTable ? `${origin}/?table=${qrTable.qr_token}` : '', [qrTable, origin])

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-brand-900">Kelola Meja</h1>
          <p className="text-sm text-ink-600">Tambah meja, cetak QR per meja, dan regenerate token jika perlu.</p>
        </div>
        <button type="button" onClick={openNew} className="inline-flex min-h-11 items-center gap-2 rounded-control bg-brand-900 px-4 py-2 text-sm font-semibold text-white"><Plus size={16} aria-hidden="true" /> Tambah Meja</button>
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-x-auto rounded-feature border border-cream-200 bg-white">
          <p className="px-3 pt-2 text-xs text-ink-600 md:hidden">Geser tabel untuk melihat semua kolom.</p>
          {isError ? (
            <div className="p-4"><ErrorState message="Daftar meja gagal dimuat." onRetry={() => void refetch()} /></div>
          ) : isLoading ? (
            <div className="p-4"><LoadingState label="Memuat meja..." /></div>
          ) : (
            <table className="min-w-[640px] w-full text-sm">
              <thead className="bg-cream-50 text-left text-ink-600"><tr><th scope="col" className="px-4 py-3">Meja</th><th scope="col" className="px-4 py-3">Kode</th><th scope="col" className="px-4 py-3">Status</th><th scope="col" className="px-4 py-3">Aksi</th></tr></thead>
              <tbody>
                {data.map(t => (
                  <tr key={t.id} className="border-t border-cream-100">
                    <td className="px-4 py-3 font-medium text-brand-900">{t.name}</td>
                    <td className="px-4 py-3">{t.code}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${t.is_active ? 'bg-success/10 text-success' : 'bg-cream-200 text-ink-600'}`}>{t.is_active ? 'Aktif' : 'Nonaktif'}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => setQrTable(t)} className="inline-flex min-h-11 items-center gap-1 rounded-control border border-cream-200 px-3 py-2 hover:bg-cream-50"><Printer size={14} aria-hidden="true" /> QR</button>
                        <button type="button" onClick={() => openEdit(t)} className="inline-flex min-h-11 items-center gap-1 rounded-control border border-cream-200 px-3 py-2 hover:bg-cream-50"><Edit2 size={14} aria-hidden="true" /> Ubah</button>
                        <button type="button" onClick={() => { if (confirm('Regenerate token QR meja ini? QR lama tidak berlaku.')) regenMut.mutate(t.id) }} className="inline-flex min-h-11 items-center gap-1 rounded-control border border-cream-200 px-3 py-2 hover:bg-cream-50"><RefreshCw size={14} aria-hidden="true" /> Regenerate</button>
                        <button type="button" onClick={() => { if (confirm('Hapus meja ini?')) delMut.mutate(t.id) }} className="inline-flex min-h-11 items-center gap-1 rounded-control border border-danger/20 px-3 py-2 text-danger hover:bg-danger/10"><Trash2 size={14} aria-hidden="true" /> Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!data.length && <tr><td colSpan={4} className="px-4 py-8 text-center text-ink-600">Belum ada meja.</td></tr>}
              </tbody>
            </table>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-feature border border-cream-200 bg-white p-4">
            <h2 className="mb-3 font-display text-lg font-semibold text-brand-900">{editing ? 'Ubah Meja' : 'Tambah Meja'}</h2>
            <form onSubmit={e => { e.preventDefault(); saveMut.mutate() }} className="space-y-3">
              <label className="block text-sm font-medium">Nama<input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required autoComplete="off" className="mt-1 min-h-11 w-full rounded-control border border-cream-200 px-3 py-2" placeholder="Meja 1" /></label>
              <label className="block text-sm font-medium">Kode<input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required autoComplete="off" className="mt-1 min-h-11 w-full rounded-control border border-cream-200 px-3 py-2" placeholder="M1" /></label>
              <label className="inline-flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-brand-900" /> Aktif</label>
              <div className="flex flex-wrap gap-2">
                <button type="submit" disabled={saveMut.isPending || !form.name || !form.code} className="inline-flex min-h-11 items-center rounded-control bg-brand-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saveMut.isPending ? 'Menyimpan...' : 'Simpan'}</button>
                {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', code: '', is_active: true }) }} className="inline-flex min-h-11 items-center rounded-control border border-cream-200 px-4 py-2 text-sm">Batal</button>}
              </div>
              {saveMut.isError && <p role="alert" className="text-sm text-danger">Gagal menyimpan. Pastikan kode unik.</p>}
            </form>
          </div>

          <div className="rounded-feature border border-cream-200 bg-white p-4">
            <h2 className="mb-3 font-display text-lg font-semibold text-brand-900">QR Meja</h2>
            {qrTable ? (
              <div className="text-center">
                <div ref={qrRef} className="inline-block rounded-control border border-cream-200 bg-white p-3"><QRCodeCanvas value={qrUrl} size={220} includeMargin /></div>
                <div className="mt-2 font-semibold text-brand-900">{qrTable.name} ({qrTable.code})</div>
                <div className="mt-1 break-all text-xs text-ink-600">{qrUrl}</div>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <button type="button" onClick={printQr} className="inline-flex min-h-11 items-center gap-1 rounded-control bg-brand-900 px-3 py-2 text-sm font-semibold text-white"><Printer size={14} aria-hidden="true" /> Cetak</button>
                  <button type="button" onClick={downloadQr} className="inline-flex min-h-11 items-center gap-1 rounded-control border border-cream-200 px-3 py-2 text-sm"><Download size={14} aria-hidden="true" /> Unduh PNG</button>
                </div>
              </div>
            ) : <p className="text-sm text-ink-600">Pilih QR pada meja untuk melihat dan mencetak kode QR.</p>}
          </div>
        </div>
      </div>

      {delMut.isError && <p role="alert" className="text-sm text-danger">Gagal menghapus meja. Coba lagi.</p>}
      {regenMut.isError && <p role="alert" className="text-sm text-danger">Gagal regenerate token QR. Coba lagi.</p>}
    </div>
  )
}
