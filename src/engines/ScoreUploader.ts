import { execute } from '@/db/database'
import { ScoreParser } from '@/engines/ScoreParser'
import { DifficultyCalculator } from '@/engines/DifficultyCalculator'

const STORE_NAME = 'user-scores'
const DB_NAME = 'music-practice-scores'

function openScoreStore(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function uploadUserScore(file: File): Promise<string> {
  const xmlString = await file.text()

  const parser = new ScoreParser()
  const parsed = parser.parse(xmlString)

  const calculator = new DifficultyCalculator()
  const difficulty = calculator.calculate(parsed)

  const id = `user-${Date.now()}`
  const storageKey = `user/${id}.xml`

  // Save XML to IndexedDB
  const idb = await openScoreStore()
  await new Promise<void>((resolve, reject) => {
    const tx = idb.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(xmlString, storageKey)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })

  // Insert track metadata into SQLite
  execute(
    `INSERT INTO tracks (id, name, composer, instrument, difficulty, difficulty_score, duration_seconds, musicxml_path, is_builtin)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [id, parsed.title, parsed.composer, 'piano', difficulty.level, difficulty.score, 0, storageKey],
  )

  return id
}

export async function getUserScoreXml(storageKey: string): Promise<string | null> {
  const idb = await openScoreStore()
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(storageKey)
    req.onsuccess = () => resolve(req.result ?? null)
    req.onerror = () => reject(req.error)
  })
}

export async function deleteUserScore(id: string, storageKey: string): Promise<void> {
  const idb = await openScoreStore()
  await new Promise<void>((resolve, reject) => {
    const tx = idb.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(storageKey)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })

  execute('DELETE FROM tracks WHERE id = ?', [id])
}
