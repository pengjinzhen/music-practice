import { useNavigate } from 'react-router-dom'
import type { PracticeSessionRecord } from '@/db/repositories/PracticeRepository'

interface SessionWithTrack extends PracticeSessionRecord {
  trackName: string
}

interface Props {
  sessions: SessionWithTrack[]
  emptyText: string
}

export function RecentSessionList({ sessions, emptyText }: Props) {
  const navigate = useNavigate()

  if (sessions.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">{emptyText}</p>
  }

  return (
    <div className="space-y-2">
      {sessions.map((s) => (
        <button
          key={s.id}
          className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-muted"
          onClick={() => navigate(`/report/${s.id}`)}
        >
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{s.trackName}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(s.created_at).toLocaleDateString()} &middot;{' '}
              {s.duration_seconds ? `${Math.floor(s.duration_seconds / 60)}min` : '--'}
            </p>
          </div>
          <div className="ml-4 text-right">
            {s.total_score != null ? (
              <span className="text-lg font-bold">{Math.round(s.total_score)}</span>
            ) : (
              <span className="text-muted-foreground">--</span>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
