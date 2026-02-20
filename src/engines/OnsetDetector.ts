import type { Seconds } from '@/types/music'

export interface OnsetEvent {
  timestamp: Seconds
  energy: number
  type: 'onset'
}

export class OnsetDetector {
  private prevSpectrum: Float32Array | null = null
  private threshold: number
  private cooldownMs: number
  private lastOnsetTime: number = 0

  constructor(_sampleRate = 44100, threshold: number = 0.15, cooldownMs: number = 50) {
    void _sampleRate // reserved for future use
    this.threshold = threshold
    this.cooldownMs = cooldownMs
  }

  /** Detect onset from magnitude spectrum (spectral flux method) */
  detect(magnitudeSpectrum: Float32Array, timestamp: Seconds): OnsetEvent | null {
    if (!this.prevSpectrum) {
      this.prevSpectrum = new Float32Array(magnitudeSpectrum.length)
      this.prevSpectrum.set(magnitudeSpectrum)
      return null
    }

    // Half-wave rectified spectral flux
    let flux = 0
    for (let i = 0; i < magnitudeSpectrum.length; i++) {
      const diff = magnitudeSpectrum[i] - this.prevSpectrum[i]
      if (diff > 0) flux += diff
    }
    this.prevSpectrum.set(magnitudeSpectrum)

    // Normalize
    flux /= magnitudeSpectrum.length

    const timeSinceLastMs = (timestamp - this.lastOnsetTime) * 1000
    if (flux > this.threshold && timeSinceLastMs > this.cooldownMs) {
      this.lastOnsetTime = timestamp
      return { timestamp, energy: flux, type: 'onset' }
    }
    return null
  }

  /** Detect from AnalyserNode */
  detectFromAnalyser(analyser: AnalyserNode, timestamp: Seconds): OnsetEvent | null {
    const data = new Float32Array(analyser.frequencyBinCount)
    analyser.getFloatFrequencyData(data)
    // Convert dB to linear
    const magnitude = new Float32Array(data.length)
    for (let i = 0; i < data.length; i++) {
      magnitude[i] = Math.pow(10, data[i] / 20)
    }
    return this.detect(magnitude, timestamp)
  }

  /** Detect from energy envelope (simpler, for time-domain) */
  detectFromEnergy(buffer: Float32Array, timestamp: Seconds): OnsetEvent | null {
    let energy = 0
    for (let i = 0; i < buffer.length; i++) {
      energy += buffer[i] * buffer[i]
    }
    energy = Math.sqrt(energy / buffer.length)

    const timeSinceLastMs = (timestamp - this.lastOnsetTime) * 1000
    if (energy > this.threshold && timeSinceLastMs > this.cooldownMs) {
      this.lastOnsetTime = timestamp
      return { timestamp, energy, type: 'onset' }
    }
    return null
  }

  setThreshold(value: number): void {
    this.threshold = value
  }

  reset(): void {
    this.prevSpectrum = null
    this.lastOnsetTime = 0
  }
}
