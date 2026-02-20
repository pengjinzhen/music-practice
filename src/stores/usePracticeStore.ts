import { create } from 'zustand'

export type ScoringMode = 'piece' | 'single-note'
export type PracticeStatus = 'idle' | 'countdown' | 'recording' | 'paused' | 'completed'

interface PracticeState {
  trackId: string | null
  scoringMode: ScoringMode
  status: PracticeStatus
  targetBPM: number | null
  metronomeEnabled: boolean
  accompanimentEnabled: boolean
  elapsedSeconds: number
  setTrack: (trackId: string) => void
  setScoringMode: (mode: ScoringMode) => void
  setStatus: (status: PracticeStatus) => void
  setTargetBPM: (bpm: number | null) => void
  toggleMetronome: () => void
  toggleAccompaniment: () => void
  setElapsedSeconds: (seconds: number) => void
  reset: () => void
}

export const usePracticeStore = create<PracticeState>((set) => ({
  trackId: null,
  scoringMode: 'piece',
  status: 'idle',
  targetBPM: null,
  metronomeEnabled: false,
  accompanimentEnabled: false,
  elapsedSeconds: 0,
  setTrack: (trackId) => set({ trackId }),
  setScoringMode: (scoringMode) => set({ scoringMode }),
  setStatus: (status) => set({ status }),
  setTargetBPM: (targetBPM) => set({ targetBPM }),
  toggleMetronome: () => set((s) => ({ metronomeEnabled: !s.metronomeEnabled })),
  toggleAccompaniment: () => set((s) => ({ accompanimentEnabled: !s.accompanimentEnabled })),
  setElapsedSeconds: (elapsedSeconds) => set({ elapsedSeconds }),
  reset: () =>
    set({
      trackId: null,
      scoringMode: 'piece',
      status: 'idle',
      targetBPM: null,
      metronomeEnabled: false,
      accompanimentEnabled: false,
      elapsedSeconds: 0,
    }),
}))
