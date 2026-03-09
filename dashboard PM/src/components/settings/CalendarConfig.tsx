'use client'
import { useState } from 'react'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useSettingsStore } from '@/store/useSettingsStore'
import { Card } from '@/components/ui/Card'
import type { CalendarMeeting } from '@/types/history'

export function CalendarConfig() {
  const { googleCalendarUrl, setGoogleCalendarUrl } = useSettingsStore()
  const [verifying, setVerifying] = useState(false)
  const [verifyResult, setVerifyResult] = useState<'ok' | 'error' | null>(null)
  const [verifyMsg, setVerifyMsg] = useState('')

  const handleVerify = async () => {
    setVerifying(true)
    setVerifyResult(null)
    try {
      const res = await fetch(`/api/calendar/meetings?url=${encodeURIComponent(googleCalendarUrl)}`)
      const data: { ok: boolean; meetings?: CalendarMeeting[]; error?: string } = await res.json()
      if (data.ok && data.meetings) {
        setVerifyResult('ok')
        setVerifyMsg(
          data.meetings.length === 0
            ? 'Calendario conectado — no hay reuniones pasadas aún'
            : `Calendario conectado — ${data.meetings.length} reunión${data.meetings.length !== 1 ? 'es' : ''} encontrada${data.meetings.length !== 1 ? 's' : ''}`
        )
      } else {
        setVerifyResult('error')
        setVerifyMsg(data.error ?? 'Error desconocido')
      }
    } catch (e: unknown) {
      setVerifyResult('error')
      setVerifyMsg(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <Card className="p-6 space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-1">Google Calendar</h3>
        <p className="text-xs text-text-muted">
          Pegá tu URL secreta en formato iCal para importar reuniones al Historial.
        </p>
      </div>

      <div className="space-y-2">
        <Input
          label="URL iCal secreta"
          type="url"
          value={googleCalendarUrl}
          onChange={(e) => setGoogleCalendarUrl(e.target.value)}
          placeholder="https://calendar.google.com/calendar/ical/..."
        />
        <p className="text-xs text-text-muted">
          Encontrála en Google Calendar &rarr; &#9881;&#65039; &rarr; Configuración del calendario &rarr; &apos;Dirección secreta en formato iCal&apos;
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleVerify}
          disabled={verifying || !googleCalendarUrl.trim()}
        >
          {verifying ? <Loader2 size={13} className="animate-spin" /> : null}
          Verificar
        </Button>
        {verifyResult && (
          <div className={`flex items-center gap-1.5 text-xs ${verifyResult === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
            {verifyResult === 'ok' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
            {verifyMsg}
          </div>
        )}
      </div>
    </Card>
  )
}
