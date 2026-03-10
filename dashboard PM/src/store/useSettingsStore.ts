import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  operatorName: string
  setOperatorName: (name: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      operatorName: '',
      setOperatorName: (name) => set({ operatorName: name }),
    }),
    { name: 'pm-settings' }
  )
)
