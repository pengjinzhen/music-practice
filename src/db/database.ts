import initSqlJs, { type Database } from 'sql.js'
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url'
import schemaSql from './schema.sql?raw'
import { runMigrations } from './migrations'
import { seedBuiltinTracks } from './seedTracks'

const DB_NAME = 'ai-music-practice'
const DB_STORE = 'database'

let db: Database | null = null

export async function loadFromIndexedDB(): Promise<Uint8Array | null> {
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(DB_STORE)
    }
    request.onsuccess = () => {
      const tx = request.result.transaction(DB_STORE, 'readonly')
      const store = tx.objectStore(DB_STORE)
      const get = store.get('db')
      get.onsuccess = () => resolve(get.result ?? null)
      get.onerror = () => resolve(null)
    }
    request.onerror = () => resolve(null)
  })
}

export async function deleteIndexedDB(): Promise<void> {
  return new Promise((resolve) => {
    const request = indexedDB.deleteDatabase(DB_NAME)
    request.onsuccess = () => resolve()
    request.onerror = () => resolve()
    request.onblocked = () => resolve()
  })
}

export async function saveToIndexedDB(): Promise<void> {
  if (!db) return
  const data = db.export()
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(DB_STORE)
    }
    request.onsuccess = () => {
      const tx = request.result.transaction(DB_STORE, 'readwrite')
      const store = tx.objectStore(DB_STORE)
      store.put(data, 'db')
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function getDatabase(): Promise<Database> {
  if (db) return db

  const SQL = await initSqlJs({
    locateFile: () => sqlWasmUrl,
  })

  // Try to restore from IndexedDB first
  const saved = await loadFromIndexedDB()
  if (saved) {
    try {
      const restored = new SQL.Database(saved)
      // Validate the DB is usable
      restored.exec('SELECT 1')
      db = restored
      // Run migrations on restored DB in case schema evolved
      try {
        runMigrations(db)
      } catch {
        // migrations may already be applied
      }
      ensureDefaultUser(db)
      await seedBuiltinTracks()
      console.log('[DB] restored from IndexedDB')
      return db
    } catch (e) {
      console.warn('[DB] IndexedDB restore failed, creating fresh:', e)
    }
  }

  const fresh = new SQL.Database()

  try {
    fresh.exec(schemaSql)
    console.log('[DB] schema: OK')
  } catch (e) {
    console.error('[DB] schema FAILED:', e)
    throw e
  }

  try {
    runMigrations(fresh)
    console.log('[DB] migrations: OK')
  } catch (e) {
    console.error('[DB] migrations FAILED:', e)
    throw e
  }

  try {
    ensureDefaultUser(fresh)
    console.log('[DB] user: OK')
  } catch (e) {
    console.error('[DB] user FAILED:', e)
    throw e
  }

  db = fresh

  try {
    await seedBuiltinTracks()
    console.log('[DB] seed tracks: OK')
  } catch (e) {
    console.error('[DB] seed tracks FAILED:', e)
  }

  await saveToIndexedDB()
  return db
}

export function createFreshDB(SQL: Awaited<ReturnType<typeof initSqlJs>>): Database {
  const fresh = new SQL.Database()
  fresh.exec(schemaSql)
  runMigrations(fresh)
  ensureDefaultUser(fresh)
  return fresh
}

function ensureDefaultUser(d: Database) {
  const result = d.exec("SELECT id FROM users WHERE id = 'local-user'")
  if (result.length === 0 || result[0].values.length === 0) {
    d.run("INSERT OR IGNORE INTO users (id) VALUES ('local-user')")
  }
}

export function getDB(): Database {
  if (!db) throw new Error('Database not initialized. Call getDatabase() first.')
  return db
}

/** Safe query using prepared statements — avoids sql.js exec() param binding issues */
export function query(sql: string, params: unknown[] = []): { columns: string[]; values: unknown[][] } | null {
  const d = getDB()
  const stmt = d.prepare(sql)
  if (params.length) stmt.bind(params as never)
  const columns = stmt.getColumnNames()
  const values: unknown[][] = []
  while (stmt.step()) {
    values.push(stmt.get())
  }
  stmt.free()
  if (values.length === 0 && columns.length === 0) return null
  return { columns, values }
}

/** Safe execute using prepared statements for write operations (INSERT/UPDATE/DELETE) */
export function execute(sql: string, params: unknown[] = []): void {
  const d = getDB()
  const stmt = d.prepare(sql)
  if (params.length) stmt.bind(params as never)
  stmt.step()
  stmt.free()
}
