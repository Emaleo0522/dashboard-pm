'use client'
import { useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Calendar } from 'lucide-react'
import type { Meeting } from '@/types/history'
import { formatDate } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export function MeetingCard({ meeting }: { meeting: Meeting }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-surface-raised border border-border rounded-xl overflow-hidden hover:border-border/80 transition-colors">
      {/* Header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
      >
        <span className="text-text-muted">{expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary">{meeting.title}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <Calendar size={11} />
              {formatDate(meeting.date)}
            </span>
            <span className="text-xs text-text-muted">
              {meeting.decisions.length} decisiones &middot; {meeting.actions.filter((a) => !a.completed).length} acciones pendientes
            </span>
          </div>
        </div>
        <div className="flex gap-1 flex-wrap justify-end">
          {meeting.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 bg-accent-dim text-accent rounded-full">{tag}</span>
          ))}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-5 py-4 space-y-4">
              {/* Summary */}
              <div>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">Resumen</p>
                <p className="text-sm text-text-secondary leading-relaxed">{meeting.summary}</p>
              </div>

              {/* Decisions */}
              {meeting.decisions.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">Decisiones</p>
                  <ul className="space-y-1.5">
                    {meeting.decisions.map((d) => (
                      <li key={d.id} className="flex items-start gap-2 text-sm text-text-primary">
                        <span className="text-accent mt-0.5 shrink-0">&rarr;</span>
                        <span>{d.text}</span>
                        {d.rationale && <span className="text-xs text-text-muted">&mdash; {d.rationale}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              {meeting.actions.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">Acciones</p>
                  <ul className="space-y-1.5">
                    {meeting.actions.map((a) => (
                      <li key={a.id} className="flex items-center gap-2 text-sm">
                        {a.completed
                          ? <CheckCircle2 size={13} className="text-green-400 shrink-0" />
                          : <Circle size={13} className="text-text-muted shrink-0" />}
                        <span className={a.completed ? 'text-text-muted line-through' : 'text-text-primary'}>{a.text}</span>
                        {a.assignee && <span className="ml-auto text-xs text-text-muted">{a.assignee}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
