'use client'
import { Search, X } from 'lucide-react'

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
        placeholder="Busca por tema, decision o accion..."
        className="w-full bg-surface-raised border border-border rounded-card pl-9 pr-9 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
          aria-label="Limpiar busqueda"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
