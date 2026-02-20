import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PracticeRepository } from '@/db/repositories/PracticeRepository'
import { ScoreRepository } from '@/db/repositories/ScoreRepository'

export function PracticeTimeline() {
  const navigate = useNavigate()

  const sessions = useMemo(() => {
    const all = PracticeRepository.getRecent(20)
    return all.map((s) => {
      const track = ScoreRepository.getById(s.track_id)
      return { ...s, trackName: track?.name || s.track_id }
    })
  }, [])

  if (sessions.length === 0) {
    return <p className="py-4 text-center text-sm text-muted-foreground">No practice history yet.</p>
  }

  return (
    <div className="space-y-3">
      {sessions.map((s) => (
        <button
          key={s.id}
          className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-muted"
          onClick={() => navigate(`/report/${s.id}`)}
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{s.trackName}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(s.created_at).toLocaleDateString()} &middot;{' '}
              {s.duration_seconds ? `${Math.floor(s.duration_seconds / 60)}min` : '--'}
            </p>
          </div>
          {s.total_score != null && (
            <span className="ml-3 text-sm font-bold">{Math.round(s.total_score)}</span>
          )}
        </button>
      ))}
    </div>
  )
}
