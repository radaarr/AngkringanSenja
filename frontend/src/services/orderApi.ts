import { api } from '@/lib/api'
import { publicApi } from './publicApi'
import type { Resource } from './publicApi'
import type { Payment, Promotion } from '@/types/menu'

export type CreateOrderPayload = {
  order_type: 'DINE_IN' | 'TAKEAWAY'
  table_token?: string | null
  customer_name?: string | null
  notes?: string | null
  payment_method?: 'QRIS_SIMULATED' | null
  promo_code?: string | null
  idempotency_key?: string | null
  items: { product_id: number; quantity: number; notes?: string }[]
}
export type CreateOrderResult = { order_number: string; tracking_token: string; status: string; total: number; paid: boolean }
export type TrackingOrder = {
  order_number: string; source: string; order_type: string; status: string;
  table?: { id: number; name: string; code: string } | null;
  items: { id: number; product_id: number; product_name: string; unit_price: number; quantity: number; subtotal: number; notes?: string }[];
  subtotal: number; discount_amount: number; service_charge_amount: number; tax_amount: number;
  promotion_code?: string | null; promotion?: Promotion | null;
  total: number; created_at: string;
  payments?: Payment[];
  paid?: boolean;
  status_histories?: { from_status: string | null; to_status: string; created_at: string }[];
}

export const orderApi = {
  resolveTable: async (token: string) => {
    const res = await fetch(`/api/v1/tables/resolve/${token}`)
    if (!res.ok) throw new Error('invalid')
    return (await res.json()).data as { id: number; name: string; code: string; qr_token: string }
  },
  create: async (payload: CreateOrderPayload): Promise<CreateOrderResult> => {
    const res = await api.post<Resource<CreateOrderResult>>('/public/orders', payload)
    return res.data.data
  },
  track: async (token: string): Promise<TrackingOrder> => {
    const res = await fetch(`/api/v1/public/orders/${token}`)
    if (!res.ok) throw new Error('not found')
    return (await res.json()).data as TrackingOrder
  },
  pay: async (token: string, payload: { method: 'QRIS_SIMULATED'; idempotency_key?: string }) => {
    const res = await api.post(`/public/orders/${token}/payments`, payload)
    return res.data.data as { payment: Payment; order: TrackingOrder }
  },
  products: publicApi.products,
}
