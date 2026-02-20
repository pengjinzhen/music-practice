import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScoreViewer } from '@/components/score/ScoreViewer'
import { RecorderControls } from '@/components/practice/RecorderControls'
import { ScoreRepository } from '@/db/repositories/ScoreRepository'

const PASS_THRESHOLD = 80

export default function SectionPracticePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const trackId = searchParams.get('track') || ''
  const measureStart = Number(searchParams.get('start') || 1)
  const measureEnd = Number(searchParams.get('end') || 1)
  const reportId = searchParams.get('report') || ''

  const track = trackId ? ScoreRepository.getById(trackId) : null
  const [score, setScore] = useState<number | null>(null)

  const handleStart = useCallback(() => {}, [])
  const handlePause = useCallback(() => {}, [])
  const handleResume = useCallback(() => {}, [])
  const handleStop = useCallback(() => {
    // TODO: Run scoring on section only
    setScore(Math.round(Math.random() * 40 + 60)) // Placeholder
  }, [])

  const passed = score !== null && score >= PASS_THRESHOLD

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-6 py-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(reportId ? `/report/${reportId}` : -1 as never)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-lg font-bold">{t('section.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {track?.name} &middot; {t('section.measures')} {measureStart}-{measureEnd}
          </p>
        </div>
      </div>

      {/* Score viewer (section only) */}
      <div className="flex-1 overflow-auto p-4">
        {track?.musicxml_path && <ScoreViewer musicXml={track.musicxml_path} />}
      </div>

      {/* Result */}
      {score !== null && (
        <div className="px-6">
          <Card className={passed ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
            <CardContent className="flex items-center gap-4 pt-6">
              {passed ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-orange-600" />
              )}
              <div>
                <p className="text-2xl font-bold">{score}/100</p>
                <p className="text-sm">{passed ? t('section.passed') : t('section.not_passed')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <div className="border-t px-6">
        <RecorderControls onStart={handleStart} onPause={handlePause} onResume={handleResume} onStop={handleStop} />
      </div>
    </div>
  )
}
