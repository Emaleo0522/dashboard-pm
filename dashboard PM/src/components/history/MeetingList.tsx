'use client'
import { MeetingCard } from './MeetingCard'
import { useHistoryStore } from '@/store/useHistoryStore'
import type { Meeting } from '@/types/history'

function SkeletonMeeting() {
  return (
    <div className="bg-surface-raised border border-border rounded-xl p-5 animate-pulse">
      <div className="h-4 bg-surface-overlay rounded w-2/3 mb-3" />
      <div className="h-3 bg-surface-overlay rounded w-1/3" />
    </div>
  )
}

export function MeetingList({ meetings }: { meetings: Meeting[] }) {
  const isLoaded = useHistoryStore((s) => s.isLoaded)

  if (!isLoaded) {
    return (
      <div className="space-y-3">
        <SkeletonMeeting />
        <SkeletonMeeting />
      </div>
    )
  }

  if (meetings.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-text-muted text-sm">No hay reuniones que coincidan con la busqueda</p>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {meetings.map((m) => <MeetingCard key={m.id} meeting={m} />)}
    </div>
  )
}
