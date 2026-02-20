import type { BPM, Seconds } from '@/types/music'

export class BPMTracker {
  private onsetTimes: Seconds[] = []
  private maxOnsets: number = 50
  private currentBPM: BPM = 0
  private smoothingFactor: number = 0.3

  /** Record an onset event timestamp */
  addOnset(timestamp: Seconds): void {
    this.onsetTimes.push(timestamp)
    if (this.onsetTimes.length > this.maxOnsets) {
      this.onsetTimes.shift()
    }
    this.updateBPM()
  }

  /** Get current estimated BPM */
  getBPM(): BPM {
    return this.currentBPM
  }

  private updateBPM(): void {
    if (this.onsetTimes.length < 3) return

    // Calculate inter-onset intervals
    const intervals: number[] = []
    for (let i = 1; i < this.onsetTimes.length; i++) {
      const interval = this.onsetTimes[i] - this.onsetTimes[i - 1]
      if (interval > 0.1 && interval < 3.0) {
        intervals.push(interval)
      }
    }
    if (intervals.length === 0) return

    // Use median interval for robustness
    intervals.sort((a, b) => a - b)
    const median = intervals[Math.floor(intervals.length / 2)]
    const rawBPM = 60 / median

    // Clamp to reasonable range
    const clampedBPM = Math.max(30, Math.min(300, rawBPM))

    // Exponential smoothing
    if (this.currentBPM === 0) {
      this.currentBPM = clampedBPM
    } else {
      this.currentBPM =
        this.smoothingFactor * clampedBPM + (1 - this.smoothingFactor) * this.currentBPM
    }
    this.currentBPM = Math.round(this.currentBPM * 10) / 10
  }

  /** Get BPM stability (0-1, higher = more stable) */
  getStability(): number {
    if (this.onsetTimes.length < 4) return 0

    const intervals: number[] = []
    for (let i = 1; i < this.onsetTimes.length; i++) {
      const interval = this.onsetTimes[i] - this.onsetTimes[i - 1]
      if (interval > 0.1 && interval < 3.0) intervals.push(interval)
    }
    if (intervals.length < 3) return 0

    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const variance = intervals.reduce((sum, v) => sum + (v - mean) ** 2, 0) / intervals.length
    const cv = Math.sqrt(variance) / mean // coefficient of variation
    return Math.max(0, 1 - cv * 2)
  }

  reset(): void {
    this.onsetTimes = []
    this.currentBPM = 0
  }
}
