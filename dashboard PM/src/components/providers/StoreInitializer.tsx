'use client'
import { useEffect } from 'react'
import { useBacklogStore } from '@/store/useBacklogStore'
import { useBrainstormStore } from '@/store/useBrainstormStore'
import { useInboxStore } from '@/store/useInboxStore'
import { useAuthStore } from '@/store/useAuthStore'

export function StoreInitializer() {
  const loadBacklog = useBacklogStore((s) => s.load)
  const loadBrainstorm = useBrainstormStore((s) => s.load)
  const loadInbox = useInboxStore((s) => s.load)
  const loadAuth = useAuthStore((s) => s.load)

  useEffect(() => {
    // Auth primero, luego el resto en paralelo
    loadAuth()
    loadBacklog()
    loadBrainstorm()
    loadInbox()
  }, [loadAuth, loadBacklog, loadBrainstorm, loadInbox])

  return null
}
