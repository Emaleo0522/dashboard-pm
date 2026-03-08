import { PageShell } from '@/components/layout/PageShell'
import { KanbanBoard } from '@/components/backlog/KanbanBoard'
import { HelpTooltip } from '@/components/ui/HelpTooltip'

export default function BacklogPage() {
  return (
    <PageShell
      title="Backlog Estratégico"
      description="Organizá y priorizá ideas en el pipeline de producto"
      actions={
        <HelpTooltip
          title="Cómo usar el Backlog"
          items={[
            { label: 'Columnas', description: 'El tablero tiene 4 etapas: Ideas → Refinando → Listo para ejecutar → Descartado.' },
            { label: 'Mover tarjetas', description: 'Arrastrá cualquier tarjeta a otra columna para actualizar su estado.' },
            { label: 'Nueva tarjeta', description: 'Usá el botón "+" al pie de cada columna para agregar una idea nueva.' },
            { label: 'Prioridad', description: 'Cada tarjeta tiene un nivel de prioridad: Crítica, Alta, Media o Baja.' },
          ]}
        />
      }
    >
      <div className="px-8 py-6 overflow-x-auto">
        <KanbanBoard />
      </div>
    </PageShell>
  )
}
