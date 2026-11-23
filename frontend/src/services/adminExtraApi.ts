import { api } from '@/lib/api'

export type Ingredient = { id: number; name: string; unit: string; current_stock: number; min_stock: number; is_active: boolean; is_low_stock: boolean }
export type Movement = { id: number; type: 'IN'|'OUT'|'ADJUSTMENT'; quantity: number; balance_before: number; balance_after: number; reason?: string|null; notes?: string|null; created_at: string }
export type Expense = { id: number; category: string; description: string; amount: number; expense_date: string }
export type Promotion = { id: number; name: string; code: string; type: 'PERCENTAGE'|'FIXED'; value: number; min_order: number; starts_at?: string|null; ends_at?: string|null; is_active: boolean; is_currently_active?: boolean }
export type Dashboard = { range: {from:string;to:string}; sales_total: number; orders_count: number; avg_order: number; expenses_total: number; profit_estimate: number; low_stock_count: number; orders_by_status: Record<string,number>; daily_sales: { date: string; total: number }[]; top_products: { product_name: string; qty: number; revenue: number }[] }
export type AdminTable = { id: number; name: string; code: string; qr_token: string; is_active: boolean }

const data = <T,>(r: any): T => r.data.data as T

export const inventoryApi = {
  ingredients: async (): Promise<Ingredient[]> => data(await api.get('/admin/ingredients')),
  createIngredient: async (p: { name: string; unit: string; current_stock: number; min_stock: number }) => data(await api.post('/admin/ingredients', p)),
  deleteIngredient: async (id: number) => api.delete(`/admin/ingredients/${id}`),
  adjust: async (id: number, p: { type: string; quantity?: number; balance_after?: number; reason?: string; notes?: string }) => data(await api.post(`/admin/ingredients/${id}/adjust`, p)),
  movements: async (id: number): Promise<Movement[]> => data(await api.get(`/admin/ingredients/${id}/movements`)),
  getRecipe: async (productId: number): Promise<any> => data(await api.get(`/admin/products/${productId}/recipe`)),
  saveRecipe: async (productId: number, items: { ingredient_id: number; quantity_required: number; unit: string }[]) => data(await api.put(`/admin/products/${productId}/recipe`, { items })),
}

export const expenseApi = {
  list: async (filters?: Record<string, string>): Promise<Expense[]> => data(await api.get('/admin/expenses', { params: filters })),
  create: async (p: Partial<Expense>) => data(await api.post('/admin/expenses', p)),
  update: async (id: number, p: Partial<Expense>) => data(await api.patch(`/admin/expenses/${id}`, p)),
  remove: async (id: number) => api.delete(`/admin/expenses/${id}`),
}

export const promotionApi = {
  list: async (): Promise<Promotion[]> => data(await api.get('/admin/promotions')),
  create: async (p: any) => data(await api.post('/admin/promotions', p)),
  update: async (id: number, p: any) => data(await api.patch(`/admin/promotions/${id}`, p)),
  remove: async (id: number) => api.delete(`/admin/promotions/${id}`),
}

export const reportApi = {
  dashboard: async (params?: Record<string, string>): Promise<Dashboard> => data(await api.get('/admin/dashboard', { params })),
  sales: async (params?: Record<string, string>): Promise<any[]> => data(await api.get('/admin/reports/sales', { params })),
  products: async (params?: Record<string, string>): Promise<any[]> => data(await api.get('/admin/reports/products', { params })),
  inventory: async (): Promise<any[]> => data(await api.get('/admin/reports/inventory')),
  expenses: async (params?: Record<string, string>): Promise<any> => (await api.get('/admin/reports/expenses', { params })).data,
  download: async (path: string, params?: Record<string, string>) => {
    const res = await api.get(path, { params: { ...params, format: 'csv' }, responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    const name = path.split('/').pop() || 'report'
    a.href = url; a.download = `${name}.csv`; a.click()
    URL.revokeObjectURL(url)
  },
}

export const adminExtraApi = {
  tables: async (): Promise<AdminTable[]> => data(await api.get('/admin/tables')),
  createTable: async (p: { name: string; code: string; is_active?: boolean }): Promise<AdminTable> => data(await api.post('/admin/tables', p)),
  updateTable: async (id: number, p: Partial<{ name: string; code: string; is_active: boolean }>): Promise<AdminTable> => data(await api.patch(`/admin/tables/${id}`, p)),
  deleteTable: async (id: number) => api.delete(`/admin/tables/${id}`),
  regenerateTable: async (id: number): Promise<AdminTable> => data(await api.post(`/admin/tables/${id}/regenerate`)),
}
