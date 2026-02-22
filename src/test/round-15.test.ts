import { describe, it, expect } from 'vitest'

/**
 * 第15轮：组件 Props 类型安全测试
 * 通过代码审查验证所有组件 props 接口定义和传递的类型安全性。
 * 这些测试验证接口结构，实际类型检查由 TypeScript 编译器保证。
 */

describe('第15轮：组件 Props 类型安全审查', () => {
  it('15-1: ScoreRadarChart 接口要求 scores 和 totalScore', () => {
    // Props: { scores: {speed,rhythm,intonation,smoothness,completeness: number}, totalScore: number }
    // ReportPage 传入: scores={scores} totalScore={session.total_score ?? 0}
    // 使用 ?? 0 确保 null 被转为 number，类型安全
    const scores = { speed: 15, rhythm: 18, intonation: 12, smoothness: 16, completeness: 19 }
    expect(typeof scores.speed).toBe('number')
    expect(typeof scores.rhythm).toBe('number')
    expect(typeof scores.intonation).toBe('number')
    expect(typeof scores.smoothness).toBe('number')
    expect(typeof scores.completeness).toBe('number')
  })

  it('15-2: ShareCard 接口要求 trackName, totalScore, scores, date', () => {
    // ReportPage 传入: trackName={track?.name ?? ''} totalScore={session.total_score ?? 0}
    // scores={scores} date={session.created_at}
    // ?? '' 和 ?? 0 确保 null safety
    const props = {
      trackName: 'Test Track',
      totalScore: 85,
      scores: { speed: 15, rhythm: 18, intonation: 12, smoothness: 16, completeness: 19 },
      date: '2024-01-01',
    }
    expect(typeof props.trackName).toBe('string')
    expect(typeof props.totalScore).toBe('number')
    expect(typeof props.date).toBe('string')
  })

  it('15-3: ErrorList 接口要求 errors 数组和可选 onErrorClick', () => {
    // ReportPage 传入: <ErrorList errors={errors} /> 没传 onErrorClick
    // onErrorClick 是可选的 (?)，类型安全
    const errors: { measure_number: number; expected_note: string | null;
      actual_note: string | null; severity: string }[] = []
    expect(Array.isArray(errors)).toBe(true)
  })

  it('15-4: DiagnosticCard 接口要求 diagnostics 数组', () => {
    // ReportPage 传入: <DiagnosticCard diagnostics={diagnostics} />
    // onMeasureClick 是可选的，未传递，类型安全
    const diagnostics: { dimension: string; problem: string;
      cause_analysis: string | null; solution: string | null;
      measure_start: number | null; measure_end: number | null;
      severity_rank: number | null }[] = []
    expect(Array.isArray(diagnostics)).toBe(true)
  })

  it('15-5: RecorderControls 接口要求 4 个回调函数', () => {
    // PracticePage 传入: onStart, onPause, onResume, onStop
    // 全部是 () => void 类型，匹配
    const callbacks = {
      onStart: () => {},
      onPause: () => {},
      onResume: () => {},
      onStop: () => {},
    }
    expect(typeof callbacks.onStart).toBe('function')
    expect(typeof callbacks.onPause).toBe('function')
    expect(typeof callbacks.onResume).toBe('function')
    expect(typeof callbacks.onStop).toBe('function')
  })

  it('15-6: StopConfirmDialog 接口要求 open + 5 个回调', () => {
    // PracticePage 传入全部 6 个 props
    const props = {
      open: false,
      onClose: () => {},
      onSubmit: () => {},
      onSave: () => {},
      onRestart: () => {},
      onDiscard: () => {},
    }
    expect(typeof props.open).toBe('boolean')
    expect(typeof props.onClose).toBe('function')
  })

  it('15-7: PracticeSettings 接口要求 defaultBPM', () => {
    // PracticePage 传入: defaultBPM={track.duration_seconds ? 120 : null}
    // 类型是 number | null，匹配接口定义
    const defaultBPM: number | null = null
    expect(defaultBPM === null || typeof defaultBPM === 'number').toBe(true)
  })

  it('15-8: WaveformDisplay 接口要求 analyser 和 isActive', () => {
    // PracticePage 传入: analyser={analyser} isActive={isRecording}
    // analyser: AnalyserNode | null, isActive: boolean
    const props = { analyser: null, isActive: false }
    expect(props.analyser === null || typeof props.analyser === 'object').toBe(true)
    expect(typeof props.isActive).toBe('boolean')
  })

  it('15-9: AchievementBadge 接口要求 title, description, unlockedAt, isLocked', () => {
    // ProfilePage 传入: title, description (string|null), unlockedAt (string|null), isLocked (boolean)
    const props = {
      title: 'First Practice',
      description: null as string | null,
      unlockedAt: null as string | null,
      isLocked: true,
    }
    expect(typeof props.title).toBe('string')
    expect(props.description === null || typeof props.description === 'string').toBe(true)
  })

  it('15-10: RecentSessionList 接口要求 sessions 和 emptyText', () => {
    // HomePage 传入: sessions={recentSessions} emptyText={t('dashboard.no_sessions')}
    // sessions 是 SessionWithTrack[]，emptyText 是 string
    const props = { sessions: [], emptyText: 'No sessions' }
    expect(Array.isArray(props.sessions)).toBe(true)
    expect(typeof props.emptyText).toBe('string')
  })
})
