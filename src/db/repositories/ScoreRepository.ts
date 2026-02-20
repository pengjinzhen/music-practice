import { getDB } from '../database'

export interface TrackRecord {
  id: string
  name: string
  composer: string | null
  instrument: string
  difficulty: string | null
  difficulty_score: number | null
  duration_seconds: number | null
  category: string | null
  musicxml_path: string | null
  midi_path: string | null
  is_builtin: number
  created_at: string
}

function rowToObject<T>(columns: string[], values: unknown[]): T {
  return Object.fromEntries(columns.map((c, i) => [c, values[i]])) as T
}

export const ScoreRepository = {
  getAll(instrument?: string): TrackRecord[] {
    const db = getDB()
    const sql = instrument
      ? 'SELECT * FROM tracks WHERE instrument = ? ORDER BY difficulty_score ASC'
      : 'SELECT * FROM tracks ORDER BY instrument, difficulty_score ASC'
    const result = db.exec(sql, instrument ? [instrument] : [])
    if (!result.length) return []
    return result[0].values.map((v) => rowToObject<TrackRecord>(result[0].columns, v))
  },

  getById(id: string): TrackRecord | null {
    const db = getDB()
    const result = db.exec('SELECT * FROM tracks WHERE id = ?', [id])
    if (!result.length || !result[0].values.length) return null
    return rowToObject<TrackRecord>(result[0].columns, result[0].values[0])
  },

  upsert(track: Omit<TrackRecord, 'created_at'>): void {
    const db = getDB()
    db.run(
      `INSERT OR REPLACE INTO tracks (id, name, composer, instrument, difficulty, difficulty_score, duration_seconds, category, musicxml_path, midi_path, is_builtin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [track.id, track.name, track.composer, track.instrument, track.difficulty, track.difficulty_score, track.duration_seconds, track.category, track.musicxml_path, track.midi_path, track.is_builtin],
    )
  },

  search(query: string, instrument?: string): TrackRecord[] {
    const db = getDB()
    const pattern = `%${query}%`
    const sql = instrument
      ? "SELECT * FROM tracks WHERE instrument = ? AND (name LIKE ? OR composer LIKE ?) ORDER BY difficulty_score ASC"
      : "SELECT * FROM tracks WHERE (name LIKE ? OR composer LIKE ?) ORDER BY difficulty_score ASC"
    const params = instrument ? [instrument, pattern, pattern] : [pattern, pattern]
    const result = db.exec(sql, params)
    if (!result.length) return []
    return result[0].values.map((v) => rowToObject<TrackRecord>(result[0].columns, v))
  },
}
