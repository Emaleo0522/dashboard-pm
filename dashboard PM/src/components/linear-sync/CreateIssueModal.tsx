'use client'
import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { useBacklogStore } from '@/store/useBacklogStore'
import { useQueryClient } from '@tanstack/react-query'

interface CreateIssueModalProps {
  open: boolean
  onClose: () => void
}

export function CreateIssueModal({ open, onClose }: CreateIssueModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const readyCards = useBacklogStore((s) => s.cards.filter((c) => c.columnId === 'ready'))
  const qc = useQueryClient()

  const handleCreate = async () => {
    if (!title.trim()) return
    setLoading(true)
    setError('')
    try {
      const teamId = process.env.NEXT_PUBLIC_LINEAR_TEAM_ID || ''
      const res = await fetch('/api/linear/create-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, teamId, priority: 3 }),
      })
      const data = await res.json()
      if (data.ok) {
        qc.invalidateQueries({ queryKey: ['linear-issues'] })
        onClose()
        setTitle('')
        setDescription('')
      } else {
        setError(data.error || 'Error al crear el issue')
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const loadFromCard = (card: { title: string; description?: string }) => {
    setTitle(card.title)
    setDescription(card.description || '')
  }

  return (
    <Modal open={open} onClose={onClose} title="Crear issue en Linear" size="md">
      <div className="space-y-4">
        {readyCards.length > 0 && (
          <div>
            <p className="text-xs text-text-muted mb-2">Ideas listas del backlog:</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {readyCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => loadFromCard(card)}
                  className="w-full text-left px-3 py-2 text-xs bg-surface-raised border border-border rounded-card hover:border-accent/30 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {card.title}
                </button>
              ))}
            </div>
            <div className="border-t border-border my-3" />
          </div>
        )}
        <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título del issue..." />
        <Textarea label="Descripción (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Contexto, criterios de aceptación..." />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={handleCreate} loading={loading} disabled={!title.trim()}>
            Crear en Linear
          </Button>
        </div>
      </div>
    </Modal>
  )
}
