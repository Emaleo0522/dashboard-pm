'use client'
import { useEffect, useRef } from 'react'
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
  const user = useAuthStore((s) => s.user)
  const loadingRef = useRef(false)

  const loadStores = async () => {
    // Prevent concurrent loads
    if (loadingRef.current) return
    loadingRef.current = true
    try {
      await Promise.all([loadBacklog(), loadBrainstorm(), loadInbox(), loadHistory()])
    } finally {
      loadingRef.current = false
    }
  }

  // Initial load: auth first, then data stores
  useEffect(() => {
    const init = async () => {
      await loadAuth()
      const authed = useAuthStore.getState().user
      if (!authed) return
      await loadStores()
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When user changes from null to object (e.g., after login),
  // trigger data load if not already loaded
  useEffect(() => {
    if (!user) return
    loadStores()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return null
}
