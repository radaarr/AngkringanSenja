import { api } from '@/lib/api'
import type { Order, Payment, Product, Table } from '@/types/menu'

export type Resource<T> = { data: T }

export type PosOrderPayload = {
  order_type: 'DINE_IN' | 'TAKEAWAY'
  table_id?: number | null
  customer_name?: string | null
  notes?: string | null
  promo_code?: string | null
  items: { product_id: number; quantity: number; notes?: string }[]
}

export type PaymentPayload = {
  method: 'CASH' | 'QRIS_SIMULATED'
  amount_received?: number
  idempotency_key?: string
}

export const posApi = {
  products: async (): Promise<Product[]> => (await api.get<Resource<Product[]>>('/pos/products')).data.data,
  tables: async (): Promise<Table[]> => (await api.get<Resource<Table[]>>('/pos/tables')).data.data,
  createOrder: async (payload: PosOrderPayload): Promise<Order> => (await api.post<Resource<Order>>('/pos/orders', payload)).data.data,
  orders: async (): Promise<Order[]> => (await api.get<Resource<Order[]>>('/pos/orders')).data.data,
  order: async (id: number): Promise<Order> => (await api.get<Resource<Order>>(`/pos/orders/${id}`)).data.data,
  pay: async (orderId: number, payload: PaymentPayload): Promise<Payment> => (await api.post<Resource<Payment>>(`/orders/${orderId}/payments`, payload)).data.data,
}

export const orderApi = {
  list: async (params?: { status?: string; source?: string; order_type?: string; date?: string }): Promise<Order[]> => (await api.get<Resource<Order[]>>('/orders', { params })).data.data,
  updateStatus: async (id: number, payload: { status: string; reason?: string }): Promise<Order> => (await api.patch<Resource<Order>>(`/orders/${id}/status`, payload)).data.data,
  kitchen: async (): Promise<Order[]> => (await api.get<Resource<Order[]>>('/kitchen/orders')).data.data,
}
