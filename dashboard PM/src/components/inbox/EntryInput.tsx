'use client'
import { useState, useRef } from 'react'
import { Sparkles, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { VoiceButton } from './VoiceButton'
import { useInboxStore } from '@/store/useInboxStore'
import { cn } from '@/lib/utils'

export function EntryInput() {
  const [value, setValue] = useState('')
  const [processing, setProcessing] = useState(false)
  const addEntry = useInboxStore((s) => s.addEntry)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    if (!value.trim()) return
    addEntry(value.trim())
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleProcessAI = async () => {
    if (!value.trim()) return
    setProcessing(true)
    await new Promise((r) => setTimeout(r, 1200)) // simula delay IA
    addEntry(value.trim())
    setValue('')
    setProcessing(false)
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
