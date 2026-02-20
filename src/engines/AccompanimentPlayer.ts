import { MidiPlayer } from './MidiPlayer'

export class AccompanimentPlayer {
  private player: MidiPlayer
  private _volume: number = -6 // dB

  constructor() {
    this.player = new MidiPlayer()
  }

  async loadFromUrl(url: string): Promise<void> {
    await this.player.loadMidiFromUrl(url)
  }

  async loadFromBuffer(buffer: ArrayBuffer): Promise<void> {
    await this.player.loadMidiFile(buffer)
  }

  async play(startTime: number = 0): Promise<void> {
    this.player.setVolume(this._volume)
    await this.player.play(startTime)
  }

  stop(): void {
    this.player.stop()
  }

  pause(): void {
    this.player.pause()
  }

  resume(): void {
    this.player.resume()
  }

  /** Set playback speed (0.25 - 1.5) */
  setSpeed(rate: number): void {
    this.player.setPlaybackRate(rate)
  }

  /** Set volume in dB (-60 to 0) */
  setVolume(db: number): void {
    this._volume = Math.max(-60, Math.min(0, db))
    this.player.setVolume(this._volume)
  }

  get isPlaying(): boolean {
    return this.player.isPlaying
  }

  dispose(): void {
    this.player.dispose()
  }
}
