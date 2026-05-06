'use client'
import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { useHistoryStore } from '@/store/useHistoryStore'
import type { CalendarMeeting } from '@/types/history'

interface DecisionRow {
  text: string
  rationale: string
}

interface ActionRow {
  text: string
  assignee: string
  dueDate: string
}

interface MeetingNoteModalProps {
  open: boolean
  onClose: () => void
  calendarMeeting: CalendarMeeting | null
}

export function MeetingNoteModal({ open, onClose, calendarMeeting }: MeetingNoteModalProps) {
  const { addMeeting } = useHistoryStore()

  const [title, setTitle] = useState('')
  const [participants, setParticipants] = useState('')
  const [summary, setSummary] = useState('')
  const [tags, setTags] = useState('')
  const [decisions, setDecisions] = useState<DecisionRow[]>([])
  const [actions, setActions] = useState<ActionRow[]>([])

  // Pre-fill from calendarMeeting whenever it changes
  useEffect(() => {
    if (calendarMeeting) {
      setTitle(calendarMeeting.title)
      setParticipants(calendarMeeting.attendees.join(', '))
      setSummary('')
      setTags('')
      setDecisions([])
      setActions([])
    }
  }, [calendarMeeting])

  const addDecision = () => setDecisions((d) => [...d, { text: '', rationale: '' }])
  const removeDecision = (i: number) => setDecisions((d) => d.filter((_, idx) => idx !== i))
  const updateDecision = (i: number, field: keyof DecisionRow, value: string) =>
    setDecisions((d) => d.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)))

  const addAction = () => setActions((a) => [...a, { text: '', assignee: '', dueDate: '' }])
  const removeAction = (i: number) => setActions((a) => a.filter((_, idx) => idx !== i))
  const updateAction = (i: number, field: keyof ActionRow, value: string) =>
    setActions((a) => a.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)))

  const handleSubmit = () => {
    if (!calendarMeeting || !title.trim()) return

    const participantsList = participants.split(',').map((p) => p.trim()).filter(Boolean)
    addMeeting({
      title: title.trim(),
      date: calendarMeeting.date,
      summary: summary.trim(),
      participants: participantsList.length > 0 ? participantsList : undefined,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      decisions: decisions
        .filter((d) => d.text.trim())
        .map((d, i) => ({ id: `d${i}`, text: d.text, rationale: d.rationale })),
      actions: actions
        .filter((a) => a.text.trim())
        .map((a, i) => ({
          id: `a${i}`,
          text: a.text,
          assignee: a.assignee,
          dueDate: a.dueDate || undefined,
          completed: false,
        })),
    })

    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Registrar notas de reunión" size="lg">
      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
        {/* Title & Participants */}
        <div className="space-y-3">
          <Input
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nombre de la reunión"
          />
          <Input
            label="Participantes"
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
            placeholder="email@example.com, otro@example.com"
          />
        </div>

        {/* Summary */}
        <Textarea
          label="Resumen"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="¿De qué trató la reunión?"
          rows={3}
        />

        {/* Tags */}
        <Input
          label="Etiquetas (separadas por coma)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Q4, retención, producto"
        />

        {/* Decisions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">Decisiones</span>
            <Button variant="ghost" size="sm" onClick={addDecision} type="button">
              <Plus size={13} />
              Decisión
            </Button>
          </div>
          {decisions.map((d, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Input
                  placeholder="Decisión tomada"
                  value={d.text}
                  onChange={(e) => updateDecision(i, 'text', e.target.value)}
                />
                <Input
                  placeholder="Fundamento"
                  value={d.rationale}
                  onChange={(e) => updateDecision(i, 'rationale', e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeDecision(i)}
                className="mt-2 text-text-muted hover:text-red-400 transition-colors flex-shrink-0"
                aria-label="Eliminar decisión"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">Acciones</span>
            <Button variant="ghost" size="sm" onClick={addAction} type="button">
              <Plus size={13} />
              Acción
            </Button>
          </div>
          {actions.map((a, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-3 gap-2">
                <Input
                  placeholder="Acción"
                  value={a.text}
                  onChange={(e) => updateAction(i, 'text', e.target.value)}
                />
                <Input
                  placeholder="Responsable"
                  value={a.assignee}
                  onChange={(e) => updateAction(i, 'assignee', e.target.value)}
                />
                <Input
                  type="date"
                  placeholder="Fecha límite"
                  value={a.dueDate}
                  onChange={(e) => updateAction(i, 'dueDate', e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeAction(i)}
                className="mt-2 text-text-muted hover:text-red-400 transition-colors flex-shrink-0"
                aria-label="Eliminar acción"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-border">
        <Button variant="ghost" size="sm" onClick={onClose} type="button">
          Cancelar
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          type="button"
          disabled={!title.trim()}
        >
          Guardar reunión
        </Button>
      </div>
    </Modal>
  )
}
