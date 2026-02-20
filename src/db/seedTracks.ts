import { getDB } from '@/db/database'
import { allTracks } from '@/assets/scores/trackIndex'

export async function seedBuiltinTracks(): Promise<void> {
  const db = await getDB()

  const existing = db.exec('SELECT COUNT(*) as cnt FROM tracks WHERE is_builtin = 1')
  const count = existing[0]?.values[0]?.[0] as number
  if (count >= allTracks.length) return

  for (const t of allTracks) {
    db.run(
      `INSERT OR IGNORE INTO tracks (id, name, composer, instrument, difficulty, difficulty_score, duration_seconds, category, musicxml_path, midi_path, is_builtin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [t.id, t.title, t.composer, t.instrument, t.difficulty, t.difficultyScore, t.durationSeconds, t.tags[0] || null, t.xmlPath, t.midiPath || null],
    )
  }
}
