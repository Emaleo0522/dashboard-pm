'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Pencil, X, GripVertical, Send, Check, AlertCircle } from 'lucide-react'
import { useBacklogStore } from '@/store/useBacklogStore'
import type { BacklogCard } from '@/types/backlog'

interface KanbanCardProps {
  card: BacklogCard
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-emerald-500/20 text-emerald-400',
  medium: 'bg-amber-500/20 text-amber-400',
  high: 'bg-red-500/20 text-red-400',
}

const CARD_COLOR_STYLES: Record<string, { border: string; dot: string }> = {
  indigo:  { border: 'border-l-indigo-500',  dot: 'bg-indigo-500' },
  violet:  { border: 'border-l-violet-500',  dot: 'bg-violet-500' },
  emerald: { border: 'border-l-emerald-500', dot: 'bg-emerald-500' },
  amber:   { border: 'border-l-amber-500',   dot: 'bg-amber-500' },
  rose:    { border: 'border-l-rose-500',    dot: 'bg-rose-500' },
}

const COLOR_OPTIONS = ['indigo', 'violet', 'emerald', 'amber', 'rose'] as const
type CardColor = typeof COLOR_OPTIONS[number]

export function KanbanCard({ card }: KanbanCardProps) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || '')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(card.tags || [])
  const [cardColor, setCardColor] = useState<CardColor | undefined>(card.color as CardColor | undefined)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [sendingToLinear, setSendingToLinear] = useState(false)
  const [linearIssueId, setLinearIssueId] = useState<string | undefined>(card.linearIssueId)
  const [linearError, setLinearError] = useState<string | null>(null)

  const { updateCard, deleteCard } = useBacklogStore()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const handleSave = () => {
    updateCard(card.id, { title, description, tags, color: cardColor })
    setEditing(false)
  }

  const handleAddTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) {
      setTags(prev => [...prev, t])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag))
  }

  const handleSendToLinear = async () => {
    setSendingToLinear(true)
    setLinearError(null)
    try {
      const res = await fetch('/api/linear/create-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: card.title, description: card.description }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear issue')
      const issueId = data.issueId || data.id || data.identifier
      setLinearIssueId(issueId)
      updateCard(card.id, { linearIssueId: issueId })
    } catch (err) {
      setLinearError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSendingToLinear(false)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-surface-secondary border border-border rounded-lg p-3 group relative ${
        cardColor ? `border-l-4 ${CARD_COLOR_STYLES[cardColor].border}` : ''
      }`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-1 top-3 opacity-0 group-hover:opacity-40 cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={14} className="text-text-muted" />
      </div>

      <div className="pl-4">
        {editing ? (
          <div className="space-y-2">
            <input
              className="w-full bg-surface-tertiary text-text-primary text-sm px-2 py-1 rounded border border-border focus:outline-none focus:border-brand-primary"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
            <textarea
              className="w-full bg-surface-tertiary text-text-secondary text-xs px-2 py-1 rounded border border-border focus:outline-none focus:border-brand-primary resize-none"
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descripción (opcional)"
            />
            {/* Tags management */}
            <div className="flex flex-wrap gap-1 mb-1">
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 text-xs bg-brand-primary/20 text-brand-primary px-2 py-0.5 rounded-full">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-400">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-1">
              <input
                className="flex-1 bg-surface-tertiary text-text-secondary text-xs px-2 py-1 rounded border border-border focus:outline-none"
                placeholder="Agregar tag..."
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddTag()}
              />
              <button onClick={handleAddTag} className="text-xs bg-brand-primary/20 text-brand-primary px-2 py-1 rounded hover:bg-brand-primary/30">
                +
              </button>
            </div>
            {/* Color picker */}
            <div
              className="flex items-center gap-1 mt-1"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <span className="text-xs text-text-muted mr-1">Color:</span>
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c}
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCardColor(cardColor === c ? undefined : c)
                  }}
                  className={`w-5 h-5 rounded-full transition-all ${CARD_COLOR_STYLES[c].dot} ${
                    cardColor === c
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-black/50 scale-125 opacity-100'
                      : 'opacity-60 hover:opacity-100 hover:scale-110'
                  }`}
                />
              ))}
              {cardColor && (
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); setCardColor(undefined) }}
                  className="text-xs text-text-muted hover:text-text-primary ml-1 leading-none"
                >
                  ×
                </button>
              )}
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSave}
                className="flex-1 text-xs bg-brand-primary text-white px-2 py-1 rounded hover:opacity-90"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setEditing(false)
                  setTitle(card.title)
                  setDescription(card.description || '')
                  setTags(card.tags || [])
                  setCardColor(card.color as CardColor | undefined)
                }}
                className="flex-1 text-xs bg-surface-tertiary text-text-secondary px-2 py-1 rounded hover:bg-border"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-text-primary font-medium leading-snug pr-12">{card.title}</p>
            {card.description && (
              <p className="text-xs text-text-muted mt-1 leading-relaxed">{card.description}</p>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map(tag => (
                  <span key={tag} className="text-xs bg-brand-primary/20 text-brand-primary px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Priority badge */}
            {card.priority && (
              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[card.priority] || ''}`}>
                {card.priority}
              </span>
            )}

            {/* Linear issue badge */}
            {linearIssueId && (
              <div className="mt-2 flex items-center gap-1 text-xs text-emerald-400">
                <Check size={12} />
                <span>En Linear: {linearIssueId}</span>
              </div>
            )}
            {linearError && (
              <div className="mt-1 flex items-center gap-1 text-xs text-red-400">
                <AlertCircle size={12} />
                <span>{linearError}</span>
              </div>
            )}

            {/* Send to Linear button — solo cuando columnId === 'ready' */}
            {card.columnId === 'ready' && !linearIssueId && (
              <button
                onClick={handleSendToLinear}
                disabled={sendingToLinear}
                className="mt-2 flex items-center gap-1 text-xs bg-brand-primary/20 text-brand-primary px-2 py-1 rounded hover:bg-brand-primary/30 disabled:opacity-50"
              >
                <Send size={11} />
                {sendingToLinear ? 'Enviando...' : 'Push a Linear'}
              </button>
            )}

            {/* Action buttons */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setEditing(true)}
                className="p-1 rounded hover:bg-surface-tertiary text-text-muted hover:text-text-primary"
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1 rounded hover:bg-surface-tertiary text-text-muted hover:text-red-400"
              >
                <X size={12} />
              </button>
            </div>

            {/* Confirm delete */}
            {confirmDelete && (
              <div className="mt-2 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded p-2">
                <span className="text-xs text-red-400">¿Eliminar?</span>
                <button
                  onClick={() => deleteCard(card.id)}
                  className="text-xs bg-red-500 text-white px-2 py-0.5 rounded hover:bg-red-600"
                >
                  Sí
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs bg-surface-tertiary text-text-secondary px-2 py-0.5 rounded hover:bg-border"
                >
                  No
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
