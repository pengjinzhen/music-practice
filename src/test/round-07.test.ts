import { describe, it, expect } from 'vitest'
import { ChromaExtractor } from '@/engines/ChromaExtractor'
import { NoiseFilter } from '@/engines/NoiseFilter'
import { EchoCanceller } from '@/engines/EchoCanceller'
import { OnsetDetector } from '@/engines/OnsetDetector'
import { BPMTracker } from '@/engines/BPMTracker'

describe('ChromaExtractor', () => {
  const extractor = new ChromaExtractor(44100, 4096)

  it('7.1 纯正弦波提取正确 chroma bin', () => {
    // 构造 A4=440Hz 对应的频谱，bin = 440 / (44100/4096) ≈ 41
    const spectrum = new Float32Array(2048)
    const binIndex = Math.round(440 / (44100 / 4096))
    spectrum[binIndex] = 1.0
    const chroma = extractor.extract(spectrum)
    // A = pitch class 9
    expect(chroma[9]).toBe(1.0)
  })

  it('7.2 静音输入返回全零 chroma', () => {
    const spectrum = new Float32Array(2048)
    const chroma = extractor.extract(spectrum)
    const sum = chroma.reduce((a, b) => a + b, 0)
    expect(sum).toBe(0)
  })

  it('7.3 归一化后最大值为 1', () => {
    const spectrum = new Float32Array(2048)
    spectrum[41] = 5.0 // A4
    spectrum[82] = 3.0 // A5
    const chroma = extractor.extract(spectrum)
    const max = Math.max(...chroma)
    expect(max).toBe(1.0)
  })
})

describe('NoiseFilter', () => {
  it('7.4 未校准时直接返回原始数据', () => {
    const nf = new NoiseFilter()
    const input = new Float32Array([0.5, 0.3, 0.1])
    const output = nf.filter(input)
    expect(output[0]).toBeCloseTo(0.5)
    expect(output[1]).toBeCloseTo(0.3)
    expect(output[2]).toBeCloseTo(0.1)
  })

  it('7.5 校准后 isCalibrated 为 true', () => {
    const nf = new NoiseFilter()
    expect(nf.isCalibrated).toBe(false)
    nf.calibrate(new Float32Array([0.01, 0.02]))
    expect(nf.isCalibrated).toBe(true)
  })

  it('7.6 频谱减法正确过滤噪声', () => {
    const nf = new NoiseFilter()
    nf.calibrate(new Float32Array([0.1, 0.2, 0.3]))
    const output = nf.filter(new Float32Array([0.5, 0.2, 0.1]))
    // 0.5 - 0.1*1.5 = 0.35, 0.2 - 0.2*1.5 = -0.1 -> 0, 0.1 - 0.3*1.5 = -0.35 -> 0
    expect(output[0]).toBeCloseTo(0.35)
    expect(output[1]).toBe(0)
    expect(output[2]).toBe(0)
  })

  it('7.7 噪声门限判断正确', () => {
    const nf = new NoiseFilter()
    nf.setGateThreshold(0.05)
    expect(nf.isAboveGate(0.1)).toBe(true)
    expect(nf.isAboveGate(0.03)).toBe(false)
  })

  it('7.8 AGC 将信号归一化到目标 RMS', () => {
    const nf = new NoiseFilter()
    const input = new Float32Array([0.5, -0.5, 0.5, -0.5])
    const output = nf.applyAGC(input, 0.1)
    let sum = 0
    for (const v of output) sum += v * v
    const rms = Math.sqrt(sum / output.length)
    expect(rms).toBeCloseTo(0.1, 1)
  })

  it('7.9 AGC 静音信号不放大', () => {
    const nf = new NoiseFilter()
    const input = new Float32Array([0, 0, 0, 0])
    const output = nf.applyAGC(input)
    expect(Array.from(output)).toEqual([0, 0, 0, 0])
  })

  it('7.10 reset 清除校准状态', () => {
    const nf = new NoiseFilter()
    nf.calibrate(new Float32Array([0.1]))
    expect(nf.isCalibrated).toBe(true)
    nf.reset()
    expect(nf.isCalibrated).toBe(false)
  })
})

describe('EchoCanceller', () => {
  it('7.11 纯回声信号逐步收敛', () => {
    const ec = new EchoCanceller(32, 0.05)
    // 模拟：mic = instrument + echo, ref = echo source
    // 经过多次迭代后，输出应趋近于 instrument 信号
    for (let i = 0; i < 200; i++) {
      const ref = Math.sin(i * 0.1) * 0.5
      const echo = ref * 0.8 // 回声
      const instrument = 0 // 无乐器信号
      const mic = instrument + echo
      ec.processSample(mic, ref)
    }
    // 收敛后，对纯回声信号，输出应接近 0
    const ref = Math.sin(200 * 0.1) * 0.5
    const result = Math.abs(ec.processSample(ref * 0.8, ref))
    expect(result).toBeLessThan(0.5)
  })

  it('7.12 processBuffer 长度正确', () => {
    const ec = new EchoCanceller(16)
    const mic = new Float32Array(100).fill(0.1)
    const ref = new Float32Array(100).fill(0.05)
    const output = ec.processBuffer(mic, ref)
    expect(output.length).toBe(100)
  })

  it('7.13 reset 清除权重', () => {
    const ec = new EchoCanceller(16)
    ec.processSample(0.5, 0.3)
    ec.reset()
    // reset 后第一次处理应该和全新实例一样
    const result = ec.processSample(0.1, 0)
    expect(result).toBeCloseTo(0.1)
  })
})

describe('OnsetDetector', () => {
  it('7.14 首帧返回 null', () => {
    const od = new OnsetDetector(44100, 0.1, 50)
    const spectrum = new Float32Array(128).fill(0.5)
    expect(od.detect(spectrum, 0)).toBeNull()
  })

  it('7.15 能量突增检测到 onset', () => {
    const od = new OnsetDetector(44100, 0.01, 50)
    const quiet = new Float32Array(128).fill(0.01)
    od.detect(quiet, 0) // 首帧
    const loud = new Float32Array(128).fill(1.0)
    const result = od.detect(loud, 0.1)
    expect(result).not.toBeNull()
    expect(result!.type).toBe('onset')
  })

  it('7.16 cooldown 期间不重复触发', () => {
    const od = new OnsetDetector(44100, 0.01, 100)
    const quiet = new Float32Array(128).fill(0.01)
    od.detect(quiet, 0)
    const loud = new Float32Array(128).fill(1.0)
    od.detect(loud, 0.05) // 第一次 onset
    // 50ms 后再次突增，仍在 100ms cooldown 内
    const result = od.detect(loud, 0.1)
    expect(result).toBeNull()
  })
})

describe('BPMTracker', () => {
  it('7.17 稳定节拍估算正确 BPM', () => {
    const tracker = new BPMTracker()
    // 120 BPM = 0.5s 间隔
    for (let i = 0; i < 10; i++) {
      tracker.addOnset(i * 0.5)
    }
    const bpm = tracker.getBPM()
    expect(bpm).toBeGreaterThan(115)
    expect(bpm).toBeLessThan(125)
  })

  it('7.18 不足3拍返回0', () => {
    const tracker = new BPMTracker()
    tracker.addOnset(0)
    tracker.addOnset(0.5)
    expect(tracker.getBPM()).toBe(0)
  })

  it('7.19 稳定性指标合理', () => {
    const tracker = new BPMTracker()
    for (let i = 0; i < 10; i++) {
      tracker.addOnset(i * 0.5)
    }
    const stability = tracker.getStability()
    expect(stability).toBeGreaterThan(0.8)
    expect(stability).toBeLessThanOrEqual(1)
  })
})
