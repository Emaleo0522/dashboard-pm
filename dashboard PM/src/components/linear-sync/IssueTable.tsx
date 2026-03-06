'use client'
import { useState } from 'react'
import { IssueRow } from './IssueRow'
import { SyncStatus } from './SyncStatus'
import { CreateIssueModal } from './CreateIssueModal'
import { Button } from '@/components/ui/Button'
import { useLinearIssues } from '@/hooks/useLinearIssues'
import { Plus, RefreshCw } from 'lucide-react'

export function IssueTable() {
  const { data, isLoading, refetch, isFetching } = useLinearIssues()
  const [creating, setCreating] = useState(false)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        {data && <SyncStatus mock={data.mock} error={data.error} />}
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
          Actualizar
        </Button>
        <Button variant="primary" size="sm" onClick={() => setCreating(true)}>
          <Plus size={13} />
          Crear issue
        </Button>
      </div>

      {/* Tabla */}
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-raised">
              {['ID', 'Título', 'Estado', 'Prioridad', 'Ciclo', ''].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-text-muted">
                  Cargando issues...
                </td>
              </tr>
            ) : data?.issues.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-text-muted">
                  No hay issues
                </td>
              </tr>
            ) : (
              data?.issues.map((issue) => <IssueRow key={issue.id} issue={issue} />)
            )}
          </tbody>
        </table>
      </div>

      <CreateIssueModal open={creating} onClose={() => setCreating(false)} />
    </div>
  )
}
