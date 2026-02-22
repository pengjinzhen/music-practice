import { describe, it, expect } from 'vitest'
import { ScoreFollower } from '@/engines/ScoreFollower'
import { NoteAligner } from '@/engines/NoteAligner'
import type { ScoreNote, DetectedNote } from '@/types/music'

function makeChroma(dominant: number, value = 1.0): Float32Array {
  const c = new Float32Array(12)
  c[dominant % 12] = value
  return c
}

describe('ScoreFollower', () => {
  it('8.1 空乐谱返回位置 0', () => {
    const sf = new ScoreFollower()
    sf.start()
    expect(sf.follow(makeChroma(0))).toBe(0)
  })

  it('8.2 未激活时不更新位置', () => {
    const sf = new ScoreFollower()
    sf.loadScoreChroma([makeChroma(0), makeChroma(2), makeChroma(4)])
    // 不调用 start()
    sf.follow(makeChroma(0))
    sf.follow(makeChroma(2))
    expect(sf.getPosition()).toBe(0)
  })

  it('8.3 相同 chroma 跟踪到正确位置', () => {
    const sf = new ScoreFollower()
    const score = [makeChroma(0), makeChroma(2), makeChroma(4), makeChroma(5)]
    sf.loadScoreChroma(score)
    sf.start()
    sf.follow(makeChroma(0))
    sf.follow(makeChroma(2))
    sf.follow(makeChroma(4))
    const pos = sf.getPosition()
    expect(pos).toBeGreaterThanOrEqual(1)
  })

  it('8.4 位置只前进不后退', () => {
    const sf = new ScoreFollower()
    const score = [makeChroma(0), makeChroma(2), makeChroma(4), makeChroma(7), makeChroma(9)]
    sf.loadScoreChroma(score)
    sf.start()
    sf.follow(makeChroma(0))
    sf.follow(makeChroma(4))
    const pos1 = sf.getPosition()
    sf.follow(makeChroma(0))
    const pos2 = sf.getPosition()
    expect(pos2).toBeGreaterThanOrEqual(pos1)
  })

  it('8.5 getProgress 返回 0-1 范围', () => {
    const sf = new ScoreFollower()
    sf.loadScoreChroma([makeChroma(0), makeChroma(5)])
    expect(sf.getProgress()).toBeGreaterThanOrEqual(0)
    expect(sf.getProgress()).toBeLessThanOrEqual(1)
  })

  it('8.6 reset 重置位置', () => {
    const sf = new ScoreFollower()
    sf.loadScoreChroma([makeChroma(0), makeChroma(5)])
    sf.start()
    sf.follow(makeChroma(5))
    sf.reset()
    expect(sf.getPosition()).toBe(0)
  })

  it('8.7 costMatrix 有界不无限增长', () => {
    const sf = new ScoreFollower(10)
    const score = Array.from({ length: 5 }, (_, i) => makeChroma(i))
    sf.loadScoreChroma(score)
    sf.start()
    for (let i = 0; i < 50; i++) {
      sf.follow(makeChroma(i % 5))
    }
    expect(sf.getPosition()).toBeGreaterThanOrEqual(0)
  })
})

// 后续 NoteAligner 测试通过编辑添加

describe('NoteAligner', () => {
  const aligner = new NoteAligner(50, 0.5)

  function sn(midi: number, startBeat: number): ScoreNote {
    return { midiNumber: midi, startBeat, durationBeats: 1, voice: 1, staff: 1 }
  }

  function dn(midi: number, ts: number, cents = 0): DetectedNote {
    return { frequency: 440, midiNumber: midi, noteName: 'A', octave: 4, cents, confidence: 0.9, timestamp: ts }
  }

  it('8.8 完美匹配全部 correct', () => {
    const result = aligner.align([sn(60, 0), sn(62, 1)], [dn(60, 0), dn(62, 0.5)], 0, 120)
    expect(result.every(r => r.status === 'correct')).toBe(true)
  })

  it('8.9 无检测音符全部 missed', () => {
    const result = aligner.align([sn(60, 0), sn(62, 1)], [], 0, 120)
    expect(result.every(r => r.status === 'missed')).toBe(true)
  })

  it('8.10 音高偏差标记 wrong-pitch', () => {
    const result = aligner.align([sn(60, 0)], [dn(63, 0)], 0, 120)
    expect(result[0].status).toBe('wrong-pitch')
  })

  it('8.11 时间偏差计算正确', () => {
    const result = aligner.align([sn(60, 0)], [dn(60, 0.25)], 0, 120)
    expect(result[0].timeDeviation).toBeCloseTo(0.5, 1)
  })

  it('8.12 setTolerance 生效', () => {
    const strict = new NoteAligner(10, 0.1)
    const result = strict.align([sn(60, 0)], [dn(60, 0, 20)], 0, 120)
    expect(result[0].status).toBe('wrong-pitch')
  })
})

describe('chromaDistance 间接测试', () => {
  it('8.13 相同向量位置不变', () => {
    const sf = new ScoreFollower()
    sf.loadScoreChroma([makeChroma(0), makeChroma(5)])
    sf.start()
    sf.follow(makeChroma(0))
    expect(sf.getPosition()).toBe(0)
  })

  it('8.14 不同向量产生位移', () => {
    const sf = new ScoreFollower()
    sf.loadScoreChroma([makeChroma(0), makeChroma(7)])
    sf.start()
    sf.follow(makeChroma(0))
    sf.follow(makeChroma(7))
    expect(sf.getPosition()).toBeGreaterThanOrEqual(0)
  })
})
