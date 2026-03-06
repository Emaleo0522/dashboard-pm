'use client'
import { useState } from 'react'
import { Mic } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface VoiceButtonProps {
  onTranscript?: (text: string) => void
}

export function VoiceButton({ onTranscript }: VoiceButtonProps) {
  const [recording, setRecording] = useState(false)

  const toggle = () => {
    if (recording) {
      setRecording(false)
      // Simula transcripción
      onTranscript?.('(transcripción de voz simulada)')
    } else {
      setRecording(true)
    }
  }

  return (
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
            Grabando...
          </motion.span>
        ) : (
          <motion.span key="off" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-2">
            <Mic size={14} />
            Grabar voz
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
