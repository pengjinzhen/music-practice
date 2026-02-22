import { describe, it, expect } from 'vitest'
import {
  midiToFrequency,
  frequencyToMidi,
  midiToNoteName,
  centsBetween,
  centsFromNearest,
  noteNameToMidi,
  isInTune,
} from '@/utils/music'

describe('第14轮：工具函数边界测试', () => {
  describe('midiToFrequency 边界', () => {
    it('14-1: 负数 MIDI 不崩溃，返回正数', () => {
      const result = midiToFrequency(-1)
      expect(result).toBeGreaterThan(0)
      expect(isFinite(result)).toBe(true)
    })

    it('14-2: 超大 MIDI 值(200)返回有限数', () => {
      const result = midiToFrequency(200)
      expect(isFinite(result)).toBe(true)
      expect(result).toBeGreaterThan(0)
    })

    it('MIDI 0 返回正数', () => {
      const result = midiToFrequency(0)
      expect(result).toBeGreaterThan(0)
    })

    it('MIDI 127 返回有限数', () => {
      const result = midiToFrequency(127)
      expect(isFinite(result)).toBe(true)
    })
  })

  describe('frequencyToMidi 边界', () => {
    it('14-3: 输入 0 返回 -Infinity', () => {
      // log2(0) = -Infinity
      const result = frequencyToMidi(0)
      expect(result).toBe(-Infinity)
    })

    it('负频率返回 NaN', () => {
      const result = frequencyToMidi(-100)
      expect(isNaN(result)).toBe(true)
    })

    it('14-4: 输入 NaN 返回 NaN', () => {
      const result = frequencyToMidi(NaN)
      expect(isNaN(result)).toBe(true)
    })

    it('极大频率不崩溃', () => {
      const result = frequencyToMidi(100000)
      expect(isFinite(result)).toBe(true)
    })
  })

  describe('centsBetween 边界', () => {
    it('14-5: 输入 0 频率返回特殊值', () => {
      const result = centsBetween(0, 440)
      expect(result).toBe(-Infinity)
    })

    it('两个 0 频率返回 NaN', () => {
      const result = centsBetween(0, 0)
      expect(isNaN(result)).toBe(true)
    })
  })

  describe('midiToNoteName 边界', () => {
    it('14-6: 负数 MIDI 不崩溃', () => {
      const result = midiToNoteName(-1)
      expect(typeof result).toBe('string')
    })

    it('MIDI 0 返回有效字符串', () => {
      expect(midiToNoteName(0)).toBe('C-1')
    })
  })

  describe('noteNameToMidi 无效输入', () => {
    it('14-7: 各种无效输入返回 null', () => {
      expect(noteNameToMidi('')).toBeNull()
      expect(noteNameToMidi('X4')).toBeNull()
      expect(noteNameToMidi('Cb4')).toBeNull() // b 不是 #
      expect(noteNameToMidi('4C')).toBeNull()
      expect(noteNameToMidi('CC4')).toBeNull()
      expect(noteNameToMidi('C')).toBeNull()
      expect(noteNameToMidi('123')).toBeNull()
    })
  })

  describe('isInTune 边界', () => {
    it('14-8: 容差为 0 的精确匹配', () => {
      expect(isInTune(440, 69, 0)).toBe(true)
      // 稍有偏差就不通过
      expect(isInTune(440.1, 69, 0)).toBe(false)
    })
  })

  describe('centsFromNearest 边界', () => {
    it('14-9: 极小频率不崩溃', () => {
      const result = centsFromNearest(0.001)
      expect(typeof result).toBe('number')
    })
  })
})
