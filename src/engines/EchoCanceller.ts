/**
 * EchoCanceller — NLMS 自适应滤波器
 * 分离扬声器伴奏与麦克风乐器声
 */
export class EchoCanceller {
  private filterLength: number
  private weights: Float32Array
  private referenceBuffer: Float32Array
  private mu: number // step size
  private writeIndex: number = 0

  constructor(filterLength: number = 512, stepSize: number = 0.01) {
    this.filterLength = filterLength
    this.weights = new Float32Array(filterLength)
    this.referenceBuffer = new Float32Array(filterLength)
    this.mu = stepSize
  }

  /**
   * Process a single sample
   * @param micSample - microphone input (instrument + echo)
   * @param refSample - reference signal (accompaniment being played)
   * @returns cleaned sample (instrument only)
   */
  processSample(micSample: number, refSample: number): number {
    // Shift reference buffer
    this.referenceBuffer[this.writeIndex] = refSample
    this.writeIndex = (this.writeIndex + 1) % this.filterLength

    // Compute estimated echo
    let echoEstimate = 0
    for (let i = 0; i < this.filterLength; i++) {
      const idx = (this.writeIndex - 1 - i + this.filterLength) % this.filterLength
      echoEstimate += this.weights[i] * this.referenceBuffer[idx]
    }

    // Error = mic - estimated echo (this is the cleaned signal)
    const error = micSample - echoEstimate

    // NLMS weight update
    let refPower = 0
    for (let i = 0; i < this.filterLength; i++) {
      refPower += this.referenceBuffer[i] * this.referenceBuffer[i]
    }
    const normFactor = refPower > 1e-10 ? this.mu / (refPower + 1e-10) : 0

    for (let i = 0; i < this.filterLength; i++) {
      const idx = (this.writeIndex - 1 - i + this.filterLength) % this.filterLength
      this.weights[i] += normFactor * error * this.referenceBuffer[idx]
    }

    return error
  }

  /** Process a buffer of samples */
  processBuffer(micBuffer: Float32Array, refBuffer: Float32Array): Float32Array {
    const output = new Float32Array(micBuffer.length)
    const len = Math.min(micBuffer.length, refBuffer.length)
    for (let i = 0; i < len; i++) {
      output[i] = this.processSample(micBuffer[i], refBuffer[i])
    }
    return output
  }

  reset(): void {
    this.weights.fill(0)
    this.referenceBuffer.fill(0)
    this.writeIndex = 0
  }
}
