import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // Future dates
  if (diff < 0) {
    const absDiff = Math.abs(diff)
    const futureMinutes = Math.floor(absDiff / 60000)
    const futureHours = Math.floor(absDiff / 3600000)
    const futureDays = Math.floor(absDiff / 86400000)

    if (futureMinutes < 60) return `en ${futureMinutes}m`
    if (futureHours < 24) return `en ${futureHours}h`
    if (futureDays < 7) return `en ${futureDays}d`
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
  }

  // Past dates
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `hace ${minutes}m`
  if (hours < 24) return `hace ${hours}h`
  if (days < 7) return `hace ${days}d`
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
}

export function generateId(): string {
  return crypto.randomUUID()
}
