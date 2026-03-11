'use client'
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { useCallback, useRef, useState, useEffect } from 'react'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import { useBacklogStore } from '@/store/useBacklogStore'
import { KANBAN_COLUMNS } from '@/types/backlog'
import type { KanbanColumnId } from '@/types/backlog'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

const MIN_ZOOM = 0.3
const MAX_ZOOM = 1.5
const ZOOM_STEP = 0.1

export interface ColumnFilters {
  tags: string[]
  keyword: string
  author: string
}

const emptyFilters: ColumnFilters = { tags: [], keyword: '', author: '' }

export function KanbanBoard() {
  const { cards, moveCard } = useBacklogStore()
  const isLoaded = useBacklogStore((s) => s.isLoaded)
  const loadError = useBacklogStore((s) => s.loadError)
  const loadBacklog = useBacklogStore((s) => s.load)
  const [activeId, setActiveId] = useState<string | null>(null)

  // Canvas state
  const [zoom, setZoom] = useState(0.85)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStartRef = useRef({ x: 0, y: 0 })
  const panOriginRef = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Per-column filters
  const [filters, setFilters] = useState<Record<string, ColumnFilters>>({})

  const getFilters = (colId: string): ColumnFilters => filters[colId] || emptyFilters

  const updateFilter = useCallback((colId: string, partial: Partial<ColumnFilters>) => {
    setFilters((prev) => ({
      ...prev,
      [colId]: { ...(prev[colId] || emptyFilters), ...partial },
    }))
  }, [])

  // Get all unique tags and authors for filter options
  const allTags = Array.from(new Set(cards.flatMap((c) => c.tags || [])))
  const allAuthors = Array.from(new Set(cards.map((c) => c.createdBy).filter(Boolean) as string[]))

  // Filter cards for a column
  const getFilteredCards = useCallback(
    (colId: KanbanColumnId) => {
      const colCards = cards.filter((c) => c.columnId === colId)
      const f = getFilters(colId)

      return colCards.filter((card) => {
        // Tag filter
        if (f.tags.length > 0) {
          const cardTags = card.tags || []
          if (!f.tags.some((t) => cardTags.includes(t))) return false
        }
        // Keyword filter
        if (f.keyword) {
          const kw = f.keyword.toLowerCase()
          const inTitle = card.title.toLowerCase().includes(kw)
          const inDesc = card.description?.toLowerCase().includes(kw) || false
          const inTags = (card.tags || []).some((t) => t.toLowerCase().includes(kw))
          if (!inTitle && !inDesc && !inTags) return false
        }
        // Author filter
        if (f.author && card.createdBy !== f.author) return false
        return true
      })
    },
    [cards, filters] // eslint-disable-line react-hooks/exhaustive-deps
  )

  // DnD sensors - increase distance to not conflict with panning
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
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

    // Dropped over a card -- find that card's column
    const targetCard = cards.find((c) => c.id === overId)
    if (targetCard) {
      const sourceCard = cards.find((c) => c.id === String(active.id))
      if (sourceCard && targetCard.columnId !== sourceCard.columnId) {
        moveCard(String(active.id), targetCard.columnId)
      }
    }
  }

  const activeCard = cards.find((c) => c.id === activeId)

  // Zoom with mouse wheel — use native listener with { passive: false } to avoid
  // "Unable to preventDefault inside passive event" warnings (Issue 5)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      if (activeId) return // Don't zoom while dragging
      e.preventDefault()
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
      setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta)))
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [activeId])

  // Pan with middle mouse or right click + drag
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Middle button (1) or Space+Left click -> pan
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        e.preventDefault()
        setIsPanning(true)
        panStartRef.current = { x: e.clientX, y: e.clientY }
        panOriginRef.current = { ...pan }
      }
    },
    [pan]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return
      const dx = e.clientX - panStartRef.current.x
      const dy = e.clientY - panStartRef.current.y
      setPan({
        x: panOriginRef.current.x + dx,
        y: panOriginRef.current.y + dy,
      })
    },
    [isPanning]
  )

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  // Handle mouse leave
  useEffect(() => {
    const handleGlobalUp = () => setIsPanning(false)
    window.addEventListener('mouseup', handleGlobalUp)
    return () => window.removeEventListener('mouseup', handleGlobalUp)
  }, [])

  const resetView = () => {
    setZoom(0.85)
    setPan({ x: 0, y: 0 })
  }

  const measuring = {
    droppable: {
      strategy: MeasuringStrategy.Always,
    },
  }

  // Custom modifier: only apply zoom compensation to sortable transforms
  // inside the scaled container. The DragOverlay is outside the scale so it
  // does NOT need any compensation — its coordinates are already in screen space.
  // We intentionally do NOT pass any modifier to DndContext.

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-center">
          <p className="text-sm text-red-400 font-medium mb-1">Error al cargar el backlog</p>
          <p className="text-xs text-text-muted max-w-md">{loadError}</p>
        </div>
        <button
          onClick={() => {
            useBacklogStore.setState({ isLoaded: false, loadError: null })
            loadBacklog()
          }}
          className="px-4 py-2 text-xs bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex gap-4 pb-4">
        {KANBAN_COLUMNS.map((col) => (
          <div key={col.id} className="w-60 shrink-0 md:w-72">
            <div className="px-1 mb-2.5">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {col.label}
              </span>
            </div>
            <div className="space-y-2 rounded-card p-2 bg-surface-raised/30">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="bg-surface-secondary border border-border rounded-lg p-3 animate-pulse"
                >
                  <div className="h-4 bg-surface-overlay rounded w-3/4 mb-2" />
                  <div className="h-3 bg-surface-overlay rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="relative h-[calc(100vh-160px)] overflow-hidden rounded-xl border border-border bg-surface-primary">
      {/* Zoom controls */}
      <div
        className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-surface-secondary/90 backdrop-blur-sm border border-border rounded-lg px-2 py-1.5 shadow-lg"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
          className="p-1 rounded hover:bg-surface-tertiary text-text-muted hover:text-text-primary transition-colors"
          title="Zoom out"
        >
          <ZoomOut size={16} />
        </button>
        <span className="text-xs text-text-secondary font-mono w-12 text-center select-none">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
          className="p-1 rounded hover:bg-surface-tertiary text-text-muted hover:text-text-primary transition-colors"
          title="Zoom in"
        >
          <ZoomIn size={16} />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button
          onClick={resetView}
          className="p-1 rounded hover:bg-surface-tertiary text-text-muted hover:text-text-primary transition-colors"
          title="Reset view"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      {/* Pan/zoom hint */}
      <div className="absolute bottom-3 left-3 z-20 text-[10px] text-text-muted/50 select-none pointer-events-none">
        Scroll: zoom | Alt+Drag: mover lienzo | Drag cards: mover entre columnas
      </div>

      {/* Scroll fade indicators for tablet — hint that more columns exist */}
      <div className="absolute inset-y-0 right-0 w-12 z-10 pointer-events-none bg-gradient-to-l from-surface-primary to-transparent lg:hidden" />
      <div className="absolute inset-y-0 left-0 w-8 z-10 pointer-events-none bg-gradient-to-r from-surface-primary to-transparent lg:hidden opacity-0 transition-opacity" />

      {/* Canvas container */}
      <div
        ref={containerRef}
        className={`w-full h-full overflow-x-auto ${isPanning ? 'cursor-grabbing' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ touchAction: 'none' }}
      >
        {/* Dotted grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, var(--color-border, rgba(255,255,255,0.06)) 1px, transparent 1px)`,
            backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
          }}
        />

        {/* DndContext wraps everything so DragOverlay can be outside the scale */}
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          measuring={measuring}
        >
          {/* Transformed content */}
          <div
            className="origin-top-left h-full"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              willChange: 'transform',
            }}
          >
            <div className="flex gap-3 p-4 h-full items-stretch md:gap-5 md:p-6">
              {KANBAN_COLUMNS.map((col) => (
                <KanbanColumn
                  key={col.id}
                  id={col.id}
                  label={col.label}
                  cards={getFilteredCards(col.id)}
                  totalCards={cards.filter((c) => c.columnId === col.id).length}
                  filters={getFilters(col.id)}
                  onFilterChange={(partial) => updateFilter(col.id, partial)}
                  allTags={allTags}
                  allAuthors={allAuthors}
                />
              ))}
            </div>
          </div>
          <DragOverlay dropAnimation={null}>
            {activeCard ? (
              <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
                <KanbanCard card={activeCard} isOverlay />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
