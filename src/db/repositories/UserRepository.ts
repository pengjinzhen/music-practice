import { getDB } from '../database'

export interface UserRecord {
  id: string
  nickname: string
  avatar: string | null
  skill_level: string
  instrument: string
  language: string
  sound_effects_enabled: number
}

export const UserRepository = {
  get(): UserRecord {
    const db = getDB()
    const result = db.exec("SELECT * FROM users WHERE id = 'local-user'")
    if (!result.length || !result[0].values.length) {
      throw new Error('User not found')
    }
    const cols = result[0].columns
    const vals = result[0].values[0]
    return Object.fromEntries(cols.map((c, i) => [c, vals[i]])) as unknown as UserRecord
  },

  update(fields: Partial<Omit<UserRecord, 'id'>>): void {
    const db = getDB()
    const entries = Object.entries(fields)
    if (!entries.length) return
    const sets = entries.map(([k]) => `${k} = ?`).join(', ')
    const values = entries.map(([, v]) => v)
    db.run(`UPDATE users SET ${sets}, updated_at = datetime('now') WHERE id = 'local-user'`, values)
  },
}
