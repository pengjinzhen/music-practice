import { create } from 'zustand'

interface DetectedNote {
  frequency: number
  midiNumber: number
  confidence: number
  timestamp: number
}

interface AudioState {
  isCapturing: boolean
  currentPitch: DetectedNote | null
  currentBPM: number | null
  audioLevel: number
  setCapturing: (capturing: boolean) => void
  setCurrentPitch: (note: DetectedNote | null) => void
  setCurrentBPM: (bpm: number | null) => void
  setAudioLevel: (level: number) => void
}

export const useAudioStore = create<AudioState>((set) => ({
  isCapturing: false,
  currentPitch: null,
  currentBPM: null,
  audioLevel: 0,
  setCapturing: (isCapturing) => set({ isCapturing }),
  setCurrentPitch: (currentPitch) => set({ currentPitch }),
  setCurrentBPM: (currentBPM) => set({ currentBPM }),
  setAudioLevel: (audioLevel) => set({ audioLevel }),
}))
