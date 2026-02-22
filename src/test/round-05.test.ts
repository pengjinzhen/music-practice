/**
 * 第5轮测试 — 成就系统测试
 * mock 数据库依赖，测试 AchievementEngine 的逻辑
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock 数据库模块
vi.mock('@/db/database', () => ({
  getDB: vi.fn(),
  query: vi.fn(),
  execute: vi.fn(),
}))

// Mock repositories
vi.mock('@/db/repositories/AchievementRepository', () => ({
  AchievementRepository: {
    getAll: vi.fn().mockReturnValue([]),
    unlock: vi.fn(),
  },
}))

vi.mock('@/db/repositories/PracticeRepository', () => ({
  PracticeRepository: {
    getTotalSessions: vi.fn().mockReturnValue(0),
    getRecent: vi.fn().mockReturnValue([]),
    getDistinctTrackCount: vi.fn().mockReturnValue(0),
    getTotalDuration: vi.fn().mockReturnValue(0),
    getDailyDurations: vi.fn().mockReturnValue([]),
  },
}))

import { AchievementEngine } from '@/engines/AchievementEngine'
import { AchievementRepository } from '@/db/repositories/AchievementRepository'
import { PracticeRepository } from '@/db/repositories/PracticeRepository'

const engine = new AchievementEngine()

describe('AchievementEngine', () => {
  beforeEach(() => {
    vi.mocked(AchievementRepository.getAll).mockReturnValue([])
    vi.mocked(AchievementRepository.unlock).mockClear()
    vi.mocked(PracticeRepository.getTotalSessions).mockReturnValue(0)
    vi.mocked(PracticeRepository.getRecent).mockReturnValue([])
    vi.mocked(PracticeRepository.getDistinctTrackCount).mockReturnValue(0)
    vi.mocked(PracticeRepository.getTotalDuration).mockReturnValue(0)
    vi.mocked(PracticeRepository.getDailyDurations).mockReturnValue([])
  })

  it('5.1 getDefinitions 返回所有成就定义', () => {
    const defs = engine.getDefinitions()
    expect(defs.length).toBeGreaterThanOrEqual(8)
  })

  it('5.2 成就定义包含必要字段', () => {
    const defs = engine.getDefinitions()
    for (const d of defs) {
      expect(d.id).toBeTruthy()
      expect(d.type).toBeTruthy()
      expect(d.title).toBeTruthy()
      expect(d.titleZh).toBeTruthy()
      expect(d.description).toBeTruthy()
      expect(d.descriptionZh).toBeTruthy()
      expect(typeof d.check).toBe('function')
    }
  })

  it('5.3 成就 ID 无重复', () => {
    const defs = engine.getDefinitions()
    const ids = defs.map((d) => d.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('AchievementEngine.checkAll', () => {
  beforeEach(() => {
    vi.mocked(AchievementRepository.getAll).mockReturnValue([])
    vi.mocked(AchievementRepository.unlock).mockClear()
    vi.mocked(PracticeRepository.getTotalSessions).mockReturnValue(0)
    vi.mocked(PracticeRepository.getRecent).mockReturnValue([])
    vi.mocked(PracticeRepository.getDistinctTrackCount).mockReturnValue(0)
    vi.mocked(PracticeRepository.getTotalDuration).mockReturnValue(0)
    vi.mocked(PracticeRepository.getDailyDurations).mockReturnValue([])
  })

  it('5.5 已解锁的成就不重复解锁', () => {
    vi.mocked(AchievementRepository.getAll).mockReturnValue([
      { id: 'first-practice', user_id: 'local-user', achievement_type: 'milestone', title: 'First Steps', description: '', unlocked_at: '2025-01-01' },
    ])
    vi.mocked(PracticeRepository.getTotalSessions).mockReturnValue(1)
    const result = engine.checkAll()
    // first-practice 已解锁，不应再出现
    expect(result.find((r) => r.id === 'first-practice')).toBeUndefined()
  })

  it('5.7 first-practice 成就：1次练习即解锁', () => {
    vi.mocked(PracticeRepository.getTotalSessions).mockReturnValue(1)
    const result = engine.checkAll()
    expect(result.find((r) => r.id === 'first-practice')).toBeDefined()
    expect(AchievementRepository.unlock).toHaveBeenCalled()
  })

  it('5.8 perfect-score 成就：满分100解锁', () => {
    vi.mocked(PracticeRepository.getRecent).mockReturnValue([
      { id: 's1', total_score: 100 } as never,
    ])
    const result = engine.checkAll()
    expect(result.find((r) => r.id === 'perfect-score')).toBeDefined()
  })

  it('5.9 tracks-5 成就：5首不同曲目解锁', () => {
    vi.mocked(PracticeRepository.getDistinctTrackCount).mockReturnValue(5)
    const result = engine.checkAll()
    expect(result.find((r) => r.id === 'tracks-5')).toBeDefined()
  })

  it('5.10 hours-10 成就：36000秒解锁', () => {
    vi.mocked(PracticeRepository.getTotalDuration).mockReturnValue(36000)
    const result = engine.checkAll()
    expect(result.find((r) => r.id === 'hours-10')).toBeDefined()
  })

  it('5.11 sessions-50 成就：50次练习解锁', () => {
    vi.mocked(PracticeRepository.getTotalSessions).mockReturnValue(50)
    const result = engine.checkAll()
    expect(result.find((r) => r.id === 'sessions-50')).toBeDefined()
  })

  it('5.12 成就类型合法', () => {
    const validTypes = new Set(['milestone', 'score', 'streak'])
    const defs = engine.getDefinitions()
    for (const d of defs) {
      expect(validTypes.has(d.type)).toBe(true)
    }
  })
})
