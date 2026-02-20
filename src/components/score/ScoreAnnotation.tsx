import { useEffect, useRef } from 'react'

export type AnnotationType = 'correct' | 'error' | 'missed'

export interface NoteAnnotation {
  measure: number
  noteIndex: number
  type: AnnotationType
  message?: string
}

const COLORS: Record<AnnotationType, string> = {
  correct: 'rgba(34, 197, 94, 0.3)',
  error: 'rgba(239, 68, 68, 0.4)',
  missed: 'rgba(156, 163, 175, 0.3)',
}

export interface ScoreAnnotationProps {
  containerRef: React.RefObject<HTMLDivElement | null>
  annotations: NoteAnnotation[]
}

export function ScoreAnnotation({ containerRef, annotations }: ScoreAnnotationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return
    const container = containerRef.current
    const canvas = canvasRef.current

    canvas.width = container.scrollWidth
    canvas.height = container.scrollHeight
    canvas.style.width = `${container.scrollWidth}px`
    canvas.style.height = `${container.scrollHeight}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Find stave elements to overlay annotations
    const staves = container.querySelectorAll('.vf-stave')
    const measureMap = new Map<number, DOMRect>()
    staves.forEach((stave, idx) => {
      measureMap.set(idx + 1, stave.getBoundingClientRect())
    })

    const containerRect = container.getBoundingClientRect()

    for (const ann of annotations) {
      const rect = measureMap.get(ann.measure)
      if (!rect) continue

      const x = rect.left - containerRect.left + container.scrollLeft
      const y = rect.top - containerRect.top + container.scrollTop
      const w = rect.width
      const h = rect.height

      ctx.fillStyle = COLORS[ann.type]
      ctx.fillRect(x, y, w, h)

      if (ann.type === 'error') {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)'
        ctx.lineWidth = 2
        ctx.strokeRect(x, y, w, h)
      }
    }
  }, [containerRef, annotations])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute left-0 top-0"
      style={{ zIndex: 10 }}
    />
  )
}
