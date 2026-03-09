'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, Clock, Trash2 } from 'lucide-react'
import { useCalendarStore } from '@/store/useCalendarStore'
import { useAuthStore } from '@/store/useAuthStore'
import type { CalendarEvent, CalendarEventColor, CalendarEventType } from '@/types/calendar'

const COLOR_MAP: Record<CalendarEventColor, string> = {
  indigo: 'bg-indigo-500',
  violet: 'bg-violet-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
}

const COLOR_BORDER: Record<CalendarEventColor, string> = {
  indigo: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300',
  violet: 'border-violet-500/50 bg-violet-500/10 text-violet-300',
  emerald: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300',
  amber: 'border-amber-500/50 bg-amber-500/10 text-amber-300',
  rose: 'border-rose-500/50 bg-rose-500/10 text-rose-300',
}

const DAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function toYMD(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

interface EventFormState {
  title: string
  startTime: string
  endTime: string
  description: string
  color: CalendarEventColor
  type: CalendarEventType
  allDay: boolean
}

const EMPTY_FORM: EventFormState = {
  title: '',
  startTime: '',
  endTime: '',
  description: '',
  color: 'indigo',
  type: 'meeting',
  allDay: false,
}

export function CalendarView() {
  const events = useCalendarStore((s) => s.events)
  const addEvent = useCalendarStore((s) => s.addEvent)
  const deleteEvent = useCalendarStore((s) => s.deleteEvent)
  const user = useAuthStore((s) => s.user)

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<EventFormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  // Grid for the month
  const firstDay = new Date(year, month, 1)
  // Monday=0 offset
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to complete last week
  while (cells.length % 7 !== 0) cells.push(null)

  const eventsForDate = (date: string) => events.filter((e) => e.date === date)

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const todayStr = toYMD(now.getFullYear(), now.getMonth(), now.getDate())
  const selectedEvents = selectedDay ? eventsForDate(selectedDay) : []

  async function handleAdd() {
    if (!form.title.trim() || !selectedDay || !user) return
    setSaving(true)
    await addEvent({
      title: form.title.trim(),
      date: selectedDay,
      startTime: form.allDay ? undefined : form.startTime || undefined,
      endTime: form.allDay ? undefined : form.endTime || undefined,
      allDay: form.allDay,
      description: form.description || undefined,
      color: form.color,
      type: form.type,
      userId: user.id,
    })
    setForm(EMPTY_FORM)
    setShowForm(false)
    setSaving(false)
  }

  return (
    <div className="flex gap-4 h-full">
      {/* Calendar Grid */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1.5 hover:bg-surface-2 rounded-lg transition-colors">
            <ChevronLeft size={16} className="text-text-muted" />
          </button>
          <h2 className="text-sm font-semibold text-text-primary">
            {MONTHS[month]} {year}
          </h2>
          <button onClick={nextMonth} className="p-1.5 hover:bg-surface-2 rounded-lg transition-colors">
            <ChevronRight size={16} className="text-text-muted" />
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs text-text-muted py-1.5 font-medium">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((day, i) => {
            if (!day) return <div key={i} className="aspect-square" />
            const dateStr = toYMD(year, month, day)
            const dayEvents = eventsForDate(dateStr)
            const isToday = dateStr === todayStr
            const isSelected = dateStr === selectedDay

            return (
              <button
                key={i}
                onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                className={`
                  aspect-square p-1 rounded-lg text-left transition-colors relative flex flex-col
                  ${isSelected ? 'bg-accent/20 border border-accent/50' : 'hover:bg-surface-2'}
                `}
              >
                <span className={`
                  text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full
                  ${isToday ? 'bg-accent text-white' : 'text-text-primary'}
                `}>
                  {day}
                </span>
                {/* Event dots */}
                <div className="flex flex-wrap gap-0.5 mt-0.5">
                  {dayEvents.slice(0, 3).map((ev) => (
                    <span
                      key={ev.id}
                      className={`w-1.5 h-1.5 rounded-full ${COLOR_MAP[ev.color ?? 'indigo']}`}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[9px] text-text-muted">+{dayEvents.length - 3}</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-64 shrink-0 flex flex-col gap-3">
        {selectedDay ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-text-primary">
                {new Date(selectedDay + 'T12:00:00').toLocaleDateString('es-AR', {
                  weekday: 'long', day: 'numeric', month: 'long'
                })}
              </p>
              <button
                onClick={() => { setShowForm(true); setForm(EMPTY_FORM) }}
                className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
              >
                <Plus size={13} /> Agregar
              </button>
            </div>

            {/* Add form */}
            {showForm && (
              <div className="bg-surface-2 border border-border rounded-xl p-3 space-y-2.5">
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Título del evento"
                  className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                  autoFocus
                />

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-text-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.allDay}
                      onChange={(e) => setForm(f => ({ ...f, allDay: e.target.checked }))}
                      className="accent-[--color-accent]"
                    />
                    Todo el día
                  </label>
                </div>

                {!form.allDay && (
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={(e) => setForm(f => ({ ...f, startTime: e.target.value }))}
                      className="flex-1 bg-surface border border-border rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                    />
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={(e) => setForm(f => ({ ...f, endTime: e.target.value }))}
                      className="flex-1 bg-surface border border-border rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <select
                    value={form.type}
                    onChange={(e) => setForm(f => ({ ...f, type: e.target.value as CalendarEventType }))}
                    className="flex-1 bg-surface border border-border rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                  >
                    <option value="meeting">Reunión</option>
                    <option value="task">Tarea</option>
                    <option value="reminder">Recordatorio</option>
                    <option value="personal">Personal</option>
                  </select>
                  <select
                    value={form.color}
                    onChange={(e) => setForm(f => ({ ...f, color: e.target.value as CalendarEventColor }))}
                    className="flex-1 bg-surface border border-border rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                  >
                    <option value="indigo">Indigo</option>
                    <option value="violet">Violeta</option>
                    <option value="emerald">Verde</option>
                    <option value="amber">Amarillo</option>
                    <option value="rose">Rosa</option>
                  </select>
                </div>

                <textarea
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Descripción (opcional)"
                  rows={2}
                  className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent resize-none"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 text-xs text-text-muted hover:text-text-primary border border-border rounded-lg py-1.5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAdd}
                    disabled={!form.title.trim() || saving}
                    className="flex-1 text-xs bg-accent hover:bg-accent/90 disabled:opacity-50 text-white rounded-lg py-1.5 transition-colors"
                  >
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            )}

            {/* Events list */}
            {selectedEvents.length === 0 && !showForm && (
              <p className="text-xs text-text-muted text-center py-4">Sin eventos este día</p>
            )}
            <div className="space-y-2 overflow-y-auto flex-1">
              {selectedEvents.map((ev) => (
                <EventCard key={ev.id} event={ev} onDelete={() => deleteEvent(ev.id)} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <p className="text-xs text-text-muted">Seleccioná un día para ver o agregar eventos</p>
          </div>
        )}
      </div>
    </div>
  )
}

function EventCard({ event, onDelete }: { event: CalendarEvent; onDelete: () => void }) {
  const colorClass = COLOR_BORDER[event.color ?? 'indigo']

  return (
    <div className={`border rounded-lg p-2.5 ${colorClass} group`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{event.title}</p>
          {(event.startTime || event.allDay) && (
            <p className="text-[10px] opacity-70 flex items-center gap-1 mt-0.5">
              <Clock size={9} />
              {event.allDay ? 'Todo el día' : `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}`}
            </p>
          )}
          {event.description && (
            <p className="text-[10px] opacity-60 mt-0.5 line-clamp-2">{event.description}</p>
          )}
        </div>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-0.5 hover:opacity-80 transition-opacity shrink-0"
          title="Eliminar"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  )
}
