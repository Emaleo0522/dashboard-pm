'use client'
import { MeetingCard } from './MeetingCard'
import type { Meeting } from '@/types/history'

export function MeetingList({ meetings }: { meetings: Meeting[] }) {
  if (meetings.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-text-muted text-sm">No hay reuniones que coincidan con la b\u00fasqueda</p>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {meetings.map((m) => <MeetingCard key={m.id} meeting={m} />)}
    </div>
  )
}
