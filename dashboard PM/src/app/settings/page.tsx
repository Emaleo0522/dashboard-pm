import { PageShell } from '@/components/layout/PageShell'
import { LinearConfig } from '@/components/settings/LinearConfig'
import { CalendarConfig } from '@/components/settings/CalendarConfig'
import { UserPreferences } from '@/components/settings/UserPreferences'
import { HelpTooltip } from '@/components/ui/HelpTooltip'

export default function SettingsPage() {
  return (
    <PageShell
      title="Settings"
      description="Configuración del dashboard y conexiones"
      actions={
        <HelpTooltip
          title="Cómo usar Settings"
          items={[
            { label: 'Nombre y rol', description: 'Personalizá cómo aparecés en el dashboard. No afecta ninguna integración externa.' },
            { label: 'Linear API Key', description: 'Obtené tu key en linear.app → Settings → API → Personal API Keys. Es necesaria para Linear Sync.' },
            { label: 'Linear Team ID', description: 'El ID de tu equipo en Linear. Lo encontrás en linear.app → Settings → Members → Team ID.' },
            { label: 'Google Calendar', description: 'Conectá tu calendario para importar reuniones pasadas al Historial y anotarlas con decisiones y acciones.' },
            { label: 'Anthropic API Key', description: 'Se configura directamente en Vercel (no aquí). Es necesaria para el botón "Procesar con IA" en Inbox.' },
          ]}
        />
      }
    >
      <div className="px-8 py-6 max-w-xl space-y-4">
        <UserPreferences />
        <LinearConfig />
        <CalendarConfig />
      </div>
    </PageShell>
  )
}
