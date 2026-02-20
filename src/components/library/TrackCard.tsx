import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Music } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { TrackRecord } from '@/db/repositories/ScoreRepository'

interface Props {
  track: TrackRecord
}

export function TrackCard({ track }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const difficultyColor: Record<string, string> = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700',
  }

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => navigate(`/practice?track=${track.id}`)}
    >
      <CardContent className="flex items-start gap-4 pt-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Music className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{track.name}</p>
          {track.composer && (
            <p className="truncate text-sm text-muted-foreground">{track.composer}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {track.difficulty && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${difficultyColor[track.difficulty] || ''}`}>
                {t(`difficulty.${track.difficulty}`)}
              </span>
            )}
            {track.duration_seconds && (
              <span className="text-xs text-muted-foreground">
                {Math.floor(track.duration_seconds / 60)}:{String(track.duration_seconds % 60).padStart(2, '0')}
              </span>
            )}
            {!track.is_builtin && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                {t('library.custom')}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
