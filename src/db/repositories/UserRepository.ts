import { query, execute } from '../database'

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
    const result = query("SELECT * FROM users WHERE id = 'local-user'")
    if (!result || !result.values.length) {
      throw new Error('User not found')
    }
    return Object.fromEntries(result.columns.map((c, i) => [c, result.values[0][i]])) as unknown as UserRecord
  },

  update(fields: Partial<Omit<UserRecord, 'id'>>): void {
    const entries = Object.entries(fields)
    if (!entries.length) return
    const sets = entries.map(([k]) => `${k} = ?`).join(', ')
    const values = entries.map(([, v]) => v)
    execute(`UPDATE users SET ${sets}, updated_at = datetime('now') WHERE id = 'local-user'`, values)
  },
}
