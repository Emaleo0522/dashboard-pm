import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BacklogCard, KanbanColumnId } from '@/types/backlog'
import { mockBacklogCards } from '@/data/mock'

interface AddCardData {
  title: string
  columnId: KanbanColumnId
  description?: string
  tags?: string[]
  priority?: 'urgent' | 'high' | 'medium' | 'low'
  color?: 'indigo' | 'violet' | 'emerald' | 'amber' | 'rose'
}

interface BacklogState {
  cards: BacklogCard[]
  addCard: (data: AddCardData) => void
  updateCard: (id: string, updates: Partial<BacklogCard>) => void
  moveCard: (id: string, columnId: KanbanColumnId) => void
  deleteCard: (id: string) => void
}

export const useBacklogStore = create<BacklogState>()(
  persist(
    (set) => ({
      cards: mockBacklogCards,
      addCard: (data) =>
        set((s) => ({
          cards: [
            ...s.cards,
            {
              id: crypto.randomUUID(),
              title: data.title,
              columnId: data.columnId,
              description: data.description,
              tags: data.tags,
              priority: data.priority,
              color: data.color,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),
      updateCard: (id, updates) =>
        set((s) => ({
          cards: s.cards.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
          ),
        })),
      moveCard: (id, columnId) =>
        set((s) => ({
          cards: s.cards.map((c) =>
            c.id === id ? { ...c, columnId, updatedAt: new Date().toISOString() } : c
          ),
        })),
      deleteCard: (id) =>
        set((s) => ({ cards: s.cards.filter((c) => c.id !== id) })),
    }),
    { name: 'pm-backlog' }
  )
)
