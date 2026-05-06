'use client'
import { useState, useRef } from 'react'
import { Sparkles, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { VoiceButton } from './VoiceButton'
import { useInboxStore } from '@/store/useInboxStore'
import { cn } from '@/lib/utils'
import type { InboxEntry } from '@/types/inbox'

export function EntryInput() {
  const [value, setValue] = useState('')
  const [processing, setProcessing] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const addEntry = useInboxStore((s) => s.addEntry)
  const addClassifiedEntry = useInboxStore((s) => s.addClassifiedEntry)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    if (!value.trim()) return
    addEntry(value.trim())
    setValue('')
    setAiError(null)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleProcessAI = async () => {
    if (!value.trim()) return
    setProcessing(true)
    setAiError(null)
    try {
      const res = await fetch('/api/ai/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: value.trim() }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setAiError(data.error || 'Error al procesar con IA')
        return
      }
      addClassifiedEntry(
        value.trim(),
        data.classifiedAs as NonNullable<InboxEntry['classifiedAs']>,
        data.tags ?? []
      )
      setValue('')
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
    } catch {
      setAiError('No se pudo conectar con la IA. Verificá tu conexión.')
    } finally {
      setProcessing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
  }

  return (
    <div className="bg-surface-raised border border-border rounded-xl p-4 space-y-3">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Capturá una idea, observación, decisión o acción… (Cmd+Enter para guardar)"
        rows={3}
        className={cn(
          'w-full bg-transparent text-text-primary placeholder:text-text-muted text-sm',
          'focus:outline-none resize-none leading-relaxed'
        )}
      />
      {aiError && (
        <p className="text-xs text-red-400">{aiError}</p>
      )}
      <div className="flex items-center gap-2 pt-1 border-t border-border">
        <VoiceButton onTranscript={(t) => setValue((v) => v + (v ? ' ' : '') + t)} />
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleProcessAI}
          loading={processing}
          disabled={!value.trim()}
        >
          <Sparkles size={14} />
          Procesar con IA
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={!value.trim()}
        >
          <Send size={14} />
          Guardar
        </Button>
      </div>
    </div>
  )
}
