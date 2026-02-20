export type ScoringDimension = 'speed' | 'rhythm' | 'intonation' | 'smoothness' | 'completeness'

export interface DimensionScore {
  dimension: ScoringDimension
  score: number // 0-20
  details: string
}

export interface ScoringResult {
  totalScore: number // 0-100
  dimensions: DimensionScore[]
  errors: ScoringError[]
  diagnostics: Diagnostic[]
}

export interface ScoringError {
  measureNumber: number
  beatPosition: number
  errorType: 'pitch' | 'rhythm' | 'missed' | 'extra'
  expectedNote: string | null
  actualNote: string | null
  deviationCents: number | null
  deviationMs: number | null
  severity: 'minor' | 'moderate' | 'severe'
  hand?: 'left' | 'right' | 'both'
}

export interface Diagnostic {
  dimension: ScoringDimension
  problem: string
  causeAnalysis: string
  solution: string
  measureStart: number
  measureEnd: number
  severityRank: number
}

export interface ToleranceConfig {
  pitchCents: number
  rhythmPercent: number
  speedPercent: number
}

export const TOLERANCE_LEVELS: Record<string, ToleranceConfig> = {
  beginner: { pitchCents: 50, rhythmPercent: 30, speedPercent: 40 },
  intermediate: { pitchCents: 25, rhythmPercent: 15, speedPercent: 20 },
  advanced: { pitchCents: 10, rhythmPercent: 8, speedPercent: 10 },
}
