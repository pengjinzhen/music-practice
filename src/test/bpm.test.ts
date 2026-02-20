import { describe, it, expect } from 'vitest'
import { BPMTracker } from '@/engines/BPMTracker'

describe('BPMTracker', () => {
  it('5.1 稳定120BPM', () => {
    const tracker = new BPMTracker()
    // 120 BPM = 0.5s per beat
    for (let i = 0; i < 10; i++) {
      tracker.addOnset(i * 0.5)
    }
    const bpm = tracker.getBPM()
    expect(bpm).toBeGreaterThan(115)
    expect(bpm).toBeLessThan(125)
  })

  it('5.2 不足3个onset返回0', () => {
    const tracker = new BPMTracker()
    tracker.addOnset(0)
    tracker.addOnset(0.5)
    expect(tracker.getBPM()).toBe(0)
  })

  it('5.3 稳定性计算', () => {
    const tracker = new BPMTracker()
    for (let i = 0; i < 10; i++) {
      tracker.addOnset(i * 0.5)
    }
    const stability = tracker.getStability()
    expect(stability).toBeGreaterThan(0.8)
    expect(stability).toBeLessThanOrEqual(1)
  })

  it('5.4 reset清空', () => {
    const tracker = new BPMTracker()
    for (let i = 0; i < 10; i++) {
      tracker.addOnset(i * 0.5)
    }
    expect(tracker.getBPM()).toBeGreaterThan(0)
    tracker.reset()
    expect(tracker.getBPM()).toBe(0)
  })
})
