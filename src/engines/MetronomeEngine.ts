import * as Tone from 'tone'
import type { BPM } from '@/types/music'

export type MetronomeSoundType = 'woodblock' | 'electronic' | 'silent'

export class MetronomeEngine {
  private bpm: BPM = 120
  private beatsPerMeasure: number = 4
  private soundType: MetronomeSoundType = 'woodblock'
  private _isPlaying = false
  private loop: Tone.Loop | null = null
  private synth: Tone.MembraneSynth | Tone.Synth | null = null
  private beatCount: number = 0
  private onBeat?: (beat: number, isDownbeat: boolean) => void

  get isPlaying(): boolean {
    return this._isPlaying
  }

  setBPM(bpm: BPM): void {
    this.bpm = Math.max(20, Math.min(300, bpm))
    if (this._isPlaying) {
      Tone.getTransport().bpm.value = this.bpm
    }
  }

  getBPM(): BPM {
    return this.bpm
  }

  setBeatsPerMeasure(beats: number): void {
    this.beatsPerMeasure = beats
  }

  setSoundType(type: MetronomeSoundType): void {
    this.soundType = type
    if (this.synth) {
      this.synth.dispose()
      this.synth = null
    }
  }

  setOnBeat(callback: (beat: number, isDownbeat: boolean) => void): void {
    this.onBeat = callback
  }

  async start(): Promise<void> {
    if (this._isPlaying) return
    await Tone.start()

    if (!this.synth && this.soundType !== 'silent') {
      this.synth = this.soundType === 'woodblock'
        ? new Tone.MembraneSynth({ pitchDecay: 0.01, octaves: 6, envelope: { attack: 0.001, decay: 0.1, sustain: 0 } }).toDestination()
        : new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.001, decay: 0.05, sustain: 0 } }).toDestination()
    }

    this.beatCount = 0
    Tone.getTransport().bpm.value = this.bpm

    this.loop = new Tone.Loop((time) => {
      const isDownbeat = this.beatCount % this.beatsPerMeasure === 0
      if (this.synth && this.soundType !== 'silent') {
        const note = isDownbeat ? 'C5' : 'C4'
        const velocity = isDownbeat ? 0.8 : 0.5
        this.synth.triggerAttackRelease(note, '32n', time, velocity)
      }
      this.onBeat?.(this.beatCount % this.beatsPerMeasure, isDownbeat)
      this.beatCount++
    }, '4n')

    this.loop.start(0)
    Tone.getTransport().start()
    this._isPlaying = true
  }

  stop(): void {
    this._isPlaying = false
    this.loop?.stop()
    this.loop?.dispose()
    this.loop = null
    Tone.getTransport().stop()
    this.beatCount = 0
  }

  dispose(): void {
    this.stop()
    this.synth?.dispose()
    this.synth = null
  }
}
