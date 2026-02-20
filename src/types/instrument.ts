import type { Frequency, MidiNumber, Cents, DetectedNote } from './music'
import type { ToleranceConfig } from './scoring'

export type InstrumentType = 'piano' | 'cello'

export interface InstrumentConfig {
  type: InstrumentType
  name: string
  minMidi: MidiNumber
  maxMidi: MidiNumber
  minFrequency: Frequency
  maxFrequency: Frequency
  polyphonic: boolean
  tolerance: ToleranceConfig
  tuningStandard: Frequency // A4 reference
}

export interface PitchDetectionStrategy {
  detect(buffer: Float32Array, sampleRate: number): DetectedNote | DetectedNote[] | null
}

export interface TuningInfo {
  stringName: string
  standardFrequency: Frequency
  currentFrequency: Frequency
  deviationCents: Cents
  inTune: boolean
}
