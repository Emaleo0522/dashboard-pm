import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  operatorName: string
  linearApiKey: string
  linearTeamId: string
  googleCalendarUrl: string
  setOperatorName: (name: string) => void
  setLinearApiKey: (key: string) => void
  setLinearTeamId: (id: string) => void
  setGoogleCalendarUrl: (url: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      operatorName: '',
      linearApiKey: '',
      linearTeamId: '',
      googleCalendarUrl: '',
      setOperatorName: (name) => set({ operatorName: name }),
      setLinearApiKey: (key) => set({ linearApiKey: key }),
      setLinearTeamId: (id) => set({ linearTeamId: id }),
      setGoogleCalendarUrl: (url) => set({ googleCalendarUrl: url }),
    }),
    { name: 'pm-settings' }
  )
)
