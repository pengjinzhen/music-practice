import { useRef, useEffect } from 'react'

interface Props {
  analyser: AnalyserNode | null
  isActive: boolean
}

export function WaveformDisplay({ analyser, isActive }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    if (!analyser || !isActive || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bufferLength = analyser.fftSize
    const dataArray = new Float32Array(bufferLength)

    const draw = () => {
      animRef.current = requestAnimationFrame(draw)
      analyser.getFloatTimeDomainData(dataArray)

      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      ctx.strokeStyle = 'hsl(var(--primary))'
      ctx.lineWidth = 2
      ctx.beginPath()

      const sliceWidth = w / bufferLength
      let x = 0
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i]
        const y = (v + 1) / 2 * h
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
        x += sliceWidth
      }
      ctx.stroke()
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [analyser, isActive])

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={100}
      className="w-full rounded-lg border bg-muted/30"
    />
  )
}
