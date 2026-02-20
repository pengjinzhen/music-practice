import * as Tone from 'tone'
import { Midi } from '@tonejs/midi'

export class MidiPlayer {
  private synth: Tone.PolySynth | null = null
  private midi: Midi | null = null
  private scheduledEvents: number[] = []
  private _isPlaying = false
  private _playbackRate = 1.0

  get isPlaying(): boolean {
    return this._isPlaying
  }

  get playbackRate(): number {
    return this._playbackRate
  }

  async loadMidiFile(arrayBuffer: ArrayBuffer): Promise<void> {
    this.midi = new Midi(arrayBuffer)
  }

  loadMidiFromUrl(url: string): Promise<void> {
    return fetch(url)
      .then((r) => r.arrayBuffer())
      .then((buf) => this.loadMidiFile(buf))
  }

  async play(startTime: number = 0): Promise<void> {
    if (!this.midi) throw new Error('No MIDI loaded')
    await Tone.start()

    if (!this.synth) {
      this.synth = new Tone.PolySynth(Tone.Synth).toDestination()
    }

    this.stop()
    this._isPlaying = true
    Tone.getTransport().bpm.value = (this.midi.header.tempos[0]?.bpm || 120) * this._playbackRate

    const now = Tone.now()
    for (const track of this.midi.tracks) {
      for (const note of track.notes) {
        if (note.time < startTime) continue
        const adjustedTime = (note.time - startTime) / this._playbackRate
        const id = Tone.getTransport().schedule((time) => {
          this.synth?.triggerAttackRelease(
            note.name,
            note.duration / this._playbackRate,
            time,
            note.velocity,
          )
        }, adjustedTime)
        this.scheduledEvents.push(id)
      }
    }

    Tone.getTransport().start(now)
  }

  stop(): void {
    this._isPlaying = false
    Tone.getTransport().stop()
    Tone.getTransport().cancel()
    this.scheduledEvents = []
    this.synth?.releaseAll()
  }

  pause(): void {
    this._isPlaying = false
    Tone.getTransport().pause()
  }

  resume(): void {
    this._isPlaying = true
    Tone.getTransport().start()
  }

  setPlaybackRate(rate: number): void {
    this._playbackRate = Math.max(0.25, Math.min(1.5, rate))
  }

  setVolume(db: number): void {
    if (this.synth) {
      this.synth.volume.value = db
    }
  }

  getMidi(): Midi | null {
    return this.midi
  }

  dispose(): void {
    this.stop()
    this.synth?.dispose()
    this.synth = null
    this.midi = null
  }
}
