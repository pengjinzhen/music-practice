import { query, execute } from '@/db/database'
import { allTracks } from '@/assets/scores/trackIndex'

export async function seedBuiltinTracks(): Promise<void> {
  const result = query('SELECT COUNT(*) as cnt FROM tracks WHERE is_builtin = 1')
  const count = result ? Number(result.values[0][0]) : 0
  if (count >= allTracks.length) return

  for (const t of allTracks) {
    execute(
      `INSERT OR IGNORE INTO tracks (id, name, composer, instrument, difficulty, difficulty_score, duration_seconds, category, musicxml_path, midi_path, is_builtin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [t.id, t.title, t.composer, t.instrument, t.difficulty, t.difficultyScore, t.durationSeconds, t.tags[0] || null, t.xmlPath, t.midiPath || null],
    )
  }
}
