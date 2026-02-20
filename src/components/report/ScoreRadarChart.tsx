import { useTranslation } from 'react-i18next'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

interface Props {
  scores: { speed: number; rhythm: number; intonation: number; smoothness: number; completeness: number }
  totalScore: number
}

export function ScoreRadarChart({ scores, totalScore }: Props) {
  const { t } = useTranslation()

  const data = [
    { dimension: t('scoring.speed'), value: scores.speed, fullMark: 20 },
    { dimension: t('scoring.rhythm'), value: scores.rhythm, fullMark: 20 },
    { dimension: t('scoring.intonation'), value: scores.intonation, fullMark: 20 },
    { dimension: t('scoring.smoothness'), value: scores.smoothness, fullMark: 20 },
    { dimension: t('scoring.completeness'), value: scores.completeness, fullMark: 20 },
  ]

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="dimension" fontSize={12} />
          <PolarRadiusAxis angle={90} domain={[0, 20]} tick={false} />
          <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
        </RadarChart>
      </ResponsiveContainer>
      <div className="text-center">
        <span className="text-4xl font-bold">{Math.round(totalScore)}</span>
        <span className="text-lg text-muted-foreground">/100</span>
      </div>
    </div>
  )
}
