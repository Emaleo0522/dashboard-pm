export type NoteColor = 'indigo' | 'violet' | 'emerald' | 'amber' | 'rose'

export interface StickyNote {
  id: string
  content: string
  color: NoteColor
  tags: string[]
  position: { x: number; y: number }
  createdAt: string
}
