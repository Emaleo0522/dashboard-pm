export type CalendarEventType = 'meeting' | 'task' | 'reminder' | 'personal'
export type CalendarEventColor = 'indigo' | 'violet' | 'emerald' | 'amber' | 'rose'

export interface CalendarEvent {
  id: string
  title: string
  date: string         // YYYY-MM-DD
  startTime?: string   // HH:MM
  endTime?: string     // HH:MM
  allDay?: boolean
  description?: string
  color?: CalendarEventColor
  type?: CalendarEventType
  userId: string
  createdAt: string
}
