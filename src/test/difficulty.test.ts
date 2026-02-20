import { describe, it, expect } from 'vitest'
import { DifficultyCalculator } from '@/engines/DifficultyCalculator'
import type { ParsedScore } from '@/engines/ScoreParser'
import type { ScoreNote, MeasureInfo } from '@/types/music'

function makeParsedScore(noteCount: number, midiRange: [number, number], durations: number[], bpm: number, voices: number): ParsedScore {
  const notes: ScoreNote[] = Array.from({ length: noteCount }, (_, i) => ({
    midiNumber: midiRange[0] + (i % (midiRange[1] - midiRange[0] + 1)),
    startBeat: i, durationBeats: durations[i % durations.length], voice: (i % voices) + 1, staff: 1,
  }))
  const measures: MeasureInfo[] = [{
    number: 1, startTime: 0, endTime: 4, notes,
  }]
  return {
    title: 'Test', composer: 'Test',
    parts: [{ id: 'P1', name: 'Piano', measures }],
    tempos: [{ bpm, measure: 1, beat: 1 }],
    totalMeasures: Math.max(1, Math.ceil(noteCount / 4)),
    timeSignatures: [{ beats: 4, beatType: 4, measure: 1 }],
    keySignatures: [{ fifths: 0, mode: 'major', measure: 1 }],
  }
}

describe('DifficultyCalculator', () => {
  const calc = new DifficultyCalculator()

  it('4.1 简单曲目→beginner', () => {
    const parsed = makeParsedScore(8, [60, 67], [1], 72, 1)
    const result = calc.calculate(parsed)
    expect(result.level).toBe('beginner')
    expect(result.score).toBeGreaterThanOrEqual(1)
    expect(result.score).toBeLessThanOrEqual(3)
  })

  it('4.2 复杂曲目→advanced', () => {
    const parsed = makeParsedScore(200, [36, 96], [0.25, 0.5, 1, 0.125, 0.75, 1.5], 160, 3)
    const result = calc.calculate(parsed)
    expect(result.level).toBe('advanced')
    expect(result.score).toBeGreaterThanOrEqual(7)
  })

  it('4.3 空乐谱不崩溃', () => {
    const parsed = makeParsedScore(0, [60, 60], [1], 100, 1)
    const result = calc.calculate(parsed)
    expect(result.score).toBeGreaterThanOrEqual(1)
    expect(result.level).toBeDefined()
  })
})
