import { describe, it, expect } from 'vitest'
import { SpeedScorer } from '@/engines/scoring/SpeedScorer'
import { RhythmScorer } from '@/engines/scoring/RhythmScorer'
import { IntonationScorer } from '@/engines/scoring/IntonationScorer'
import { SmoothnessScorer } from '@/engines/scoring/SmoothnessScorer'
import { CompletenessScorer } from '@/engines/scoring/CompletenessScorer'
import { TOLERANCE_LEVELS } from '@/types/scoring'

const beginner = TOLERANCE_LEVELS.beginner

describe('SpeedScorer', () => {
  const scorer = new SpeedScorer()

  it('2.1 完美速度得满分', () => {
    const result = scorer.score({
      targetBPM: 120,
      detectedBPMs: [120, 120, 120, 120, 120],
      tolerance: beginner,
    })
    expect(result.score).toBe(20)
  })

  it('2.2 无数据得0分', () => {
    const result = scorer.score({
      targetBPM: 120,
      detectedBPMs: [],
      tolerance: beginner,
    })
    expect(result.score).toBe(0)
  })

  it('2.3 偏差较大扣分', () => {
    const result = scorer.score({
      targetBPM: 120,
      detectedBPMs: [150, 155, 148, 152, 149],
      tolerance: beginner,
    })
    expect(result.score).toBeLessThan(20)
    expect(result.score).toBeGreaterThanOrEqual(0)
  })
})

describe('RhythmScorer', () => {
  const scorer = new RhythmScorer()

  it('2.4 完美节奏得满分', () => {
    const result = scorer.score({
      timeDeviations: [0, 0, 0, 0, 0],
      tolerance: beginner,
    })
    expect(result.score).toBe(20)
  })

  it('2.5 无数据得0分', () => {
    const result = scorer.score({
      timeDeviations: [],
      tolerance: beginner,
    })
    expect(result.score).toBe(0)
  })

  it('2.6 部分偏差扣分', () => {
    const result = scorer.score({
      timeDeviations: [0, 0.1, 0.5, 0, 0.8],
      tolerance: beginner,
    })
    expect(result.score).toBeLessThan(20)
    expect(result.score).toBeGreaterThanOrEqual(0)
  })
})

describe('IntonationScorer', () => {
  const scorer = new IntonationScorer()

  it('2.7 钢琴全对满分', () => {
    const notes = Array(10).fill({ correct: true })
    const result = scorer.score({
      noteResults: notes,
      isPiano: true,
      tolerance: beginner,
    })
    expect(result.score).toBe(20)
  })

  it('2.8 钢琴无数据0分', () => {
    const result = scorer.score({
      noteResults: [],
      isPiano: true,
      tolerance: beginner,
    })
    expect(result.score).toBe(0)
  })

  it('2.9 大提琴精准满分', () => {
    const notes = Array(10).fill({ deviationCents: 0 })
    const result = scorer.score({
      noteResults: notes,
      isPiano: false,
      tolerance: beginner,
    })
    expect(result.score).toBe(20)
  })

  it('2.10 大提琴偏差扣分', () => {
    const notes = Array(10).fill({ deviationCents: 40 })
    const result = scorer.score({
      noteResults: notes,
      isPiano: false,
      tolerance: beginner,
    })
    expect(result.score).toBeLessThan(20)
    expect(result.score).toBeGreaterThanOrEqual(0)
  })
})

describe('SmoothnessScorer', () => {
  const scorer = new SmoothnessScorer()

  it('2.11 流畅演奏满分', () => {
    const timestamps = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0]
    const result = scorer.score({
      onsetTimestamps: timestamps,
      expectedDurations: timestamps.map(() => 0.5),
      totalDuration: 4.0,
    })
    expect(result.score).toBe(20)
  })

  it('2.12 少于2音符得20分', () => {
    const result = scorer.score({
      onsetTimestamps: [0],
      expectedDurations: [1],
      totalDuration: 1,
    })
    expect(result.score).toBe(20)
  })

  it('2.13 有停顿扣分', () => {
    // 均匀0.5s间隔中插入5s长停顿
    const timestamps = [0, 0.5, 1.0, 1.5, 6.5, 7.0, 7.5, 8.0]
    const result = scorer.score({
      onsetTimestamps: timestamps,
      expectedDurations: timestamps.map(() => 0.5),
      totalDuration: 8.0,
    })
    expect(result.score).toBeLessThan(20)
  })
})

describe('CompletenessScorer', () => {
  const scorer = new CompletenessScorer()

  it('2.14 全部演奏满分', () => {
    const result = scorer.score({
      totalScoreNotes: 50,
      detectedNotes: 50,
      skippedMeasures: [],
      totalMeasures: 16,
    })
    expect(result.score).toBe(20)
  })

  it('2.15 空乐谱满分', () => {
    const result = scorer.score({
      totalScoreNotes: 0,
      detectedNotes: 0,
      skippedMeasures: [],
      totalMeasures: 0,
    })
    expect(result.score).toBe(20)
  })

  it('2.16 部分缺失扣分', () => {
    const result = scorer.score({
      totalScoreNotes: 50,
      detectedNotes: 25,
      skippedMeasures: [5, 6, 7, 8],
      totalMeasures: 16,
    })
    expect(result.score).toBeLessThan(20)
    expect(result.score).toBeGreaterThanOrEqual(0)
  })
})
