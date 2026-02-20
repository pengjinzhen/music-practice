import { useTranslation } from 'react-i18next'
import type { PracticeErrorRecord } from '@/db/repositories/PracticeRepository'

interface Props {
  errors: PracticeErrorRecord[]
  onErrorClick?: (measureNumber: number) => void
}

export function ErrorList({ errors, onErrorClick }: Props) {
  const { t } = useTranslation()

  if (errors.length === 0) return null

  const severityColor: Record<string, string> = {
    minor: 'text-yellow-600 bg-yellow-50',
    moderate: 'text-orange-600 bg-orange-50',
    severe: 'text-red-600 bg-red-50',
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">{t('report.errors_title')}</h3>
      <div className="max-h-64 overflow-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="px-3 py-2">{t('report.measure')}</th>
              <th className="px-3 py-2">{t('report.expected')}</th>
              <th className="px-3 py-2">{t('report.actual')}</th>
              <th className="px-3 py-2">Severity</th>
            </tr>
          </thead>
          <tbody>
            {errors.map((err, idx) => (
              <tr
                key={idx}
                className="cursor-pointer border-t hover:bg-muted/50"
                onClick={() => onErrorClick?.(err.measure_number)}
              >
                <td className="px-3 py-2">{err.measure_number}</td>
                <td className="px-3 py-2">{err.expected_note || '--'}</td>
                <td className="px-3 py-2">{err.actual_note || '--'}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${severityColor[err.severity] || ''}`}>
                    {t(`report.severity_${err.severity}`)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
