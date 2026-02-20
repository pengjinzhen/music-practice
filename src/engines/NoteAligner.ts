import type { DetectedNote, ScoreNote } from '@/types/music'

export interface AlignedNote {
  scoreNote: ScoreNote
  detectedNote: DetectedNote | null
  status: 'correct' | 'wrong-pitch' | 'missed'
  pitchDeviation: number // cents
  timeDeviation: number // beats
}

export class NoteAligner {
  private toleranceCents: number
  private toleranceBeats: number

  constructor(toleranceCents: number = 50, toleranceBeats: number = 0.5) {
    this.toleranceCents = toleranceCents
    this.toleranceBeats = toleranceBeats
  }

  /** Align detected notes to score notes for a measure */
  align(scoreNotes: ScoreNote[], detectedNotes: DetectedNote[], measureStartTime: number, bpm: number): AlignedNote[] {
    const results: AlignedNote[] = []
    const used = new Set<number>()

    for (const sn of scoreNotes) {
      const expectedTime = measureStartTime + (sn.startBeat * 60) / bpm
      let bestMatch: DetectedNote | null = null
      let bestIdx = -1
      let bestScore = Infinity

      for (let i = 0; i < detectedNotes.length; i++) {
        if (used.has(i)) continue
        const dn = detectedNotes[i]
        const timeDiff = Math.abs(dn.timestamp - expectedTime)
        const pitchDiff = Math.abs(dn.midiNumber - sn.midiNumber)
        const score = timeDiff * 10 + pitchDiff
        if (score < bestScore) {
          bestScore = score
          bestMatch = dn
          bestIdx = i
        }
      }

      if (bestMatch && bestIdx >= 0) {
        used.add(bestIdx)
        const pitchDeviation = (bestMatch.midiNumber - sn.midiNumber) * 100 + bestMatch.cents
        const timeDeviation = ((bestMatch.timestamp - expectedTime) * bpm) / 60
        const pitchCorrect = Math.abs(bestMatch.midiNumber - sn.midiNumber) === 0 && Math.abs(bestMatch.cents) <= this.toleranceCents
        const isCorrect = pitchCorrect && Math.abs(timeDeviation) <= this.toleranceBeats

        results.push({
          scoreNote: sn,
          detectedNote: bestMatch,
          status: isCorrect ? 'correct' : 'wrong-pitch',
          pitchDeviation,
          timeDeviation,
        })
      } else {
        results.push({
          scoreNote: sn,
          detectedNote: null,
          status: 'missed',
          pitchDeviation: 0,
          timeDeviation: 0,
        })
      }
    }

    return results
  }

  setTolerance(cents: number, beats: number): void {
    this.toleranceCents = cents
    this.toleranceBeats = beats
  }
}
