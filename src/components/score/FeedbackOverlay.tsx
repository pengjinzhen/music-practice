/* eslint-disable react-refresh/only-export-components */
import { useState, useCallback, useRef, useEffect } from 'react'

export type FeedbackType = 'sharp' | 'flat' | 'fast' | 'slow' | 'correct' | 'missed'

export interface FeedbackBubble {
  id: number
  type: FeedbackType
  message: string
  x: number
  y: number
  timestamp: number
}

const FEEDBACK_MESSAGES: Record<FeedbackType, string> = {
  sharp: '偏高 ↑',
  flat: '偏低 ↓',
  fast: '过快 →',
  slow: '过慢 ←',
  correct: '✓',
  missed: '漏弹',
}

const FEEDBACK_COLORS: Record<FeedbackType, string> = {
  sharp: 'bg-orange-500',
  flat: 'bg-blue-500',
  fast: 'bg-yellow-500',
  slow: 'bg-purple-500',
  correct: 'bg-green-500',
  missed: 'bg-gray-500',
}

let nextId = 0

export function useRealtimeFeedback(displayDurationMs: number = 1500) {
  const [bubbles, setBubbles] = useState<FeedbackBubble[]>([])
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  const addFeedback = useCallback(
    (type: FeedbackType, x: number = 50, y: number = 50) => {
      const id = nextId++
      const bubble: FeedbackBubble = {
        id,
        type,
        message: FEEDBACK_MESSAGES[type],
        x,
        y,
        timestamp: Date.now(),
      }
      setBubbles((prev) => [...prev.slice(-5), bubble])

      const timer = setTimeout(() => {
        setBubbles((prev) => prev.filter((b) => b.id !== id))
        timersRef.current.delete(id)
      }, displayDurationMs)
      timersRef.current.set(id, timer)
    },
    [displayDurationMs],
  )

  const clearAll = useCallback(() => {
    for (const timer of timersRef.current.values()) clearTimeout(timer)
    timersRef.current.clear()
    setBubbles([])
  }, [])

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      for (const timer of timers.values()) clearTimeout(timer)
    }
  }, [])

  return { bubbles, addFeedback, clearAll }
}

export function FeedbackOverlay({ bubbles }: { bubbles: FeedbackBubble[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 20 }}>
      {bubbles.map((b) => (
        <div
          key={b.id}
          className={`absolute rounded-full px-3 py-1 text-xs font-bold text-white shadow-lg ${FEEDBACK_COLORS[b.type]} animate-bounce`}
          style={{ left: `${b.x}%`, top: `${b.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          {b.message}
        </div>
      ))}
    </div>
  )
}
