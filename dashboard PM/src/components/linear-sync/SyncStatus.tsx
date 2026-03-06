interface SyncStatusProps {
  mock: boolean
  error?: string
}

export function SyncStatus({ mock, error }: SyncStatusProps) {
  if (!mock) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-green-400">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        Conectado a Linear
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1.5 text-xs text-text-muted">
      <span className="w-1.5 h-1.5 rounded-full bg-text-muted" />
      {error ? `Error: ${error}` : 'Modo demo (configurá LINEAR_API_KEY)'}
    </div>
  )
}
