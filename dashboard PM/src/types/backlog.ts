export type KanbanColumnId = 'raw' | 'validating' | 'prioritize' | 'ready' | 'discarded'

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
  { id: 'discarded', label: 'Descartado' },
]
