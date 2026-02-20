import type { Database } from 'sql.js'

const CURRENT_VERSION = 1

export function runMigrations(db: Database): void {
  // Create migrations tracking table
  db.run(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    applied_at TEXT DEFAULT (datetime('now'))
  )`)

  const result = db.exec('SELECT COALESCE(MAX(version), 0) as v FROM schema_migrations')
  const currentVersion = (result[0]?.values[0]?.[0] as number) ?? 0

  if (currentVersion < CURRENT_VERSION) {
    // Apply migrations sequentially
    for (let v = currentVersion + 1; v <= CURRENT_VERSION; v++) {
      applyMigration(db, v)
      db.run('INSERT INTO schema_migrations (version) VALUES (?)', [v])
    }
  }
}

function applyMigration(_db: Database, version: number): void {
  switch (version) {
    case 1:
      // v1 is the initial schema, already applied via schema.sql
      break
    // Future migrations:
    // case 2:
    //   db.run('ALTER TABLE ...')
    //   break
    default:
      throw new Error(`Unknown migration version: ${version}`)
  }
}
