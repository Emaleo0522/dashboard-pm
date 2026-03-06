'use client'
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { useState } from 'react'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import { useBacklogStore } from '@/store/useBacklogStore'
import { KANBAN_COLUMNS } from '@/types/backlog'
import type { KanbanColumnId } from '@/types/backlog'

export function KanbanBoard() {
  const { cards, moveCard } = useBacklogStore()
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id))

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    setActiveId(null)
    if (!over) return

    const overId = String(over.id)
    const isColumn = KANBAN_COLUMNS.some((c) => c.id === overId)

    if (isColumn) {
      moveCard(String(active.id), overId as KanbanColumnId)
      return
    }

    // Dropped over a card — find that card's column
    const targetCard = cards.find((c) => c.id === overId)
    if (targetCard && targetCard.columnId !== cards.find((c) => c.id === String(active.id))?.columnId) {
      moveCard(String(active.id), targetCard.columnId)
    }
  }

  const activeCard = cards.find((c) => c.id === activeId)

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 pb-4">
        {KANBAN_COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            label={col.label}
            cards={cards.filter((c) => c.columnId === col.id)}
          />
        ))}
      </div>
      <DragOverlay>
        {activeCard ? <KanbanCard card={activeCard} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
