'use client'
import { useState } from 'react'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useSettingsStore } from '@/store/useSettingsStore'
import { Card } from '@/components/ui/Card'

export function LinearConfig() {
  const { linearApiKey, linearTeamId, setLinearApiKey, setLinearTeamId } = useSettingsStore()
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'ok' | 'error' | null>(null)
  const [testMsg, setTestMsg] = useState('')

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/linear/issues')
      const data = await res.json()
      if (data.mock && data.error) {
        setTestResult('error')
        setTestMsg(data.error)
      } else if (data.mock) {
        setTestResult('error')
        setTestMsg('API key no configurada en el servidor (.env.local)')
      } else {
        setTestResult('ok')
        setTestMsg(`Conectado \u2014 ${data.issues.length} issues encontrados`)
      }
    } catch (e: unknown) {
      setTestResult('error')
      setTestMsg(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card className="p-6 space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-1">Integraci\u00f3n Linear</h3>
        <p className="text-xs text-text-muted">
          Configur\u00e1 tu API key en <code className="font-mono bg-surface px-1 rounded">.env.local</code> del servidor para conectar con tu workspace.
        </p>
      </div>

      <div className="space-y-3">
        <Input
          label="LINEAR_API_KEY"
          type="password"
          value={linearApiKey}
          onChange={(e) => setLinearApiKey(e.target.value)}
          placeholder="lin_api_..."
        />
        <p className="text-xs text-text-muted -mt-1">
          Esta key se guarda localmente solo para referencia. La clave real debe estar en <code className="font-mono">.env.local</code>.
        </p>
        <Input
          label="LINEAR_TEAM_ID"
          value={linearTeamId}
          onChange={(e) => setLinearTeamId(e.target.value)}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" onClick={handleTest} disabled={testing}>
          {testing ? <Loader2 size={13} className="animate-spin" /> : null}
          Probar conexi\u00f3n
        </Button>
        {testResult && (
          <div className={`flex items-center gap-1.5 text-xs ${testResult === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
            {testResult === 'ok' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
            {testMsg}
          </div>
        )}
      </div>

      <div className="border-t border-border pt-4">
        <p className="text-xs text-text-muted font-mono space-y-1">
          <span className="block text-text-muted/60"># .env.local</span>
          <span className="block text-green-400/80">LINEAR_API_KEY=lin_api_tu_key_aqui</span>
          <span className="block text-green-400/80">LINEAR_TEAM_ID=tu-team-id-aqui</span>
        </p>
      </div>
    </Card>
  )
}
