import { create } from 'zustand'

export type AuthRole = { id: number; name: string; slug: string }
export type AuthUser = {
  id: number
  name: string
  email: string
  is_active: boolean
  role: AuthRole | null
}

type AuthState = {
  user: AuthUser | null
  isReady: boolean
  setUser: (user: AuthUser | null) => void
  setReady: (isReady: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isReady: false,
  setUser: (user) => set({ user }),
  setReady: (isReady) => set({ isReady }),
}))
