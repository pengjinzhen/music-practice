import type { ScoringResult, DimensionScore, ScoringError, Diagnostic, ToleranceConfig } from '@/types/scoring'
import type { MeasureInfo, DetectedNote, BPM } from '@/types/music'
import { SpeedScorer } from './SpeedScorer'
import { RhythmScorer } from './RhythmScorer'
import { IntonationScorer } from './IntonationScorer'
import { SmoothnessScorer } from './SmoothnessScorer'
import { CompletenessScorer } from './CompletenessScorer'
import { NoteAligner, type AlignedNote } from '../NoteAligner'

export interface ScoringInput {
  measures: MeasureInfo[]
  detectedNotes: DetectedNote[]
  targetBPM: BPM
  detectedBPMs: BPM[]
  tolerance: ToleranceConfig
  isPiano: boolean
}

export class ScoringEngine {
  private speedScorer = new SpeedScorer()
  private rhythmScorer = new RhythmScorer()
  private intonationScorer = new IntonationScorer()
  private smoothnessScorer = new SmoothnessScorer()
  private completenessScorer = new CompletenessScorer()
  private noteAligner = new NoteAligner()

  score(input: ScoringInput): ScoringResult {
    const { measures, detectedNotes, targetBPM, tolerance } = input
    this.noteAligner.setTolerance(tolerance.pitchCents, tolerance.rhythmPercent / 100)

    // Align notes per measure
    const allAligned: AlignedNote[] = []
    const errors: ScoringError[] = []
    const playedMeasures = new Set<number>()

    for (const measure of measures) {
      const measureNotes = detectedNotes.filter(
        (n) => n.timestamp >= measure.startTime && n.timestamp <= measure.endTime,
      )
      if (measureNotes.length > 0) playedMeasures.add(measure.number)

      const aligned = this.noteAligner.align(measure.notes, measureNotes, measure.startTime, targetBPM)
      allAligned.push(...aligned)

      for (const a of aligned) {
        if (a.status !== 'correct') {
          errors.push({
            measureNumber: measure.number,
            beatPosition: a.scoreNote.startBeat,
            errorType: a.status === 'missed' ? 'missed' : 'pitch',
            expectedNote: String(a.scoreNote.midiNumber),
            actualNote: a.detectedNote ? String(a.detectedNote.midiNumber) : null,
            deviationCents: a.pitchDeviation || null,
            deviationMs: null,
            severity: a.status === 'missed' ? 'severe' : Math.abs(a.pitchDeviation) > 100 ? 'severe' : 'minor',
          })
        }
      }
    }

    const dimensions = this.scoreDimensions(input, allAligned, playedMeasures)
    const totalScore = dimensions.reduce((sum, d) => sum + d.score, 0)
    const diagnostics = this.generateDiagnostics(dimensions, errors, measures)

    return { totalScore, dimensions, errors, diagnostics }
  }

  private scoreDimensions(input: ScoringInput, aligned: AlignedNote[], playedMeasures: Set<number>): DimensionScore[] {
    const speed = this.speedScorer.score({
      targetBPM: input.targetBPM,
      detectedBPMs: input.detectedBPMs,
      tolerance: input.tolerance,
    })

    const rhythm = this.rhythmScorer.score({
      timeDeviations: aligned.filter((a) => a.detectedNote).map((a) => a.timeDeviation),
      tolerance: input.tolerance,
    })

    const intonation = this.intonationScorer.score({
      noteResults: aligned.filter((a) => a.detectedNote).map((a) => ({
        correct: a.status === 'correct',
        deviationCents: a.pitchDeviation,
      })),
      isPiano: input.isPiano,
      tolerance: input.tolerance,
    })

    const smoothness = this.smoothnessScorer.score({
      onsetTimestamps: input.detectedNotes.map((n) => n.timestamp),
      expectedDurations: [],
      totalDuration: input.measures.length > 0
        ? input.measures[input.measures.length - 1].endTime - input.measures[0].startTime
        : 0,
    })

    const totalNotes = input.measures.reduce((sum, m) => sum + m.notes.length, 0)
    const skippedMeasures = input.measures
      .filter((m) => !playedMeasures.has(m.number))
      .map((m) => m.number)

    const completeness = this.completenessScorer.score({
      totalScoreNotes: totalNotes,
      detectedNotes: input.detectedNotes.length,
      skippedMeasures,
      totalMeasures: input.measures.length,
    })

    return [
      { dimension: 'speed', ...speed },
      { dimension: 'rhythm', ...rhythm },
      { dimension: 'intonation', ...intonation },
      { dimension: 'smoothness', ...smoothness },
      { dimension: 'completeness', ...completeness },
    ]
  }

  private generateDiagnostics(dimensions: DimensionScore[], errors: ScoringError[], measures: MeasureInfo[]): Diagnostic[] {
    const diagnostics: Diagnostic[] = []
    const sorted = [...dimensions].sort((a, b) => a.score - b.score)

    for (const dim of sorted) {
      if (dim.score >= 16) continue // Good enough, skip
      const relatedErrors = errors.filter((e) => {
        if (dim.dimension === 'intonation') return e.errorType === 'pitch'
        if (dim.dimension === 'completeness') return e.errorType === 'missed'
        return true
      })

      const measureStart = relatedErrors.length > 0 ? Math.min(...relatedErrors.map((e) => e.measureNumber)) : 1
      const measureEnd = relatedErrors.length > 0 ? Math.max(...relatedErrors.map((e) => e.measureNumber)) : measures.length

      diagnostics.push({
        dimension: dim.dimension,
        problem: `${dim.dimension} score is ${dim.score}/20`,
        causeAnalysis: dim.details,
        solution: this.getSolution(dim.dimension),
        measureStart,
        measureEnd,
        severityRank: 20 - dim.score,
      })
    }

    return diagnostics.sort((a, b) => b.severityRank - a.severityRank)
  }

  private getSolution(dimension: string): string {
    const solutions: Record<string, string> = {
      speed: 'Practice with metronome at a slower tempo, gradually increase speed',
      rhythm: 'Focus on counting beats, use metronome for steady rhythm',
      intonation: 'Practice scales and intervals, use tuner for reference',
      smoothness: 'Practice transitions between notes, avoid unnecessary pauses',
      completeness: 'Practice difficult sections separately before playing the full piece',
    }
    return solutions[dimension] || 'Continue practicing'
  }
}
