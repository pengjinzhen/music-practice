import { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Image } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShareCardProps {
  trackName: string
  totalScore: number
  scores: { speed: number; rhythm: number; intonation: number; smoothness: number; completeness: number }
  date: string
}

export function ShareCard({ trackName, totalScore, scores, date }: ShareCardProps) {
  const { t } = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = 600, H = 400
    canvas.width = W
    canvas.height = H

    // Background
    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, '#1e293b')
    grad.addColorStop(1, '#0f172a')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    // Title
    ctx.fillStyle = '#f8fafc'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText(t('app.name'), 30, 45)

    // Track name
    ctx.font = '16px sans-serif'
    ctx.fillStyle = '#94a3b8'
    ctx.fillText(trackName, 30, 75)
    ctx.fillText(new Date(date).toLocaleDateString(), 30, 100)

    // Total score circle
    const cx = 150, cy = 230, r = 70
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 8
    ctx.stroke()
    const pct = totalScore / 100
    ctx.beginPath()
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct)
    ctx.strokeStyle = totalScore >= 80 ? '#22c55e' : totalScore >= 60 ? '#eab308' : '#ef4444'
    ctx.lineWidth = 8
    ctx.stroke()
    ctx.fillStyle = '#f8fafc'
    ctx.font = 'bold 36px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(String(Math.round(totalScore)), cx, cy + 12)
    ctx.font = '12px sans-serif'
    ctx.fillStyle = '#94a3b8'
    ctx.fillText(t('scoring.total'), cx, cy + 32)
    ctx.textAlign = 'left'

    // Dimension bars
    const dims = [
      { key: 'speed', val: scores.speed },
      { key: 'rhythm', val: scores.rhythm },
      { key: 'intonation', val: scores.intonation },
      { key: 'smoothness', val: scores.smoothness },
      { key: 'completeness', val: scores.completeness },
    ]
    const bx = 300, by = 150, bw = 250, bh = 16, gap = 40
    dims.forEach((d, i) => {
      const y = by + i * gap
      ctx.fillStyle = '#94a3b8'
      ctx.font = '13px sans-serif'
      ctx.fillText(t(`scoring.${d.key}`), bx, y - 4)
      ctx.fillStyle = '#334155'
      ctx.fillRect(bx, y, bw, bh)
      ctx.fillStyle = '#3b82f6'
      ctx.fillRect(bx, y, bw * (d.val / 20), bh)
      ctx.fillStyle = '#f8fafc'
      ctx.font = '12px sans-serif'
      ctx.fillText(String(Math.round(d.val)), bx + bw + 8, y + 12)
    })

    // Watermark
    ctx.fillStyle = '#475569'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText('AI Music Practice', W - 20, H - 15)
    ctx.textAlign = 'left'
  }, [trackName, totalScore, scores, date, t])

  const download = useCallback(() => {
    generate()
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `practice-report-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [generate])

  return (
    <div className="space-y-3">
      <canvas ref={canvasRef} className="hidden" />
      <Button variant="outline" size="sm" onClick={download}>
        <Image className="mr-2 h-4 w-4" />
        {t('report.share')}
      </Button>
    </div>
  )
}
