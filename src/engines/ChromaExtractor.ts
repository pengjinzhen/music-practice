/**
 * ChromaExtractor — 基于 Web Audio API FFT 的 chroma 特征提取
 * 用于乐谱跟随的 DTW 算法输入
 * 注：如需更高精度可后续替换为 Essentia.js WASM
 */
export class ChromaExtractor {
  private sampleRate: number
  private fftSize: number

  constructor(sampleRate: number = 44100, fftSize: number = 4096) {
    this.sampleRate = sampleRate
    this.fftSize = fftSize
  }

  /** Extract 12-bin chroma vector from frequency magnitude spectrum */
  extract(magnitudeSpectrum: Float32Array): Float32Array {
    const chroma = new Float32Array(12)
    const binFreqWidth = this.sampleRate / this.fftSize

    for (let bin = 1; bin < magnitudeSpectrum.length; bin++) {
      const freq = bin * binFreqWidth
      if (freq < 27.5 || freq > 4200) continue

      const midi = 69 + 12 * Math.log2(freq / 440)
      const pitchClass = ((Math.round(midi) % 12) + 12) % 12
      chroma[pitchClass] += magnitudeSpectrum[bin]
    }

    // Normalize
    let max = 0
    for (let i = 0; i < 12; i++) {
      if (chroma[i] > max) max = chroma[i]
    }
    if (max > 0) {
      for (let i = 0; i < 12; i++) {
        chroma[i] /= max
      }
    }
    return chroma
  }

  /** Extract chroma from raw time-domain audio buffer using FFT */
  extractFromBuffer(buffer: Float32Array): Float32Array {
    // Apply Hann window
    const windowed = new Float32Array(this.fftSize)
    const len = Math.min(buffer.length, this.fftSize)
    for (let i = 0; i < len; i++) {
      const w = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (len - 1)))
      windowed[i] = buffer[i] * w
    }

    // Simple DFT magnitude (for real-time, AnalyserNode FFT is preferred)
    const magnitude = new Float32Array(this.fftSize / 2)
    for (let k = 0; k < this.fftSize / 2; k++) {
      let re = 0
      let im = 0
      for (let n = 0; n < this.fftSize; n++) {
        const angle = (2 * Math.PI * k * n) / this.fftSize
        re += windowed[n] * Math.cos(angle)
        im -= windowed[n] * Math.sin(angle)
      }
      magnitude[k] = Math.sqrt(re * re + im * im)
    }

    return this.extract(magnitude)
  }

  /** Extract chroma from AnalyserNode (preferred for real-time) */
  extractFromAnalyser(analyser: AnalyserNode): Float32Array {
    const data = new Float32Array(analyser.frequencyBinCount)
    analyser.getFloatFrequencyData(data)
    // Convert dB to linear magnitude
    const magnitude = new Float32Array(data.length)
    for (let i = 0; i < data.length; i++) {
      magnitude[i] = Math.pow(10, data[i] / 20)
    }
    return this.extract(magnitude)
  }
}
