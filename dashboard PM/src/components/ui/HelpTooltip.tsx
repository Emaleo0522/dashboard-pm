'use client'
import { useState } from 'react'
import { HelpCircle } from 'lucide-react'

interface HelpTooltipProps {
  title: string
  items: { label: string; description: string }[]
}

export function HelpTooltip({ title, items }: HelpTooltipProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        aria-label="Ayuda"
        className="w-7 h-7 rounded-full flex items-center justify-center border border-border text-text-muted hover:text-accent hover:border-accent/40 bg-surface-raised transition-all"
      >
        <HelpCircle size={14} />
      </button>

      {open && (
        <div
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          className="absolute right-0 top-9 w-80 bg-surface-raised border border-border rounded-xl shadow-2xl p-4 z-50"
        >
          <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3">
            {title}
          </p>
          <ul className="space-y-2.5">
            {items.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-accent/60 flex-shrink-0" />
                <span className="text-xs text-text-secondary leading-relaxed">
                  <span className="text-text-primary font-medium">{item.label}:</span>{' '}
                  {item.description}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
