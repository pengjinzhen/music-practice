import { describe, it, expect, vi } from 'vitest'
import { generateSuggestionsFromScores } from '@/engines/SuggestionEngine'

// Mock Tone.js 以避免浏览器 API 依赖
vi.mock('tone', () => ({
  start: vi.fn(),
  now: vi.fn(() => 0),
  getTransport: vi.fn(() => ({
    bpm: { value: 120 },
    start: vi.fn(),
    stop: vi.fn(),
    cancel: vi.fn(),
    schedule: vi.fn(() => 0),
    pause: vi.fn(),
  })),
  Loop: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    dispose: vi.fn(),
  })),
  MembraneSynth: vi.fn().mockImplementation(() => ({
    toDestination: vi.fn().mockReturnThis(),
    triggerAttackRelease: vi.fn(),
    dispose: vi.fn(),
  })),
  Synth: vi.fn().mockImplementation(() => ({
    toDestination: vi.fn().mockReturnThis(),
    triggerAttackRelease: vi.fn(),
    dispose: vi.fn(),
  })),
  PolySynth: vi.fn().mockImplementation(() => ({
    toDestination: vi.fn().mockReturnThis(),
    triggerAttackRelease: vi.fn(),
    releaseAll: vi.fn(),
    dispose: vi.fn(),
    volume: { value: 0 },
  })),
}))

// 占位，后续通过编辑添加测试
import { MidiPlayer } from '@/engines/MidiPlayer'
import { MetronomeEngine } from '@/engines/MetronomeEngine'
import { ScoringEngine } from '@/engines/scoring/ScoringEngine'
import { TOLERANCE_LEVELS } from '@/types/scoring'

describe('MidiPlayer (mocked Tone.js)', () => {
  it('9.1 初始状态 isPlaying=false', () => {
    const player = new MidiPlayer()
    expect(player.isPlaying).toBe(false)
  })

  it('9.2 setPlaybackRate 限制在 0.25-1.5', () => {
    const player = new MidiPlayer()
    player.setPlaybackRate(0.1)
    expect(player.playbackRate).toBe(0.25)
    player.setPlaybackRate(2.0)
    expect(player.playbackRate).toBe(1.5)
    player.setPlaybackRate(0.8)
    expect(player.playbackRate).toBe(0.8)
  })

  it('9.3 未加载 MIDI 时 play 抛出错误', async () => {
    const player = new MidiPlayer()
    await expect(player.play()).rejects.toThrow('No MIDI loaded')
  })

  it('9.4 getMidi 初始返回 null', () => {
    const player = new MidiPlayer()
    expect(player.getMidi()).toBeNull()
  })
})

describe('MetronomeEngine (mocked Tone.js)', () => {
  it('9.5 初始 BPM 为 120', () => {
    const metro = new MetronomeEngine()
    expect(metro.getBPM()).toBe(120)
  })

  it('9.6 setBPM 限制在 20-300', () => {
    const metro = new MetronomeEngine()
    metro.setBPM(10)
    expect(metro.getBPM()).toBe(20)
    metro.setBPM(500)
    expect(metro.getBPM()).toBe(300)
    metro.setBPM(90)
    expect(metro.getBPM()).toBe(90)
  })

  it('9.7 初始 isPlaying=false', () => {
    const metro = new MetronomeEngine()
    expect(metro.isPlaying).toBe(false)
  })
})

describe('ScoringEngine', () => {
  const engine = new ScoringEngine()
  const tol = TOLERANCE_LEVELS.beginner

  it('9.8 空输入不崩溃', () => {
    const result = engine.score({
      measures: [], detectedNotes: [], targetBPM: 120,
      detectedBPMs: [], tolerance: tol, isPiano: true,
    })
    expect(result.totalScore).toBeGreaterThanOrEqual(0)
    expect(result.dimensions).toHaveLength(5)
  })

  it('9.9 完美输入得高分', () => {
    const measures = [{
      number: 1, startTime: 0, endTime: 2,
      notes: [
        { midiNumber: 60, startBeat: 0, durationBeats: 1, voice: 1, staff: 1 },
        { midiNumber: 62, startBeat: 1, durationBeats: 1, voice: 1, staff: 1 },
      ],
    }]
    const detected = [
      { frequency: 261.6, midiNumber: 60, noteName: 'C', octave: 4, cents: 0, confidence: 0.95, timestamp: 0 },
      { frequency: 293.7, midiNumber: 62, noteName: 'D', octave: 4, cents: 0, confidence: 0.95, timestamp: 0.5 },
    ]
    const result = engine.score({
      measures, detectedNotes: detected, targetBPM: 120,
      detectedBPMs: [120, 120, 120], tolerance: tol, isPiano: true,
    })
    expect(result.totalScore).toBeGreaterThan(50)
  })

  it('9.10 全部 missed 得低分', () => {
    const measures = [{
      number: 1, startTime: 0, endTime: 2,
      notes: [
        { midiNumber: 60, startBeat: 0, durationBeats: 1, voice: 1, staff: 1 },
        { midiNumber: 62, startBeat: 1, durationBeats: 1, voice: 1, staff: 1 },
      ],
    }]
    const result = engine.score({
      measures, detectedNotes: [], targetBPM: 120,
      detectedBPMs: [], tolerance: tol, isPiano: true,
    })
    expect(result.totalScore).toBeLessThan(50)
  })

  it('9.11 diagnostics 按严重度排序', () => {
    const measures = [{
      number: 1, startTime: 0, endTime: 2,
      notes: [{ midiNumber: 60, startBeat: 0, durationBeats: 1, voice: 1, staff: 1 }],
    }]
    const result = engine.score({
      measures, detectedNotes: [], targetBPM: 120,
      detectedBPMs: [], tolerance: tol, isPiano: true,
    })
    for (let i = 1; i < result.diagnostics.length; i++) {
      expect(result.diagnostics[i - 1].severityRank).toBeGreaterThanOrEqual(result.diagnostics[i].severityRank)
    }
  })
})

describe('SuggestionEngine', () => {
  it('9.12 低分维度生成建议', () => {
    const suggestions = generateSuggestionsFromScores({ speed: 5, rhythm: 8, intonation: 10, smoothness: 12, completeness: 15 })
    expect(suggestions.length).toBeGreaterThan(0)
    expect(suggestions.some(s => s.dimension === 'speed')).toBe(true)
  })

  it('9.13 高分维度不生成建议', () => {
    const suggestions = generateSuggestionsFromScores({ speed: 20, rhythm: 19, intonation: 18, smoothness: 20, completeness: 19 })
    expect(suggestions.length).toBe(0)
  })

  it('9.14 建议按优先级排序', () => {
    const suggestions = generateSuggestionsFromScores({ speed: 5, rhythm: 10, intonation: 3, smoothness: 15, completeness: 8 })
    for (let i = 1; i < suggestions.length; i++) {
      expect(suggestions[i - 1].priority).toBeGreaterThanOrEqual(suggestions[i].priority)
    }
  })
})
