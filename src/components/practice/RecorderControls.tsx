import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Circle, Pause, Square, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePracticeStore } from '@/stores/usePracticeStore'

interface Props {
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
}

export function RecorderControls({ onStart, onPause, onResume, onStop }: Props) {
  const { t } = useTranslation()
  const { status, setStatus, elapsedSeconds, setElapsedSeconds } = usePracticeStore()
  const [countdown, setCountdown] = useState(0)
  const countdownInitRef = useRef(false)

  // Countdown timer
  useEffect(() => {
    if (status !== 'countdown') {
      countdownInitRef.current = false
      return
    }
    if (!countdownInitRef.current) {
      countdownInitRef.current = true
    }
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setStatus('recording')
          onStart()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [status, setStatus, onStart])

  // Elapsed timer
  useEffect(() => {
    if (status !== 'recording') return
    const interval = setInterval(() => {
      setElapsedSeconds(elapsedSeconds + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [status, elapsedSeconds, setElapsedSeconds])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, '0')}`
  }

  const handleStartClick = useCallback(() => {
    setCountdown(3)
    setStatus('countdown')
  }, [setStatus])

  const handlePause = useCallback(() => {
    setStatus('paused')
    onPause()
  }, [setStatus, onPause])

  const handleResume = useCallback(() => {
    setStatus('recording')
    onResume()
  }, [setStatus, onResume])

  const handleStop = useCallback(() => {
    onStop()
  }, [onStop])

  if (status === 'countdown') {
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <span className="text-5xl font-bold text-primary">{countdown}</span>
        <span className="text-sm text-muted-foreground">{t('practice.countdown')}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-4 py-4">
      {status === 'idle' && (
        <Button size="lg" onClick={handleStartClick}>
          <Circle className="mr-2 h-5 w-5 fill-red-500 text-red-500" />
          {t('practice.start')}
        </Button>
      )}
      {status === 'recording' && (
        <>
          <span className="mr-4 font-mono text-lg">{formatTime(elapsedSeconds)}</span>
          <Button variant="outline" size="lg" onClick={handlePause}>
            <Pause className="mr-2 h-5 w-5" />
            {t('practice.pause')}
          </Button>
          <Button variant="destructive" size="lg" onClick={handleStop}>
            <Square className="mr-2 h-5 w-5" />
            {t('practice.stop')}
          </Button>
        </>
      )}
      {status === 'paused' && (
        <>
          <span className="mr-4 font-mono text-lg">{formatTime(elapsedSeconds)}</span>
          <Button size="lg" onClick={handleResume}>
            <Play className="mr-2 h-5 w-5" />
            {t('practice.resume')}
          </Button>
          <Button variant="destructive" size="lg" onClick={handleStop}>
            <Square className="mr-2 h-5 w-5" />
            {t('practice.stop')}
          </Button>
        </>
      )}
    </div>
  )
}
