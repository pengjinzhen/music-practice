import type { Frequency, MidiNumber, Cents } from '@/types/music'

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const A4_MIDI = 69
const A4_FREQ = 440

/** Convert MIDI number to frequency (Hz) */
export function midiToFrequency(midi: MidiNumber, a4: Frequency = A4_FREQ): Frequency {
  return a4 * Math.pow(2, (midi - A4_MIDI) / 12)
}

/** Convert frequency to MIDI number (fractional) */
export function frequencyToMidi(freq: Frequency, a4: Frequency = A4_FREQ): number {
  return A4_MIDI + 12 * Math.log2(freq / a4)
}

/** Convert frequency to nearest MIDI number (integer) */
export function frequencyToNearestMidi(freq: Frequency, a4: Frequency = A4_FREQ): MidiNumber {
  return Math.round(frequencyToMidi(freq, a4))
}

/** Get note name from MIDI number (e.g., "C4", "A#3") */
export function midiToNoteName(midi: MidiNumber): string {
  const octave = Math.floor(midi / 12) - 1
  const noteIndex = midi % 12
  return `${NOTE_NAMES[noteIndex]}${octave}`
}

/** Calculate cents deviation between two frequencies */
export function centsBetween(freq1: Frequency, freq2: Frequency): Cents {
  return 1200 * Math.log2(freq1 / freq2)
}

/** Calculate cents deviation from nearest semitone */
export function centsFromNearest(freq: Frequency, a4: Frequency = A4_FREQ): Cents {
  const midi = frequencyToMidi(freq, a4)
  const nearestMidi = Math.round(midi)
  return (midi - nearestMidi) * 100
}

/** Get note name from frequency */
export function frequencyToNoteName(freq: Frequency, a4: Frequency = A4_FREQ): string {
  const midi = frequencyToNearestMidi(freq, a4)
  return midiToNoteName(midi)
}

/** Parse note name to MIDI number (e.g., "C4" -> 60) */
export function noteNameToMidi(name: string): MidiNumber | null {
  const match = name.match(/^([A-G]#?)(\d+)$/)
  if (!match) return null
  const noteIndex = NOTE_NAMES.indexOf(match[1])
  if (noteIndex === -1) return null
  const octave = parseInt(match[2])
  return (octave + 1) * 12 + noteIndex
}

/** Check if a frequency is within tolerance of a target MIDI note */
export function isInTune(
  freq: Frequency,
  targetMidi: MidiNumber,
  toleranceCents: Cents,
  a4: Frequency = A4_FREQ,
): boolean {
  const targetFreq = midiToFrequency(targetMidi, a4)
  const deviation = Math.abs(centsBetween(freq, targetFreq))
  return deviation <= toleranceCents
}
