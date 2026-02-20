/** MIDI note number (0-127) */
export type MidiNumber = number

/** Frequency in Hz */
export type Frequency = number

/** Deviation in cents from a reference pitch */
export type Cents = number

/** Time in seconds */
export type Seconds = number

/** Beats per minute */
export type BPM = number

export interface NoteEvent {
  midiNumber: MidiNumber
  frequency: Frequency
  startTime: Seconds
  duration: Seconds
  velocity: number
}

export interface DetectedNote {
  frequency: Frequency
  midiNumber: MidiNumber
  noteName: string
  octave: number
  cents: Cents
  confidence: number
  timestamp: Seconds
}

export interface MeasureInfo {
  number: number
  startTime: Seconds
  endTime: Seconds
  notes: ScoreNote[]
}

export interface ScoreNote {
  midiNumber: MidiNumber
  startBeat: number
  durationBeats: number
  voice: number
  staff: number
  tied?: boolean
}

export interface ChordInfo {
  notes: MidiNumber[]
  startBeat: number
  durationBeats: number
}

export type Hand = 'left' | 'right' | 'both'

export interface CelloString {
  name: 'C' | 'G' | 'D' | 'A'
  standardFrequency: Frequency
  midiNumber: MidiNumber
}
