import { getDB } from '../database'

export interface WeeklyGoalRecord {
  id: number
  user_id: string
  week_start: string
  target_days: number
  target_minutes: number
  actual_days: number
  actual_minutes: number
  created_at: string
}

function rowToObject<T>(columns: string[], values: unknown[]): T {
  return Object.fromEntries(columns.map((c, i) => [c, values[i]])) as T
}

function getWeekStart(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now.setDate(diff))
  return monday.toISOString().slice(0, 10)
}

export const WeeklyGoalRepository = {
  /** Get or create current week's goal */
  getCurrentWeek(): WeeklyGoalRecord {
    const db = getDB()
    const weekStart = getWeekStart()
    const result = db.exec('SELECT * FROM weekly_goals WHERE week_start = ?', [weekStart])
    if (result.length && result[0].values.length) {
      return rowToObject<WeeklyGoalRecord>(result[0].columns, result[0].values[0])
    }
    db.run(
      'INSERT INTO weekly_goals (week_start, target_days, target_minutes) VALUES (?, 5, 120)',
      [weekStart],
    )
    const created = db.exec('SELECT * FROM weekly_goals WHERE week_start = ?', [weekStart])
    return rowToObject<WeeklyGoalRecord>(created[0].columns, created[0].values[0])
  },

  /** Update target */
  updateTarget(weekStart: string, targetDays: number, targetMinutes: number): void {
    const db = getDB()
    db.run(
      'UPDATE weekly_goals SET target_days=?, target_minutes=? WHERE week_start=?',
      [targetDays, targetMinutes, weekStart],
    )
  },

  /** Recalculate actual progress from practice_sessions */
  recalculate(weekStart: string): void {
    const db = getDB()
    const weekEnd = new Date(new Date(weekStart).getTime() + 7 * 86400000).toISOString().slice(0, 10)
    const daysResult = db.exec(
      `SELECT COUNT(DISTINCT DATE(created_at)) FROM practice_sessions
       WHERE status='completed' AND DATE(created_at) >= ? AND DATE(created_at) < ?`,
      [weekStart, weekEnd],
    )
    const minsResult = db.exec(
      `SELECT COALESCE(SUM(duration_seconds),0)/60 FROM practice_sessions
       WHERE status='completed' AND DATE(created_at) >= ? AND DATE(created_at) < ?`,
      [weekStart, weekEnd],
    )
    const actualDays = daysResult.length ? Number(daysResult[0].values[0][0]) : 0
    const actualMinutes = minsResult.length ? Number(minsResult[0].values[0][0]) : 0
    db.run(
      'UPDATE weekly_goals SET actual_days=?, actual_minutes=? WHERE week_start=?',
      [actualDays, actualMinutes, weekStart],
    )
  },
}
