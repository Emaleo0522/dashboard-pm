import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  operatorName: string
  linearApiKey: string
  linearTeamId: string
  setOperatorName: (name: string) => void
  setLinearApiKey: (key: string) => void
  setLinearTeamId: (id: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      operatorName: '',
      linearApiKey: '',
      linearTeamId: '',
      setOperatorName: (name) => set({ operatorName: name }),
      setLinearApiKey: (key) => set({ linearApiKey: key }),
      setLinearTeamId: (id) => set({ linearTeamId: id }),
    }),
    { name: 'pm-settings' }
  )
)
