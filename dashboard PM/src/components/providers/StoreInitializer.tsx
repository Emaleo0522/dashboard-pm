'use client'
import { useEffect } from 'react'
import { useBacklogStore } from '@/store/useBacklogStore'
import { useBrainstormStore } from '@/store/useBrainstormStore'
import { useInboxStore } from '@/store/useInboxStore'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useAuthStore } from '@/store/useAuthStore'

export function StoreInitializer() {
  const loadBacklog = useBacklogStore((s) => s.load)
  const loadBrainstorm = useBrainstormStore((s) => s.load)
  const loadInbox = useInboxStore((s) => s.load)
  const loadHistory = useHistoryStore((s) => s.load)
  const loadAuth = useAuthStore((s) => s.load)

  useEffect(() => {
    const init = async () => {
      await loadAuth()
      await Promise.all([loadBacklog(), loadBrainstorm(), loadInbox(), loadHistory()])
    }
    init()
  }, [loadAuth, loadBacklog, loadBrainstorm, loadInbox, loadHistory])

  return null
}
