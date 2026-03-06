import { PageShell } from '@/components/layout/PageShell'
import { KanbanBoard } from '@/components/backlog/KanbanBoard'

export default function BacklogPage() {
  return (
    <PageShell
      title="Backlog Estratégico"
      description="Organizá y priorizá ideas en el pipeline de producto"
    >
      <div className="px-8 py-6 overflow-x-auto">
        <KanbanBoard />
      </div>
    </PageShell>
  )
}
