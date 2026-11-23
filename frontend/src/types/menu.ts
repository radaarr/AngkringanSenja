export type Category = {
  id: number
  name: string
  slug: string
  description?: string | null
  is_active?: boolean
  sort_order?: number
}

export type Product = {
  id: number
  category_id: number
  name: string
  slug: string
  description?: string | null
  price: number
  image_path?: string | null
  image_url?: string | null
  is_available: boolean
  is_featured: boolean
  sort_order?: number
  archived_at?: string | null
  category?: Category
}

export type Table = {
  id: number
  name: string
  code: string
}

export type OrderItem = {
  id?: number
  product_id: number | null
  product_name: string
  unit_price: number
  quantity: number
  subtotal: number
  notes?: string | null
}

export type Payment = {
  id: number
  order_id: number
  method: 'CASH' | 'QRIS_SIMULATED'
  status: string
  amount: number
  amount_received?: number | null
  change_amount?: number | null
  meta?: { simulated?: boolean } | null
  paid_at?: string | null
}

export type Promotion = {
  id: number
  code: string
  name: string
  type: 'PERCENTAGE' | 'FIXED'
  value: number
}

export type Order = {
  id: number
  order_number: string
  source: string
  order_type: 'DINE_IN' | 'TAKEAWAY'
  status: string
  table_id?: number | null
  table?: Table | null
  customer_name?: string | null
  subtotal: number
  discount_amount: number
  service_charge_amount: number
  tax_amount: number
  promotion_code?: string | null
  promotion?: Promotion | null
  total: number
  notes?: string | null
  created_at: string
  items: OrderItem[]
  payments: Payment[]
}
