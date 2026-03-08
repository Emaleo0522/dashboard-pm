'use client'
import { useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { SemanticSearch } from '@/components/history/SemanticSearch'
import { MeetingList } from '@/components/history/MeetingList'
import { HelpTooltip } from '@/components/ui/HelpTooltip'
import { mockMeetings } from '@/data/mock'

export default function HistoryPage() {
  const [query, setQuery] = useState('')

  const filtered = mockMeetings.filter((m) => {
    if (!query) return true
    const q = query.toLowerCase()
    return (
      m.title.toLowerCase().includes(q) ||
      m.summary.toLowerCase().includes(q) ||
      m.tags.some((t) => t.toLowerCase().includes(q)) ||
      m.decisions.some((d) => d.text.toLowerCase().includes(q)) ||
      m.actions.some((a) => a.text.toLowerCase().includes(q))
    )
  })

  return (
    <PageShell
      title="Historial"
      description="Reuniones pasadas, decisiones y acciones pendientes"
      actions={
        <HelpTooltip
          title="Cómo usar el Historial"
          items={[
            { label: 'Reuniones', description: 'Cada tarjeta representa una reunión pasada con su resumen, decisiones tomadas y acciones pendientes.' },
            { label: 'Buscador', description: 'Escribí cualquier término para filtrar reuniones. Busca en títulos, resúmenes, decisiones y acciones.' },
            { label: 'Decisiones', description: 'Las decisiones registradas de cada reunión aparecen dentro de la tarjeta.' },
            { label: 'Acciones', description: 'Cada acción tiene un responsable asignado y una fecha límite.' },
          ]}
        />
      }
    >
      <div className="px-8 py-6 max-w-3xl space-y-5">
        <SemanticSearch value={query} onChange={setQuery} />
        <MeetingList meetings={filtered} />
      </div>
    </PageShell>
  )
}
