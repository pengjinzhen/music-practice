import { PracticeRepository } from '@/db/repositories/PracticeRepository'
import { AchievementRepository } from '@/db/repositories/AchievementRepository'
import { UserRepository } from '@/db/repositories/UserRepository'

interface ExportData {
  version: 1
  exportedAt: string
  user: Record<string, unknown>
  sessions: Record<string, unknown>[]
  achievements: Record<string, unknown>[]
}

export function exportData(): void {
  const user = (() => { try { return UserRepository.get() } catch { return {} } })()
  const sessions = PracticeRepository.getRecent(9999)
  const achievements = AchievementRepository.getAll()

  const data: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    user: user as Record<string, unknown>,
    sessions: sessions as unknown as Record<string, unknown>[],
    achievements: achievements as unknown as Record<string, unknown>[],
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `music-practice-export-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importData(file: File): Promise<{ sessions: number; achievements: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as ExportData
        if (data.version !== 1) throw new Error('Unsupported version')
        let sCount = 0
        let aCount = 0
        for (const s of data.sessions ?? []) {
          PracticeRepository.upsert(s as never)
          sCount++
        }
        for (const a of data.achievements ?? []) {
          AchievementRepository.unlock(a as never)
          aCount++
        }
        resolve({ sessions: sCount, achievements: aCount })
      } catch (e) {
        reject(e)
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}
