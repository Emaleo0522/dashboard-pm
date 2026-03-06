'use client'
import { SidebarItem } from './SidebarItem'
import { Inbox, Lightbulb, Kanban, Zap, History, Settings, Layers } from 'lucide-react'
import { useInboxStore } from '@/store/useInboxStore'

export function Sidebar() {
  const entries = useInboxStore((s) => s.entries)
  const unprocessedCount = entries.filter((e) => e.status === 'unprocessed').length

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-surface border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
            <Layers size={14} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-text-primary">PM Dashboard</div>
            <div className="text-xs text-text-muted">Strategy</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        <SidebarItem href="/inbox" icon={Inbox} label="Inbox" badge={unprocessedCount} />
        <SidebarItem href="/brainstorm" icon={Lightbulb} label="Brainstorm" />
        <SidebarItem href="/backlog" icon={Kanban} label="Backlog Estratégico" />
        <SidebarItem href="/linear-sync" icon={Zap} label="Linear Sync" />
        <SidebarItem href="/history" icon={History} label="Historial" />
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-border">
        <SidebarItem href="/settings" icon={Settings} label="Settings" />
      </div>
    </aside>
  )
}
