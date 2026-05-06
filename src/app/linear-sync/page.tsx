import { PageShell } from '@/components/layout/PageShell'
import { IssueTable } from '@/components/linear-sync/IssueTable'
import { HelpTooltip } from '@/components/ui/HelpTooltip'

export default function LinearSyncPage() {
  return (
    <PageShell
      title="Linear Sync"
      description="Issues conectados a tu workspace de Linear"
      actions={
        <HelpTooltip
          title="Cómo usar Linear Sync"
          items={[
            { label: '¿Qué es Linear?', description: 'Linear es una herramienta de gestión de issues para equipos de producto. Este módulo conecta tu dashboard con ella.' },
            { label: 'Ver issues', description: 'Se listan todos los issues activos de tu equipo en Linear con estado y prioridad.' },
            { label: 'Crear issue', description: 'Usá el botón "Nuevo issue" para crear uno directamente desde el dashboard, sin abrir Linear.' },
            { label: 'Configuración', description: 'Necesitás configurar tu LINEAR_API_KEY y LINEAR_TEAM_ID en la sección Settings para que funcione.' },
          ]}
        />
      }
    >
      <div className="px-8 py-6">
        <IssueTable />
      </div>
    </PageShell>
  )
}
