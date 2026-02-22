import { query, execute } from '../database'

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
  const monday = new Date(now.getFullYear(), now.getMonth(), diff)
  return monday.toISOString().slice(0, 10)
}

export const WeeklyGoalRepository = {
  getCurrentWeek(): WeeklyGoalRecord {
    const weekStart = getWeekStart()
    const result = query('SELECT * FROM weekly_goals WHERE week_start = ?', [weekStart])
    if (result && result.values.length) {
      return rowToObject<WeeklyGoalRecord>(result.columns, result.values[0])
    }
    execute(
      'INSERT INTO weekly_goals (week_start, target_days, target_minutes) VALUES (?, 5, 120)',
      [weekStart],
    )
    const created = query('SELECT * FROM weekly_goals WHERE week_start = ?', [weekStart])
    return rowToObject<WeeklyGoalRecord>(created!.columns, created!.values[0])
  },

  updateTarget(weekStart: string, targetDays: number, targetMinutes: number): void {
    execute(
      'UPDATE weekly_goals SET target_days=?, target_minutes=? WHERE week_start=?',
      [targetDays, targetMinutes, weekStart],
    )
  },

  recalculate(weekStart: string): void {
    const weekEnd = new Date(new Date(weekStart).getTime() + 7 * 86400000).toISOString().slice(0, 10)
    const daysResult = query(
      `SELECT COUNT(DISTINCT DATE(created_at)) FROM practice_sessions
       WHERE status='completed' AND DATE(created_at) >= ? AND DATE(created_at) < ?`,
      [weekStart, weekEnd],
    )
    const minsResult = query(
      `SELECT COALESCE(SUM(duration_seconds),0)/60 FROM practice_sessions
       WHERE status='completed' AND DATE(created_at) >= ? AND DATE(created_at) < ?`,
      [weekStart, weekEnd],
    )
    const actualDays = daysResult ? Number(daysResult.values[0][0]) : 0
    const actualMinutes = minsResult ? Number(minsResult.values[0][0]) : 0
    execute(
      'UPDATE weekly_goals SET actual_days=?, actual_minutes=? WHERE week_start=?',
      [actualDays, actualMinutes, weekStart],
    )
  },
}
