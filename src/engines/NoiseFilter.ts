export class NoiseFilter {
  private noiseFloor: Float32Array | null = null
  private calibrated = false
  private gateThreshold = 0.01

  /** Calibrate noise floor from ambient recording (call with ~1s of silence) */
  calibrate(frequencyData: Float32Array): void {
    this.noiseFloor = new Float32Array(frequencyData.length)
    for (let i = 0; i < frequencyData.length; i++) {
      this.noiseFloor[i] = frequencyData[i]
    }
    this.calibrated = true
  }

  get isCalibrated(): boolean {
    return this.calibrated
  }

  /** Apply spectral subtraction to remove noise floor */
  filter(frequencyData: Float32Array): Float32Array {
    const output = new Float32Array(frequencyData.length)
    if (!this.noiseFloor) {
      output.set(frequencyData)
      return output
    }
    for (let i = 0; i < frequencyData.length; i++) {
      const cleaned = frequencyData[i] - this.noiseFloor[i] * 1.5
      output[i] = Math.max(0, cleaned)
    }
    return output
  }

  /** Simple noise gate: returns true if signal is above threshold */
  isAboveGate(rmsLevel: number): boolean {
    return rmsLevel > this.gateThreshold
  }

  setGateThreshold(threshold: number): void {
    this.gateThreshold = threshold
  }

  /** Auto gain control: normalize signal level */
  applyAGC(buffer: Float32Array, targetRMS: number = 0.1): Float32Array {
    let sum = 0
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i]
    }
    const rms = Math.sqrt(sum / buffer.length)
    if (rms < 0.001) return buffer

    const gain = Math.min(targetRMS / rms, 5.0)
    const output = new Float32Array(buffer.length)
    for (let i = 0; i < buffer.length; i++) {
      output[i] = Math.max(-1, Math.min(1, buffer[i] * gain))
    }
    return output
  }

  reset(): void {
    this.noiseFloor = null
    this.calibrated = false
  }
}
