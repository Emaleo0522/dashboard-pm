import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Meeting } from '@/types/history'
import { mockMeetings } from '@/data/mock'

interface HistoryState {
  meetings: Meeting[]
  addMeeting: (meeting: Omit<Meeting, 'id'>) => void
  updateMeeting: (id: string, updates: Partial<Omit<Meeting, 'id'>>) => void
  deleteMeeting: (id: string) => void
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      meetings: mockMeetings,
      addMeeting: (meeting) =>
        set((s) => ({
          meetings: [
            { ...meeting, id: crypto.randomUUID() },
            ...s.meetings,
          ],
        })),
      updateMeeting: (id, updates) =>
        set((s) => ({
          meetings: s.meetings.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        })),
      deleteMeeting: (id) =>
        set((s) => ({ meetings: s.meetings.filter((m) => m.id !== id) })),
    }),
    { name: 'pm-history' }
  )
)
