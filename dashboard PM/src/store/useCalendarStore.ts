import { create } from 'zustand'
import type { CalendarEvent, CalendarEventType, CalendarEventColor } from '@/types/calendar'

interface AddEventData {
  title: string
  date: string
  startTime?: string
  endTime?: string
  allDay?: boolean
  description?: string
  color?: CalendarEventColor
  type?: CalendarEventType
  userId: string
}

interface CalendarState {
  events: CalendarEvent[]
  isLoaded: boolean
  load: () => Promise<void>
  addEvent: (data: AddEventData) => Promise<void>
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void
  deleteEvent: (id: string) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pbToEvent(r: any): CalendarEvent {
  return {
    id: r.id,
    title: r.title,
    date: r.date,
    startTime: r.startTime || undefined,
    endTime: r.endTime || undefined,
    allDay: r.allDay ?? false,
    description: r.description || undefined,
    color: r.color || undefined,
    type: r.type || undefined,
    userId: r.userId,
    createdAt: r.created,
  }
}

export const useCalendarStore = create<CalendarState>()((set, get) => ({
  events: [],
  isLoaded: false,

  load: async () => {
    if (get().isLoaded) return
    try {
      const res = await fetch('/api/pb/calendar_events?perPage=500&sort=date')
      const data = await res.json()
      set({ events: (data.items ?? []).map(pbToEvent), isLoaded: true })
    } catch {
      set({ isLoaded: true })
    }
  },

  addEvent: async (data) => {
    const tempId = `temp_${crypto.randomUUID()}`
    const optimistic: CalendarEvent = {
      id: tempId,
      title: data.title,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      allDay: data.allDay ?? false,
      description: data.description,
      color: data.color,
      type: data.type,
      userId: data.userId,
      createdAt: new Date().toISOString(),
    }
    set((s) => ({ events: [...s.events, optimistic] }))
    try {
      const res = await fetch('/api/pb/calendar_events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          date: data.date,
          startTime: data.startTime ?? '',
          endTime: data.endTime ?? '',
          allDay: data.allDay ?? false,
          description: data.description ?? '',
          color: data.color ?? '',
          type: data.type ?? '',
          userId: data.userId,
        }),
      })
      const item = await res.json()
      set((s) => ({
        events: s.events.map((e) => (e.id === tempId ? pbToEvent(item) : e)),
      }))
    } catch {
      set((s) => ({ events: s.events.filter((e) => e.id !== tempId) }))
    }
  },

  updateEvent: (id, updates) => {
    set((s) => ({
      events: s.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }))
    fetch(`/api/pb/calendar_events/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {})
  },

  deleteEvent: (id) => {
    set((s) => ({ events: s.events.filter((e) => e.id !== id) }))
    fetch(`/api/pb/calendar_events/${id}`, { method: 'DELETE' }).catch(() => {})
  },
}))
