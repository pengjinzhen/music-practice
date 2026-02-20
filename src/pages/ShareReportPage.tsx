import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { ScoreRadarChart } from '@/components/report/ScoreRadarChart'
import { fetchSharedReport, type SharePayload } from '@/services/shareService'

export default function ShareReportPage() {
  const { token } = useParams<{ token: string }>()
  const [data, setData] = useState<SharePayload | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!token) return
    fetchSharedReport(token).then(setData).catch(() => setError(true))
  }, [token])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Report not found or link expired.</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold">AI Music Practice Report</h1>
        <p className="text-sm text-muted-foreground">
          {data.trackName} &middot; {new Date(data.date).toLocaleDateString()}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ScoreRadarChart scores={data.scores} totalScore={data.totalScore} />
        </CardContent>
      </Card>

      {data.diagnostics.length > 0 && (
        <Card>
          <CardContent className="space-y-3 pt-6">
            {data.diagnostics.map((d, i) => (
              <div key={i} className="space-y-1 rounded-lg border p-3">
                <p className="text-sm font-medium">{d.problem}</p>
                <p className="text-xs text-muted-foreground">{d.cause}</p>
                <p className="text-xs text-green-600">{d.solution}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
