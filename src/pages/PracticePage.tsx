import { useState, useCallback, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePracticeStore } from '@/stores/usePracticeStore'
import { ScoreRepository } from '@/db/repositories/ScoreRepository'
import { PracticeRepository } from '@/db/repositories/PracticeRepository'
import { ScoreViewer } from '@/components/score/ScoreViewer'
import { PracticeSettings } from '@/components/practice/PracticeSettings'
import { RecorderControls } from '@/components/practice/RecorderControls'
import { WaveformDisplay } from '@/components/practice/WaveformDisplay'
import { StopConfirmDialog } from '@/components/practice/StopConfirmDialog'

export default function PracticePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const store = usePracticeStore()
  const [showStopDialog, setShowStopDialog] = useState(false)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const audioRef = useRef<{ stream: MediaStream; ctx: AudioContext } | null>(null)
  const sessionIdRef = useRef<string>('')
  const audioFileRef = useRef<HTMLInputElement>(null)

  // Load track from URL params
  const trackId = searchParams.get('track') || store.trackId
  const track = trackId ? ScoreRepository.getById(trackId) : null

  useEffect(() => {
    if (trackId && trackId !== store.trackId) store.setTrack(trackId)
  }, [trackId, store])

  const startAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      })
      const ctx = new AudioContext()
      const source = ctx.createMediaStreamSource(stream)
      const node = ctx.createAnalyser()
      node.fftSize = 2048
      source.connect(node)
      audioRef.current = { stream, ctx }
      setAnalyser(node)
    } catch {
      // Mic permission denied
    }
  }, [])

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.stream.getTracks().forEach((t) => t.stop())
      audioRef.current.ctx.close()
      audioRef.current = null
      setAnalyser(null)
    }
  }, [])

  const handleStart = useCallback(() => { startAudio() }, [startAudio])
  const handlePause = useCallback(() => {}, [])
  const handleResume = useCallback(() => {}, [])

  const handleStop = useCallback(() => {
    setShowStopDialog(true)
  }, [])

  const handleSubmit = useCallback(() => {
    setShowStopDialog(false)
    stopAudio()
    const id = sessionIdRef.current || crypto.randomUUID()
    PracticeRepository.create({
      id, user_id: 'local-user', track_id: trackId || '',
      scoring_mode: store.scoringMode, status: 'completed',
      duration_seconds: store.elapsedSeconds, target_bpm: store.targetBPM,
      actual_bpm: null, total_score: null, speed_score: null, rhythm_score: null,
      intonation_score: null, smoothness_score: null, completeness_score: null,
      audio_blob_key: null, video_blob_key: null, resume_position: null,
    })
    store.reset()
    navigate(`/report/${id}`)
  }, [trackId, store, stopAudio, navigate])

  const handleSave = useCallback(() => {
    setShowStopDialog(false)
    stopAudio()
    const id = sessionIdRef.current || crypto.randomUUID()
    PracticeRepository.create({
      id, user_id: 'local-user', track_id: trackId || '',
      scoring_mode: store.scoringMode, status: 'in-progress',
      duration_seconds: store.elapsedSeconds, target_bpm: store.targetBPM,
      actual_bpm: null, total_score: null, speed_score: null, rhythm_score: null,
      intonation_score: null, smoothness_score: null, completeness_score: null,
      audio_blob_key: null, video_blob_key: null, resume_position: store.elapsedSeconds,
    })
    store.reset()
    navigate('/')
  }, [trackId, store, stopAudio, navigate])

  const handleRestart = useCallback(() => {
    setShowStopDialog(false)
    stopAudio()
    store.setStatus('idle')
    store.setElapsedSeconds(0)
  }, [store, stopAudio])

  const handleDiscard = useCallback(() => {
    setShowStopDialog(false)
    stopAudio()
    store.reset()
  }, [store, stopAudio])

  const handleAudioUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // TODO: Process uploaded audio file for retrospective analysis
    e.target.value = ''
  }, [])

  if (!track) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6 py-20">
        <p className="text-lg text-muted-foreground">{t('practice.select_track')}</p>
        <Button onClick={() => navigate('/library')}>{t('nav.library')}</Button>
      </div>
    )
  }

  const isRecording = store.status === 'recording' || store.status === 'paused'

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-3">
        <div>
          <h1 className="text-lg font-bold">{track.name}</h1>
          {track.composer && <p className="text-sm text-muted-foreground">{track.composer}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => audioFileRef.current?.click()}>
            <Upload className="mr-1 h-4 w-4" />
            {t('practice.upload_audio')}
          </Button>
          <input ref={audioFileRef} type="file" accept=".wav,.mp3,.m4a,.flac" className="hidden" onChange={handleAudioUpload} />
        </div>
      </div>

      {/* Score viewer */}
      <div className="flex-1 overflow-auto p-4">
        <ScoreViewer musicXml={track.musicxml_path || ''} />
      </div>

      {/* Waveform */}
      {isRecording && (
        <div className="px-6">
          <WaveformDisplay analyser={analyser} isActive={isRecording} />
        </div>
      )}

      {/* Controls */}
      <div className="border-t px-6">
        {store.status === 'idle' && <PracticeSettings defaultBPM={track.duration_seconds ? 120 : null} />}
        <RecorderControls onStart={handleStart} onPause={handlePause} onResume={handleResume} onStop={handleStop} />
      </div>

      <StopConfirmDialog
        open={showStopDialog}
        onClose={() => setShowStopDialog(false)}
        onSubmit={handleSubmit}
        onSave={handleSave}
        onRestart={handleRestart}
        onDiscard={handleDiscard}
      />
    </div>
  )
}
