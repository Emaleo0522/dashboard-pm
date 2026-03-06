'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import { useBrainstormStore } from '@/store/useBrainstormStore'
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
  const { updateNote, deleteNote } = useBrainstormStore()
  const colors = COLOR_STYLES[note.color] || COLOR_STYLES.indigo

  const handleMouseDown = (e: React.MouseEvent) => {
    if (editing) return
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    onDragStart(note.id, e.clientX - rect.left, e.clientY - rect.top)
  }

  const saveContent = () => {
    updateNote(note.id, { content })
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
      {/* Delete */}
      <button
        onClick={(e) => { e.stopPropagation(); deleteNote(note.id) }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-white/40 hover:text-white/80 transition-all"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <X size={12} />
      </button>

      {/* Content */}
      {editing ? (
        <textarea
          autoFocus
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={saveContent}
          onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) saveContent() }}
          className={cn('w-full bg-transparent text-sm leading-relaxed resize-none focus:outline-none', colors.text)}
          rows={4}
          onMouseDown={(e) => e.stopPropagation()}
        />
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
    </div>
  )
}
