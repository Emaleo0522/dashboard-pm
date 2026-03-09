'use client'
import { useState, useRef, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { StickyNote } from './StickyNote'
import { TagFilter } from './TagFilter'
import { useBrainstormStore } from '@/store/useBrainstormStore'
import type { NoteColor } from '@/types/brainstorm'

export function StickyBoard() {
  const { notes, addNote, moveNote } = useBrainstormStore()
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [createColor, setCreateColor] = useState<NoteColor>('indigo')
  const boardRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null)

  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags)))

  const filtered = notes.filter((n) => {
    if (selectedTag && !n.tags.includes(selectedTag)) return false
    return true
  })

  const handleDragStart = useCallback((id: string, offsetX: number, offsetY: number) => {
    dragging.current = { id, offsetX, offsetY }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current || !boardRef.current) return
    const rect = boardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - dragging.current.offsetX
    const y = e.clientY - rect.top - dragging.current.offsetY
    moveNote(dragging.current.id, { x: Math.max(0, x), y: Math.max(0, y) })
  }, [moveNote])

  const handleMouseUp = useCallback(() => {
    dragging.current = null
  }, [])

  const handleAddNote = () => {
    addNote('Nueva idea...', createColor)
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <TagFilter
          tags={allTags}
          selectedTag={selectedTag}
          selectedColor={createColor}
          onTagSelect={setSelectedTag}
          onColorSelect={(c) => { if (c) setCreateColor(c) }}
        />
        <div className="flex-1" />
        <button
          onClick={handleAddNote}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-accent text-white rounded-card hover:bg-accent-hover transition-colors"
        >
          <Plus size={13} />
          Nueva nota
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={boardRef}
        className="flex-1 relative bg-surface-raised/30 border border-border rounded-xl overflow-hidden min-h-[500px]"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid dots */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #a1a1aa 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        {filtered.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-text-muted text-sm">
              {notes.length === 0 ? 'Hac\u00e9 clic en "Nueva nota" para empezar' : 'No hay notas con ese filtro'}
            </p>
          </div>
        )}

        {filtered.map((note) => (
          <StickyNote key={note.id} note={note} onDragStart={handleDragStart} />
        ))}
      </div>
    </div>
  )
}
