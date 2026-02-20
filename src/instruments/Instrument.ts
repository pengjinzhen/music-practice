import type { InstrumentType, InstrumentConfig } from '@/types/instrument'
import type { ToleranceConfig } from '@/types/scoring'
import type { Frequency, MidiNumber } from '@/types/music'

export interface Instrument {
  readonly config: InstrumentConfig
  getType(): InstrumentType
  getName(): string
  isPolyphonic(): boolean
  getMidiRange(): [MidiNumber, MidiNumber]
  getFrequencyRange(): [Frequency, Frequency]
  getTolerance(skillLevel: string): ToleranceConfig
  getTuningStandard(): Frequency
}

export abstract class BaseInstrument implements Instrument {
  abstract readonly config: InstrumentConfig

  getType(): InstrumentType {
    return this.config.type
  }

  getName(): string {
    return this.config.name
  }

  isPolyphonic(): boolean {
    return this.config.polyphonic
  }

  getMidiRange(): [MidiNumber, MidiNumber] {
    return [this.config.minMidi, this.config.maxMidi]
  }

  getFrequencyRange(): [Frequency, Frequency] {
    return [this.config.minFrequency, this.config.maxFrequency]
  }

  getTolerance(skillLevel: string): ToleranceConfig {
    const levels: Record<string, ToleranceConfig> = {
      beginner: { pitchCents: 50, rhythmPercent: 30, speedPercent: 40 },
      intermediate: { pitchCents: 25, rhythmPercent: 15, speedPercent: 20 },
      advanced: { pitchCents: 10, rhythmPercent: 8, speedPercent: 10 },
    }
    return levels[skillLevel] ?? levels.beginner
  }

  getTuningStandard(): Frequency {
    return this.config.tuningStandard
  }
}
