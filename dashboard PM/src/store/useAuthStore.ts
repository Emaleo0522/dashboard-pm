import { create } from 'zustand'

interface AuthUser {
  id: string
  email: string
  name: string
}

interface AuthState {
  user: AuthUser | null
  isLoaded: boolean
  load: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isLoaded: false,

  load: async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        set({ user: data.user, isLoaded: true })
      } else {
        set({ user: null, isLoaded: true })
      }
    } catch {
      set({ user: null, isLoaded: true })
    }
  },

  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    set({ user: null, isLoaded: false })
    window.location.href = '/login'
  },
}))
