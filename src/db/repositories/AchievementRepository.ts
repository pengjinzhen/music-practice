import { query, execute } from '../database'

export interface AchievementRecord {
  id: string
  user_id: string
  achievement_type: string
  title: string
  description: string | null
  unlocked_at: string
}

export interface WeeklyGoalRecord {
  id: number
  user_id: string
  week_start: string
  target_days: number
  target_minutes: number
  actual_days: number
  actual_minutes: number
}

function rowToObject<T>(columns: string[], values: unknown[]): T {
  return Object.fromEntries(columns.map((c, i) => [c, values[i]])) as T
}

export const AchievementRepository = {
  getAll(): AchievementRecord[] {
    const result = query("SELECT * FROM achievements WHERE user_id = 'local-user' ORDER BY unlocked_at DESC")
    if (!result) return []
    return result.values.map((v) => rowToObject<AchievementRecord>(result.columns, v))
  },

  unlock(achievement: Omit<AchievementRecord, 'unlocked_at'>): void {
    execute(
      'INSERT OR IGNORE INTO achievements (id, user_id, achievement_type, title, description) VALUES (?, ?, ?, ?, ?)',
      [achievement.id, achievement.user_id, achievement.achievement_type, achievement.title, achievement.description],
    )
  },

  getCurrentWeekGoal(): WeeklyGoalRecord | null {
    const result = query(
      "SELECT * FROM weekly_goals WHERE user_id = 'local-user' ORDER BY week_start DESC LIMIT 1",
    )
    if (!result || !result.values.length) return null
    return rowToObject<WeeklyGoalRecord>(result.columns, result.values[0])
  },

  upsertWeeklyGoal(goal: Omit<WeeklyGoalRecord, 'id'>): void {
    execute(
      `INSERT INTO weekly_goals (user_id, week_start, target_days, target_minutes, actual_days, actual_minutes)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET target_days=?, target_minutes=?, actual_days=?, actual_minutes=?`,
      [goal.user_id, goal.week_start, goal.target_days, goal.target_minutes, goal.actual_days, goal.actual_minutes, goal.target_days, goal.target_minutes, goal.actual_days, goal.actual_minutes],
    )
  },
}
