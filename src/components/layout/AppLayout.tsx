'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Sidebar } from './Sidebar'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (pathname === '/login') {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-surface-raised border border-border rounded-lg md:hidden"
        aria-label="Abrir menu"
      >
        <Menu size={18} className="text-text-primary" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar: hidden on mobile, shown on md+ */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out
        md:translate-x-0 md:static md:transform-none
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 z-50 p-1 rounded-lg text-text-muted hover:text-text-primary md:hidden"
            aria-label="Cerrar menu"
          >
            <X size={16} />
          </button>
        )}
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 md:ml-56 overflow-auto pt-14 md:pt-0">
        {children}
      </div>
    </div>
  )
}
