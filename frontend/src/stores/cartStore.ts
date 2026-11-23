import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  product_id: number
  slug: string
  name: string
  price: number
  quantity: number
  notes?: string
  image_url?: string | null
}

type CartState = {
  items: CartItem[]
  tableToken: string | null
  tableName: string | null
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  updateQty: (product_id: number, quantity: number) => void
  updateNotes: (product_id: number, notes: string) => void
  removeItem: (product_id: number) => void
  clear: () => void
  setTable: (token: string | null, name: string | null) => void
  subtotal: () => number
}

export const useCartStore = create<CartState>()(persist((set, get) => ({
  items: [],
  tableToken: null,
  tableName: null,
  addItem: (item, qty = 1) => set((s) => {
    const ex = s.items.find(i => i.product_id === item.product_id)
    if (ex) return { items: s.items.map(i => i.product_id === item.product_id ? { ...i, quantity: Math.min(99, i.quantity + qty) } : i) }
    return { items: [...s.items, { ...item, quantity: qty }] }
  }),
  updateQty: (product_id, quantity) => set((s) => ({ items: quantity <= 0 ? s.items.filter(i => i.product_id !== product_id) : s.items.map(i => i.product_id === product_id ? { ...i, quantity } : i) })),
  updateNotes: (product_id, notes) => set((s) => ({ items: s.items.map(i => i.product_id === product_id ? { ...i, notes } : i) })),
  removeItem: (product_id) => set((s) => ({ items: s.items.filter(i => i.product_id !== product_id) })),
  clear: () => set({ items: [] }),
  setTable: (token, name) => set({ tableToken: token, tableName: name }),
  subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}), { name: 'as-cart' }))
