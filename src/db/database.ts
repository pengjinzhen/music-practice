import initSqlJs, { type Database } from 'sql.js'
import schemaSql from './schema.sql?raw'
import { runMigrations } from './migrations'

const DB_NAME = 'ai-music-practice'
const DB_STORE = 'database'

let db: Database | null = null

async function loadFromIndexedDB(): Promise<Uint8Array | null> {
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
    locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/sql.js@1.12.0/dist/${file}`,
  })

  const saved = await loadFromIndexedDB()
  db = saved ? new SQL.Database(saved) : new SQL.Database()

  // Run schema migrations
  db.run(schemaSql)
  runMigrations(db)

  // Ensure default user exists
  const result = db.exec("SELECT id FROM users WHERE id = 'local-user'")
  if (result.length === 0 || result[0].values.length === 0) {
    db.run("INSERT OR IGNORE INTO users (id) VALUES ('local-user')")
  }

  await saveToIndexedDB()
  return db
}

export function getDB(): Database {
  if (!db) throw new Error('Database not initialized. Call getDatabase() first.')
  return db
}
