import { api, ensureCsrf } from '@/lib/api'
import type { AuthUser } from '@/stores/authStore'
import type { Category, Product } from '@/types/menu'

export type Resource<T> = { data: T }

export async function login(email: string, password: string) {
  await ensureCsrf()
  const res = await api.post<Resource<any>>('/auth/login', { email, password })
  return res.data.data
}
export async function logout() {
  await api.post('/auth/logout')
}
export async function me(): Promise<AuthUser> {
  const res = await api.get<Resource<AuthUser>>('/auth/me')
  return res.data.data
}

export const adminApi = {
  categories: async (): Promise<Category[]> => (await api.get<Resource<Category[]>>('/admin/categories')).data.data,
  createCategory: async (payload: Partial<Category>) => (await api.post<Resource<Category>>('/admin/categories', payload)).data.data,
  updateCategory: async (id: number, payload: Partial<Category>) => (await api.put<Resource<Category>>(`/admin/categories/${id}`, payload)).data.data,
  deleteCategory: async (id: number) => api.delete(`/admin/categories/${id}`),
  products: async (): Promise<Product[]> => (await api.get<Resource<Product[]>>('/admin/products')).data.data,
  createProduct: async (fd: FormData) => (await api.post<Resource<Product>>('/admin/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } })).data.data,
  updateProduct: async (id: number, fd: FormData) => { fd.append('_method', 'PUT'); return (await api.post<Resource<Product>>(`/admin/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })).data.data },
  archiveProduct: async (id: number) => (await api.post<Resource<Product>>(`/admin/products/${id}/archive`)).data.data,
  restoreProduct: async (id: number) => (await api.post<Resource<Product>>(`/admin/products/${id}/restore`)).data.data,
}
