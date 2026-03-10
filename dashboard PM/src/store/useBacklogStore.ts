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
  loadError: string | null
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
  loadError: null,

  load: async () => {
    if (get().isLoaded) return
    set({ loadError: null })
    try {
      let allItems: BacklogCard[] = []
      let page = 1
      const perPage = 200
      let hasMore = true

      while (hasMore) {
        const res = await fetch(`/api/pb/backlog_cards?perPage=${perPage}&page=${page}&sort=-id`)
        if (!res.ok) {
          const errText = await res.text().catch(() => '')
          throw new Error(`HTTP ${res.status}: ${errText}`)
        }
        const data = await res.json()
        if (!data.items) throw new Error('Unexpected response shape: ' + JSON.stringify(data).slice(0, 200))
        allItems = [...allItems, ...data.items.map(pbToCard)]
        hasMore = data.totalPages > page
        page++
      }

      set({ cards: allItems, isLoaded: true, loadError: null })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      console.error('[BacklogStore] load failed:', msg)
      set({ loadError: msg })
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
    const prev = get().cards.find((c) => c.id === id)
    set((s) => ({
      cards: s.cards.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      ),
    }))
    fetch(`/api/pb/backlog_cards/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {
      if (prev) {
        set((s) => ({ cards: s.cards.map((c) => (c.id === id ? prev : c)) }))
      }
    })
  },

  moveCard: (id, columnId) => {
    const prev = get().cards.find((c) => c.id === id)
    set((s) => ({
      cards: s.cards.map((c) =>
        c.id === id ? { ...c, columnId, updatedAt: new Date().toISOString() } : c
      ),
    }))
    fetch(`/api/pb/backlog_cards/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columnId }),
    }).catch(() => {
      if (prev) {
        set((s) => ({ cards: s.cards.map((c) => (c.id === id ? prev : c)) }))
      }
    })
  },

  deleteCard: (id) => {
    const prev = get().cards.find((c) => c.id === id)
    set((s) => ({ cards: s.cards.filter((c) => c.id !== id) }))
    fetch(`/api/pb/backlog_cards/${id}`, { method: 'DELETE' }).catch(() => {
      if (prev) {
        set((s) => ({ cards: [...s.cards, prev] }))
      }
    })
  },
}))
