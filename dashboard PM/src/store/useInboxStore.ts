import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { InboxEntry, EntryStatus } from '@/types/inbox'
import { mockInboxEntries } from '@/data/mock'

interface InboxState {
  entries: InboxEntry[]
  addEntry: (content: string) => void
  updateStatus: (id: string, status: EntryStatus) => void
  deleteEntry: (id: string) => void
}

export const useInboxStore = create<InboxState>()(
  persist(
    (set) => ({
      entries: mockInboxEntries,
      addEntry: (content) =>
        set((s) => ({
          entries: [
            {
              id: crypto.randomUUID(),
              content,
              status: 'unprocessed',
              createdAt: new Date().toISOString(),
            },
            ...s.entries,
          ],
        })),
      updateStatus: (id, status) =>
        set((s) => ({
          entries: s.entries.map((e) => (e.id === id ? { ...e, status } : e)),
        })),
      deleteEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
    }),
    { name: 'pm-inbox' }
  )
)
