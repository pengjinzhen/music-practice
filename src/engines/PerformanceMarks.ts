export interface PerformanceMark {
  type: 'fingering' | 'bowing' | 'pedal' | 'dynamic' | 'articulation'
  value: string
  measure: number
  beat: number
  staff?: number
}

/** Extract performance marks from MusicXML DOM */
export function extractPerformanceMarks(doc: Document): PerformanceMark[] {
  const marks: PerformanceMark[] = []
  const measures = doc.querySelectorAll('part measure')
  let measureNum = 0

  measures.forEach((measure) => {
    measureNum++

    // Fingering
    measure.querySelectorAll('technical fingering').forEach((el) => {
      marks.push({
        type: 'fingering',
        value: el.textContent?.trim() || '',
        measure: measureNum,
        beat: 1,
      })
    })

    // Bowing (up-bow / down-bow)
    measure.querySelectorAll('technical up-bow').forEach(() => {
      marks.push({ type: 'bowing', value: 'up', measure: measureNum, beat: 1 })
    })
    measure.querySelectorAll('technical down-bow').forEach(() => {
      marks.push({ type: 'bowing', value: 'down', measure: measureNum, beat: 1 })
    })

    // Pedal
    measure.querySelectorAll('direction-type pedal').forEach((el) => {
      const pedalType = el.getAttribute('type') || 'start'
      marks.push({ type: 'pedal', value: pedalType, measure: measureNum, beat: 1 })
    })

    // Dynamics
    measure.querySelectorAll('direction-type dynamics').forEach((el) => {
      const dynamic = el.children[0]?.tagName || ''
      if (dynamic) {
        marks.push({ type: 'dynamic', value: dynamic, measure: measureNum, beat: 1 })
      }
    })

    // Articulations
    const artTypes = ['staccato', 'accent', 'tenuto', 'fermata']
    for (const art of artTypes) {
      measure.querySelectorAll(`articulations ${art}`).forEach(() => {
        marks.push({ type: 'articulation', value: art, measure: measureNum, beat: 1 })
      })
    }
  })

  return marks
}
