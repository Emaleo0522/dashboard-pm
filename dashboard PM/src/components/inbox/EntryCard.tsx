'use client'
import { useState } from 'react'
import { MoreHorizontal, Zap, Archive, Trash2, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { useInboxStore } from '@/store/useInboxStore'
import { formatDate } from '@/lib/utils'
import type { InboxEntry } from '@/types/inbox'
import { motion } from 'framer-motion'

interface EntryCardProps {
  entry: InboxEntry
}

export function EntryCard({ entry }: EntryCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { updateStatus, deleteEntry } = useInboxStore()

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
            <span className="text-xs text-text-muted ml-auto">{formatDate(entry.createdAt)}</span>
          </div>
          {entry.convertedIssueId && (
            <p className="text-xs text-accent mt-1.5 font-mono">{entry.convertedIssueId}</p>
          )}
        </div>

        {/* Acciones */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface-overlay transition-all"
          >
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-6 z-20 bg-surface-overlay border border-border rounded-card shadow-xl py-1 w-44"
              onMouseLeave={() => setMenuOpen(false)}
            >
              {entry.status !== 'classified' && (
                <MenuItem icon={<CheckCircle2 size={13} />} label="Marcar clasificada" onClick={() => { updateStatus(entry.id, 'classified'); setMenuOpen(false) }} />
              )}
              {entry.status !== 'converted' && (
                <MenuItem icon={<Zap size={13} />} label="Convertir a issue" onClick={() => { updateStatus(entry.id, 'converted'); setMenuOpen(false) }} />
              )}
              {entry.status !== 'archived' && (
                <MenuItem icon={<Archive size={13} />} label="Archivar" onClick={() => { updateStatus(entry.id, 'archived'); setMenuOpen(false) }} />
              )}
              <div className="border-t border-border my-1" />
              <MenuItem icon={<Trash2 size={13} />} label="Eliminar" danger onClick={() => { deleteEntry(entry.id); setMenuOpen(false) }} />
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
