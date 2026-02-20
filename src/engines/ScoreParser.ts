import type { MidiNumber, ScoreNote, MeasureInfo } from '@/types/music'

export interface ParsedScore {
  title: string
  composer: string
  parts: ParsedPart[]
  timeSignatures: TimeSignature[]
  keySignatures: KeySignature[]
  tempos: TempoMark[]
  totalMeasures: number
}

export interface ParsedPart {
  id: string
  name: string
  measures: MeasureInfo[]
}

export interface TimeSignature {
  beats: number
  beatType: number
  measure: number
}

export interface KeySignature {
  fifths: number
  mode: 'major' | 'minor'
  measure: number
}

export interface TempoMark {
  bpm: number
  measure: number
  beat: number
}

export class ScoreParser {
  parse(xmlString: string): ParsedScore {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlString, 'application/xml')
    const errorNode = doc.querySelector('parsererror')
    if (errorNode) {
      throw new Error('Invalid MusicXML: ' + errorNode.textContent)
    }

    const title = this.getText(doc, 'work-title') || this.getText(doc, 'movement-title') || 'Untitled'
    const composer = this.getComposer(doc)
    const partElements = doc.querySelectorAll('part')
    const partListItems = doc.querySelectorAll('part-list score-part')

    const parts: ParsedPart[] = []
    const timeSignatures: TimeSignature[] = []
    const keySignatures: KeySignature[] = []
    const tempos: TempoMark[] = []
    let totalMeasures = 0

    partElements.forEach((partEl, idx) => {
      const partId = partEl.getAttribute('id') || `P${idx + 1}`
      const partName = partListItems[idx]?.querySelector('part-name')?.textContent?.trim() || partId
      const { measures, timeSigs, keySigs, tempoMarks } = this.parsePart(partEl)
      parts.push({ id: partId, name: partName, measures })
      if (idx === 0) {
        timeSignatures.push(...timeSigs)
        keySignatures.push(...keySigs)
        tempos.push(...tempoMarks)
        totalMeasures = measures.length
      }
    })

    return { title, composer, parts, timeSignatures, keySignatures, tempos, totalMeasures }
  }

  private getText(doc: Document, tag: string): string {
    return doc.querySelector(tag)?.textContent?.trim() || ''
  }

  private getComposer(doc: Document): string {
    const creators = doc.querySelectorAll('identification creator')
    for (const c of creators) {
      if (c.getAttribute('type') === 'composer') return c.textContent?.trim() || ''
    }
    return ''
  }

  private parsePart(partEl: Element) {
    const measures: MeasureInfo[] = []
    const timeSigs: TimeSignature[] = []
    const keySigs: KeySignature[] = []
    const tempoMarks: TempoMark[] = []
    let divisions = 1
    let currentBeats = 4
    let currentBeatType = 4

    const measureEls = partEl.querySelectorAll('measure')
    measureEls.forEach((mEl, mIdx) => {
      const measureNum = mIdx + 1
      const attributes = mEl.querySelector('attributes')
      if (attributes) {
        const div = attributes.querySelector('divisions')
        if (div) divisions = parseInt(div.textContent || '1')
        const time = attributes.querySelector('time')
        if (time) {
          currentBeats = parseInt(time.querySelector('beats')?.textContent || '4')
          currentBeatType = parseInt(time.querySelector('beat-type')?.textContent || '4')
          timeSigs.push({ beats: currentBeats, beatType: currentBeatType, measure: measureNum })
        }
        const key = attributes.querySelector('key')
        if (key) {
          const fifths = parseInt(key.querySelector('fifths')?.textContent || '0')
          const mode = (key.querySelector('mode')?.textContent as 'major' | 'minor') || 'major'
          keySigs.push({ fifths, mode, measure: measureNum })
        }
      }

      // Parse tempo from direction/sound
      const directions = mEl.querySelectorAll('direction')
      for (const dir of directions) {
        const sound = dir.querySelector('sound')
        const tempo = sound?.getAttribute('tempo')
        if (tempo) tempoMarks.push({ bpm: parseFloat(tempo), measure: measureNum, beat: 1 })
      }

      const notes = this.parseMeasureNotes(mEl, divisions)
      measures.push({ number: measureNum, startTime: 0, endTime: 0, notes })
    })

    return { measures, timeSigs, keySigs, tempoMarks }
  }

  private parseMeasureNotes(measureEl: Element, divisions: number): ScoreNote[] {
    const notes: ScoreNote[] = []
    let currentBeat = 0

    for (const el of measureEl.children) {
      if (el.tagName === 'forward') {
        currentBeat += parseInt(el.querySelector('duration')?.textContent || '0') / divisions
      } else if (el.tagName === 'backup') {
        currentBeat -= parseInt(el.querySelector('duration')?.textContent || '0') / divisions
      } else if (el.tagName === 'note') {
        const isRest = el.querySelector('rest') !== null
        const isChord = el.querySelector('chord') !== null
        const duration = parseInt(el.querySelector('duration')?.textContent || '0')
        const durationBeats = duration / divisions
        const voice = parseInt(el.querySelector('voice')?.textContent || '1')
        const staff = parseInt(el.querySelector('staff')?.textContent || '1')
        const tied = el.querySelector('tie[type="stop"]') !== null

        if (isChord) {
          // Chord notes share the same start beat as previous note
          const prevBeat = currentBeat - (notes.length > 0 ? notes[notes.length - 1].durationBeats : 0)
          if (!isRest) {
            const midi = this.pitchToMidi(el)
            if (midi !== null) {
              notes.push({ midiNumber: midi, startBeat: prevBeat, durationBeats, voice, staff, tied })
            }
          }
        } else {
          if (!isRest) {
            const midi = this.pitchToMidi(el)
            if (midi !== null) {
              notes.push({ midiNumber: midi, startBeat: currentBeat, durationBeats, voice, staff, tied })
            }
          }
          currentBeat += durationBeats
        }
      }
    }
    return notes
  }

  private pitchToMidi(noteEl: Element): MidiNumber | null {
    const pitch = noteEl.querySelector('pitch')
    if (!pitch) return null
    const step = pitch.querySelector('step')?.textContent || 'C'
    const octave = parseInt(pitch.querySelector('octave')?.textContent || '4')
    const alter = parseInt(pitch.querySelector('alter')?.textContent || '0')
    const stepMap: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
    return (octave + 1) * 12 + (stepMap[step] ?? 0) + alter
  }
}
