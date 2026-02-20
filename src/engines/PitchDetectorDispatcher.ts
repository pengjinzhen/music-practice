import type { InstrumentType } from '@/types/instrument'
import type { DetectedNote } from '@/types/music'
import { MonoPitchDetector } from './MonoPitchDetector'
import { PolyPitchDetector } from './PolyPitchDetector'

export class PitchDetectorDispatcher {
  private monoDetector: MonoPitchDetector
  private polyDetector: PolyPitchDetector
  private instrumentType: InstrumentType

  constructor(instrumentType: InstrumentType, sampleRate: number = 44100) {
    this.instrumentType = instrumentType
    this.monoDetector = new MonoPitchDetector(sampleRate)
    this.polyDetector = new PolyPitchDetector(sampleRate)
  }

  setInstrument(type: InstrumentType): void {
    this.instrumentType = type
  }

  /** Detect from audio buffer (time-domain) */
  detectFromBuffer(buffer: Float32Array, timestamp: number): DetectedNote[] {
    if (this.instrumentType === 'cello') {
      const result = this.monoDetector.detect(buffer)
      if (!result) return []
      return [this.monoDetector.toDetectedNote(result, timestamp)]
    }
    // Piano: use poly detection via analyser (buffer-based fallback)
    const result = this.monoDetector.detect(buffer)
    if (!result) return []
    return [this.monoDetector.toDetectedNote(result, timestamp)]
  }

  /** Detect from AnalyserNode (preferred for piano) */
  detectFromAnalyser(analyser: AnalyserNode, timestamp: number): DetectedNote[] {
    if (this.instrumentType === 'cello') {
      const data = new Float32Array(analyser.fftSize)
      analyser.getFloatTimeDomainData(data)
      const result = this.monoDetector.detect(data)
      if (!result) return []
      return [this.monoDetector.toDetectedNote(result, timestamp)]
    }
    // Piano: poly detection
    const result = this.polyDetector.detectFromAnalyser(analyser, timestamp)
    return this.polyDetector.toDetectedNotes(result)
  }

  isPolyphonic(): boolean {
    return this.instrumentType === 'piano'
  }
}
