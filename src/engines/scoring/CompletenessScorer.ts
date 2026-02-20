export interface CompletenessScoreInput {
  totalScoreNotes: number
  detectedNotes: number
  /** Measures that were completely skipped */
  skippedMeasures: number[]
  totalMeasures: number
}

export class CompletenessScorer {
  /** Score completeness dimension (0-20) */
  score(input: CompletenessScoreInput): { score: number; details: string } {
    const { totalScoreNotes, detectedNotes, skippedMeasures, totalMeasures } = input
    if (totalScoreNotes === 0) return { score: 20, details: 'No notes in score' }

    // Note coverage (0-14)
    const noteRatio = Math.min(1, detectedNotes / totalScoreNotes)
    const noteScore = noteRatio * 14

    // Measure coverage (0-6)
    const skippedRatio = skippedMeasures.length / totalMeasures
    const measureScore = Math.max(0, 6 * (1 - skippedRatio * 2))

    const total = Math.min(20, Math.round(noteScore + measureScore))
    const details = `${detectedNotes}/${totalScoreNotes} notes played (${(noteRatio * 100).toFixed(0)}%), ${skippedMeasures.length} measures skipped`

    return { score: total, details }
  }
}
