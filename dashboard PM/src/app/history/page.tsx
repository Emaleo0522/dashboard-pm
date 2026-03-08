'use client'
import { useState, useEffect } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { SemanticSearch } from '@/components/history/SemanticSearch'
import { MeetingList } from '@/components/history/MeetingList'
import { MeetingNoteModal } from '@/components/history/MeetingNoteModal'
import { HelpTooltip } from '@/components/ui/HelpTooltip'
import { Button } from '@/components/ui/Button'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import type { CalendarMeeting, Meeting } from '@/types/history'
import { formatDate } from '@/lib/utils'

function isSameMeeting(cal: CalendarMeeting, stored: Meeting): boolean {
  const calDate = new Date(cal.date).toDateString()
  const storedDate = new Date(stored.date).toDateString()
  return (
    calDate === storedDate &&
    cal.title.toLowerCase().trim() === stored.title.toLowerCase().trim()
  )
}

export default function HistoryPage() {
  const { meetings } = useHistoryStore()
  const { googleCalendarUrl } = useSettingsStore()

  const [query, setQuery] = useState('')
  const [calendarMeetings, setCalendarMeetings] = useState<CalendarMeeting[]>([])
  const [calendarError, setCalendarError] = useState<string | null>(null)
  const [loadingCalendar, setLoadingCalendar] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCalMeeting, setSelectedCalMeeting] = useState<CalendarMeeting | null>(null)

  useEffect(() => {
    if (!googleCalendarUrl.trim()) {
      setCalendarMeetings([])
      setCalendarError(null)
      return
    }

    const controller = new AbortController()
    setLoadingCalendar(true)
    setCalendarError(null)

    fetch(`/api/calendar/meetings?url=${encodeURIComponent(googleCalendarUrl)}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data: { ok: boolean; meetings?: CalendarMeeting[]; error?: string }) => {
        if (data.ok && data.meetings) {
          setCalendarMeetings(data.meetings)
        } else {
          setCalendarError(data.error ?? 'Error al cargar el calendario')
        }
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return
        setCalendarError('No se pudo conectar con el calendario')
      })
      .finally(() => setLoadingCalendar(false))

    return () => controller.abort()
  }, [googleCalendarUrl])

  // Filter out calendar meetings that are already annotated in the store
  const unannotatedCalMeetings = calendarMeetings.filter(
    (cm) => !meetings.some((m) => isSameMeeting(cm, m))
  )

  // Filter stored meetings by query
  const filteredMeetings = meetings.filter((m) => {
    if (!query) return true
    const q = query.toLowerCase()
    return (
      m.title.toLowerCase().includes(q) ||
      m.summary.toLowerCase().includes(q) ||
      m.tags.some((t) => t.toLowerCase().includes(q)) ||
      m.decisions.some((d) => d.text.toLowerCase().includes(q)) ||
      m.actions.some((a) => a.text.toLowerCase().includes(q))
    )
  })

  const openModal = (cm: CalendarMeeting) => {
    setSelectedCalMeeting(cm)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedCalMeeting(null)
  }

  return (
    <PageShell
      title="Historial"
      description="Reuniones pasadas, decisiones y acciones pendientes"
      actions={
        <HelpTooltip
          title="Cómo usar el Historial"
          items={[
            { label: 'Reuniones', description: 'Cada tarjeta representa una reunión pasada con su resumen, decisiones tomadas y acciones pendientes.' },
            { label: 'Buscador', description: 'Escribí cualquier término para filtrar reuniones. Busca en títulos, resúmenes, decisiones y acciones.' },
            { label: 'Decisiones', description: 'Las decisiones registradas de cada reunión aparecen dentro de la tarjeta.' },
            { label: 'Acciones', description: 'Cada acción tiene un responsable asignado y una fecha límite.' },
            { label: 'Google Calendar', description: 'Configurá tu URL iCal en Settings para importar reuniones pasadas y anotarlas directamente desde acá.' },
          ]}
        />
      }
    >
      <div className="px-8 py-6 max-w-3xl space-y-6">
        <SemanticSearch value={query} onChange={setQuery} />

        {/* Calendar section — only shown when URL is configured */}
        {googleCalendarUrl.trim() && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                Del calendario
              </h2>
              {loadingCalendar && (
                <span className="text-xs text-text-muted">Cargando...</span>
              )}
            </div>

            {calendarError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-card px-3 py-2">
                {calendarError}
              </p>
            )}

            {loadingCalendar && !calendarError && (
              <div className="space-y-2">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="bg-surface-raised border border-border rounded-card p-4 h-16 animate-pulse"
                  />
                ))}
              </div>
            )}

            {!loadingCalendar && !calendarError && unannotatedCalMeetings.length === 0 && (
              <p className="text-xs text-text-muted py-4 text-center">
                Todas las reuniones del calendario ya están registradas
              </p>
            )}

            {!loadingCalendar && !calendarError && unannotatedCalMeetings.length > 0 && (
              <div className="space-y-2">
                {unannotatedCalMeetings.map((cm) => (
                  <div
                    key={cm.uid}
                    className="bg-surface-raised border border-border rounded-card p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary">{cm.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {formatDate(cm.date)}
                        {cm.attendees.length > 0 && (
                          <>
                            {' \u00b7 '}
                            {cm.attendees.slice(0, 3).join(', ')}
                            {cm.attendees.length > 3 && ` +${cm.attendees.length - 3}`}
                          </>
                        )}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openModal(cm)}
                    >
                      Registrar notas
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Registered meetings section */}
        <section>
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
            Registradas
          </h2>
          <MeetingList meetings={filteredMeetings} />
        </section>
      </div>

      <MeetingNoteModal
        open={modalOpen}
        onClose={closeModal}
        calendarMeeting={selectedCalMeeting}
      />
    </PageShell>
  )
}
