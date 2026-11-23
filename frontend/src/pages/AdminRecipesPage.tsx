import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/services/adminApi'
import { inventoryApi, type Ingredient } from '@/services/adminExtraApi'
import { ErrorState, LoadingState } from '@/components/QueryState'
import type { Product } from '@/types/menu'

type Line = { ingredient_id: number; quantity_required: string; unit: string }
type RecipeRow = { ingredient_id: number; quantity_required: number | string; unit?: string | null; ingredient?: { unit?: string | null } }
type RecipeResponse = { recipes?: RecipeRow[] }

export function AdminRecipesPage() {
  const qc = useQueryClient()
  const { data: products = [], isLoading: productsLoading, isError: productsError, refetch: refetchProducts } = useQuery({ queryKey: ['admin-products'], queryFn: adminApi.products })
  const { data: ingredients = [], isLoading: ingredientsLoading, isError: ingredientsError, refetch: refetchIngredients } = useQuery<Ingredient[]>({ queryKey: ['ingredients'], queryFn: inventoryApi.ingredients })
  const [productId, setProductId] = useState<number | ''>('')
  const [lines, setLines] = useState<Line[]>([])

  const recipe = useQuery<RecipeResponse>({
    queryKey: ['recipe', productId],
    queryFn: () => inventoryApi.getRecipe(Number(productId)),
    enabled: !!productId,
  })

  useEffect(() => {
    if (recipe.data?.recipes) {
      setLines(recipe.data.recipes.map((r) => ({ ingredient_id: r.ingredient_id, quantity_required: String(r.quantity_required), unit: r.unit || r.ingredient?.unit || '' })))
    } else if (productId) {
      setLines([])
    }
  }, [recipe.data, productId])

  const save = useMutation({
    mutationFn: () => inventoryApi.saveRecipe(Number(productId), lines.map(l => ({ ingredient_id: Number(l.ingredient_id), quantity_required: Number(l.quantity_required), unit: l.unit }))),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipe', productId] }),
  })

  const ingredientMap = useMemo(() => new Map(ingredients.map(i => [i.id, i])), [ingredients])
  const saveError = save.error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } } | null
  const recipeError = saveError?.response?.data?.errors?.items?.[0] || saveError?.response?.data?.message

  function addLine() {
    setLines(l => [...l, { ingredient_id: ingredients[0]?.id || 0, quantity_required: '1', unit: ingredients[0]?.unit || '' }])
    save.reset()
  }

  function update(i: number, patch: Partial<Line>) {
    setLines(ls => ls.map((l, idx) => {
      if (idx !== i) return l
      const next = { ...l, ...patch }
      if (patch.ingredient_id) next.unit = ingredientMap.get(Number(patch.ingredient_id))?.unit || next.unit
      return next
    }))
    save.reset()
  }

  function removeLine(i: number) {
    setLines(ls => ls.filter((_, idx) => idx !== i))
    save.reset()
  }

  const productList: Product[] = products

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-brand-900">Resep / BOM Produk</h1>
        <p className="text-ink-600">Tentukan kebutuhan bahan per porsi produk untuk perhitungan stok otomatis.</p>
      </div>

      {productsError && <ErrorState message="Daftar produk gagal dimuat." onRetry={() => void refetchProducts()} />}
      {ingredientsError && <ErrorState message="Daftar bahan gagal dimuat." onRetry={() => void refetchIngredients()} />}

      <div className="rounded-card border border-cream-200 bg-white p-4">
        <label className="block text-sm font-medium">Pilih Produk
          <select value={productId} onChange={e => setProductId(e.target.value ? Number(e.target.value) : '')} disabled={productsLoading || productsError} className="mt-1 min-h-11 w-full max-w-md rounded-control border border-cream-200 px-3 py-2 disabled:opacity-50">
            <option value="">Pilih produk</option>
            {productList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        {productsLoading && <p role="status" className="mt-2 text-xs text-ink-600">Memuat produk...</p>}
      </div>

      {productId ? (
        <div className="rounded-card border border-cream-200 bg-white p-4">
          {recipe.isError ? (
            <ErrorState message="Resep gagal dimuat." onRetry={() => void recipe.refetch()} />
          ) : recipe.isLoading ? (
            <LoadingState label="Memuat resep..." compact />
          ) : (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold">Komposisi Bahan</h2>
                <button type="button" onClick={addLine} disabled={!ingredients.length || ingredientsLoading || ingredientsError} className="inline-flex min-h-11 items-center rounded-control border border-cream-200 px-3 py-2 text-sm disabled:opacity-50">+ Tambah Bahan</button>
              </div>
              {!ingredients.length && !ingredientsLoading && !ingredientsError && <p className="text-sm text-warning-700">Tambahkan bahan di menu Inventaris terlebih dahulu.</p>}
              <div className="space-y-2">
                {lines.map((line, i) => (
                  <div key={i} className="grid items-center gap-2 md:grid-cols-[1fr_140px_120px_80px]">
                    <label>
                      <span className="sr-only">Bahan baris {i + 1}</span>
                      <select value={line.ingredient_id} onChange={e => update(i, { ingredient_id: Number(e.target.value) })} className="min-h-11 w-full rounded-control border border-cream-200 px-3 py-2">
                        {ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>)}
                      </select>
                    </label>
                    <label>
                      <span className="sr-only">Jumlah bahan baris {i + 1}</span>
                      <input type="number" step="0.001" min="0" value={line.quantity_required} onChange={e => update(i, { quantity_required: e.target.value })} className="min-h-11 w-full rounded-control border border-cream-200 px-3 py-2" placeholder="Qty" />
                    </label>
                    <label>
                      <span className="sr-only">Satuan bahan baris {i + 1}</span>
                      <input value={line.unit} onChange={e => update(i, { unit: e.target.value })} className="min-h-11 w-full rounded-control border border-cream-200 px-3 py-2" placeholder="Satuan" />
                    </label>
                    <button type="button" onClick={() => removeLine(i)} aria-label={`Hapus bahan baris ${i + 1}`} className="inline-flex min-h-11 items-center justify-center rounded-control border border-danger/20 px-3 text-sm text-danger hover:bg-danger/10">Hapus</button>
                  </div>
                ))}
                {!lines.length && <p className="text-sm text-ink-600">Belum ada bahan. Produk ini tidak akan mengurangi stok otomatis.</p>}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => save.mutate()} disabled={save.isPending || lines.some(l => !l.ingredient_id || Number(l.quantity_required) <= 0)} className="inline-flex min-h-11 items-center rounded-control bg-brand-900 px-4 py-2 font-semibold text-white disabled:opacity-50">{save.isPending ? 'Menyimpan...' : 'Simpan Resep'}</button>
                {save.isSuccess && <span role="status" className="text-sm text-success">Resep tersimpan.</span>}
                {save.isError && <span role="alert" className="text-sm text-danger">{recipeError || 'Gagal menyimpan resep.'}</span>}
              </div>
            </>
          )}
        </div>
      ) : <p className="text-ink-600">Pilih produk untuk mengelola resep.</p>}
    </div>
  )
}
