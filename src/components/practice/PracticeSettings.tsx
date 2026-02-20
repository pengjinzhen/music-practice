import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { usePracticeStore } from '@/stores/usePracticeStore'
import type { ScoringMode } from '@/stores/usePracticeStore'

interface Props {
  defaultBPM: number | null
}

export function PracticeSettings({ defaultBPM }: Props) {
  const { t } = useTranslation()
  const {
    scoringMode, setScoringMode,
    targetBPM, setTargetBPM,
    metronomeEnabled, toggleMetronome,
    accompanimentEnabled, toggleAccompaniment,
  } = usePracticeStore()

  const bpm = targetBPM ?? defaultBPM ?? 120

  const modes: { key: ScoringMode; label: string }[] = [
    { key: 'piece', label: t('practice.mode_piece') },
    { key: 'single-note', label: t('practice.mode_single') },
  ]

  return (
    <Card>
      <CardHeader><CardTitle>{t('practice.settings')}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {/* Scoring mode */}
        <div>
          <label className="mb-1 block text-sm font-medium">{t('practice.scoring_mode')}</label>
          <div className="flex gap-2">
            {modes.map((m) => (
              <button
                key={m.key}
                className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                  scoringMode === m.key ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
                onClick={() => setScoringMode(m.key)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* BPM */}
        <div>
          <label className="mb-1 flex items-center justify-between text-sm font-medium">
            <span>{t('practice.speed')}</span>
            <span className="text-muted-foreground">{bpm} {t('practice.bpm')}</span>
          </label>
          <Slider
            value={[bpm]}
            min={30}
            max={240}
            step={1}
            onValueChange={([v]) => setTargetBPM(v)}
          />
        </div>

        {/* Toggles */}
        <div className="flex gap-4">
          <ToggleButton
            label={t('practice.metronome')}
            active={metronomeEnabled}
            onClick={toggleMetronome}
          />
          <ToggleButton
            label={t('practice.accompaniment')}
            active={accompanimentEnabled}
            onClick={toggleAccompaniment}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function ToggleButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      className={`rounded-lg px-4 py-2 text-sm transition-colors ${
        active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
