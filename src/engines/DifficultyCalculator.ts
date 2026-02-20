import type { ParsedScore } from './ScoreParser'

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export interface DifficultyResult {
  level: DifficultyLevel
  score: number // 1-10
  factors: DifficultyFactors
}

export interface DifficultyFactors {
  noteDensity: number
  pitchRange: number
  rhythmComplexity: number
  tempoFactor: number
  polyphonyFactor: number
}

export class DifficultyCalculator {
  calculate(parsed: ParsedScore): DifficultyResult {
    const allNotes = parsed.parts.flatMap((p) => p.measures.flatMap((m) => m.notes))
    const totalMeasures = parsed.totalMeasures || 1

    const noteDensity = this.calcNoteDensity(allNotes.length, totalMeasures)
    const pitchRange = this.calcPitchRange(allNotes.map((n) => n.midiNumber))
    const rhythmComplexity = this.calcRhythmComplexity(allNotes.map((n) => n.durationBeats))
    const tempoFactor = this.calcTempoFactor(parsed.tempos)
    const polyphonyFactor = this.calcPolyphony(parsed.parts)

    const factors: DifficultyFactors = {
      noteDensity,
      pitchRange,
      rhythmComplexity,
      tempoFactor,
      polyphonyFactor,
    }

    const raw = noteDensity * 0.25 + pitchRange * 0.2 + rhythmComplexity * 0.25 + tempoFactor * 0.15 + polyphonyFactor * 0.15
    const score = Math.max(1, Math.min(10, Math.round(raw)))
    const level: DifficultyLevel = score <= 3 ? 'beginner' : score <= 6 ? 'intermediate' : 'advanced'

    return { level, score, factors }
  }

  private calcNoteDensity(noteCount: number, measures: number): number {
    const avg = noteCount / measures
    if (avg <= 4) return 2
    if (avg <= 8) return 4
    if (avg <= 16) return 6
    if (avg <= 24) return 8
    return 10
  }

  private calcPitchRange(midis: number[]): number {
    if (midis.length === 0) return 1
    const range = Math.max(...midis) - Math.min(...midis)
    if (range <= 12) return 2
    if (range <= 24) return 4
    if (range <= 36) return 6
    if (range <= 48) return 8
    return 10
  }

  private calcRhythmComplexity(durations: number[]): number {
    if (durations.length === 0) return 1
    const unique = new Set(durations.map((d) => Math.round(d * 100)))
    const count = unique.size
    if (count <= 2) return 2
    if (count <= 4) return 5
    if (count <= 6) return 7
    return 9
  }

  private calcTempoFactor(tempos: { bpm: number }[]): number {
    if (tempos.length === 0) return 3
    const maxBpm = Math.max(...tempos.map((t) => t.bpm))
    if (maxBpm <= 72) return 2
    if (maxBpm <= 108) return 4
    if (maxBpm <= 132) return 6
    if (maxBpm <= 160) return 8
    return 10
  }

  private calcPolyphony(parts: { measures: { notes: { voice: number }[] }[] }[]): number {
    let maxVoices = 1
    for (const part of parts) {
      for (const m of part.measures) {
        const voices = new Set(m.notes.map((n) => n.voice))
        maxVoices = Math.max(maxVoices, voices.size)
      }
    }
    if (maxVoices <= 1) return 1
    if (maxVoices <= 2) return 5
    return 9
  }
}
