import { describe, it, expect } from 'vitest'
import { ScoreParser } from '@/engines/ScoreParser'
import { DifficultyCalculator } from '@/engines/DifficultyCalculator'
import { extractPerformanceMarks } from '@/engines/PerformanceMarks'

// 辅助函数：构建最小 MusicXML
function buildMusicXML(opts: {
  title?: string
  composer?: string
  measures?: string
  partId?: string
  partName?: string
  extraParts?: string
} = {}): string {
  const title = opts.title ? `<work><work-title>${opts.title}</work-title></work>` : ''
  const composer = opts.composer
    ? `<identification><creator type="composer">${opts.composer}</creator></identification>`
    : ''
  const pid = opts.partId || 'P1'
  const pname = opts.partName || 'Piano'
  const measures = opts.measures || ''
  const extraParts = opts.extraParts || ''
  return `<?xml version="1.0"?>
<score-partwise>
  ${title}
  ${composer}
  <part-list>
    <score-part id="${pid}"><part-name>${pname}</part-name></score-part>
    ${extraParts ? '<score-part id="P2"><part-name>Cello</part-name></score-part>' : ''}
  </part-list>
  <part id="${pid}">${measures}</part>
  ${extraParts}
</score-partwise>`
}

describe('ScoreParser', () => {
  const parser = new ScoreParser()

  it('6.1 解析包含标题和作曲家的 MusicXML', () => {
    const xml = buildMusicXML({ title: 'Sonata', composer: 'Mozart' })
    const result = parser.parse(xml)
    expect(result.title).toBe('Sonata')
    expect(result.composer).toBe('Mozart')
  })

  it('6.2 解析无效 XML 抛出错误', () => {
    expect(() => parser.parse('<invalid><unclosed')).toThrow('Invalid MusicXML')
  })

  it('6.3 解析无标题的 MusicXML 返回 Untitled', () => {
    const xml = buildMusicXML({})
    const result = parser.parse(xml)
    expect(result.title).toBe('Untitled')
  })

  it('6.4 正确解析拍号信息', () => {
    const xml = buildMusicXML({
      measures: `<measure><attributes>
        <divisions>1</divisions>
        <time><beats>3</beats><beat-type>4</beat-type></time>
      </attributes></measure>`,
    })
    const result = parser.parse(xml)
    expect(result.timeSignatures).toHaveLength(1)
    expect(result.timeSignatures[0]).toEqual({ beats: 3, beatType: 4, measure: 1 })
  })

  it('6.5 正确解析调号信息', () => {
    const xml = buildMusicXML({
      measures: `<measure><attributes>
        <key><fifths>-3</fifths><mode>minor</mode></key>
      </attributes></measure>`,
    })
    const result = parser.parse(xml)
    expect(result.keySignatures).toHaveLength(1)
    expect(result.keySignatures[0]).toEqual({ fifths: -3, mode: 'minor', measure: 1 })
  })

  it('6.6 正确解析速度标记', () => {
    const xml = buildMusicXML({
      measures: `<measure>
        <direction><sound tempo="132"/></direction>
      </measure>`,
    })
    const result = parser.parse(xml)
    expect(result.tempos).toHaveLength(1)
    expect(result.tempos[0].bpm).toBe(132)
  })

  it('6.7 正确解析音符的 MIDI 编号', () => {
    // C4 = MIDI 60
    const xml = buildMusicXML({
      measures: `<measure><attributes><divisions>1</divisions></attributes>
        <note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><voice>1</voice><staff>1</staff></note>
      </measure>`,
    })
    const result = parser.parse(xml)
    expect(result.parts[0].measures[0].notes[0].midiNumber).toBe(60)
  })

  it('6.8 正确解析和弦', () => {
    const xml = buildMusicXML({
      measures: `<measure><attributes><divisions>1</divisions></attributes>
        <note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><voice>1</voice><staff>1</staff></note>
        <note><chord/><pitch><step>E</step><octave>4</octave></pitch><duration>1</duration><voice>1</voice><staff>1</staff></note>
      </measure>`,
    })
    const result = parser.parse(xml)
    const notes = result.parts[0].measures[0].notes
    expect(notes).toHaveLength(2)
    expect(notes[0].startBeat).toBe(0)
    expect(notes[1].startBeat).toBe(0) // 和弦音符共享起始拍
  })

  it('6.9 正确解析休止符（不生成音符）', () => {
    const xml = buildMusicXML({
      measures: `<measure><attributes><divisions>1</divisions></attributes>
        <note><rest/><duration>1</duration><voice>1</voice><staff>1</staff></note>
      </measure>`,
    })
    const result = parser.parse(xml)
    expect(result.parts[0].measures[0].notes).toHaveLength(0)
  })

  it('6.10 正确处理 forward/backup 元素', () => {
    const xml = buildMusicXML({
      measures: `<measure><attributes><divisions>1</divisions></attributes>
        <note><pitch><step>C</step><octave>4</octave></pitch><duration>2</duration><voice>1</voice><staff>1</staff></note>
        <backup><duration>2</duration></backup>
        <note><pitch><step>E</step><octave>3</octave></pitch><duration>2</duration><voice>2</voice><staff>2</staff></note>
      </measure>`,
    })
    const result = parser.parse(xml)
    const notes = result.parts[0].measures[0].notes
    expect(notes).toHaveLength(2)
    expect(notes[0].startBeat).toBe(0)
    expect(notes[1].startBeat).toBe(0) // backup 后回到起始位置
  })

  it('6.11 解析多声部乐谱', () => {
    const xml = buildMusicXML({
      measures: '<measure></measure>',
      extraParts: '<part id="P2"><measure></measure></part>',
    })
    const result = parser.parse(xml)
    expect(result.parts).toHaveLength(2)
  })
})

describe('DifficultyCalculator', () => {
  const calc = new DifficultyCalculator()
  const parser = new ScoreParser()

  it('6.12 空乐谱计算不崩溃', () => {
    const xml = buildMusicXML({ measures: '<measure></measure>' })
    const parsed = parser.parse(xml)
    const result = calc.calculate(parsed)
    expect(result.score).toBeGreaterThanOrEqual(1)
    expect(result.score).toBeLessThanOrEqual(10)
    expect(result.level).toBe('beginner')
  })

  it('6.13 简单乐谱为 beginner', () => {
    // 4小节，每小节1个音符，窄音域
    const noteXml = `<note><pitch><step>C</step><octave>4</octave></pitch>
      <duration>4</duration><voice>1</voice><staff>1</staff></note>`
    const measures = Array.from({ length: 4 }, (_, i) =>
      i === 0
        ? `<measure><attributes><divisions>1</divisions></attributes>${noteXml}</measure>`
        : `<measure>${noteXml}</measure>`
    ).join('')
    const xml = buildMusicXML({ measures })
    const parsed = parser.parse(xml)
    const result = calc.calculate(parsed)
    expect(result.level).toBe('beginner')
  })

  it('6.14 复杂乐谱为 advanced', () => {
    // 构造高密度、宽音域、多节奏型的乐谱
    const notes = Array.from({ length: 30 }, (_, i) => {
      const octave = 2 + (i % 5)
      const steps = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
      const step = steps[i % 7]
      const dur = [1, 2, 3, 4, 6, 8][i % 6]
      return `<note><pitch><step>${step}</step><octave>${octave}</octave></pitch>
        <duration>${dur}</duration><voice>${(i % 2) + 1}</voice><staff>1</staff></note>`
    }).join('')
    const xml = buildMusicXML({
      measures: `<measure><attributes><divisions>4</divisions></attributes>
        <direction><sound tempo="180"/></direction>${notes}</measure>`,
    })
    const parsed = parser.parse(xml)
    const result = calc.calculate(parsed)
    expect(result.level).toBe('advanced')
  })
})

describe('extractPerformanceMarks', () => {
  it('6.15 提取力度标记', () => {
    const xml = `<?xml version="1.0"?>
<score-partwise>
  <part-list><score-part id="P1"><part-name>P</part-name></score-part></part-list>
  <part id="P1">
    <measure>
      <direction><direction-type><dynamics><ff/></dynamics></direction-type></direction>
    </measure>
  </part>
</score-partwise>`
    const doc = new DOMParser().parseFromString(xml, 'application/xml')
    const marks = extractPerformanceMarks(doc)
    expect(marks.some(m => m.type === 'dynamic' && m.value === 'ff')).toBe(true)
  })
})
