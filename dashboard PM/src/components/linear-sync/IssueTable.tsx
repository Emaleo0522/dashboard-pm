'use client'

import { useState } from 'react'
import { Send, Check, RefreshCw, ExternalLink, AlertCircle, Clock } from 'lucide-react'
import { useLinearIssues } from '@/hooks/useLinearIssues'
import { useBacklogStore } from '@/store/useBacklogStore'
import type { BacklogCard } from '@/types/backlog'

const PRIORITY_LABEL: Record<number, string> = {
  0: 'Sin prioridad', 1: 'Urgente', 2: 'Alta', 3: 'Media', 4: 'Baja',
}

export function IssueTable() {
  const { data, isLoading, isFetching, refetch } = useLinearIssues()
  const { cards, updateCard } = useBacklogStore()
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [sendError, setSendError] = useState<Record<string, string>>({})

  // Cards del backlog en columna 'ready'
  const readyCards = cards.filter((c) => c.columnId === 'ready')
  const pendingCards = readyCards.filter((c) => !c.linearIssueId)
  const syncedCards = readyCards.filter((c) => !!c.linearIssueId)

  // Issues de Linear que NO están vinculados a ninguna card local
  const linkedIds = new Set(syncedCards.map((c) => c.linearIssueId).filter(Boolean))
  const linearOnlyIssues = (data?.issues ?? []).filter(
    (i) => !linkedIds.has(i.id) && !linkedIds.has(i.identifier)
  )

  const handlePush = async (card: BacklogCard) => {
    setSendingId(card.id)
    setSendError((prev) => ({ ...prev, [card.id]: '' }))
    try {
      const res = await fetch('/api/linear/create-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: card.title, description: card.description }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al crear issue')
      const issueId = json.issueId || json.id || json.identifier
      updateCard(card.id, { linearIssueId: issueId })
      refetch()
    } catch (err) {
      setSendError((prev) => ({
        ...prev,
        [card.id]: err instanceof Error ? err.message : 'Error desconocido',
      }))
    } finally {
      setSendingId(null)
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Linear Sync</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Cards en &quot;Listo para Linear&quot; y su estado de sincronización
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-surface-raised border border-border rounded-lg text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={isFetching ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface-raised border border-border rounded-xl p-3">
          <p className="text-2xl font-bold text-amber-400">{pendingCards.length}</p>
          <p className="text-xs text-text-muted mt-0.5">Pendientes</p>
        </div>
        <div className="bg-surface-raised border border-border rounded-xl p-3">
          <p className="text-2xl font-bold text-emerald-400">{syncedCards.length}</p>
          <p className="text-xs text-text-muted mt-0.5">Sincronizadas</p>
        </div>
        <div className="bg-surface-raised border border-border rounded-xl p-3">
          <p className="text-2xl font-bold text-brand-primary">{linearOnlyIssues.length}</p>
          <p className="text-xs text-text-muted mt-0.5">Solo en Linear</p>
        </div>
      </div>

      {/* SECCIÓN 1: Pendientes (ready pero sin linearIssueId) */}
      <section>
        <h3 className="text-sm font-semibold text-text-secondary mb-2 flex items-center gap-2">
          <Clock size={14} className="text-amber-400" />
          Pendientes de enviar a Linear
          <span className="text-xs font-normal text-text-muted">({pendingCards.length})</span>
        </h3>

        {pendingCards.length === 0 ? (
          <p className="text-xs text-text-muted py-3 text-center bg-surface-raised/40 rounded-lg border border-border border-dashed">
            Todo está sincronizado ✓
          </p>
        ) : (
          <div className="space-y-2">
            {pendingCards.map((card) => (
              <div
                key={card.id}
                className="flex items-center gap-3 bg-surface-raised border border-border rounded-lg px-3 py-2.5"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary font-medium truncate">{card.title}</p>
                  {card.tags && card.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {card.tags.map((t) => (
                        <span key={t} className="text-xs bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded-full">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {sendError[card.id] && (
                    <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                      <AlertCircle size={10} /> {sendError[card.id]}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handlePush(card)}
                  disabled={sendingId === card.id}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-brand-primary/20 text-brand-primary rounded-lg hover:bg-brand-primary/30 disabled:opacity-50 shrink-0"
                >
                  <Send size={11} />
                  {sendingId === card.id ? 'Enviando...' : 'Push a Linear'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECCIÓN 2: Sincronizadas (tienen linearIssueId) */}
      <section>
        <h3 className="text-sm font-semibold text-text-secondary mb-2 flex items-center gap-2">
          <Check size={14} className="text-emerald-400" />
          Sincronizadas con Linear
          <span className="text-xs font-normal text-text-muted">({syncedCards.length})</span>
        </h3>

        {syncedCards.length === 0 ? (
          <p className="text-xs text-text-muted py-3 text-center bg-surface-raised/40 rounded-lg border border-border border-dashed">
            Ninguna card enviada aún
          </p>
        ) : (
          <div className="space-y-2">
            {syncedCards.map((card) => {
              const linearIssue = (data?.issues ?? []).find(
                (i) => i.id === card.linearIssueId || i.identifier === card.linearIssueId
              )
              return (
                <div
                  key={card.id}
                  className="flex items-center gap-3 bg-surface-raised border border-emerald-500/20 rounded-lg px-3 py-2.5"
                >
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary font-medium truncate">{card.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-text-muted font-mono">{card.linearIssueId}</span>
                      {linearIssue?.state && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${linearIssue.state.color}20`,
                            color: linearIssue.state.color,
                          }}
                        >
                          {linearIssue.state.name}
                        </span>
                      )}
                      {!linearIssue && !isLoading && (
                        <span className="text-xs text-text-muted italic">Sin estado (no encontrado en API)</span>
                      )}
                    </div>
                  </div>
                  {linearIssue?.url && (
                    <a
                      href={linearIssue.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-muted hover:text-accent transition-colors shrink-0"
                      title="Abrir en Linear"
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* SECCIÓN 3: Issues solo en Linear (no vinculados a cards locales) */}
      {linearOnlyIssues.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-text-secondary mb-2 flex items-center gap-2">
            <ExternalLink size={14} className="text-brand-primary" />
            Solo en Linear (sin card local)
            <span className="text-xs font-normal text-text-muted">({linearOnlyIssues.length})</span>
          </h3>
          <div className="space-y-2">
            {linearOnlyIssues.map((issue) => (
              <div
                key={issue.id}
                className="flex items-center gap-3 bg-surface-raised/60 border border-border rounded-lg px-3 py-2.5"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{issue.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-text-muted font-mono">{issue.identifier}</span>
                    {issue.state && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${issue.state.color}20`,
                          color: issue.state.color,
                        }}
                      >
                        {issue.state.name}
                      </span>
                    )}
                    {issue.priority !== undefined && (
                      <span className="text-xs text-text-muted">
                        {PRIORITY_LABEL[issue.priority] || ''}
                      </span>
                    )}
                  </div>
                </div>
                {issue.url && (
                  <a
                    href={issue.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-muted hover:text-accent transition-colors shrink-0"
                    title="Abrir en Linear"
                  >
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-4">
          <RefreshCw size={16} className="animate-spin text-text-muted mx-auto" />
          <p className="text-xs text-text-muted mt-2">Cargando issues de Linear...</p>
        </div>
      )}

      {/* Mock warning */}
      {data?.mock && (
        <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5 text-xs text-amber-400">
          <AlertCircle size={13} className="shrink-0 mt-0.5" />
          <span>
            Sin credenciales de Linear. Configurá <code className="font-mono">LINEAR_API_KEY</code> y <code className="font-mono">LINEAR_TEAM_ID</code> en Vercel para sincronizar issues reales.
          </span>
        </div>
      )}
    </div>
  )
}
