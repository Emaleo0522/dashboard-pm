'use client'
import { useEffect } from 'react'
import { useBacklogStore } from '@/store/useBacklogStore'
import { useBrainstormStore } from '@/store/useBrainstormStore'
import { useInboxStore } from '@/store/useInboxStore'

export function StoreInitializer() {
  const loadBacklog = useBacklogStore((s) => s.load)
  const loadBrainstorm = useBrainstormStore((s) => s.load)
  const loadInbox = useInboxStore((s) => s.load)

  useEffect(() => {
    loadBacklog()
    loadBrainstorm()
    loadInbox()
  }, [loadBacklog, loadBrainstorm, loadInbox])

  return null
}
