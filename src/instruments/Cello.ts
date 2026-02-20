import type { InstrumentConfig } from '@/types/instrument'
import type { CelloString } from '@/types/music'
import { BaseInstrument } from './Instrument'

export class Cello extends BaseInstrument {
  readonly config: InstrumentConfig = {
    type: 'cello',
    name: 'Cello',
    minMidi: 36,   // C2
    maxMidi: 76,   // E5 (with higher positions)
    minFrequency: 65.41,
    maxFrequency: 659.26,
    polyphonic: false,
    tolerance: { pitchCents: 50, rhythmPercent: 30, speedPercent: 40 },
    tuningStandard: 440,
  }

  /** Standard cello tuning: C2-G2-D3-A3 */
  readonly strings: CelloString[] = [
    { name: 'C', standardFrequency: 65.41, midiNumber: 36 },
    { name: 'G', standardFrequency: 98.0, midiNumber: 43 },
    { name: 'D', standardFrequency: 146.83, midiNumber: 50 },
    { name: 'A', standardFrequency: 220.0, midiNumber: 57 },
  ]

  /** Cello uses continuous pitch detection (cents precision) */
  isPitchContinuous(): boolean {
    return true
  }

  /** Identify which string is being played based on frequency */
  identifyString(frequency: number): CelloString | null {
    let closest: CelloString | null = null
    let minDistance = Infinity
    for (const s of this.strings) {
      const distance = Math.abs(1200 * Math.log2(frequency / s.standardFrequency))
      if (distance < minDistance && distance < 600) {
        minDistance = distance
        closest = s
      }
    }
    return closest
  }

  /** Get fingering range (0-4) */
  getFingeringRange(): [number, number] {
    return [0, 4]
  }
}
