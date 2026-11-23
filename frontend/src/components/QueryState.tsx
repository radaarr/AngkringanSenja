import { AlertCircle, Loader2, RefreshCw } from 'lucide-react'

export function LoadingState({ label = 'Memuat data...', compact = false }: { label?: string; compact?: boolean }) {
  return (
    <div role="status" className={`flex items-center gap-2 text-sm text-ink-600 ${compact ? '' : 'rounded-card border border-cream-200 bg-white p-5'}`}>
      <Loader2 size={16} className="animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function ErrorState({ message = 'Data gagal dimuat.', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-card border border-danger/20 bg-danger/5 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2 text-sm text-danger">
        <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p>{message}</p>
      </div>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-control border border-danger/30 bg-white px-4 py-2 text-sm font-semibold text-danger hover:bg-danger/10">
          <RefreshCw size={16} aria-hidden="true" />
          Coba lagi
        </button>
      ) : null}
    </div>
  )
}
