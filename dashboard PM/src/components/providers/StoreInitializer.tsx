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
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    const init = async () => {
      await loadAuth()
      // Solo cargar datos si el usuario está autenticado.
      // useAuthStore.getState() para leer el valor actualizado post-await.
      const authed = useAuthStore.getState().user
      if (!authed) return
      await Promise.all([loadBacklog(), loadBrainstorm(), loadInbox(), loadHistory()])
    }
    init()
  }, [loadAuth, loadBacklog, loadBrainstorm, loadInbox, loadHistory])

  // Cuando el usuario hace login (user cambia de null a objeto),
  // disparar la carga de datos si aún no se cargaron.
  useEffect(() => {
    if (!user) return
    Promise.all([loadBacklog(), loadBrainstorm(), loadInbox(), loadHistory()])
  }, [user, loadBacklog, loadBrainstorm, loadInbox, loadHistory])

  return null
}
