'use client'
import { useState, useRef } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface VoiceButtonProps {
  onTranscript?: (text: string) => void
}

// webkitSpeechRecognition no está en los tipos TS por defecto
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any
  }
}

export function VoiceButton({ onTranscript }: VoiceButtonProps) {
  const [recording, setRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  const toggle = () => {
    if (recording) {
      recognitionRef.current?.stop()
      setRecording(false)
      return
    }

    const SpeechRecognitionAPI =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)

    if (!SpeechRecognitionAPI) {
      setError('Tu navegador no soporta voz. Usá Chrome o Edge.')
      return
    }

    setError(null)
    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'es-AR'
    recognition.interimResults = false
    recognition.continuous = false
    recognitionRef.current = recognition

    recognition.onstart = () => setRecording(true)

    recognition.onresult = (event: { results: { [x: string]: { [x: string]: { transcript: string } } } }) => {
      const transcript = event.results[0][0].transcript
      onTranscript?.(transcript)
    }

    recognition.onerror = (event: { error: string }) => {
      if (event.error === 'not-allowed') {
        setError('Permiso de micrófono denegado. Habilitalo en el navegador.')
      } else if (event.error !== 'aborted') {
        setError('Error al grabar. Intentá de nuevo.')
      }
      setRecording(false)
    }

    recognition.onend = () => setRecording(false)

    recognition.start()
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={toggle}
        className={cn(
          'relative flex items-center gap-2 px-3 py-2 rounded-card text-xs font-medium transition-all duration-200',
          recording
            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
            : 'bg-surface-raised border border-border text-text-secondary hover:text-text-primary hover:border-border'
        )}
      >
        <AnimatePresence mode="wait">
          {recording ? (
            <motion.span key="on" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              Grabando… (click para detener)
            </motion.span>
          ) : (
            <motion.span key="off" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-2">
              <Mic size={14} />
              Grabar voz
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <MicOff size={11} /> {error}
        </p>
      )}
    </div>
  )
}
