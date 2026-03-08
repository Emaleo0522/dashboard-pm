import { PageShell } from '@/components/layout/PageShell'
import { EntryInput } from '@/components/inbox/EntryInput'
import { EntryList } from '@/components/inbox/EntryList'
import { HelpTooltip } from '@/components/ui/HelpTooltip'

export default function InboxPage() {
  return (
    <PageShell
      title="Inbox"
      description="Capturá ideas, observaciones y acciones en tiempo real"
      actions={
        <HelpTooltip
          title="Cómo usar Inbox"
          items={[
            { label: 'Guardar', description: 'Guarda la entrada sin clasificar. Aparece como "Sin procesar".' },
            { label: 'Procesar con IA', description: 'Claude analiza el texto y le asigna una categoría (bug, feature, mejora…) y etiquetas automáticamente.' },
            { label: 'Filtros', description: 'Usá las pestañas para ver entradas por estado: Sin procesar, Clasificadas, Convertidas o Archivadas.' },
            { label: 'Voz', description: 'Dictá tu idea con el micrófono en lugar de escribir.' },
          ]}
        />
      }
    >
      <div className="px-8 py-6 max-w-3xl space-y-6">
        <EntryInput />
        <EntryList />
      </div>
    </PageShell>
  )
}
