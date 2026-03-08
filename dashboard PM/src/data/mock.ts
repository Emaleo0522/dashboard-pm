import type { InboxEntry } from '@/types/inbox'
import type { StickyNote } from '@/types/brainstorm'
import type { BacklogCard } from '@/types/backlog'
import type { LinearIssue } from '@/types/linear'
import type { Meeting } from '@/types/history'

export const mockInboxEntries: InboxEntry[] = [
  {
    id: '1',
    content: 'Los usuarios están pidiendo un modo de comparación entre planes. Podría ser útil para el onboarding.',
    status: 'classified',
    createdAt: '2026-03-08T13:00:00.000Z',
    classifiedAs: 'feature',
    tags: ['onboarding', 'pricing'],
  },
  {
    id: '2',
    content: 'El NPS bajó 12 puntos este mes. Hay que investigar el motivo antes del próximo board.',
    status: 'unprocessed',
    createdAt: '2026-03-08T12:00:00.000Z',
  },
  {
    id: '3',
    content: 'Propuesta: integrar Slack como canal de notificaciones para issues críticos.',
    status: 'converted',
    createdAt: '2026-03-07T14:00:00.000Z',
    classifiedAs: 'improvement',
    tags: ['integraciones', 'notificaciones'],
    convertedIssueId: 'PM-47',
  },
  {
    id: '4',
    content: 'Revisar el flujo de checkout — hay un 34% de abandono en el paso 2.',
    status: 'classified',
    createdAt: '2026-03-06T14:00:00.000Z',
    classifiedAs: 'bug',
    tags: ['checkout', 'conversión'],
  },
]

export const mockStickyNotes: StickyNote[] = [
  {
    id: '1',
    content: '¿Qué pasaría si el usuario pudiera customizar su dashboard desde el onboarding?',
    color: 'indigo',
    tags: ['onboarding', 'personalización'],
    position: { x: 40, y: 60 },
    createdAt: '2026-03-08T10:00:00.000Z',
  },
  {
    id: '2',
    content: 'Integración con calendarios para contexto de reuniones automático.',
    color: 'violet',
    tags: ['integraciones'],
    position: { x: 320, y: 80 },
    createdAt: '2026-03-08T10:00:00.000Z',
  },
  {
    id: '3',
    content: 'Métricas de adopción por feature — necesitamos un health score.',
    color: 'emerald',
    tags: ['métricas', 'adopción'],
    position: { x: 600, y: 120 },
    createdAt: '2026-03-08T10:00:00.000Z',
  },
  {
    id: '4',
    content: 'AI para clasificar automáticamente el feedback de usuarios.',
    color: 'amber',
    tags: ['AI', 'feedback'],
    position: { x: 160, y: 280 },
    createdAt: '2026-03-08T10:00:00.000Z',
  },
]

export const mockBacklogCards: BacklogCard[] = [
  {
    id: '1',
    title: 'Modo de comparación de planes en onboarding',
    description: 'Mostrar tabla comparativa al inicio del trial para reducir fricción en la decisión.',
    columnId: 'validating',
    priority: 'high',
    tags: ['onboarding', 'pricing'],
    createdAt: '2026-03-08T10:00:00.000Z',
    updatedAt: '2026-03-08T10:00:00.000Z',
  },
  {
    id: '2',
    title: 'Health score de adopción por feature',
    description: 'Dashboard interno para ver qué features tienen mejor adopción por segmento.',
    columnId: 'prioritize',
    priority: 'medium',
    tags: ['métricas'],
    createdAt: '2026-03-08T10:00:00.000Z',
    updatedAt: '2026-03-08T10:00:00.000Z',
  },
  {
    id: '3',
    title: 'Notificaciones Slack para issues críticos',
    description: undefined,
    columnId: 'ready',
    priority: 'high',
    tags: ['integraciones'],
    createdAt: '2026-03-08T10:00:00.000Z',
    updatedAt: '2026-03-08T10:00:00.000Z',
  },
  {
    id: '4',
    title: 'Revisar y optimizar flujo de checkout',
    columnId: 'raw',
    priority: 'urgent',
    tags: ['checkout'],
    createdAt: '2026-03-08T10:00:00.000Z',
    updatedAt: '2026-03-08T10:00:00.000Z',
  },
  {
    id: '5',
    title: 'Exportar datos a CSV desde reportes',
    columnId: 'discarded',
    priority: 'low',
    tags: ['reportes'],
    createdAt: '2026-03-08T10:00:00.000Z',
    updatedAt: '2026-03-08T10:00:00.000Z',
  },
]

export const mockLinearIssues: LinearIssue[] = [
  {
    id: '1',
    identifier: 'PM-47',
    title: 'Integrar Slack como canal de notificaciones',
    priority: 2,
    state: { id: 's1', name: 'In Progress', color: '#f97316', type: 'started' },
    cycle: { id: 'c1', name: 'Ciclo 12', number: 12 },
    createdAt: '2026-03-08T10:00:00.000Z',
    updatedAt: '2026-03-08T10:00:00.000Z',
    url: 'https://linear.app/team/issue/PM-47',
  },
  {
    id: '2',
    identifier: 'PM-44',
    title: 'Optimizar tiempo de carga del dashboard principal',
    priority: 1,
    state: { id: 's2', name: 'Todo', color: '#6366f1', type: 'unstarted' },
    cycle: { id: 'c1', name: 'Ciclo 12', number: 12 },
    createdAt: '2026-03-08T10:00:00.000Z',
    updatedAt: '2026-03-08T10:00:00.000Z',
    url: 'https://linear.app/team/issue/PM-44',
  },
  {
    id: '3',
    identifier: 'PM-39',
    title: 'Rediseño del flujo de invitación de usuarios',
    priority: 3,
    state: { id: 's3', name: 'Done', color: '#22c55e', type: 'completed' },
    cycle: { id: 'c2', name: 'Ciclo 11', number: 11 },
    createdAt: '2026-03-08T10:00:00.000Z',
    updatedAt: '2026-03-08T10:00:00.000Z',
    url: 'https://linear.app/team/issue/PM-39',
  },
]

export const mockMeetings: Meeting[] = [
  {
    id: '1',
    title: 'One-on-One PM/CPO — Semana 46',
    date: '2026-03-01T10:00:00.000Z',
    summary: 'Se revisó el estado del Q4 y se priorizaron las iniciativas de retención. El CPO validó el approach de notificaciones via Slack y se aprobó el presupuesto para la integración. Se discutió el bajo NPS y se acordó una investigación cualitativa.',
    decisions: [
      { id: 'd1', text: 'Avanzar con integración Slack en este ciclo', rationale: 'Alto impacto en retención de usuarios power' },
      { id: 'd2', text: 'Postergar exportación CSV a Q1', rationale: 'Bajo uso esperado vs esfuerzo de implementación' },
    ],
    actions: [
      { id: 'a1', text: 'Preparar propuesta de investigación cualitativa NPS', assignee: 'PM', dueDate: '2026-03-11T00:00:00.000Z', completed: false },
      { id: 'a2', text: 'Definir métricas de éxito para integración Slack', assignee: 'PM', dueDate: '2026-03-13T00:00:00.000Z', completed: true },
    ],
    tags: ['Q4', 'retención', 'NPS'],
  },
]
