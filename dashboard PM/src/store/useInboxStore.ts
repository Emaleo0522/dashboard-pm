import { create } from 'zustand'
import type { InboxEntry, EntryStatus } from '@/types/inbox'
import { useAuthStore } from './useAuthStore'

interface InboxState {
  entries: InboxEntry[]
  isLoaded: boolean
  load: () => Promise<void>
  addEntry: (content: string) => Promise<void>
  addClassifiedEntry: (
    content: string,
    classifiedAs: NonNullable<InboxEntry['classifiedAs']>,
    tags: string[]
  ) => Promise<void>
  updateStatus: (id: string, status: EntryStatus) => void
  deleteEntry: (id: string) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pbToEntry(r: any): InboxEntry {
  return {
    id: r.id,
    content: r.content,
    status: (r.status as EntryStatus) || 'unprocessed',
    classifiedAs: r.classifiedAs || undefined,
    tags: Array.isArray(r.tags) ? r.tags : [],
    convertedIssueId: r.convertedIssueId || undefined,
    createdBy: r.createdBy || undefined,
    createdAt: r.created,
  }
}

export const useInboxStore = create<InboxState>()((set, get) => ({
  entries: [],
  isLoaded: false,

  load: async () => {
    if (get().isLoaded) return
    try {
      const res = await fetch('/api/pb/inbox_entries?perPage=200&sort=-id')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (!data.items) throw new Error('Unexpected response shape')
      set({ entries: data.items.map(pbToEntry), isLoaded: true })
    } catch (err) {
      console.error('[InboxStore] load failed:', err)
      // No marcar isLoaded:true para que el próximo montaje reintente
    }
  },

  addEntry: async (content) => {
    const user = useAuthStore.getState().user
    const createdBy = user?.name || user?.email || undefined
    const tempId = `temp_${crypto.randomUUID()}`
    const optimistic: InboxEntry = {
      id: tempId,
      content,
      status: 'unprocessed',
      createdBy,
      createdAt: new Date().toISOString(),
    }
    set((s) => ({ entries: [optimistic, ...s.entries] }))
    try {
      const res = await fetch('/api/pb/inbox_entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, status: 'unprocessed', tags: [], createdBy: createdBy ?? '' }),
      })
      const item = await res.json()
      set((s) => ({
        entries: s.entries.map((e) => (e.id === tempId ? pbToEntry(item) : e)),
      }))
    } catch {
      set((s) => ({ entries: s.entries.filter((e) => e.id !== tempId) }))
    }
  },

  addClassifiedEntry: async (content, classifiedAs, tags) => {
    const user = useAuthStore.getState().user
    const createdBy = user?.name || user?.email || undefined
    const tempId = `temp_${crypto.randomUUID()}`
    const optimistic: InboxEntry = {
      id: tempId,
      content,
      status: 'classified',
      classifiedAs,
      tags,
      createdBy,
      createdAt: new Date().toISOString(),
    }
    set((s) => ({ entries: [optimistic, ...s.entries] }))
    try {
      const res = await fetch('/api/pb/inbox_entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, status: 'classified', classifiedAs, tags, createdBy: createdBy ?? '' }),
      })
      const item = await res.json()
      set((s) => ({
        entries: s.entries.map((e) => (e.id === tempId ? pbToEntry(item) : e)),
      }))
    } catch {
      set((s) => ({ entries: s.entries.filter((e) => e.id !== tempId) }))
    }
  },

  updateStatus: (id, status) => {
    set((s) => ({
      entries: s.entries.map((e) => (e.id === id ? { ...e, status } : e)),
    }))
    fetch(`/api/pb/inbox_entries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {})
  },

  deleteEntry: (id) => {
    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }))
    fetch(`/api/pb/inbox_entries/${id}`, { method: 'DELETE' }).catch(() => {})
  },
}))
