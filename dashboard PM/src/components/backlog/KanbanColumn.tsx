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

export function KanbanColumn({ id, label, cards }: KanbanColumnProps) {
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const addCard = useBacklogStore((s) => s.addCard)
  const { setNodeRef, isOver } = useDroppable({ id })

  const handleAdd = () => {
    if (!newTitle.trim()) return
    addCard(newTitle.trim(), id)
    setNewTitle('')
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
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd() } if (e.key === 'Escape') setAdding(false) }}
            placeholder="Título de la tarjeta..."
            rows={2}
            className="w-full bg-surface-raised border border-accent/40 rounded-card px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none resize-none"
          />
          <div className="flex gap-1.5">
            <button onClick={handleAdd} className="flex-1 px-2 py-1 text-xs bg-accent text-white rounded-card hover:bg-accent-hover transition-colors">Agregar</button>
            <button onClick={() => setAdding(false)} className="px-2 py-1 text-xs text-text-muted hover:text-text-primary transition-colors">✕</button>
          </div>
        </div>
      )}
    </div>
  )
}
