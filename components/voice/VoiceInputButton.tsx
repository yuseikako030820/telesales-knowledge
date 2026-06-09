'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionConstructor = new () => any

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor
    webkitSpeechRecognition: SpeechRecognitionConstructor
  }
}

export default function VoiceInputButton({ onTranscript, disabled }: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const transcriptRef = useRef('')

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionAPI) {
      setIsSupported(false)
      return
    }

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'ja-JP'
    recognition.continuous = true
    recognition.interimResults = false

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let text = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          text += event.results[i][0].transcript
        }
      }
      transcriptRef.current += text
    }

    recognition.onend = () => {
      setIsListening(false)
      if (transcriptRef.current) {
        onTranscript(transcriptRef.current)
        transcriptRef.current = ''
      }
    }

    recognition.onerror = () => {
      setIsListening(false)
      transcriptRef.current = ''
    }

    recognitionRef.current = recognition
  }, [onTranscript])

  function toggle() {
    if (!recognitionRef.current) return
    if (isListening) {
      recognitionRef.current.stop()
    } else {
      transcriptRef.current = ''
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  if (!isSupported) {
    return (
      <Button type="button" variant="outline" size="sm" disabled title="このブラウザは音声入力に対応していません（Chrome推奨）">
        <MicOff className="w-4 h-4 mr-1" />
        音声入力不可
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant={isListening ? 'destructive' : 'outline'}
      size="sm"
      onClick={toggle}
      disabled={disabled}
      className={cn(isListening && 'animate-pulse')}
    >
      <Mic className="w-4 h-4 mr-1" />
      {isListening ? '録音停止' : '音声入力'}
    </Button>
  )
}
