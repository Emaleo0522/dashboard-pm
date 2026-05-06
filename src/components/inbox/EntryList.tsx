'use client'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { EntryCard } from './EntryCard'
import { useInboxStore } from '@/store/useInboxStore'
import type { EntryStatus } from '@/types/inbox'

const FILTERS: { label: string; value: EntryStatus | 'all' }[] = [
  { label: 'Todo', value: 'all' },
  { label: 'Sin procesar', value: 'unprocessed' },
  { label: 'Clasificadas', value: 'classified' },
  { label: 'Convertidas', value: 'converted' },
  { label: 'Archivadas', value: 'archived' },
]

function SkeletonCard() {
  return (
    <div className="bg-surface-raised border border-border rounded-card p-4 animate-pulse">
      <div className="h-4 bg-surface-overlay rounded w-3/4 mb-3" />
      <div className="h-3 bg-surface-overlay rounded w-1/2" />
    </div>
  )
}

export function EntryList() {
  const entries = useInboxStore((s) => s.entries)
  const isLoaded = useInboxStore((s) => s.isLoaded)
  const [filter, setFilter] = useState<EntryStatus | 'all'>('all')

  const filtered = filter === 'all' ? entries : entries.filter((e) => e.status === filter)

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex items-center gap-1 flex-wrap">
        {FILTERS.map((f) => {
          const count = f.value === 'all' ? entries.length : entries.filter((e) => e.status === f.value).length
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === f.value
                  ? 'bg-accent-dim text-accent'
                  : 'text-text-muted hover:text-text-secondary hover:bg-surface-raised'
              }`}
            >
              {f.label} <span className="opacity-60 ml-1">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {!isLoaded ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">No hay entradas</p>
            ) : (
              filtered.map((entry) => <EntryCard key={entry.id} entry={entry} />)
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
