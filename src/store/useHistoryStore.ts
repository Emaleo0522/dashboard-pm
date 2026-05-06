import { create } from 'zustand'
import type { Meeting } from '@/types/history'
import { useAuthStore } from './useAuthStore'

interface HistoryState {
  meetings: Meeting[]
  isLoaded: boolean
  load: () => Promise<void>
  addMeeting: (meeting: Omit<Meeting, 'id'>) => Promise<void>
  updateMeeting: (id: string, updates: Partial<Omit<Meeting, 'id'>>) => void
  deleteMeeting: (id: string) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pbToMeeting(r: any): Meeting {
  return {
    id: r.id,
    title: r.title,
    date: r.date,
    summary: r.summary || '',
    participants: Array.isArray(r.participants) ? r.participants : undefined,
    decisions: Array.isArray(r.decisions) ? r.decisions : [],
    actions: Array.isArray(r.actions) ? r.actions : [],
    tags: Array.isArray(r.tags) ? r.tags : [],
  }
}

export const useHistoryStore = create<HistoryState>()((set, get) => ({
  meetings: [],
  isLoaded: false,

  load: async () => {
    if (get().isLoaded) return
    try {
      const res = await fetch('/api/pb/meeting_history?perPage=200&sort=-date')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (!data.items) throw new Error('Unexpected response shape')
      set({ meetings: data.items.map(pbToMeeting), isLoaded: true })
    } catch (err) {
      console.error('[HistoryStore] load failed:', err)
    }
  },

  addMeeting: async (meeting) => {
    const user = useAuthStore.getState().user
    const createdBy = user?.name || user?.email || undefined
    const tempId = `temp_${crypto.randomUUID()}`
    const optimistic: Meeting = { ...meeting, id: tempId }
    set((s) => ({ meetings: [optimistic, ...s.meetings] }))
    try {
      const res = await fetch('/api/pb/meeting_history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: meeting.title,
          date: meeting.date,
          summary: meeting.summary,
          participants: meeting.participants ?? [],
          decisions: meeting.decisions,
          actions: meeting.actions,
          tags: meeting.tags,
          createdBy: createdBy ?? '',
        }),
      })
      const item = await res.json()
      set((s) => ({
        meetings: s.meetings.map((m) => (m.id === tempId ? pbToMeeting(item) : m)),
      }))
    } catch {
      set((s) => ({ meetings: s.meetings.filter((m) => m.id !== tempId) }))
    }
  },

  updateMeeting: (id, updates) => {
    const prev = get().meetings.find((m) => m.id === id)
    set((s) => ({
      meetings: s.meetings.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }))
    fetch(`/api/pb/meeting_history/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {
      if (prev) {
        set((s) => ({ meetings: s.meetings.map((m) => (m.id === id ? prev : m)) }))
      }
    })
  },

  deleteMeeting: (id) => {
    const prev = get().meetings.find((m) => m.id === id)
    set((s) => ({ meetings: s.meetings.filter((m) => m.id !== id) }))
    fetch(`/api/pb/meeting_history/${id}`, { method: 'DELETE' }).catch(() => {
      if (prev) {
        set((s) => ({ meetings: [...s.meetings, prev] }))
      }
    })
  },
}))
