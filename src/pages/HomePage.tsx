import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Clock, Music, TrendingUp, Play, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PracticeRepository } from '@/db/repositories/PracticeRepository'
import { ScoreRepository } from '@/db/repositories/ScoreRepository'
import { ScoreTrendChart } from '@/components/dashboard/ScoreTrendChart'
import { RecentSessionList } from '@/components/dashboard/RecentSessionList'
import { WeeklyGoalCard } from '@/components/dashboard/WeeklyGoalCard'

export default function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const stats = useMemo(() => {
    const totalSeconds = PracticeRepository.getTotalDuration()
    const totalSessions = PracticeRepository.getTotalSessions()
    const avgScore = PracticeRepository.getAverageScore()
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    return { hours, minutes, totalSessions, avgScore: Math.round(avgScore) }
  }, [])

  const recentSessions = useMemo(() => {
    const sessions = PracticeRepository.getRecent(5)
    const trackMap = new Map<string, string>()
    for (const s of sessions) {
      if (!trackMap.has(s.track_id)) {
        const track = ScoreRepository.getById(s.track_id)
        if (track) trackMap.set(s.track_id, track.name)
      }
    }
    return sessions.map((s) => ({ ...s, trackName: trackMap.get(s.track_id) || s.track_id }))
  }, [])

  const dailyScores = useMemo(() => PracticeRepository.getDailyScores(30), [])
  const incompleteSessions = useMemo(() => {
    const sessions = PracticeRepository.getIncomplete()
    return sessions.map((s) => {
      const track = ScoreRepository.getById(s.track_id)
      return { ...s, trackName: track?.name || s.track_id }
    })
  }, [])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('dashboard.welcome')}</h1>
        <Button onClick={() => navigate('/practice')}>
          <Play className="mr-2 h-4 w-4" />
          {t('dashboard.go_practice')}
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Clock className="h-5 w-5 text-blue-500" />}
          label={t('dashboard.total_practice')}
          value={`${stats.hours}${t('dashboard.hours')} ${stats.minutes}${t('dashboard.minutes')}`}
        />
        <StatCard
          icon={<Music className="h-5 w-5 text-green-500" />}
          label={t('dashboard.total_sessions')}
          value={String(stats.totalSessions)}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-orange-500" />}
          label={t('dashboard.avg_score')}
          value={stats.avgScore > 0 ? `${stats.avgScore}/100` : '--'}
        />
      </div>

      {/* Incomplete sessions */}
      {incompleteSessions.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
          <CardContent className="pt-6">
            <div className="mb-2 flex items-center gap-2 text-orange-600">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">{t('dashboard.incomplete')}</span>
            </div>
            <div className="space-y-2">
              {incompleteSessions.map((s) => (
                <button
                  key={s.id}
                  className="flex w-full items-center justify-between rounded-lg bg-white/60 p-3 text-left transition-colors hover:bg-white dark:bg-black/20 dark:hover:bg-black/30"
                  onClick={() => navigate(`/practice?resume=${s.id}`)}
                >
                  <span className="truncate font-medium">{s.trackName}</span>
                  <span className="ml-2 text-sm text-muted-foreground">{t('dashboard.continue')}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Score trend chart */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {dailyScores.length > 0 && (
          <Card>
            <CardHeader><CardTitle>{t('dashboard.score_trend')}</CardTitle></CardHeader>
            <CardContent><ScoreTrendChart data={dailyScores} /></CardContent>
          </Card>
        )}
        <WeeklyGoalCard />
      </div>

      {/* Recent sessions */}
      <Card>
        <CardHeader><CardTitle>{t('dashboard.recent_sessions')}</CardTitle></CardHeader>
        <CardContent>
          <RecentSessionList sessions={recentSessions} emptyText={t('dashboard.no_sessions')} />
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="rounded-lg bg-muted p-3">{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
