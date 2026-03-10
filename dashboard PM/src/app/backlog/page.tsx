import { PageShell } from '@/components/layout/PageShell'
import { KanbanBoard } from '@/components/backlog/KanbanBoard'
import { HelpTooltip } from '@/components/ui/HelpTooltip'

export default function BacklogPage() {
  return (
    <PageShell
      title="Backlog Estrategico"
      description="Organiza y prioriza ideas en el pipeline de producto"
      actions={
        <HelpTooltip
          title="Como usar el Backlog"
          items={[
            { label: 'Lienzo', description: 'Usa scroll para zoom y Alt+Drag para mover el lienzo.' },
            { label: 'Columnas', description: 'El tablero tiene 5 etapas: Idea cruda, Validando, Priorizar, Listo para Linear, Descartado.' },
            { label: 'Mover tarjetas', description: 'Arrastra cualquier tarjeta a otra columna para actualizar su estado.' },
            { label: 'Filtros', description: 'Cada columna tiene un filtro por tags, autor y palabras clave.' },
            { label: 'Nueva tarjeta', description: 'Usa el boton "+" en el header de cada columna para agregar una idea.' },
          ]}
        />
      }
    >
      <div className="px-4 py-2">
        <KanbanBoard />
      </div>
    </PageShell>
  )
}
