import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StickyNote, NoteColor } from '@/types/brainstorm'
import { mockStickyNotes } from '@/data/mock'

interface BrainstormState {
  notes: StickyNote[]
  addNote: (content: string, color: NoteColor, tags?: string[]) => void
  updateNote: (id: string, updates: Partial<StickyNote>) => void
  moveNote: (id: string, position: { x: number; y: number }) => void
  deleteNote: (id: string) => void
}

export const useBrainstormStore = create<BrainstormState>()(
  persist(
    (set) => ({
      notes: mockStickyNotes,
      addNote: (content, color, tags) =>
        set((s) => ({
          notes: [
            ...s.notes,
            {
              id: crypto.randomUUID(),
              content,
              color,
              tags: tags ?? [],
              position: { x: Math.random() * 400 + 40, y: Math.random() * 200 + 40 },
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      updateNote: (id, updates) =>
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
        })),
      moveNote: (id, position) =>
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, position } : n)),
        })),
      deleteNote: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
    }),
    { name: 'pm-brainstorm' }
  )
)
