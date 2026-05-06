'use client'
import { PageShell } from '@/components/layout/PageShell'
import { CalendarView } from '@/components/calendar/CalendarView'
import { useCalendarStore } from '@/store/useCalendarStore'
import { useEffect } from 'react'

export default function CalendarPage() {
  const load = useCalendarStore((s) => s.load)

  useEffect(() => {
    load()
  }, [load])

  return (
    <PageShell title="Mi Calendario" description="Tus eventos personales">
      <div className="h-[calc(100vh-8rem)] p-6">
        <CalendarView />
      </div>
    </PageShell>
  )
}
