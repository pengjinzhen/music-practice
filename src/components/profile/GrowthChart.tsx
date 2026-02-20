import { useTranslation } from 'react-i18next'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface DataPoint {
  date: string
  speed: number
  rhythm: number
  intonation: number
  smoothness: number
  completeness: number
}

interface Props {
  data: DataPoint[]
}

const COLORS = {
  speed: '#3b82f6',
  rhythm: '#10b981',
  intonation: '#f59e0b',
  smoothness: '#8b5cf6',
  completeness: '#ef4444',
}

export function GrowthChart({ data }: Props) {
  const { t } = useTranslation()

  const formatted = data.map((d) => ({
    ...d,
    date: d.date.slice(5),
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formatted}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" fontSize={12} />
        <YAxis domain={[0, 20]} fontSize={12} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="speed" name={t('scoring.speed')} stroke={COLORS.speed} dot={false} />
        <Line type="monotone" dataKey="rhythm" name={t('scoring.rhythm')} stroke={COLORS.rhythm} dot={false} />
        <Line type="monotone" dataKey="intonation" name={t('scoring.intonation')} stroke={COLORS.intonation} dot={false} />
        <Line type="monotone" dataKey="smoothness" name={t('scoring.smoothness')} stroke={COLORS.smoothness} dot={false} />
        <Line type="monotone" dataKey="completeness" name={t('scoring.completeness')} stroke={COLORS.completeness} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
