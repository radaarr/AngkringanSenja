import { api } from '@/lib/api'

export type PricingPromotion = {
  id: number
  code: string
  name: string
  type: 'PERCENTAGE' | 'FIXED'
  value: number
}

export type PricingPreview = {
  subtotal: number
  discount_amount: number
  service_charge_amount: number
  tax_amount: number
  total: number
  tax_rate: number
  service_charge_rate: number
  promotion: PricingPromotion | null
}

export type PricingPreviewPayload = {
  promo_code?: string | null
  items: { product_id: number; quantity: number }[]
}

export const pricingApi = {
  preview: async (payload: PricingPreviewPayload): Promise<PricingPreview> => {
    const res = await api.post<{ data: PricingPreview }>('/pricing/preview', payload)
    return res.data.data
  },
}
