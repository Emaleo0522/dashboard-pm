import { PageShell } from '@/components/layout/PageShell'
import { LinearConfig } from '@/components/settings/LinearConfig'
import { UserPreferences } from '@/components/settings/UserPreferences'

export default function SettingsPage() {
  return (
    <PageShell title="Settings" description="Configuraci\u00f3n del dashboard y conexiones">
      <div className="px-8 py-6 max-w-xl space-y-4">
        <UserPreferences />
        <LinearConfig />
      </div>
    </PageShell>
  )
}
