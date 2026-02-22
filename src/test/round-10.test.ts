import { describe, it, expect } from 'vitest'
import {
  midiToFrequency,
  frequencyToMidi,
  midiToNoteName,
  noteNameToMidi,
  centsBetween,
  isInTune,
} from '@/utils/music'
import { InstrumentFactory } from '@/instruments/InstrumentFactory'
import { Piano } from '@/instruments/Piano'
import { Cello } from '@/instruments/Cello'

describe('music.ts 工具函数', () => {
  it('10.3 midiToFrequency A4=69 返回 440', () => {
    expect(midiToFrequency(69)).toBeCloseTo(440, 2)
  })

  it('10.4 frequencyToMidi 440Hz 返回 69', () => {
    expect(frequencyToMidi(440)).toBeCloseTo(69, 2)
  })

  it('10.5 midiToNoteName 60 返回 C4', () => {
    expect(midiToNoteName(60)).toBe('C4')
  })

  it('10.6 noteNameToMidi C4 返回 60', () => {
    expect(noteNameToMidi('C4')).toBe(60)
  })

  it('10.7 noteNameToMidi 无效输入返回 null', () => {
    expect(noteNameToMidi('invalid')).toBeNull()
    expect(noteNameToMidi('X4')).toBeNull()
    expect(noteNameToMidi('')).toBeNull()
  })

  it('10.8 centsBetween 相同频率返回 0', () => {
    expect(centsBetween(440, 440)).toBe(0)
  })

  it('10.9 isInTune 在容差内返回 true', () => {
    expect(isInTune(440, 69, 50)).toBe(true)
    // 偏差超过容差
    expect(isInTune(460, 69, 10)).toBe(false)
  })
})

describe('InstrumentFactory', () => {
  it('10.10 创建 piano 和 cello', () => {
    const piano = InstrumentFactory.create('piano')
    expect(piano.getType()).toBe('piano')
    expect(piano.getName()).toBe('Piano')
    const cello = InstrumentFactory.create('cello')
    expect(cello.getType()).toBe('cello')
    expect(cello.getName()).toBe('Cello')
  })

  it('10.11 未知类型抛出错误', () => {
    expect(() => InstrumentFactory.create('guitar' as never)).toThrow('Unknown instrument type')
  })
})

describe('Piano', () => {
  const piano = new Piano()

  it('10.12 getStaffHint 高音谱号/低音谱号', () => {
    expect(piano.getStaffHint(60)).toBe('treble')
    expect(piano.getStaffHint(59)).toBe('bass')
    expect(piano.getStaffHint(72)).toBe('treble')
    expect(piano.getStaffHint(40)).toBe('bass')
  })
})

describe('Cello', () => {
  const cello = new Cello()

  it('10.13 identifyString 正确识别弦', () => {
    // A3 = 220Hz -> A 弦
    const aString = cello.identifyString(220)
    expect(aString).not.toBeNull()
    expect(aString!.name).toBe('A')
    // C2 = 65.41Hz -> C 弦
    const cString = cello.identifyString(65.41)
    expect(cString).not.toBeNull()
    expect(cString!.name).toBe('C')
  })

  it('10.14 identifyString 超出范围返回 null', () => {
    // 非常高的频率，超出所有弦的范围
    expect(cello.identifyString(5000)).toBeNull()
  })

  it('10.15 BaseInstrument getTolerance 默认 beginner', () => {
    const tol = cello.getTolerance('unknown_level')
    expect(tol.pitchCents).toBe(50)
    expect(tol.rhythmPercent).toBe(30)
  })
})
