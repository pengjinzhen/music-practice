/**
 * ScoreFollower — 基于在线 DTW 的实时乐谱跟随
 * 使用 chroma 特征进行音频与乐谱的对齐
 */
export class ScoreFollower {
  private scoreChroma: Float32Array[] = []
  private costMatrix: number[][] = []
  private currentPosition: number = 0
  private windowSize: number
  private isActive: boolean = false

  constructor(windowSize: number = 50) {
    this.windowSize = windowSize
  }

  /** Load score chroma features (pre-computed from MusicXML) */
  loadScoreChroma(chromaFrames: Float32Array[]): void {
    this.scoreChroma = chromaFrames
    this.reset()
  }

  /** Process a new audio chroma frame and return estimated score position */
  follow(audioChroma: Float32Array): number {
    if (this.scoreChroma.length === 0) return 0
    if (!this.isActive) return this.currentPosition

    // Online DTW: extend cost matrix with new audio frame
    const audioIdx = this.costMatrix.length
    const row: number[] = []

    const searchStart = Math.max(0, this.currentPosition - this.windowSize)
    const searchEnd = Math.min(this.scoreChroma.length - 1, this.currentPosition + this.windowSize)

    for (let j = 0; j < this.scoreChroma.length; j++) {
      if (j < searchStart || j > searchEnd) {
        row.push(Infinity)
        continue
      }
      const localCost = this.chromaDistance(audioChroma, this.scoreChroma[j])
      let prevMin = Infinity
      if (audioIdx > 0 && j > 0) {
        prevMin = Math.min(
          this.costMatrix[audioIdx - 1][j],
          this.costMatrix[audioIdx - 1][j - 1],
          row[j - 1] ?? Infinity,
        )
      } else if (audioIdx > 0) {
        prevMin = this.costMatrix[audioIdx - 1][j]
      } else if (j > 0) {
        prevMin = row[j - 1] ?? 0
      } else {
        prevMin = 0
      }
      row.push(localCost + prevMin)
    }

    this.costMatrix.push(row)

    // Keep matrix bounded
    if (this.costMatrix.length > this.windowSize * 3) {
      this.costMatrix.shift()
    }

    // Find minimum cost position in the last row within window
    let minCost = Infinity
    let bestPos = this.currentPosition
    for (let j = searchStart; j <= searchEnd; j++) {
      if (row[j] < minCost) {
        minCost = row[j]
        bestPos = j
      }
    }

    // Only advance forward (prevent jumping back)
    if (bestPos >= this.currentPosition) {
      this.currentPosition = bestPos
    }

    return this.currentPosition
  }

  private chromaDistance(a: Float32Array, b: Float32Array): number {
    let sum = 0
    for (let i = 0; i < 12; i++) {
      const diff = (a[i] || 0) - (b[i] || 0)
      sum += diff * diff
    }
    return Math.sqrt(sum)
  }

  start(): void {
    this.isActive = true
  }

  stop(): void {
    this.isActive = false
  }

  getPosition(): number {
    return this.currentPosition
  }

  getProgress(): number {
    if (this.scoreChroma.length === 0) return 0
    return this.currentPosition / (this.scoreChroma.length - 1)
  }

  reset(): void {
    this.costMatrix = []
    this.currentPosition = 0
  }
}
