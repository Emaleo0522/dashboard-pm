import { create } from 'zustand'
import type { BacklogCard, KanbanColumnId } from '@/types/backlog'
import { useAuthStore } from './useAuthStore'

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
  isLoaded: boolean
  load: () => Promise<void>
  addCard: (data: AddCardData) => Promise<void>
  updateCard: (id: string, updates: Partial<BacklogCard>) => void
  moveCard: (id: string, columnId: KanbanColumnId) => void
  deleteCard: (id: string) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pbToCard(r: any): BacklogCard {
  return {
    id: r.id,
    title: r.title,
    description: r.description || undefined,
    columnId: r.columnId as KanbanColumnId,
    priority: r.priority || undefined,
    tags: Array.isArray(r.tags) ? r.tags : [],
    color: r.color || undefined,
    linearIssueId: r.linearIssueId || undefined,
    createdBy: r.createdBy || undefined,
    createdAt: r.created,
    updatedAt: r.updated,
  }
}

export const useBacklogStore = create<BacklogState>()((set, get) => ({
  cards: [],
  isLoaded: false,

  load: async () => {
    if (get().isLoaded) return
    try {
      const res = await fetch('/api/pb/backlog_cards?perPage=200&sort=created')
      const data = await res.json()
      set({ cards: (data.items ?? []).map(pbToCard), isLoaded: true })
    } catch {
      set({ isLoaded: true })
    }
  },

  addCard: async (data) => {
    const user = useAuthStore.getState().user
    const createdBy = user?.name || user?.email || undefined
    const tempId = `temp_${crypto.randomUUID()}`
    const optimistic: BacklogCard = {
      id: tempId,
      title: data.title,
      columnId: data.columnId,
      description: data.description,
      tags: data.tags ?? [],
      priority: data.priority,
      color: data.color,
      createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    set((s) => ({ cards: [...s.cards, optimistic] }))
    try {
      const res = await fetch('/api/pb/backlog_cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          columnId: data.columnId,
          description: data.description ?? '',
          tags: data.tags ?? [],
          priority: data.priority ?? '',
          color: data.color ?? '',
          linearIssueId: '',
          createdBy: createdBy ?? '',
        }),
      })
      const item = await res.json()
      set((s) => ({
        cards: s.cards.map((c) => (c.id === tempId ? pbToCard(item) : c)),
      }))
    } catch {
      set((s) => ({ cards: s.cards.filter((c) => c.id !== tempId) }))
    }
  },

  updateCard: (id, updates) => {
    set((s) => ({
      cards: s.cards.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      ),
    }))
    fetch(`/api/pb/backlog_cards/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {})
  },

  moveCard: (id, columnId) => {
    set((s) => ({
      cards: s.cards.map((c) =>
        c.id === id ? { ...c, columnId, updatedAt: new Date().toISOString() } : c
      ),
    }))
    fetch(`/api/pb/backlog_cards/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columnId }),
    }).catch(() => {})
  },

  deleteCard: (id) => {
    set((s) => ({ cards: s.cards.filter((c) => c.id !== id) }))
    fetch(`/api/pb/backlog_cards/${id}`, { method: 'DELETE' }).catch(() => {})
  },
}))
