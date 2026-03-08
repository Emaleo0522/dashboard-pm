'use client'
import { useState } from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import { KanbanCard } from './KanbanCard'
import { useBacklogStore } from '@/store/useBacklogStore'
import type { BacklogCard, KanbanColumnId } from '@/types/backlog'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  id: KanbanColumnId
  label: string
  cards: BacklogCard[]
}

type PriorityValue = '' | 'urgent' | 'high' | 'medium' | 'low'

export function KanbanColumn({ id, label, cards }: KanbanColumnProps) {
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newTagsInput, setNewTagsInput] = useState('')
  const [newPriority, setNewPriority] = useState<PriorityValue>('')
  const addCard = useBacklogStore((s) => s.addCard)
  const { setNodeRef, isOver } = useDroppable({ id })

  const parsedTags = newTagsInput
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0)

  const handleAdd = () => {
    if (!newTitle.trim()) return
    addCard({
      title: newTitle.trim(),
      columnId: id,
      description: newDescription.trim() || undefined,
      tags: parsedTags.length > 0 ? parsedTags : undefined,
      priority: newPriority || undefined,
    })
    setNewTitle('')
    setNewDescription('')
    setNewTagsInput('')
    setNewPriority('')
    setAdding(false)
  }

  const handleCancel = () => {
    setNewTitle('')
    setNewDescription('')
    setNewTagsInput('')
    setNewPriority('')
    setAdding(false)
  }

  return (
    <div className="flex flex-col w-64 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-1 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{label}</span>
          <span className="text-xs text-text-muted bg-surface-raised px-1.5 py-0.5 rounded-full">{cards.length}</span>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="text-text-muted hover:text-text-primary transition-colors p-0.5 rounded"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 space-y-2 min-h-[120px] rounded-card p-2 transition-colors',
          isOver ? 'bg-accent-dim border border-accent/30' : 'bg-surface-raised/30'
        )}
      >
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <KanbanCard key={card.id} card={card} />
          ))}
        </SortableContext>
      </div>

      {/* Add card inline */}
      {adding && (
        <div className="mt-2 space-y-2">
          <textarea
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd() }
              if (e.key === 'Escape') handleCancel()
            }}
            placeholder="Título de la tarjeta..."
            rows={2}
            className="w-full bg-surface-raised border border-accent/40 rounded-card px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none resize-none"
          />

          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') handleCancel() }}
            placeholder="Descripción (opcional)…"
            rows={2}
            className="w-full bg-surface-raised border border-border rounded-card px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 resize-none transition-colors"
          />

          <div>
            <input
              type="text"
              value={newTagsInput}
              onChange={(e) => setNewTagsInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') handleCancel() }}
              placeholder="Tags: onboarding, pricing…"
              className="w-full bg-surface-raised border border-border rounded-card px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors"
            />
            {parsedTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {parsedTags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-accent-dim text-accent text-xs px-1.5 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as PriorityValue)}
            className="bg-surface-raised border border-border rounded-card px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent w-full"
          >
            <option value="">Sin prioridad</option>
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>

          <div className="flex gap-1.5">
            <button
              onClick={handleAdd}
              className="flex-1 px-2 py-1 text-xs bg-accent text-white rounded-card hover:bg-accent-hover transition-colors"
            >
              Agregar
            </button>
            <button
              onClick={handleCancel}
              className="px-2 py-1 text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
