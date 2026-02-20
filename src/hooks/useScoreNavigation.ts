import { useCallback, useRef, useState, useMemo, useEffect } from 'react'
import type { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay'

export interface ScoreNavigationProps {
  osmd: OSMD | null
  containerRef: React.RefObject<HTMLDivElement | null>
}

export function useScoreNavigation({ osmd, containerRef }: ScoreNavigationProps) {
  const [zoom, setZoom] = useState(1.0)
  const [currentPage, setCurrentPage] = useState(1)
  const pinchStartDistance = useRef(0)
  const pinchStartZoom = useRef(1.0)

  // Use a mutable ref to avoid react-hooks/immutability on osmd
  const osmdRef = useRef(osmd)
  useEffect(() => { osmdRef.current = osmd }, [osmd])

  const applyZoom = useCallback((newZoom: number) => {
    setZoom(newZoom)
    const inst = osmdRef.current
    if (inst) {
      inst.zoom = newZoom
      inst.render()
    }
  }, [])

  const zoomIn = useCallback(() => {
    setZoom((prev) => {
      const newZoom = Math.min(prev + 0.1, 2.5)
      const inst = osmdRef.current
      if (inst) { inst.zoom = newZoom; inst.render() }
      return newZoom
    })
  }, [])

  const zoomOut = useCallback(() => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - 0.1, 0.3)
      const inst = osmdRef.current
      if (inst) { inst.zoom = newZoom; inst.render() }
      return newZoom
    })
  }, [])

  const resetZoom = useCallback(() => {
    applyZoom(1.0)
  }, [applyZoom])

  const scrollToMeasure = useCallback(
    (measureNumber: number) => {
      if (!osmdRef.current || !containerRef.current) return
      const measureEls = containerRef.current.querySelectorAll('.vf-stave')
      const target = measureEls[measureNumber - 1]
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    },
    [containerRef],
  )

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        pinchStartDistance.current = Math.sqrt(dx * dx + dy * dy)
        pinchStartZoom.current = zoom
      }
    },
    [zoom],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const distance = Math.sqrt(dx * dx + dy * dy)
        const scale = distance / pinchStartDistance.current
        const newZoom = Math.max(0.3, Math.min(2.5, pinchStartZoom.current * scale))
        applyZoom(newZoom)
      }
    },
    [applyZoom],
  )

  return useMemo(() => ({
    zoom,
    currentPage,
    setCurrentPage,
    zoomIn,
    zoomOut,
    resetZoom,
    scrollToMeasure,
    handleTouchStart,
    handleTouchMove,
  }), [zoom, currentPage, zoomIn, zoomOut, resetZoom, scrollToMeasure, handleTouchStart, handleTouchMove])
}
