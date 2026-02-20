import type { ScoreNote, DetectedNote, MeasureInfo } from '@/types/music'
import type { ToleranceConfig } from '@/types/scoring'
import { IntonationScorer } from './IntonationScorer'

export interface HandScore {
  hand: 'left' | 'right'
  intonation: { score: number; details: string }
  noteCount: number
  correctCount: number
}

export class PianoMultiVoiceScorer {
  private intonationScorer = new IntonationScorer()

  /** Score left and right hand independently */
  scoreByHand(
    measures: MeasureInfo[],
    detectedNotes: DetectedNote[],
    tolerance: ToleranceConfig,
  ): { left: HandScore; right: HandScore; chordCompleteness: number } {
    const leftNotes: ScoreNote[] = []
    const rightNotes: ScoreNote[] = []

    for (const m of measures) {
      for (const n of m.notes) {
        if (n.staff === 1) rightNotes.push(n)
        else leftNotes.push(n)
      }
    }

    const left = this.scoreHand('left', leftNotes, detectedNotes, tolerance)
    const right = this.scoreHand('right', rightNotes, detectedNotes, tolerance)
    const chordCompleteness = this.scoreChords(measures, detectedNotes)

    return { left, right, chordCompleteness }
  }

  private scoreHand(
    hand: 'left' | 'right',
    scoreNotes: ScoreNote[],
    detectedNotes: DetectedNote[],
    tolerance: ToleranceConfig,
  ): HandScore {
    let correctCount = 0
    const results: { correct: boolean }[] = []

    for (const sn of scoreNotes) {
      const match = detectedNotes.find(
        (dn) => Math.abs(dn.midiNumber - sn.midiNumber) === 0,
      )
      const correct = !!match
      results.push({ correct })
      if (correct) correctCount++
    }

    const intonation = this.intonationScorer.score({
      noteResults: results,
      isPiano: true,
      tolerance,
    })

    return { hand, intonation, noteCount: scoreNotes.length, correctCount }
  }

  /** Check chord completeness: all notes in a chord should be played */
  private scoreChords(measures: MeasureInfo[], detectedNotes: DetectedNote[]): number {
    let totalChords = 0
    let completeChords = 0

    for (const m of measures) {
      // Group notes by startBeat to find chords
      const beatGroups = new Map<number, ScoreNote[]>()
      for (const n of m.notes) {
        const key = Math.round(n.startBeat * 100)
        const group = beatGroups.get(key) || []
        group.push(n)
        beatGroups.set(key, group)
      }

      for (const [, group] of beatGroups) {
        if (group.length < 2) continue // Not a chord
        totalChords++
        const allPlayed = group.every((sn) =>
          detectedNotes.some((dn) => dn.midiNumber === sn.midiNumber),
        )
        if (allPlayed) completeChords++
      }
    }

    return totalChords === 0 ? 1 : completeChords / totalChords
  }
}
