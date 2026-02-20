import type { Seconds } from '@/types/music'

export interface SmoothnessScoreInput {
  /** Timestamps of detected onsets */
  onsetTimestamps: Seconds[]
  /** Expected note durations in seconds */
  expectedDurations: Seconds[]
  /** Total expected duration */
  totalDuration: Seconds
}

export class SmoothnessScorer {
  /** Score smoothness dimension (0-20) */
  score(input: SmoothnessScoreInput): { score: number; details: string } {
    const { onsetTimestamps, totalDuration } = input
    if (onsetTimestamps.length < 2) return { score: 20, details: 'Too few notes to evaluate' }

    // Detect unexpected pauses (gaps significantly longer than expected)
    const gaps: number[] = []
    for (let i = 1; i < onsetTimestamps.length; i++) {
      gaps.push(onsetTimestamps[i] - onsetTimestamps[i - 1])
    }

    const medianGap = this.median(gaps)
    const pauseThreshold = medianGap * 3 // 3x median = unexpected pause

    let pauseCount = 0
    let totalPauseTime = 0
    for (const gap of gaps) {
      if (gap > pauseThreshold) {
        pauseCount++
        totalPauseTime += gap - medianGap
      }
    }

    // Continuity score (0-12): fewer pauses = better
    const pauseRatio = pauseCount / gaps.length
    const continuityScore = Math.max(0, 12 * (1 - pauseRatio * 5))

    // Flow score (0-8): less total pause time = better
    const pauseTimeRatio = totalPauseTime / totalDuration
    const flowScore = Math.max(0, 8 * (1 - pauseTimeRatio * 3))

    const total = Math.min(20, Math.round(continuityScore + flowScore))
    const details = `${pauseCount} unexpected pauses, total pause: ${totalPauseTime.toFixed(1)}s / ${totalDuration.toFixed(1)}s`

    return { score: total, details }
  }

  private median(arr: number[]): number {
    const sorted = [...arr].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
  }
}
