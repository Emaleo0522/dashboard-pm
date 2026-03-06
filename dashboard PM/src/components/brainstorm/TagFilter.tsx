'use client'

const NOTE_COLORS = ['indigo', 'violet', 'emerald', 'amber', 'rose'] as const
type NoteColor = typeof NOTE_COLORS[number]

const COLOR_STYLES: Record<NoteColor, string> = {
  indigo: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300',
  violet: 'bg-violet-500/20 border-violet-500/30 text-violet-300',
  emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
  amber: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
  rose: 'bg-rose-500/20 border-rose-500/30 text-rose-300',
}

interface TagFilterProps {
  tags: string[]
  selectedTag: string | null
  selectedColor: NoteColor | null
  onTagSelect: (tag: string | null) => void
  onColorSelect: (color: NoteColor | null) => void
}

export function TagFilter({ tags, selectedTag, selectedColor, onTagSelect, onColorSelect }: TagFilterProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1">
        {NOTE_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onColorSelect(selectedColor === color ? null : color)}
            className={`w-5 h-5 rounded-full border-2 transition-all ${COLOR_STYLES[color]} ${selectedColor === color ? 'scale-125' : 'opacity-60 hover:opacity-100'}`}
          />
        ))}
      </div>
      {tags.length > 0 && (
        <>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1 flex-wrap">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagSelect(selectedTag === tag ? null : tag)}
                className={`px-2 py-0.5 rounded-full text-xs transition-all ${
                  selectedTag === tag
                    ? 'bg-accent-dim text-accent border border-accent/30'
                    : 'text-text-muted hover:text-text-secondary bg-surface-raised border border-border'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
