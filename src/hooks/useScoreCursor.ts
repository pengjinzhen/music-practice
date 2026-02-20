import { useEffect, useRef, useCallback, useState } from 'react'
import type { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay'

export interface ScoreCursorProps {
  osmd: OSMD | null
  currentMeasure: number
  isFollowing: boolean
  containerRef: React.RefObject<HTMLDivElement | null>
}

export function useScoreCursor({ osmd, currentMeasure, isFollowing, containerRef }: ScoreCursorProps) {
  const [cursorVisible, setCursorVisible] = useState(false)
  const prevMeasure = useRef(0)

  const showCursor = useCallback(() => {
    if (!osmd?.cursor) return
    osmd.cursor.show()
    setCursorVisible(true)
  }, [osmd])

  const hideCursor = useCallback(() => {
    if (!osmd?.cursor) return
    osmd.cursor.hide()
    setCursorVisible(false)
  }, [osmd])

  const moveTo = useCallback(
    (measure: number) => {
      if (!osmd?.cursor) return
      osmd.cursor.reset()
      for (let i = 0; i < measure - 1; i++) {
        if (!(osmd.cursor.iterator as unknown as { EndReached: boolean }).EndReached) {
          osmd.cursor.next()
        }
      }
    },
    [osmd],
  )

  // Auto-scroll to follow cursor
  useEffect(() => {
    if (!isFollowing || !containerRef.current || !osmd?.cursor) return
    if (currentMeasure === prevMeasure.current) return
    prevMeasure.current = currentMeasure

    moveTo(currentMeasure)

    const cursorEl = containerRef.current.querySelector('.cursor') as HTMLElement
    if (cursorEl) {
      cursorEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
    }
  }, [currentMeasure, isFollowing, containerRef, osmd, moveTo])

  return { cursorVisible, showCursor, hideCursor, moveTo }
}
