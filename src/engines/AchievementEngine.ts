import { AchievementRepository } from '@/db/repositories/AchievementRepository'
import { PracticeRepository } from '@/db/repositories/PracticeRepository'

interface AchievementDef {
  id: string
  type: string
  title: string
  titleZh: string
  description: string
  descriptionZh: string
  check: () => boolean
}

const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-practice', type: 'milestone', title: 'First Steps', titleZh: '初次练习',
    description: 'Complete your first practice session', descriptionZh: '完成第一次练习',
    check: () => PracticeRepository.getTotalSessions() >= 1,
  },
  {
    id: 'perfect-score', type: 'score', title: 'Perfect Performance', titleZh: '完美演奏',
    description: 'Score 100 on any piece', descriptionZh: '任意曲目获得满分',
    check: () => {
      const sessions = PracticeRepository.getRecent(100)
      return sessions.some((s) => s.total_score != null && s.total_score >= 100)
    },
  },
  {
    id: 'streak-7', type: 'streak', title: 'Week Warrior', titleZh: '一周坚持',
    description: 'Practice 7 days in a row', descriptionZh: '连续练习7天',
    check: () => checkStreak(7),
  },
  {
    id: 'streak-30', type: 'streak', title: 'Monthly Master', titleZh: '月度大师',
    description: 'Practice 30 days in a row', descriptionZh: '连续练习30天',
    check: () => checkStreak(30),
  },
  {
    id: 'tracks-5', type: 'milestone', title: 'Explorer', titleZh: '探索者',
    description: 'Practice 5 different tracks', descriptionZh: '练习5首不同曲目',
    check: () => PracticeRepository.getDistinctTrackCount() >= 5,
  },
  {
    id: 'tracks-20', type: 'milestone', title: 'Repertoire Builder', titleZh: '曲库达人',
    description: 'Practice 20 different tracks', descriptionZh: '练习20首不同曲目',
    check: () => PracticeRepository.getDistinctTrackCount() >= 20,
  },
  {
    id: 'sessions-50', type: 'milestone', title: 'Dedicated', titleZh: '勤奋练习',
    description: 'Complete 50 practice sessions', descriptionZh: '完成50次练习',
    check: () => PracticeRepository.getTotalSessions() >= 50,
  },
  {
    id: 'hours-10', type: 'milestone', title: 'Ten Hour Club', titleZh: '十小时俱乐部',
    description: 'Practice for 10 hours total', descriptionZh: '累计练习10小时',
    check: () => PracticeRepository.getTotalDuration() >= 36000,
  },
]

function checkStreak(days: number): boolean {
  const dailyData = PracticeRepository.getDailyDurations(days + 5)
  if (dailyData.length < days) return false
  const dates = new Set(dailyData.map((d) => d.date))
  let streak = 0
  const today = new Date()
  for (let i = 0; i < days + 5; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    if (dates.has(key)) {
      streak++
      if (streak >= days) return true
    } else {
      streak = 0
    }
  }
  return false
}

export class AchievementEngine {
  /** Check all achievements and unlock new ones. Returns newly unlocked. */
  checkAll(): AchievementDef[] {
    const existing = new Set(AchievementRepository.getAll().map((a) => a.id))
    const newlyUnlocked: AchievementDef[] = []

    for (const def of ACHIEVEMENTS) {
      if (existing.has(def.id)) continue
      if (def.check()) {
        AchievementRepository.unlock({
          id: def.id, user_id: 'local-user',
          achievement_type: def.type, title: def.title, description: def.description,
        })
        newlyUnlocked.push(def)
      }
    }
    return newlyUnlocked
  }

  getDefinitions(): AchievementDef[] {
    return ACHIEVEMENTS
  }
}
