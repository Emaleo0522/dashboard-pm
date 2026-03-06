'use client'
import { Search } from 'lucide-react'

interface SemanticSearchProps {
  value: string
  onChange: (value: string) => void
}

export function SemanticSearch({ value, onChange }: SemanticSearchProps) {
  return (
    <div className="relative">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Busc\u00e1 por tema, decisi\u00f3n o acci\u00f3n..."
        className="w-full bg-surface-raised border border-border rounded-card pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
      />
      {value && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-accent bg-accent-dim px-1.5 py-0.5 rounded-full">
          IA
        </span>
      )}
    </div>
  )
}
