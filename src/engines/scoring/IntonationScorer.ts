import type { ToleranceConfig } from '@/types/scoring'

export interface IntonationScoreInput {
  /** For piano: array of { correct: boolean } */
  /** For cello: array of { deviationCents: number } */
  noteResults: { correct?: boolean; deviationCents?: number }[]
  isPiano: boolean
  tolerance: ToleranceConfig
}

export class IntonationScorer {
  /** Score intonation dimension (0-20) */
  score(input: IntonationScoreInput): { score: number; details: string } {
    const { noteResults, isPiano, tolerance } = input
    if (noteResults.length === 0) return { score: 0, details: 'No pitch data' }

    if (isPiano) {
      return this.scorePiano(noteResults)
    }
    return this.scoreCello(noteResults, tolerance.pitchCents)
  }

  private scorePiano(notes: { correct?: boolean }[]): { score: number; details: string } {
    const correct = notes.filter((n) => n.correct).length
    const accuracy = correct / notes.length
    const score = Math.min(20, Math.round(accuracy * 20))
    return { score, details: `${correct}/${notes.length} correct notes (${(accuracy * 100).toFixed(0)}%)` }
  }

  private scoreCello(notes: { deviationCents?: number }[], maxCents: number): { score: number; details: string } {
    let inTuneCount = 0
    let totalDeviation = 0

    for (const n of notes) {
      const dev = Math.abs(n.deviationCents || 0)
      totalDeviation += dev
      if (dev <= maxCents) inTuneCount++
    }

    const accuracy = inTuneCount / notes.length
    const accuracyScore = accuracy * 12
    const avgDev = totalDeviation / notes.length
    const precisionScore = Math.max(0, 8 * (1 - avgDev / (maxCents * 3)))

    const score = Math.min(20, Math.round(accuracyScore + precisionScore))
    const details = `${inTuneCount}/${notes.length} in tune, avg deviation: ${avgDev.toFixed(1)} cents`
    return { score, details }
  }
}
