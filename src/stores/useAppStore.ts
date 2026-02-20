import { create } from 'zustand'

export type InstrumentType = 'piano' | 'cello'
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced'
export type Language = 'en' | 'zh'

interface AppState {
  instrument: InstrumentType
  skillLevel: SkillLevel
  language: Language
  setInstrument: (instrument: InstrumentType) => void
  setSkillLevel: (level: SkillLevel) => void
  setLanguage: (lang: Language) => void
}

export const useAppStore = create<AppState>((set) => ({
  instrument: 'piano',
  skillLevel: 'beginner',
  language: 'en',
  setInstrument: (instrument) => set({ instrument }),
  setSkillLevel: (skillLevel) => set({ skillLevel }),
  setLanguage: (language) => set({ language }),
}))
