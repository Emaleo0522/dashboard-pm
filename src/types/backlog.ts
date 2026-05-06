export type KanbanColumnId =
  | 'raw'
  | 'validating'
  | 'prioritize'
  | 'ready'
  | 'paused'
  | 'done'
  | 'discarded'

export interface BacklogCard {
  id: string
  title: string
  description?: string
  columnId: KanbanColumnId
  priority?: 'urgent' | 'high' | 'medium' | 'low'
  tags?: string[]
  color?: 'indigo' | 'violet' | 'emerald' | 'amber' | 'rose'
  linearIssueId?: string
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export const KANBAN_COLUMNS: { id: KanbanColumnId; label: string }[] = [
  { id: 'raw', label: 'Idea cruda' },
  { id: 'validating', label: 'Validando' },
  { id: 'prioritize', label: 'Priorizar' },
  { id: 'ready', label: 'Listo para Linear' },
  { id: 'paused', label: 'Pausado' },
  { id: 'done', label: 'Finalizado' },
  { id: 'discarded', label: 'Descartado' },
]

// Layout limits for resizable columns
export const COLUMN_MIN_WIDTH = 240
export const COLUMN_MAX_WIDTH = 640
export const COLUMN_DEFAULT_WIDTH = 288
// Max number of expanded cards across the whole board (FIFO)
export const MAX_OPEN_CARDS = 3
