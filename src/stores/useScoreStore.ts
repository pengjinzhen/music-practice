import { create } from 'zustand'

interface ScoreState {
  currentMeasure: number
  currentNoteIndex: number
  totalMeasures: number
  isFollowing: boolean
  setCurrentPosition: (measure: number, noteIndex: number) => void
  setTotalMeasures: (total: number) => void
  setFollowing: (following: boolean) => void
  reset: () => void
}

export const useScoreStore = create<ScoreState>((set) => ({
  currentMeasure: 0,
  currentNoteIndex: 0,
  totalMeasures: 0,
  isFollowing: false,
  setCurrentPosition: (currentMeasure, currentNoteIndex) =>
    set({ currentMeasure, currentNoteIndex }),
  setTotalMeasures: (totalMeasures) => set({ totalMeasures }),
  setFollowing: (isFollowing) => set({ isFollowing }),
  reset: () => set({ currentMeasure: 0, currentNoteIndex: 0, isFollowing: false }),
}))
