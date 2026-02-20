import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface DiagnosticItem {
  dimension: string
  problem: string
  cause_analysis: string | null
  solution: string | null
  measure_start: number | null
  measure_end: number | null
  severity_rank: number | null
}

interface Props {
  diagnostics: DiagnosticItem[]
  onMeasureClick?: (start: number, end: number) => void
}

export function DiagnosticCard({ diagnostics, onMeasureClick }: Props) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const toggle = (idx: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  if (diagnostics.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">{t('report.diagnostics')}</h3>
      {diagnostics.map((d, idx) => (
        <Card key={idx}>
          <CardContent className="pt-4">
            <button className="flex w-full items-start justify-between text-left" onClick={() => toggle(idx)}>
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                <div>
                  <p className="font-medium">{d.problem}</p>
                  {d.measure_start != null && (
                    <button
                      className="text-sm text-primary hover:underline"
                      onClick={(e) => { e.stopPropagation(); onMeasureClick?.(d.measure_start!, d.measure_end!) }}
                    >
                      {t('report.measure')} {d.measure_start}-{d.measure_end}
                    </button>
                  )}
                </div>
              </div>
              {expanded.has(idx) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {expanded.has(idx) && (
              <div className="mt-3 space-y-2 border-t pt-3 text-sm">
                {d.cause_analysis && (
                  <div>
                    <span className="font-medium text-muted-foreground">{t('report.cause')}:</span>
                    <p>{d.cause_analysis}</p>
                  </div>
                )}
                {d.solution && (
                  <div>
                    <span className="font-medium text-muted-foreground">{t('report.solution')}:</span>
                    <p>{d.solution}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
