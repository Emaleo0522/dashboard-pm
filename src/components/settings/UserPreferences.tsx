'use client'
import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useSettingsStore } from '@/store/useSettingsStore'
import { Card } from '@/components/ui/Card'

export function UserPreferences() {
  const { operatorName, setOperatorName } = useSettingsStore()
  const [name, setName] = useState(operatorName)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setOperatorName(name)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-sm font-semibold text-text-primary">Preferencias</h3>
      <div className="space-y-3">
        <Input
          label="Nombre del PM"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre..."
          onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
        />
      </div>
      <div className="flex items-center gap-3">
        <Button variant="primary" size="sm" onClick={handleSave}>Guardar</Button>
        {saved && (
          <span className="flex items-center gap-1 text-xs text-green-400">
            <CheckCircle2 size={12} /> Guardado
          </span>
        )}
      </div>
    </Card>
  )
}
