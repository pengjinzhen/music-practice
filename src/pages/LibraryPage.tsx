import { useState, useMemo, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Upload, Piano } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/useAppStore'
import { ScoreRepository } from '@/db/repositories/ScoreRepository'
import { TrackCard } from '@/components/library/TrackCard'
import type { InstrumentType } from '@/stores/useAppStore'

export default function LibraryPage() {
  const { t } = useTranslation()
  const { instrument, setInstrument } = useAppStore()
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const tracks = useMemo(() => {
    let results = search
      ? ScoreRepository.search(search, instrument)
      : ScoreRepository.getAll(instrument)
    if (difficulty) {
      results = results.filter((t) => t.difficulty === difficulty)
    }
    return results
  }, [instrument, search, difficulty])

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const { uploadUserScore } = await import('@/engines/ScoreUploader')
    await uploadUserScore(file)
    setSearch('')
    e.target.value = ''
  }, [])

  const instruments: { key: InstrumentType; label: string }[] = [
    { key: 'piano', label: t('instrument.piano') },
    { key: 'cello', label: t('instrument.cello') },
  ]

  const difficulties = [
    { key: '', label: t('library.all_levels') },
    { key: 'beginner', label: t('difficulty.beginner') },
    { key: 'intermediate', label: t('difficulty.intermediate') },
    { key: 'advanced', label: t('difficulty.advanced') },
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Instrument tabs */}
      <div className="flex items-center gap-4">
        <div className="flex rounded-lg bg-muted p-1">
          {instruments.map((inst) => (
            <button
              key={inst.key}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                instrument === inst.key ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setInstrument(inst.key)}
            >
              {inst.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          {t('library.upload')}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xml,.musicxml"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {/* Search and filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
            placeholder={t('library.search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1">
          {difficulties.map((d) => (
            <button
              key={d.key}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                difficulty === d.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setDifficulty(d.key)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Track grid */}
      {tracks.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-muted-foreground">
          <Piano className="h-12 w-12" />
          <p>{t('library.no_tracks')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tracks.map((track) => (
            <TrackCard key={track.id} track={track} />
          ))}
        </div>
      )}
    </div>
  )
}
