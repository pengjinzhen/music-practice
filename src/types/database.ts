export interface DBConfig {
  name: string
  version: number
}

export interface ExportData {
  version: number
  exportedAt: string
  user: Record<string, unknown>
  sessions: Record<string, unknown>[]
  errors: Record<string, unknown>[]
  diagnostics: Record<string, unknown>[]
  achievements: Record<string, unknown>[]
  weeklyGoals: Record<string, unknown>[]
  tracks: Record<string, unknown>[]
}
