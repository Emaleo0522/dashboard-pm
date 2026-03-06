'use client'
import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useBacklogStore } from '@/store/useBacklogStore'
import type { BacklogCard } from '@/types/backlog'
import type { IssuePriority } from '@/types/linear'
import { cn } from '@/lib/utils'

const priorityMap: Record<string, IssuePriority> = {
  urgent: 1, high: 2, medium: 3, low: 4,
}

interface KanbanCardProps {
  card: BacklogCard
}

export function KanbanCard({ card }: KanbanCardProps) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || '')
  const { updateCard, deleteCard } = useBacklogStore()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const save = () => {
    updateCard(card.id, { title, description })
    setEditing(false)
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'group bg-surface border border-border rounded-card p-3 cursor-default',
          'hover:border-accent/30 transition-colors',
          isDragging && 'opacity-50 shadow-lg shadow-black/40'
        )}
      >
        <div className="flex items-start gap-2">
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 text-text-muted opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
          >
            <GripVertical size={14} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-text-primary leading-snug">{card.title}</p>
            {card.description && (
              <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-2">{card.description}</p>
            )}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {card.priority && (
                <Badge variant="priority" priority={priorityMap[card.priority]} />
              )}
              {card.tags?.map((tag) => <Badge key={tag} label={tag} />)}
            </div>
          </div>
          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setEditing(true)} className="p-1 text-text-muted hover:text-text-primary rounded">
              <Pencil size={12} />
            </button>
            <button onClick={() => deleteCard(card.id)} className="p-1 text-text-muted hover:text-red-400 rounded">
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Editar tarjeta" size="sm">
        <div className="space-y-4">
          <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea label="Descripción (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={save}>Guardar</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
