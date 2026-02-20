import type { BPM } from '@/types/music'
import type { ToleranceConfig } from '@/types/scoring'

export interface SpeedScoreInput {
  targetBPM: BPM
  detectedBPMs: BPM[]
  tolerance: ToleranceConfig
}

export class SpeedScorer {
  /** Score speed dimension (0-20) */
  score(input: SpeedScoreInput): { score: number; details: string } {
    const { targetBPM, detectedBPMs, tolerance } = input
    if (detectedBPMs.length === 0) return { score: 0, details: 'No tempo data detected' }

    // Average BPM deviation
    const avgBPM = detectedBPMs.reduce((a, b) => a + b, 0) / detectedBPMs.length
    const deviationPercent = Math.abs(avgBPM - targetBPM) / targetBPM * 100

    // BPM stability (variance)
    const variance = detectedBPMs.reduce((sum, b) => sum + (b - avgBPM) ** 2, 0) / detectedBPMs.length
    const cv = Math.sqrt(variance) / avgBPM * 100 // coefficient of variation %

    // Deviation score (0-10)
    const maxDeviation = tolerance.speedPercent
    const deviationScore = Math.max(0, 10 * (1 - deviationPercent / maxDeviation))

    // Stability score (0-10)
    const stabilityScore = Math.max(0, 10 * (1 - cv / 20))

    const total = Math.min(20, Math.round(deviationScore + stabilityScore))
    const details = `Avg BPM: ${avgBPM.toFixed(1)} (target: ${targetBPM}), deviation: ${deviationPercent.toFixed(1)}%, stability CV: ${cv.toFixed(1)}%`

    return { score: total, details }
  }
}
