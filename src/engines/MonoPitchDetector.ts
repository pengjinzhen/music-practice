import { PitchDetector as PitchyDetector } from 'pitchy'
import type { DetectedNote, Frequency, Cents } from '@/types/music'
import { frequencyToNearestMidi, midiToNoteName, centsFromNearest } from '@/utils/music'

export interface MonoPitchResult {
  frequency: Frequency
  clarity: number
  midiNumber: number
  noteName: string
  cents: Cents
}

export class MonoPitchDetector {
  private detector: PitchyDetector<Float32Array> | null = null
  private sampleRate: number
  private minClarity: number

  constructor(sampleRate: number = 44100, minClarity: number = 0.9) {
    this.sampleRate = sampleRate
    this.minClarity = minClarity
  }

  init(bufferSize: number): void {
    this.detector = PitchyDetector.forFloat32Array(bufferSize)
  }

  detect(buffer: Float32Array): MonoPitchResult | null {
    if (!this.detector) {
      this.init(buffer.length)
    }
    const [frequency, clarity] = this.detector!.findPitch(buffer, this.sampleRate)

    if (frequency <= 0 || clarity < this.minClarity) return null
    if (frequency < 20 || frequency > 5000) return null

    const midiNumber = frequencyToNearestMidi(frequency)
    const noteName = midiToNoteName(midiNumber)
    const cents = centsFromNearest(frequency)

    return { frequency, clarity, midiNumber, noteName, cents }
  }

  toDetectedNote(result: MonoPitchResult, timestamp: number): DetectedNote {
    const octave = Math.floor(result.midiNumber / 12) - 1
    return {
      frequency: result.frequency,
      midiNumber: result.midiNumber,
      noteName: result.noteName.replace(/\d+$/, ''),
      octave,
      cents: result.cents,
      confidence: result.clarity,
      timestamp,
    }
  }

  setMinClarity(value: number): void {
    this.minClarity = value
  }
}
