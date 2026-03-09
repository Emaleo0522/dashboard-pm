'use client'
import { SidebarItem } from './SidebarItem'
import { Inbox, Lightbulb, Kanban, Zap, History, Settings, Layers, Calendar, LogOut } from 'lucide-react'
import { useInboxStore } from '@/store/useInboxStore'
import { useAuthStore } from '@/store/useAuthStore'

export function Sidebar() {
  const entries = useInboxStore((s) => s.entries)
  const unprocessedCount = entries.filter((e) => e.status === 'unprocessed').length
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

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
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <SidebarItem href="/inbox" icon={Inbox} label="Inbox" badge={unprocessedCount} />
        <SidebarItem href="/brainstorm" icon={Lightbulb} label="Brainstorm" />
        <SidebarItem href="/backlog" icon={Kanban} label="Backlog Estratégico" />
        <SidebarItem href="/linear-sync" icon={Zap} label="Linear Sync" />
        <SidebarItem href="/history" icon={History} label="Historial" />

        {/* Separador sección personal */}
        <div className="pt-2 pb-1 px-2">
          <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Personal</p>
        </div>
        <SidebarItem href="/calendar" icon={Calendar} label="Mi Calendario" />
      </nav>

      {/* Bottom: settings + user */}
      <div className="px-2 py-3 border-t border-border space-y-0.5">
        <SidebarItem href="/settings" icon={Settings} label="Settings" />

        {user && (
          <div className="flex items-center gap-2 px-2 py-2 mt-1">
            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-semibold text-accent uppercase">
                {(user.name || user.email).charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-primary truncate">
                {user.name || user.email}
              </p>
            </div>
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="p-1 hover:bg-surface-2 rounded transition-colors"
            >
              <LogOut size={12} className="text-text-muted hover:text-text-primary" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
