import { cn } from '@/lib/utils'
import type { EntryStatus } from '@/types/inbox'
import type { IssuePriority } from '@/types/linear'

const statusConfig: Record<EntryStatus, { label: string; color: string }> = {
  unprocessed: { label: 'Sin procesar', color: 'bg-text-muted/20 text-text-muted' },
  classified: { label: 'Clasificada', color: 'bg-blue-500/20 text-blue-400' },
  converted: { label: 'Convertida', color: 'bg-green-500/20 text-green-400' },
  archived: { label: 'Archivada', color: 'bg-zinc-800 text-text-muted' },
}

const priorityConfig: Record<IssuePriority, { label: string; color: string }> = {
  0: { label: 'Sin prioridad', color: 'bg-zinc-800 text-text-muted' },
  1: { label: 'Urgente', color: 'bg-red-500/20 text-red-400' },
  2: { label: 'Alta', color: 'bg-orange-500/20 text-orange-400' },
  3: { label: 'Media', color: 'bg-yellow-500/20 text-yellow-400' },
  4: { label: 'Baja', color: 'bg-zinc-700/50 text-text-muted' },
}

interface BadgeProps {
  variant?: 'status' | 'priority' | 'tag'
  status?: EntryStatus
  priority?: IssuePriority
  label?: string
  className?: string
}

export function Badge({ variant = 'tag', status, priority, label, className }: BadgeProps) {
  let content = { label: label || '', color: 'bg-accent-dim text-accent' }

  if (variant === 'status' && status) content = statusConfig[status]
  if (variant === 'priority' && priority !== undefined) content = priorityConfig[priority]

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        content.color,
        className
      )}
    >
      {content.label || label}
    </span>
  )
}
