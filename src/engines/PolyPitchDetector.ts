import type { DetectedNote, Frequency, MidiNumber } from '@/types/music'
import { midiToNoteName, centsFromNearest } from '@/utils/music'

export interface PolyPitchResult {
  notes: { midiNumber: MidiNumber; confidence: number; frequency: Frequency }[]
  timestamp: number
}

/**
 * PolyPitchDetector — 基于频谱峰值的多音检测
 * 用于钢琴多声部识别
 * 注：如需更高精度可后续集成 @spotify/basic-pitch-ts
 */
export class PolyPitchDetector {
  private sampleRate: number
  private fftSize: number
  private minConfidence: number

  constructor(sampleRate: number = 44100, fftSize: number = 8192) {
    this.sampleRate = sampleRate
    this.fftSize = fftSize
    this.minConfidence = 0.3
  }

  /** Detect multiple pitches from frequency magnitude data */
  detect(magnitudeData: Float32Array, timestamp: number): PolyPitchResult {
    const peaks = this.findPeaks(magnitudeData)
    const notes = this.peaksToNotes(peaks)
    return { notes, timestamp }
  }

  /** Detect from AnalyserNode */
  detectFromAnalyser(analyser: AnalyserNode, timestamp: number): PolyPitchResult {
    const data = new Float32Array(analyser.frequencyBinCount)
    analyser.getFloatFrequencyData(data)
    // Convert dB to linear
    const magnitude = new Float32Array(data.length)
    for (let i = 0; i < data.length; i++) {
      magnitude[i] = Math.pow(10, data[i] / 20)
    }
    return this.detect(magnitude, timestamp)
  }

  private findPeaks(magnitude: Float32Array): { bin: number; value: number }[] {
    const peaks: { bin: number; value: number }[] = []
    const binWidth = this.sampleRate / this.fftSize
    const minBin = Math.ceil(27.5 / binWidth)
    const maxBin = Math.min(Math.floor(4200 / binWidth), magnitude.length - 1)

    // Find local maxima
    for (let i = minBin + 1; i < maxBin; i++) {
      if (magnitude[i] > magnitude[i - 1] && magnitude[i] > magnitude[i + 1]) {
        peaks.push({ bin: i, value: magnitude[i] })
      }
    }

    // Sort by magnitude and take top peaks
    peaks.sort((a, b) => b.value - a.value)
    return peaks.slice(0, 10)
  }

  private peaksToNotes(peaks: { bin: number; value: number }[]) {
    if (peaks.length === 0) return []
    const maxVal = peaks[0].value
    const binWidth = this.sampleRate / this.fftSize
    const notes: { midiNumber: MidiNumber; confidence: number; frequency: Frequency }[] = []
    const usedMidi = new Set<number>()

    for (const peak of peaks) {
      const confidence = peak.value / maxVal
      if (confidence < this.minConfidence) break

      const freq = peak.bin * binWidth
      const midi = Math.round(69 + 12 * Math.log2(freq / 440))
      if (midi < 21 || midi > 108) continue
      if (usedMidi.has(midi)) continue

      usedMidi.add(midi)
      notes.push({ midiNumber: midi, confidence, frequency: freq })
    }

    return notes.sort((a, b) => a.midiNumber - b.midiNumber)
  }

  toDetectedNotes(result: PolyPitchResult): DetectedNote[] {
    return result.notes.map((n) => ({
      frequency: n.frequency,
      midiNumber: n.midiNumber,
      noteName: midiToNoteName(n.midiNumber).replace(/\d+$/, ''),
      octave: Math.floor(n.midiNumber / 12) - 1,
      cents: centsFromNearest(n.frequency),
      confidence: n.confidence,
      timestamp: result.timestamp,
    }))
  }

  setMinConfidence(value: number): void {
    this.minConfidence = value
  }
}
