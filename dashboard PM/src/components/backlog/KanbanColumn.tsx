'use client'
import { useState } from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { Plus, Filter, X, Search } from 'lucide-react'
import { KanbanCard } from './KanbanCard'
import { useBacklogStore } from '@/store/useBacklogStore'
import type { BacklogCard, KanbanColumnId } from '@/types/backlog'
import type { ColumnFilters } from './KanbanBoard'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  id: KanbanColumnId
  label: string
  cards: BacklogCard[]
  totalCards: number
  filters: ColumnFilters
  onFilterChange: (partial: Partial<ColumnFilters>) => void
  allTags: string[]
  allAuthors: string[]
}

type PriorityValue = '' | 'urgent' | 'high' | 'medium' | 'low'

const AUTHORS = ['Ema - PM', 'Anto - CPO']

export function KanbanColumn({
  id,
  label,
  cards,
  totalCards,
  filters,
  onFilterChange,
  allTags,
  allAuthors,
}: KanbanColumnProps) {
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newTagsInput, setNewTagsInput] = useState('')
  const [newPriority, setNewPriority] = useState<PriorityValue>('')
  const [showFilters, setShowFilters] = useState(false)
  const addCard = useBacklogStore((s) => s.addCard)
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id })

  const parsedTags = newTagsInput
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0)

  const handleAdd = () => {
    if (!newTitle.trim()) return
    addCard({
      title: newTitle.trim(),
      columnId: id,
      description: newDescription.trim() || undefined,
      tags: parsedTags.length > 0 ? parsedTags : undefined,
      priority: newPriority || undefined,
    })
    setNewTitle('')
    setNewDescription('')
    setNewTagsInput('')
    setNewPriority('')
    setAdding(false)
  }

  const handleCancel = () => {
    setNewTitle('')
    setNewDescription('')
    setNewTagsInput('')
    setNewPriority('')
    setAdding(false)
  }

  const hasActiveFilters = filters.tags.length > 0 || filters.keyword !== '' || filters.author !== ''
  const isFiltered = totalCards !== cards.length

  // Merge known authors with actual authors from data
  const authorOptions = Array.from(new Set([...AUTHORS, ...allAuthors]))

  const toggleTag = (tag: string) => {
    const current = filters.tags
    if (current.includes(tag)) {
      onFilterChange({ tags: current.filter((t) => t !== tag) })
    } else {
      onFilterChange({ tags: [...current, tag] })
    }
  }

  const clearFilters = () => {
    onFilterChange({ tags: [], keyword: '', author: '' })
  }

  return (
    <div ref={setDropRef} className={cn(
      'flex flex-col w-60 shrink-0 rounded-xl transition-all duration-150 lg:w-72 min-h-full',
      isOver ? 'ring-2 ring-accent/40 bg-accent-dim/20' : ''
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            {label}
          </span>
          <span className="text-xs text-text-muted bg-surface-raised px-1.5 py-0.5 rounded-full">
            {isFiltered ? `${cards.length}/${totalCards}` : totalCards}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'p-1 rounded transition-colors',
              hasActiveFilters
                ? 'text-accent bg-accent-dim'
                : 'text-text-muted hover:text-text-primary'
            )}
            title="Filtros"
          >
            <Filter size={13} />
          </button>
          <button
            onClick={() => setAdding(true)}
            className="text-text-muted hover:text-text-primary transition-colors p-0.5 rounded"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mb-2 p-2.5 bg-surface-secondary border border-border rounded-lg space-y-2.5">
          {/* Keyword search */}
          <div className="relative">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => onFilterChange({ keyword: e.target.value })}
              placeholder="Buscar..."
              className="w-full bg-surface-raised border border-border rounded px-2 py-1.5 pl-7 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors"
            />
          </div>

          {/* Author filter */}
          <div>
            <span className="text-[10px] text-text-muted uppercase tracking-wider">Autor</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {authorOptions.map((author) => (
                <button
                  key={author}
                  onClick={() => onFilterChange({ author: filters.author === author ? '' : author })}
                  className={cn(
                    'text-[11px] px-2 py-0.5 rounded-full border transition-colors',
                    filters.author === author
                      ? 'bg-accent-dim text-accent border-accent/30'
                      : 'bg-surface-raised text-text-muted border-border hover:text-text-secondary'
                  )}
                >
                  {author}
                </button>
              ))}
            </div>
          </div>

          {/* Tag filter */}
          {allTags.length > 0 && (
            <div>
              <span className="text-[10px] text-text-muted uppercase tracking-wider">Tags</span>
              <div className="flex flex-wrap gap-1 mt-1 max-h-24 overflow-y-auto">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'text-[11px] px-2 py-0.5 rounded-full border transition-colors',
                      filters.tags.includes(tag)
                        ? 'bg-accent-dim text-accent border-accent/30'
                        : 'bg-surface-raised text-text-muted border-border hover:text-text-secondary'
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 transition-colors"
            >
              <X size={11} />
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Cards area */}
      <div
        className="flex-1 space-y-2 min-h-[200px] rounded-xl p-2.5 bg-surface-raised/30 h-full"
      >
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <KanbanCard key={card.id} card={card} />
          ))}
        </SortableContext>

        {/* Empty state */}
        {cards.length === 0 && (
          <div className="flex items-center justify-center h-24 text-text-muted/40 text-xs">
            {isFiltered ? 'Sin resultados' : 'Sin ideas'}
          </div>
        )}
      </div>

      {/* Add card inline */}
      {adding && (
        <div className="mt-2 space-y-2">
          <textarea
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleAdd()
              }
              if (e.key === 'Escape') handleCancel()
            }}
            placeholder="Titulo de la tarjeta..."
            rows={2}
            className="w-full bg-surface-raised border border-accent/40 rounded-card px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none resize-none"
          />

          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') handleCancel()
            }}
            placeholder="Descripcion (opcional)..."
            rows={2}
            className="w-full bg-surface-raised border border-border rounded-card px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 resize-none transition-colors"
          />

          <div>
            <input
              type="text"
              value={newTagsInput}
              onChange={(e) => setNewTagsInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') handleCancel()
              }}
              placeholder="Tags: onboarding, pricing..."
              className="w-full bg-surface-raised border border-border rounded-card px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors"
            />
            {parsedTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {parsedTags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-accent-dim text-accent text-xs px-1.5 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as PriorityValue)}
            className="bg-surface-raised border border-border rounded-card px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent w-full"
          >
            <option value="">Sin prioridad</option>
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>

          <div className="flex gap-1.5">
            <button
              onClick={handleAdd}
              className="flex-1 px-2 py-1 text-xs bg-accent text-white rounded-card hover:bg-accent-hover transition-colors"
            >
              Agregar
            </button>
            <button
              onClick={handleCancel}
              className="px-2 py-1 text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              X
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
