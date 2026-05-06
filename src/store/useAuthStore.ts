import { create } from 'zustand'

interface AuthUser {
  id: string
  email: string
  name: string
  googleCalendarUrl?: string
}

interface AuthState {
  user: AuthUser | null
  isLoaded: boolean
  load: () => Promise<void>
  logout: () => Promise<void>
  setGoogleCalendarUrl: (url: string) => Promise<void>
}

export const useAuthStore = create<AuthState>()((set, get) => ({
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

  setGoogleCalendarUrl: async (url: string) => {
    const current = get().user
    if (!current) return

    // optimistic update
    set({ user: { ...current, googleCalendarUrl: url } })

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleCalendarUrl: url }),
      })
      if (res.ok) {
        const data = await res.json()
        set({ user: data.user })
      } else {
        // rollback
        set({ user: current })
      }
    } catch {
      // rollback
      set({ user: current })
    }
  },
}))
