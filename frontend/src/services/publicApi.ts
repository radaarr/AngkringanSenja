import type { Category, Product } from '@/types/menu'

export type Resource<T> = { data: T }

export const publicApi = {
  categories: async (): Promise<Category[]> => {
    const res = await fetch('/api/v1/categories')
    const json: Resource<Category[]> = await res.json()
    return json.data
  },
  products: async (params?: { category?: string; search?: string; featured?: boolean }): Promise<Product[]> => {
    const q = new URLSearchParams()
    if (params?.category) q.set('category', params.category)
    if (params?.search) q.set('search', params.search)
    if (params?.featured) q.set('featured', '1')
    const res = await fetch(`/api/v1/products${q.toString() ? `?${q}` : ''}`)
    const json: Resource<Product[]> = await res.json()
    return json.data
  },
  product: async (slug: string): Promise<Product> => {
    const res = await fetch(`/api/v1/products/${slug}`)
    if (!res.ok) throw new Error('not found')
    const json: Resource<Product> = await res.json()
    return json.data
  },
}
