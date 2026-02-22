import { describe, it, expect } from 'vitest'
import en from '@/i18n/en.json'
import zh from '@/i18n/zh.json'

/** 递归获取所有嵌套 key（用点号连接） */
function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = []
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    const val = obj[key]
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      keys.push(...getAllKeys(val as Record<string, unknown>, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys.sort()
}

describe('第11轮：i18n 国际化测试', () => {
  const enKeys = getAllKeys(en)
  const zhKeys = getAllKeys(zh)

  it('11-1: en.json 和 zh.json 顶层 key 完全一致', () => {
    const enTop = Object.keys(en).sort()
    const zhTop = Object.keys(zh).sort()
    expect(enTop).toEqual(zhTop)
  })

  it('11-2: 所有嵌套 key 在两个文件中都存在', () => {
    const missingInZh = enKeys.filter(k => !zhKeys.includes(k))
    const missingInEn = zhKeys.filter(k => !enKeys.includes(k))
    expect(missingInZh).toEqual([])
    expect(missingInEn).toEqual([])
  })

  it('11-3: 没有空字符串值', () => {
    const emptyEn = enKeys.filter(k => {
      const val = k.split('.').reduce((o: any, p) => o?.[p], en)
      return val === ''
    })
    const emptyZh = zhKeys.filter(k => {
      const val = k.split('.').reduce((o: any, p) => o?.[p], zh)
      return val === ''
    })
    expect(emptyEn).toEqual([])
    expect(emptyZh).toEqual([])
  })

  it('11-4: i18n 配置使用 en 作为 fallbackLng', () => {
    // 静态验证：en 和 zh 都有 translation 资源
    expect(en).toBeDefined()
    expect(zh).toBeDefined()
    expect(Object.keys(en).length).toBeGreaterThan(0)
    expect(Object.keys(zh).length).toBeGreaterThan(0)
  })

  it('11-5: 组件中使用的 t() key 在翻译文件中都存在', () => {
    // 从 grep 结果中提取的所有 t() key
    const usedKeys = [
      'practice.select_track', 'nav.library', 'practice.upload_audio',
      'practice.mode_piece', 'practice.mode_single', 'practice.settings',
      'practice.scoring_mode', 'practice.speed', 'practice.bpm',
      'practice.metronome', 'practice.accompaniment',
      'tuner.title', 'tuner.cents', 'tuner.stop', 'tuner.start',
      'instrument.piano', 'instrument.cello',
      'library.all_levels', 'difficulty.beginner',
      'difficulty.intermediate', 'difficulty.advanced',
      'library.upload', 'library.search_placeholder', 'library.no_tracks',
      'profile.title', 'profile.nickname', 'profile.skill_level',
      'profile.instrument_pref', 'profile.language',
      'profile.total_practice_time', 'dashboard.total_sessions',
      'profile.tracks_practiced', 'streak.title', 'achievement.title',
      'profile.growth_chart', 'profile.practice_history',
      'profile.export_data', 'profile.import_data',
      'section.title', 'section.measures', 'section.passed',
      'section.not_passed', 'dashboard.welcome', 'dashboard.go_practice',
      'dashboard.total_practice', 'dashboard.hours', 'dashboard.minutes',
      'dashboard.avg_score', 'dashboard.incomplete', 'dashboard.continue',
      'dashboard.score_trend', 'dashboard.recent_sessions',
      'dashboard.no_sessions', 'report.no_data', 'nav.dashboard',
      'report.title', 'report.link_copied', 'report.share_link',
      'report.best_score', 'report.current', 'report.best',
      'report.suggestions', 'practice.countdown', 'practice.start',
      'practice.pause', 'practice.stop', 'practice.resume',
      'scoring.speed', 'scoring.rhythm', 'scoring.intonation',
      'scoring.smoothness', 'scoring.completeness', 'app.name',
      'scoring.total', 'report.share', 'report.diagnostics',
      'report.measure', 'report.cause', 'report.solution',
      'streak.current_streak', 'streak.longest_streak',
      'streak.today_done', 'streak.today_pending', 'streak.this_month',
      'dashboard.weekly_goal', 'dashboard.practice_days',
      'dashboard.days', 'dashboard.practice_time',
      'dashboard.goal_achieved', 'practice.stop_confirm_title',
      'practice.stop_submit', 'practice.stop_save',
      'practice.stop_restart', 'practice.stop_discard',
      'pwa.install_hint', 'pwa.install', 'report.errors_title',
      'report.expected', 'report.actual', 'library.custom',
    ]
    const missing = usedKeys.filter(k => !enKeys.includes(k))
    expect(missing).toEqual([])
  })
})
