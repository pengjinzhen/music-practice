import { describe, it, expect } from 'vitest'
import { NoteAligner } from '@/engines/NoteAligner'
import type { ScoreNote, DetectedNote } from '@/types/music'

function makeScoreNote(midi: number, startBeat: number): ScoreNote {
  return { midiNumber: midi, startBeat, durationBeats: 1, voice: 1, staff: 1 }
}

function makeDetected(midi: number, timestamp: number, cents = 0): DetectedNote {
  return {
    frequency: 440, midiNumber: midi, noteName: 'A', octave: 4,
    cents, confidence: 0.9, timestamp,
  }
}

describe('NoteAligner', () => {
  const aligner = new NoteAligner(50, 0.5)

  it('3.1 完美匹配全部correct', () => {
    const scoreNotes = [makeScoreNote(60, 0), makeScoreNote(62, 1)]
    // BPM=120 → 1 beat = 0.5s, measureStart=0
    const detected = [makeDetected(60, 0), makeDetected(62, 0.5)]
    const result = aligner.align(scoreNotes, detected, 0, 120)
    expect(result).toHaveLength(2)
    expect(result[0].status).toBe('correct')
    expect(result[1].status).toBe('correct')
  })

  it('3.2 音高偏差标记wrong-pitch', () => {
    const scoreNotes = [makeScoreNote(60, 0)]
    const detected = [makeDetected(63, 0)] // 差3个半音
    const result = aligner.align(scoreNotes, detected, 0, 120)
    expect(result[0].status).toBe('wrong-pitch')
  })

  it('3.3 漏弹标记missed', () => {
    const scoreNotes = [makeScoreNote(60, 0), makeScoreNote(62, 1)]
    const detected: DetectedNote[] = [] // 没有检测到任何音符
    const result = aligner.align(scoreNotes, detected, 0, 120)
    expect(result[0].status).toBe('missed')
    expect(result[1].status).toBe('missed')
  })

  it('3.4 容忍度设置生效', () => {
    const aligner2 = new NoteAligner(50, 0.5)
    aligner2.setTolerance(100, 1.0)
    // 大容忍度下，cents=80应该通过
    const scoreNotes = [makeScoreNote(60, 0)]
    const detected = [makeDetected(60, 0, 80)]
    const result = aligner2.align(scoreNotes, detected, 0, 120)
    expect(result[0].status).toBe('correct')
  })
})
