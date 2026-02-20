import type { InstrumentConfig } from '@/types/instrument'
import { BaseInstrument } from './Instrument'

export class Piano extends BaseInstrument {
  readonly config: InstrumentConfig = {
    type: 'piano',
    name: 'Piano',
    minMidi: 21,   // A0
    maxMidi: 108,  // C8
    minFrequency: 27.5,
    maxFrequency: 4186,
    polyphonic: true,
    tolerance: { pitchCents: 50, rhythmPercent: 30, speedPercent: 40 },
    tuningStandard: 440,
  }

  /** Piano has 88 keys */
  getKeyCount(): number {
    return 88
  }

  /** Piano uses binary pitch detection (correct key or not) */
  isPitchContinuous(): boolean {
    return false
  }

  /** Get staff assignment hint based on MIDI number */
  getStaffHint(midiNumber: number): 'treble' | 'bass' {
    return midiNumber >= 60 ? 'treble' : 'bass'
  }
}
