import { describe, it, expect } from 'vitest'
import { OnsetDetector } from '@/engines/OnsetDetector'

describe('OnsetDetector', () => {
  it('6.1 首帧无检测', () => {
    const detector = new OnsetDetector(44100, 0.15, 50)
    const spectrum = new Float32Array(128).fill(0.5)
    const result = detector.detect(spectrum, 0)
    expect(result).toBeNull()
  })

  it('6.2 突变检测onset', () => {
    const detector = new OnsetDetector(44100, 0.01, 50)
    // 第一帧：静音
    const silent = new Float32Array(128).fill(0)
    detector.detect(silent, 0)
    // 第二帧：突然大音量
    const loud = new Float32Array(128).fill(1.0)
    const result = detector.detect(loud, 0.1)
    expect(result).not.toBeNull()
    expect(result!.type).toBe('onset')
  })

  it('6.3 冷却期抑制', () => {
    const detector = new OnsetDetector(44100, 0.01, 200)
    const silent = new Float32Array(128).fill(0)
    const loud = new Float32Array(128).fill(1.0)
    detector.detect(silent, 0)
    detector.detect(loud, 0.1) // 第一次onset
    // 冷却期200ms内再次突变，应被抑制
    detector.detect(silent, 0.15)
    const result = detector.detect(loud, 0.2) // 仅过了100ms
    expect(result).toBeNull()
  })

  it('6.4 能量包络检测', () => {
    const detector = new OnsetDetector(44100, 0.01, 50)
    // 高能量buffer
    const buffer = new Float32Array(1024).fill(0.5)
    const result = detector.detectFromEnergy(buffer, 1.0)
    expect(result).not.toBeNull()
    expect(result!.type).toBe('onset')
  })
})
