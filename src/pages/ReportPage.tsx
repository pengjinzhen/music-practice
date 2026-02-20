import { useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Link2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PracticeRepository } from '@/db/repositories/PracticeRepository'
import { ScoreRepository } from '@/db/repositories/ScoreRepository'
import { ScoreRadarChart } from '@/components/report/ScoreRadarChart'
import { DiagnosticCard } from '@/components/report/DiagnosticCard'
import { ErrorList } from '@/components/report/ErrorList'
import { ShareCard } from '@/components/report/ShareCard'
import { createShareLink } from '@/services/shareService'
import { generateSuggestionsFromScores } from '@/engines/SuggestionEngine'

export default function ReportPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const session = useMemo(() => id ? PracticeRepository.getById(id) : null, [id])
  const track = useMemo(() => session ? ScoreRepository.getById(session.track_id) : null, [session])
  const errors = useMemo(() => id ? PracticeRepository.getErrorsBySession(id) : [], [id])
  const diagnostics = useMemo(() => id ? PracticeRepository.getDiagnostics(id) : [], [id])
  const bestScore = useMemo(() => session ? PracticeRepository.getBestScore(session.track_id) : null, [session])

  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [sharing, setSharing] = useState(false)

  const handleShareLink = useCallback(async () => {
    if (!session) return
    setSharing(true)
    try {
      const url = await createShareLink({
        trackName: track?.name ?? '',
        totalScore: session.total_score ?? 0,
        scores: {
          speed: session.speed_score ?? 0, rhythm: session.rhythm_score ?? 0,
          intonation: session.intonation_score ?? 0, smoothness: session.smoothness_score ?? 0,
          completeness: session.completeness_score ?? 0,
        },
        date: session.created_at,
        diagnostics: diagnostics.map((d) => ({ problem: d.problem, cause: d.cause_analysis ?? '', solution: d.solution ?? '' })),
      })
      setShareUrl(url)
      await navigator.clipboard.writeText(url)
    } catch { /* ignore */ }
    setSharing(false)
  }, [session, track, diagnostics])

  if (!session) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 py-20">
        <p className="text-muted-foreground">{t('report.no_data')}</p>
        <Button onClick={() => navigate('/')}>{t('nav.dashboard')}</Button>
      </div>
    )
  }

  const scores = {
    speed: session.speed_score ?? 0,
    rhythm: session.rhythm_score ?? 0,
    intonation: session.intonation_score ?? 0,
    smoothness: session.smoothness_score ?? 0,
    completeness: session.completeness_score ?? 0,
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{t('report.title')}</h1>
            {track && <p className="text-sm text-muted-foreground">{track.name}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ShareCard
            trackName={track?.name ?? ''}
            totalScore={session.total_score ?? 0}
            scores={scores}
            date={session.created_at}
          />
          <Button variant="outline" size="sm" onClick={handleShareLink} disabled={sharing}>
            <Link2 className="mr-2 h-4 w-4" />
            {shareUrl ? t('report.link_copied') : t('report.share_link')}
          </Button>
        </div>
      </div>

      {/* Radar chart + best score */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <ScoreRadarChart scores={scores} totalScore={session.total_score ?? 0} />
          </CardContent>
        </Card>
        {bestScore != null && (
          <Card>
            <CardHeader><CardTitle>{t('report.best_score')}</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-end gap-8">
                <div>
                  <p className="text-sm text-muted-foreground">{t('report.current')}</p>
                  <p className="text-3xl font-bold">{Math.round(session.total_score ?? 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('report.best')}</p>
                  <p className="text-3xl font-bold text-primary">{Math.round(bestScore)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Diagnostics */}
      <DiagnosticCard diagnostics={diagnostics} />

      {/* Error list */}
      <ErrorList errors={errors} />

      {/* Practice suggestions */}
      {(() => {
        const suggestions = generateSuggestionsFromScores(scores)
        if (!suggestions.length) return null
        const lang = navigator.language.startsWith('zh') ? 'zh' : 'en'
        return (
          <Card>
            <CardHeader><CardTitle>{t('report.suggestions')}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {suggestions.map((s) => (
                <div key={s.dimension} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                      {t(`scoring.${s.dimension}`)}
                    </span>
                    <span className="text-xs text-muted-foreground">{s.score}/20</span>
                  </div>
                  <p className="mt-1 text-sm font-medium">{lang === 'zh' ? s.titleZh : s.titleEn}</p>
                  <p className="text-xs text-muted-foreground">{lang === 'zh' ? s.descriptionZh : s.descriptionEn}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })()}
    </div>
  )
}
