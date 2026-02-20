import { useState, useRef, useCallback, useEffect } from 'react'
import { midiToNoteName } from '@/utils/music'

interface TunerState {
  isActive: boolean
  frequency: number | null
  noteName: string
  octave: number
  cents: number
  midiNumber: number
}

export function useTuner() {
  const [state, setState] = useState<TunerState>({
    isActive: false, frequency: null, noteName: '--', octave: 0, cents: 0, midiNumber: 0,
  })
  const audioRef = useRef<{ stream: MediaStream; ctx: AudioContext; analyser: AnalyserNode } | null>(null)
  const animRef = useRef<number>(0)

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      })
      const ctx = new AudioContext()
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 4096
      source.connect(analyser)
      audioRef.current = { stream, ctx, analyser }
      setState((s) => ({ ...s, isActive: true }))
    } catch {
      // Permission denied
    }
  }, [])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.stream.getTracks().forEach((t) => t.stop())
      audioRef.current.ctx.close()
      audioRef.current = null
    }
    cancelAnimationFrame(animRef.current)
    setState({ isActive: false, frequency: null, noteName: '--', octave: 0, cents: 0, midiNumber: 0 })
  }, [])

  useEffect(() => {
    if (!state.isActive || !audioRef.current) return
    const { analyser, ctx } = audioRef.current
    const buffer = new Float32Array(analyser.fftSize)

    const detect = () => {
      animRef.current = requestAnimationFrame(detect)
      analyser.getFloatTimeDomainData(buffer)
      const freq = autoCorrelate(buffer, ctx.sampleRate)
      if (freq > 0) {
        const midi = 69 + 12 * Math.log2(freq / 440)
        const roundedMidi = Math.round(midi)
        const cents = Math.round((midi - roundedMidi) * 100)
        const name = midiToNoteName(roundedMidi)
        const octave = Math.floor(roundedMidi / 12) - 1
        setState((s) => ({ ...s, frequency: freq, noteName: name.replace(/\d+$/, ''), octave, cents, midiNumber: roundedMidi }))
      }
    }
    detect()
    return () => cancelAnimationFrame(animRef.current)
  }, [state.isActive])

  return { ...state, start, stop }
}

function autoCorrelate(buffer: Float32Array, sampleRate: number): number {
  let rms = 0
  for (let i = 0; i < buffer.length; i++) rms += buffer[i] * buffer[i]
  rms = Math.sqrt(rms / buffer.length)
  if (rms < 0.01) return -1

  const size = buffer.length
  const correlations = new Float32Array(size)
  for (let lag = 0; lag < size; lag++) {
    let sum = 0
    for (let i = 0; i < size - lag; i++) sum += buffer[i] * buffer[i + lag]
    correlations[lag] = sum
  }

  let d = 0
  while (d < size && correlations[d] > correlations[d + 1]) d++

  let maxVal = -1
  let maxPos = -1
  for (let i = d; i < size; i++) {
    if (correlations[i] > maxVal) { maxVal = correlations[i]; maxPos = i }
  }
  if (maxPos <= 0) return -1
  return sampleRate / maxPos
}
