'use client'
import { useState, useEffect, useRef } from 'react'
import { MoreHorizontal, Zap, Archive, Trash2, CheckCircle2, Layers, Lightbulb } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { useInboxStore } from '@/store/useInboxStore'
import { useBacklogStore } from '@/store/useBacklogStore'
import { useBrainstormStore } from '@/store/useBrainstormStore'
import { formatDate } from '@/lib/utils'
import type { InboxEntry } from '@/types/inbox'
import { motion } from 'framer-motion'

interface EntryCardProps {
  entry: InboxEntry
}

export function EntryCard({ entry }: EntryCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [linearLoading, setLinearLoading] = useState(false)
  const [linearError, setLinearError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu with Escape or click outside
  useEffect(() => {
    if (!menuOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  const { updateStatus, deleteEntry } = useInboxStore()
  const addBacklogCard = useBacklogStore((s) => s.addCard)
  const addBrainstormNote = useBrainstormStore((s) => s.addNote)

  const handleSendToBacklog = () => {
    addBacklogCard({
      title: entry.content,
      columnId: 'raw',
      tags: entry.tags,
    })
    updateStatus(entry.id, 'archived')
    setMenuOpen(false)
    setSentTo('Backlog')
    setTimeout(() => setSentTo(null), 2000)
  }

  const handleSendToBrainstorm = () => {
    addBrainstormNote(entry.content, 'indigo', entry.tags)
    updateStatus(entry.id, 'archived')
    setMenuOpen(false)
    setSentTo('Brainstorm')
    setTimeout(() => setSentTo(null), 2000)
  }

  const handleConvertToIssue = async () => {
    setLinearLoading(true)
    setLinearError(null)
    setMenuOpen(false)
    try {
      const res = await fetch('/api/linear/create-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: entry.content }),
      })
      const data = await res.json() as { ok: boolean; error?: string }
      if (data.ok) {
        updateStatus(entry.id, 'converted')
      } else {
        setLinearError('No se pudo crear en Linear: ' + (data.error ?? 'sin API key'))
      }
    } catch {
      setLinearError('No se pudo conectar a Linear.')
    } finally {
      setLinearLoading(false)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="group bg-surface-raised border border-border rounded-card p-4 hover:border-border/80 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-primary leading-relaxed">{entry.content}</p>
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            <Badge variant="status" status={entry.status} />
            {entry.tags?.map((tag) => (
              <Badge key={tag} label={tag} />
            ))}
            {entry.createdBy && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-overlay text-text-muted border border-border">
                {entry.createdBy}
              </span>
            )}
            <span className="text-xs text-text-muted ml-auto">{formatDate(entry.createdAt)}</span>
          </div>
          {entry.convertedIssueId && (
            <p className="text-xs text-accent mt-1.5 font-mono">{entry.convertedIssueId}</p>
          )}
          {sentTo && (
            <span className="text-xs text-green-400 mt-1.5 block">Enviado a {sentTo}</span>
          )}
          {linearError && (
            <span className="text-xs text-yellow-400 mt-1.5 block">{linearError}</span>
          )}
          {linearLoading && (
            <span className="text-xs text-text-muted mt-1.5 block">Creando issue...</span>
          )}
        </div>

        {/* Acciones */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface-overlay transition-all"
          >
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-6 z-20 bg-surface-overlay border border-border rounded-card shadow-xl py-1 w-44"
            >
              {entry.status !== 'classified' && (
                <MenuItem icon={<CheckCircle2 size={13} />} label="Marcar clasificada" onClick={() => { updateStatus(entry.id, 'classified'); setMenuOpen(false) }} />
              )}
              {entry.status !== 'converted' && (
                <MenuItem icon={<Zap size={13} />} label="Convertir a issue" onClick={handleConvertToIssue} />
              )}
              <MenuItem icon={<Layers size={13} />} label="→ Backlog" onClick={handleSendToBacklog} />
              <MenuItem icon={<Lightbulb size={13} />} label="→ Brainstorm" onClick={handleSendToBrainstorm} />
              {entry.status !== 'archived' && (
                <MenuItem icon={<Archive size={13} />} label="Archivar" onClick={() => { updateStatus(entry.id, 'archived'); setMenuOpen(false) }} />
              )}
              <div className="border-t border-border my-1" />
              {confirmDelete ? (
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <span className="text-xs text-red-400">¿Borrar?</span>
                  <button
                    onClick={() => { deleteEntry(entry.id); setMenuOpen(false) }}
                    className="text-xs text-red-400 hover:text-red-300 border border-red-400/30 px-1.5 py-0.5 rounded"
                  >
                    Sí
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs text-text-muted"
                  >
                    No
                  </button>
                </div>
              ) : (
                <MenuItem icon={<Trash2 size={13} />} label="Eliminar" danger onClick={() => setConfirmDelete(true)} />
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function MenuItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-surface-raised transition-colors ${danger ? 'text-red-400' : 'text-text-secondary hover:text-text-primary'}`}
    >
      {icon}{label}
    </button>
  )
}
