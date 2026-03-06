'use client'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'

interface SidebarItemProps {
  href: string
  icon: LucideIcon
  label: string
  badge?: number
}

export function SidebarItem({ href, icon: Icon, label, badge }: SidebarItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-card text-sm transition-all duration-150 group',
        isActive
          ? 'bg-accent-dim text-accent font-medium'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised'
      )}
    >
      <Icon size={16} className={cn(isActive ? 'text-accent' : 'text-text-muted group-hover:text-text-secondary')} />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="px-1.5 py-0.5 text-xs bg-accent/20 text-accent rounded-full font-medium">
          {badge}
        </span>
      )}
    </Link>
  )
}
