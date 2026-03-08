import { PageShell } from '@/components/layout/PageShell'
import { StickyBoard } from '@/components/brainstorm/StickyBoard'
import { HelpTooltip } from '@/components/ui/HelpTooltip'

export default function BrainstormPage() {
  return (
    <PageShell
      title="Brainstorm"
      description="Canvas libre para ideas y conexiones"
      actions={
        <HelpTooltip
          title="Cómo usar Brainstorm"
          items={[
            { label: 'Nueva nota', description: 'Hacé click en "+ Nueva nota" para agregar una idea al canvas.' },
            { label: 'Colores', description: 'Cada nota tiene un color. Usálos para agrupar ideas por tema o prioridad.' },
            { label: 'Etiquetas', description: 'Agregá etiquetas a las notas para categorizarlas.' },
            { label: 'Filtrar', description: 'Filtrá por color o etiqueta con los botones superiores del canvas.' },
            { label: 'Todas', description: 'Click en "Todas" para quitar todos los filtros activos y ver el canvas completo.' },
          ]}
        />
      }
    >
      <div className="px-8 py-6 h-[calc(100vh-73px)] flex flex-col">
        <StickyBoard />
      </div>
    </PageShell>
  )
}
