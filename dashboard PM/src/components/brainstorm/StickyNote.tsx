'use client'
import { useState, useRef } from 'react'
import { X } from 'lucide-react'
import { useBrainstormStore } from '@/store/useBrainstormStore'
import { useBacklogStore } from '@/store/useBacklogStore'
import type { StickyNote as StickyNoteType } from '@/types/brainstorm'
import { cn } from '@/lib/utils'

const COLOR_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  indigo: { bg: 'bg-indigo-950/60', border: 'border-indigo-500/40', text: 'text-indigo-100' },
  violet: { bg: 'bg-violet-950/60', border: 'border-violet-500/40', text: 'text-violet-100' },
  emerald: { bg: 'bg-emerald-950/60', border: 'border-emerald-500/40', text: 'text-emerald-100' },
  amber: { bg: 'bg-amber-950/60', border: 'border-amber-500/40', text: 'text-amber-100' },
  rose: { bg: 'bg-rose-950/60', border: 'border-rose-500/40', text: 'text-rose-100' },
}

interface StickyNoteProps {
  note: StickyNoteType
  onDragStart: (id: string, offsetX: number, offsetY: number) => void
}

export function StickyNote({ note, onDragStart }: StickyNoteProps) {
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(note.content)
  const [tags, setTags] = useState<string[]>(note.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { updateNote, deleteNote } = useBrainstormStore()
  const { addCard } = useBacklogStore()
  const colors = COLOR_STYLES[note.color] || COLOR_STYLES.indigo
  const editContainerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (editing) return
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    onDragStart(note.id, e.clientX - rect.left, e.clientY - rect.top)
  }

  const saveContent = () => {
    updateNote(note.id, { content, tags })
    setEditing(false)
  }

  const cancelEditing = () => {
    setContent(note.content)
    setTags(note.tags || [])
    setTagInput('')
    setEditing(false)
  }

  return (
    <div
      className={cn(
        'absolute w-52 rounded-xl border p-3.5 shadow-lg group',
        colors.bg, colors.border,
        !editing && 'cursor-grab active:cursor-grabbing select-none'
      )}
      style={{ left: note.position.x, top: note.position.y }}
      onMouseDown={handleMouseDown}
    >
      {/* Confirm delete overlay */}
      {confirmDelete && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-lg z-10 gap-2">
          <span className="text-xs text-white">¿Eliminar?</span>
          <div className="flex gap-2">
            <button onClick={() => deleteNote(note.id)} className="text-xs bg-red-500 text-white px-2 py-1 rounded">Sí</button>
            <button onClick={() => setConfirmDelete(false)} className="text-xs bg-white/20 text-white px-2 py-1 rounded">No</button>
          </div>
        </div>
      )}

      {/* Delete */}
      <button
        onClick={(e) => { e.stopPropagation(); setConfirmDelete(true) }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-white/40 hover:text-white/80 transition-all"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <X size={12} />
      </button>

      {/* Content */}
      {editing ? (
        <div
          ref={editContainerRef}
          onBlur={(e) => {
            if (!editContainerRef.current?.contains(e.relatedTarget as Node)) {
              saveContent()
            }
          }}
        >
          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.metaKey) saveContent()
              if (e.key === 'Escape') cancelEditing()
            }}
            className={cn('w-full bg-transparent text-sm leading-relaxed resize-none focus:outline-none', colors.text)}
            rows={4}
            onMouseDown={(e) => e.stopPropagation()}
          />
          {/* Tags management en edición */}
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                {tag}
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); setTags(prev => prev.filter(t => t !== tag)) }}
                  className="hover:text-red-300 ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-1 mt-1">
            <input
              onMouseDown={(e) => e.stopPropagation()}
              className="flex-1 bg-white/10 text-white text-xs px-2 py-1 rounded border border-white/20 focus:outline-none placeholder-white/40"
              placeholder="Agregar tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation()
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const t = tagInput.trim()
                  if (t && !tags.includes(t)) setTags(prev => [...prev, t])
                  setTagInput('')
                }
              }}
            />
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                const t = tagInput.trim()
                if (t && !tags.includes(t)) setTags(prev => [...prev, t])
                setTagInput('')
              }}
              className="text-xs bg-white/20 text-white px-2 py-1 rounded hover:bg-white/30"
            >
              +
            </button>
          </div>
        </div>
      ) : (
        <p
          className={cn('text-sm leading-relaxed', colors.text)}
          onDoubleClick={(e) => { e.stopPropagation(); setEditing(true) }}
        >
          {note.content}
        </p>
      )}

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-white/10">
          {note.tags.map((tag) => (
            <span key={tag} className={cn('text-xs opacity-60', colors.text)}>{tag}</span>
          ))}
        </div>
      )}

      {/* Send to Backlog button */}
      <button
        onClick={(e) => { e.stopPropagation(); addCard({ title: note.content, columnId: 'raw', tags: tags }) }}
        onMouseDown={(e) => e.stopPropagation()}
        className="mt-2 w-full opacity-0 group-hover:opacity-100 text-xs bg-white/10 text-white/70 hover:bg-white/20 hover:text-white px-2 py-1 rounded transition-all"
      >
        → Backlog
      </button>
    </div>
  )
}
