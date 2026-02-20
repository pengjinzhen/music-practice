import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/useAppStore'
import { useTuner } from '@/hooks/useTuner'

const CELLO_STRINGS = [
  { name: 'string_a', midi: 57, freq: 220 },
  { name: 'string_d', midi: 50, freq: 146.83 },
  { name: 'string_g', midi: 43, freq: 98 },
  { name: 'string_c', midi: 36, freq: 65.41 },
]

export default function TunerPage() {
  const { t } = useTranslation()
  const { instrument } = useAppStore()
  const tuner = useTuner()

  const centsAbs = Math.abs(tuner.cents)
  const tuneStatus = centsAbs <= 5 ? 'in_tune' : tuner.cents > 0 ? 'sharp' : 'flat'
  const statusColor = tuneStatus === 'in_tune' ? 'text-green-600' : 'text-orange-600'

  // Gauge rotation: -50 to +50 cents maps to -90 to +90 degrees
  const rotation = Math.max(-90, Math.min(90, tuner.cents * 1.8))

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h1 className="text-2xl font-bold">{t('tuner.title')}</h1>

      {/* Gauge */}
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          {/* Needle gauge */}
          <div className="relative h-40 w-64">
            <svg viewBox="0 0 200 100" className="h-full w-full">
              {/* Arc background */}
              <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" strokeLinecap="round" />
              {/* Center zone (green) */}
              <path d="M 95 14 A 80 80 0 0 1 105 14" fill="none" stroke="hsl(142 71% 45%)" strokeWidth="8" strokeLinecap="round" />
              {/* Needle */}
              <line
                x1="100" y1="90" x2="100" y2="20"
                stroke="hsl(var(--primary))" strokeWidth="2"
                transform={`rotate(${rotation} 100 90)`}
              />
              <circle cx="100" cy="90" r="4" fill="hsl(var(--primary))" />
            </svg>
          </div>

          {/* Note display */}
          <div className="text-center">
            <p className="text-5xl font-bold">{tuner.noteName}<span className="text-2xl text-muted-foreground">{tuner.octave > 0 ? tuner.octave : ''}</span></p>
            {tuner.frequency && (
              <>
                <p className={`text-lg font-medium ${statusColor}`}>{t(`tuner.${tuneStatus}`)}</p>
                <p className="text-sm text-muted-foreground">
                  {tuner.cents > 0 ? '+' : ''}{tuner.cents} {t('tuner.cents')} &middot; {tuner.frequency.toFixed(1)} Hz
                </p>
              </>
            )}
          </div>

          {/* Start/Stop */}
          <Button size="lg" onClick={tuner.isActive ? tuner.stop : tuner.start}>
            {tuner.isActive ? t('tuner.stop') : t('tuner.start')}
          </Button>
        </CardContent>
      </Card>

      {/* Cello strings */}
      {instrument === 'cello' && (
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="grid grid-cols-4 gap-3">
              {CELLO_STRINGS.map((s) => {
                const isActive = tuner.midiNumber === s.midi
                return (
                  <div
                    key={s.name}
                    className={`flex flex-col items-center rounded-lg p-3 ${isActive ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted'}`}
                  >
                    <span className="text-sm font-medium">{t(`tuner.${s.name}`)}</span>
                    <span className="text-xs text-muted-foreground">{s.freq.toFixed(0)} Hz</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
