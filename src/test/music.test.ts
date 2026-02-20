import { describe, it, expect } from 'vitest'
import {
  midiToFrequency,
  frequencyToMidi,
  midiToNoteName,
  centsBetween,
  noteNameToMidi,
  isInTune,
  centsFromNearest,
} from '@/utils/music'

describe('midiToFrequency', () => {
  it('converts A4 (MIDI 69) to 440 Hz', () => {
    expect(midiToFrequency(69)).toBeCloseTo(440, 1)
  })

  it('converts C4 (MIDI 60) correctly', () => {
    expect(midiToFrequency(60)).toBeCloseTo(261.63, 1)
  })

  it('converts A3 (MIDI 57) to 220 Hz', () => {
    expect(midiToFrequency(57)).toBeCloseTo(220, 1)
  })

  it('supports custom A4 reference', () => {
    expect(midiToFrequency(69, 442)).toBeCloseTo(442, 1)
  })
})

describe('frequencyToMidi', () => {
  it('converts 440 Hz to MIDI 69', () => {
    expect(frequencyToMidi(440)).toBeCloseTo(69, 1)
  })

  it('converts 261.63 Hz to approximately MIDI 60', () => {
    expect(frequencyToMidi(261.63)).toBeCloseTo(60, 0)
  })
})

describe('midiToNoteName', () => {
  it('converts MIDI 69 to A4', () => {
    expect(midiToNoteName(69)).toBe('A4')
  })

  it('converts MIDI 60 to C4', () => {
    expect(midiToNoteName(60)).toBe('C4')
  })

  it('converts MIDI 72 to C5', () => {
    expect(midiToNoteName(72)).toBe('C5')
  })
})

describe('noteNameToMidi', () => {
  it('parses C4 to MIDI 60', () => {
    expect(noteNameToMidi('C4')).toBe(60)
  })

  it('parses A4 to MIDI 69', () => {
    expect(noteNameToMidi('A4')).toBe(69)
  })

  it('parses C#4 to MIDI 61', () => {
    expect(noteNameToMidi('C#4')).toBe(61)
  })

  it('returns null for invalid input', () => {
    expect(noteNameToMidi('XYZ')).toBeNull()
  })
})

describe('centsBetween', () => {
  it('returns 0 for same frequency', () => {
    expect(centsBetween(440, 440)).toBe(0)
  })

  it('returns ~100 cents for one semitone up', () => {
    expect(centsBetween(466.16, 440)).toBeCloseTo(100, 0)
  })

  it('returns ~1200 cents for one octave', () => {
    expect(centsBetween(440, 220)).toBeCloseTo(1200, 0)
  })
})

describe('centsFromNearest', () => {
  it('returns ~0 for exact A4', () => {
    expect(Math.abs(centsFromNearest(440))).toBeLessThan(1)
  })
})

describe('isInTune', () => {
  it('returns true when frequency matches target', () => {
    expect(isInTune(440, 69, 10)).toBe(true)
  })

  it('returns false when frequency is far off', () => {
    expect(isInTune(460, 69, 10)).toBe(false)
  })
})
