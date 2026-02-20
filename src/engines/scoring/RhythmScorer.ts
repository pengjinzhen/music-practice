import type { ToleranceConfig } from '@/types/scoring'

export interface RhythmScoreInput {
  /** Time deviations in beats for each note */
  timeDeviations: number[]
  tolerance: ToleranceConfig
}

export class RhythmScorer {
  /** Score rhythm dimension (0-20) */
  score(input: RhythmScoreInput): { score: number; details: string } {
    const { timeDeviations, tolerance } = input
    if (timeDeviations.length === 0) return { score: 0, details: 'No rhythm data' }

    const maxDeviation = tolerance.rhythmPercent / 100 // convert percent to beat fraction
    let correctCount = 0
    let totalDeviation = 0

    for (const dev of timeDeviations) {
      const absDev = Math.abs(dev)
      totalDeviation += absDev
      if (absDev <= maxDeviation) correctCount++
    }

    // Accuracy score (0-10): percentage of notes within tolerance
    const accuracy = correctCount / timeDeviations.length
    const accuracyScore = accuracy * 10

    // Precision score (0-10): average deviation quality
    const avgDeviation = totalDeviation / timeDeviations.length
    const precisionScore = Math.max(0, 10 * (1 - avgDeviation / (maxDeviation * 3)))

    const total = Math.min(20, Math.round(accuracyScore + precisionScore))
    const details = `${correctCount}/${timeDeviations.length} notes on time (${(accuracy * 100).toFixed(0)}%), avg deviation: ${avgDeviation.toFixed(3)} beats`

    return { score: total, details }
  }
}
