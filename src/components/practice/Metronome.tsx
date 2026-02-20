import { useState, useCallback, useRef, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { MetronomeEngine, type MetronomeSoundType } from '@/engines/MetronomeEngine'
import { Play, Square } from 'lucide-react'

export function Metronome() {
  const [bpm, setBpm] = useState(120)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(-1)
  const [soundType, setSoundType] = useState<MetronomeSoundType>('woodblock')
  const [beatsPerMeasure] = useState(4)
  const engineRef = useRef<MetronomeEngine | null>(null)

  useEffect(() => {
    const engine = new MetronomeEngine()
    engine.setOnBeat((beat) => {
      setCurrentBeat(beat)
    })
    engineRef.current = engine
    return () => engine.dispose()
  }, [])

  const togglePlay = useCallback(async () => {
    const engine = engineRef.current
    if (!engine) return
    if (isPlaying) {
      engine.stop()
      setIsPlaying(false)
      setCurrentBeat(-1)
    } else {
      engine.setBPM(bpm)
      engine.setSoundType(soundType)
      engine.setBeatsPerMeasure(beatsPerMeasure)
      await engine.start()
      setIsPlaying(true)
    }
  }, [isPlaying, bpm, soundType, beatsPerMeasure])

  const handleBpmChange = useCallback(
    (value: number[]) => {
      const newBpm = value[0]
      setBpm(newBpm)
      if (isPlaying) engineRef.current?.setBPM(newBpm)
    },
    [isPlaying],
  )

  const soundTypes: { value: MetronomeSoundType; label: string }[] = [
    { value: 'woodblock', label: '🪵' },
    { value: 'electronic', label: '🔊' },
    { value: 'silent', label: '🔇' },
  ]

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Metronome</span>
        <span className="text-2xl font-bold tabular-nums">{bpm} BPM</span>
      </div>

      <Slider value={[bpm]} onValueChange={handleBpmChange} min={30} max={240} step={1} />

      <div className="flex items-center gap-2">
        <Button size="sm" variant={isPlaying ? 'destructive' : 'default'} onClick={togglePlay}>
          {isPlaying ? <Square className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
          {isPlaying ? 'Stop' : 'Start'}
        </Button>

        <div className="flex gap-1">
          {soundTypes.map((st) => (
            <Button
              key={st.value}
              size="sm"
              variant={soundType === st.value ? 'secondary' : 'ghost'}
              onClick={() => setSoundType(st.value)}
            >
              {st.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-2">
        {Array.from({ length: beatsPerMeasure }).map((_, i) => (
          <div
            key={i}
            className={`h-4 w-4 rounded-full transition-colors ${
              currentBeat === i ? (i === 0 ? 'bg-primary' : 'bg-primary/60') : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
