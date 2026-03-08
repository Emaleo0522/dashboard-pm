'use client'
import { useState, useCallback } from 'react'
import { IssueRow } from './IssueRow'
import { SyncStatus } from './SyncStatus'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useLinearIssues } from '@/hooks/useLinearIssues'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, RefreshCw } from 'lucide-react'

export function IssueTable() {
  const { data, isLoading, refetch, isFetching } = useLinearIssues()
  const qc = useQueryClient()

  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')

  const handleCreate = useCallback(async () => {
    if (!newTitle.trim()) return
    setCreating(true)
    setCreateError('')
    setCreateSuccess('')
    try {
      const res = await fetch('/api/linear/create-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), description: newDescription.trim() || undefined, priority: 3 }),
      })
      const json = await res.json() as { ok: boolean; identifier?: string; error?: string }
      if (json.ok) {
        setCreateSuccess(`Issue ${json.identifier ?? ''} creado en Linear`)
        setNewTitle('')
        setNewDescription('')
        setShowForm(false)
        qc.invalidateQueries({ queryKey: ['linear-issues'] })
      } else {
        setCreateError(json.error ?? 'Error al crear issue')
      }
    } catch {
      setCreateError('Error de red')
    } finally {
      setCreating(false)
    }
  }, [newTitle, newDescription, qc])

  const issueCount = data?.issues.length ?? 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        {data && <SyncStatus mock={data.mock} error={data.error} />}
        <span className="text-xs text-text-muted">
          {isLoading ? 'Cargando…' : `${issueCount} issue${issueCount !== 1 ? 's' : ''} activo${issueCount !== 1 ? 's' : ''}`}
        </span>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
          Actualizar
        </Button>
        <Button variant="primary" size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus size={13} />
          Nuevo issue
        </Button>
      </div>

      {/* Form colapsable */}
      {showForm && (
        <div className="bg-surface-raised border border-border rounded-xl p-4 space-y-3">
          <p className="text-xs font-medium text-text-secondary">Crear issue en Linear</p>
          <Input
            label="Título"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleCreate()}
            placeholder="Describí el issue…"
            autoFocus
          />
          <Textarea
            label="Descripción (opcional)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            rows={2}
            placeholder="Contexto, criterios de aceptación…"
          />
          {createError && <p className="text-xs text-red-400">{createError}</p>}
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleCreate} disabled={creating || !newTitle.trim()} loading={creating}>
              {creating ? 'Creando…' : 'Crear'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setCreateError('') }}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Feedback de creación exitosa */}
      {createSuccess && !showForm && (
        <p className="text-xs text-green-400">{createSuccess}</p>
      )}

      {/* Tabla de issues */}
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-raised">
              {['ID', 'Título', 'Estado', 'Prioridad', 'Ciclo', ''].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left text-xs font-medium text-text-muted uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-text-muted">
                  Cargando issues…
                </td>
              </tr>
            ) : data?.issues.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center">
                  <p className="text-sm text-text-secondary">No hay issues activos en Linear</p>
                  <p className="text-xs text-text-muted mt-1">
                    Usá &quot;Nuevo issue&quot; para crear uno, o pusheá tarjetas desde Backlog
                  </p>
                </td>
              </tr>
            ) : (
              data?.issues.map((issue) => <IssueRow key={issue.id} issue={issue} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
