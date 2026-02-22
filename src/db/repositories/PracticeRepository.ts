import { query, execute } from '../database'

export interface PracticeSessionRecord {
  id: string
  user_id: string
  track_id: string
  scoring_mode: string
  status: string
  duration_seconds: number | null
  target_bpm: number | null
  actual_bpm: number | null
  total_score: number | null
  speed_score: number | null
  rhythm_score: number | null
  intonation_score: number | null
  smoothness_score: number | null
  completeness_score: number | null
  audio_blob_key: string | null
  video_blob_key: string | null
  resume_position: number | null
  created_at: string
}

export interface PracticeErrorRecord {
  id: number
  session_id: string
  measure_number: number
  beat_position: number | null
  error_type: string
  expected_note: string | null
  actual_note: string | null
  deviation_cents: number | null
  deviation_ms: number | null
  severity: string
  hand: string | null
}

function rowToObject<T>(columns: string[], values: unknown[]): T {
  return Object.fromEntries(columns.map((c, i) => [c, values[i]])) as T
}

export const PracticeRepository = {
  create(session: Omit<PracticeSessionRecord, 'created_at'>): void {
    execute(
      `INSERT INTO practice_sessions (id, user_id, track_id, scoring_mode, status, duration_seconds, target_bpm, actual_bpm, total_score, speed_score, rhythm_score, intonation_score, smoothness_score, completeness_score, audio_blob_key, video_blob_key, resume_position)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [session.id, session.user_id, session.track_id, session.scoring_mode, session.status, session.duration_seconds, session.target_bpm, session.actual_bpm, session.total_score, session.speed_score, session.rhythm_score, session.intonation_score, session.smoothness_score, session.completeness_score, session.audio_blob_key, session.video_blob_key, session.resume_position],
    )
  },

  getRecent(limit = 10): PracticeSessionRecord[] {
    const result = query(
      `SELECT * FROM practice_sessions ORDER BY created_at DESC LIMIT ?`,
      [limit],
    )
    if (!result) return []
    return result.values.map((v) => rowToObject<PracticeSessionRecord>(result.columns, v))
  },

  getById(id: string): PracticeSessionRecord | null {
    const result = query('SELECT * FROM practice_sessions WHERE id = ?', [id])
    if (!result || !result.values.length) return null
    return rowToObject<PracticeSessionRecord>(result.columns, result.values[0])
  },

  getErrorsBySession(sessionId: string): PracticeErrorRecord[] {
    const result = query('SELECT * FROM practice_errors WHERE session_id = ?', [sessionId])
    if (!result) return []
    return result.values.map((v) => rowToObject<PracticeErrorRecord>(result.columns, v))
  },

  addError(error: Omit<PracticeErrorRecord, 'id'>): void {
    execute(
      `INSERT INTO practice_errors (session_id, measure_number, beat_position, error_type, expected_note, actual_note, deviation_cents, deviation_ms, severity, hand)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [error.session_id, error.measure_number, error.beat_position, error.error_type, error.expected_note, error.actual_note, error.deviation_cents, error.deviation_ms, error.severity, error.hand],
    )
  },

  getTotalDuration(): number {
    const result = query("SELECT COALESCE(SUM(duration_seconds),0) as total FROM practice_sessions WHERE status='completed'")
    if (!result) return 0
    return Number(result.values[0][0])
  },

  getTotalSessions(): number {
    const result = query("SELECT COUNT(*) FROM practice_sessions WHERE status='completed'")
    if (!result) return 0
    return Number(result.values[0][0])
  },

  getAverageScore(): number {
    const result = query("SELECT COALESCE(AVG(total_score),0) FROM practice_sessions WHERE status='completed' AND total_score IS NOT NULL")
    if (!result) return 0
    return Number(result.values[0][0])
  },

  getDailyDurations(days: number = 30): { date: string; minutes: number }[] {
    const daysStr = `-${days} days`
    const result = query(
      `SELECT DATE(created_at) as d, COALESCE(SUM(duration_seconds),0)/60.0 as mins
       FROM practice_sessions WHERE status='completed' AND created_at >= DATE('now', ?)
       GROUP BY DATE(created_at) ORDER BY d ASC`,
      [daysStr],
    )
    if (!result) return []
    return result.values.map((v) => ({ date: String(v[0]), minutes: Number(v[1]) }))
  },

  getDailyScores(days: number = 30): { date: string; score: number }[] {
    const daysStr = `-${days} days`
    const result = query(
      `SELECT DATE(created_at) as d, AVG(total_score) as avg_score
       FROM practice_sessions WHERE status='completed' AND total_score IS NOT NULL AND created_at >= DATE('now', ?)
       GROUP BY DATE(created_at) ORDER BY d ASC`,
      [daysStr],
    )
    if (!result) return []
    return result.values.map((v) => ({ date: String(v[0]), score: Number(v[1]) }))
  },

  getIncomplete(): PracticeSessionRecord[] {
    const result = query("SELECT * FROM practice_sessions WHERE status='in-progress' ORDER BY created_at DESC")
    if (!result) return []
    return result.values.map((v) => rowToObject<PracticeSessionRecord>(result.columns, v))
  },

  updateScores(id: string, scores: { total_score: number; speed_score: number; rhythm_score: number; intonation_score: number; smoothness_score: number; completeness_score: number }): void {
    execute(
      `UPDATE practice_sessions SET total_score=?, speed_score=?, rhythm_score=?, intonation_score=?, smoothness_score=?, completeness_score=?, status='completed' WHERE id=?`,
      [scores.total_score, scores.speed_score, scores.rhythm_score, scores.intonation_score, scores.smoothness_score, scores.completeness_score, id],
    )
  },

  getDiagnostics(sessionId: string): { dimension: string; problem: string; cause_analysis: string | null; solution: string | null; measure_start: number | null; measure_end: number | null; severity_rank: number | null }[] {
    const result = query('SELECT * FROM diagnostics WHERE session_id = ? ORDER BY severity_rank DESC', [sessionId])
    if (!result) return []
    return result.values.map((v) => rowToObject(result.columns, v)) as never[]
  },

  getBestScore(trackId: string): number | null {
    const result = query(
      "SELECT MAX(total_score) FROM practice_sessions WHERE track_id=? AND status='completed' AND total_score IS NOT NULL",
      [trackId],
    )
    if (!result || result.values[0][0] == null) return null
    return Number(result.values[0][0])
  },

  getDistinctTrackCount(): number {
    const result = query("SELECT COUNT(DISTINCT track_id) FROM practice_sessions WHERE status='completed'")
    if (!result) return 0
    return Number(result.values[0][0])
  },

  getDimensionHistory(days: number = 90): { date: string; speed: number; rhythm: number; intonation: number; smoothness: number; completeness: number }[] {
    const daysStr = `-${days} days`
    const result = query(
      `SELECT DATE(created_at) as d, AVG(speed_score), AVG(rhythm_score), AVG(intonation_score), AVG(smoothness_score), AVG(completeness_score)
       FROM practice_sessions WHERE status='completed' AND total_score IS NOT NULL AND created_at >= DATE('now', ?)
       GROUP BY DATE(created_at) ORDER BY d ASC`,
      [daysStr],
    )
    if (!result) return []
    return result.values.map((v) => ({
      date: String(v[0]),
      speed: Number(v[1] ?? 0),
      rhythm: Number(v[2] ?? 0),
      intonation: Number(v[3] ?? 0),
      smoothness: Number(v[4] ?? 0),
      completeness: Number(v[5] ?? 0),
    }))
  },

  getByTrack(trackId: string): PracticeSessionRecord[] {
    const result = query("SELECT * FROM practice_sessions WHERE track_id=? AND status='completed' ORDER BY created_at ASC", [trackId])
    if (!result) return []
    return result.values.map((v) => rowToObject<PracticeSessionRecord>(result.columns, v))
  },

  upsert(session: PracticeSessionRecord): void {
    execute(
      `INSERT OR REPLACE INTO practice_sessions (id, user_id, track_id, scoring_mode, status, duration_seconds, target_bpm, actual_bpm, total_score, speed_score, rhythm_score, intonation_score, smoothness_score, completeness_score, audio_blob_key, video_blob_key, resume_position, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [session.id, session.user_id, session.track_id, session.scoring_mode, session.status, session.duration_seconds, session.target_bpm, session.actual_bpm, session.total_score, session.speed_score, session.rhythm_score, session.intonation_score, session.smoothness_score, session.completeness_score, session.audio_blob_key, session.video_blob_key, session.resume_position, session.created_at],
    )
  },
}
