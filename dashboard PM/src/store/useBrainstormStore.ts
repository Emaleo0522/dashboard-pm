import { create } from 'zustand'
import type { StickyNote, NoteColor } from '@/types/brainstorm'
import { useAuthStore } from './useAuthStore'

interface BrainstormState {
  notes: StickyNote[]
  isLoaded: boolean
  load: () => Promise<void>
  addNote: (content: string, color: NoteColor, tags?: string[]) => Promise<void>
  updateNote: (id: string, updates: Partial<StickyNote>) => void
  moveNote: (id: string, position: { x: number; y: number }) => void
  deleteNote: (id: string) => void
  resizeNote: (id: string, size: { width: number; height: number }) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pbToNote(r: any): StickyNote {
  return {
    id: r.id,
    content: r.content,
    color: r.color as NoteColor,
    tags: Array.isArray(r.tags) ? r.tags : [],
    position: { x: r.posX ?? 100, y: r.posY ?? 100 },
    size: r.size ?? undefined,
    createdBy: r.createdBy || undefined,
    createdAt: r.created,
  }
}

export const useBrainstormStore = create<BrainstormState>()((set, get) => ({
  notes: [],
  isLoaded: false,

  load: async () => {
    if (get().isLoaded) return
    try {
      const res = await fetch('/api/pb/brainstorm_notes?perPage=200&sort=id')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (!data.items) throw new Error('Unexpected response shape')
      set({ notes: data.items.map(pbToNote), isLoaded: true })
    } catch (err) {
      console.error('[BrainstormStore] load failed:', err)
    }
  },

  addNote: async (content, color, tags) => {
    const user = useAuthStore.getState().user
    const createdBy = user?.name || user?.email || undefined
    const tempId = `temp_${crypto.randomUUID()}`
    const pos = { x: Math.random() * 400 + 40, y: Math.random() * 200 + 40 }
    const optimistic: StickyNote = {
      id: tempId,
      content,
      color,
      tags: tags ?? [],
      position: pos,
      createdBy,
      createdAt: new Date().toISOString(),
    }
    set((s) => ({ notes: [...s.notes, optimistic] }))
    try {
      const res = await fetch('/api/pb/brainstorm_notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          color,
          tags: tags ?? [],
          posX: pos.x,
          posY: pos.y,
          createdBy: createdBy ?? '',
        }),
      })
      const item = await res.json()
      set((s) => ({
        notes: s.notes.map((n) => (n.id === tempId ? pbToNote(item) : n)),
      }))
    } catch {
      set((s) => ({ notes: s.notes.filter((n) => n.id !== tempId) }))
    }
  },

  updateNote: (id, updates) => {
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    }))
    const pbUpdates: Record<string, unknown> = { ...updates }
    if (updates.position) {
      pbUpdates.posX = updates.position.x
      pbUpdates.posY = updates.position.y
      delete pbUpdates.position
    }
    fetch(`/api/pb/brainstorm_notes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pbUpdates),
    }).catch(() => {})
  },

  moveNote: (id, position) => {
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? { ...n, position } : n)),
    }))
    fetch(`/api/pb/brainstorm_notes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ posX: position.x, posY: position.y }),
    }).catch(() => {})
  },

  deleteNote: (id) => {
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }))
    fetch(`/api/pb/brainstorm_notes/${id}`, { method: 'DELETE' }).catch(() => {})
  },

  resizeNote: (id, size) => {
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? { ...n, size } : n)),
    }))
    fetch(`/api/pb/brainstorm_notes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ size }),
    }).catch(() => {})
  },
}))
