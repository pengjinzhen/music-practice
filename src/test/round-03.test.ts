/**
 * 第3轮测试 — Store 状态管理测试
 * 直接测试 zustand store 的状态变更逻辑
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '@/stores/useAppStore'
import { usePracticeStore } from '@/stores/usePracticeStore'
import { useAudioStore } from '@/stores/useAudioStore'
import { useScoreStore } from '@/stores/useScoreStore'

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({ instrument: 'piano', skillLevel: 'beginner', language: 'en' })
  })

  it('3.1 初始状态正确', () => {
    const state = useAppStore.getState()
    expect(state.instrument).toBe('piano')
    expect(state.skillLevel).toBe('beginner')
    expect(state.language).toBe('en')
  })

  it('3.2 setInstrument 切换乐器', () => {
    useAppStore.getState().setInstrument('cello')
    expect(useAppStore.getState().instrument).toBe('cello')
  })

  it('3.3 setSkillLevel 切换难度', () => {
    useAppStore.getState().setSkillLevel('advanced')
    expect(useAppStore.getState().skillLevel).toBe('advanced')
  })

  it('3.4 setLanguage 切换语言', () => {
    useAppStore.getState().setLanguage('zh')
    expect(useAppStore.getState().language).toBe('zh')
  })
})

describe('usePracticeStore', () => {
  beforeEach(() => { usePracticeStore.getState().reset() })

  it('3.5 初始状态正确', () => {
    const s = usePracticeStore.getState()
    expect(s.trackId).toBeNull()
    expect(s.scoringMode).toBe('piece')
    expect(s.status).toBe('idle')
    expect(s.targetBPM).toBeNull()
    expect(s.metronomeEnabled).toBe(false)
    expect(s.accompanimentEnabled).toBe(false)
    expect(s.elapsedSeconds).toBe(0)
  })

  it('3.6 setTrack 设置曲目', () => {
    usePracticeStore.getState().setTrack('track-123')
    expect(usePracticeStore.getState().trackId).toBe('track-123')
  })

  it('3.7 setStatus 状态流转', () => {
    const store = usePracticeStore.getState()
    store.setStatus('countdown')
    expect(usePracticeStore.getState().status).toBe('countdown')
    usePracticeStore.getState().setStatus('recording')
    expect(usePracticeStore.getState().status).toBe('recording')
    usePracticeStore.getState().setStatus('completed')
    expect(usePracticeStore.getState().status).toBe('completed')
  })

  it('3.8 toggleMetronome 切换节拍器', () => {
    usePracticeStore.getState().toggleMetronome()
    expect(usePracticeStore.getState().metronomeEnabled).toBe(true)
    usePracticeStore.getState().toggleMetronome()
    expect(usePracticeStore.getState().metronomeEnabled).toBe(false)
  })

  it('3.9 toggleAccompaniment 切换伴奏', () => {
    usePracticeStore.getState().toggleAccompaniment()
    expect(usePracticeStore.getState().accompanimentEnabled).toBe(true)
    usePracticeStore.getState().toggleAccompaniment()
    expect(usePracticeStore.getState().accompanimentEnabled).toBe(false)
  })

  it('3.10 reset 重置所有状态', () => {
    const store = usePracticeStore.getState()
    store.setTrack('t1')
    store.setStatus('recording')
    store.setTargetBPM(120)
    store.toggleMetronome()
    store.setElapsedSeconds(60)
    usePracticeStore.getState().reset()
    const s = usePracticeStore.getState()
    expect(s.trackId).toBeNull()
    expect(s.status).toBe('idle')
    expect(s.targetBPM).toBeNull()
    expect(s.metronomeEnabled).toBe(false)
    expect(s.elapsedSeconds).toBe(0)
  })
})

describe('useAudioStore', () => {
  beforeEach(() => {
    useAudioStore.setState({ isCapturing: false, currentPitch: null, currentBPM: null, audioLevel: 0 })
  })

  it('3.11 初始状态正确', () => {
    const s = useAudioStore.getState()
    expect(s.isCapturing).toBe(false)
    expect(s.currentPitch).toBeNull()
    expect(s.currentBPM).toBeNull()
    expect(s.audioLevel).toBe(0)
  })

  it('3.12 setCapturing 切换采集状态', () => {
    useAudioStore.getState().setCapturing(true)
    expect(useAudioStore.getState().isCapturing).toBe(true)
  })

  it('3.13 setCurrentPitch 设置音高', () => {
    const note = { frequency: 440, midiNumber: 69, confidence: 0.95, timestamp: Date.now() }
    useAudioStore.getState().setCurrentPitch(note)
    const pitch = useAudioStore.getState().currentPitch
    expect(pitch).not.toBeNull()
    expect(pitch!.frequency).toBe(440)
    expect(pitch!.midiNumber).toBe(69)
  })
})

describe('useScoreStore', () => {
  beforeEach(() => { useScoreStore.getState().reset() })

  it('3.14 初始状态正确', () => {
    const s = useScoreStore.getState()
    expect(s.currentMeasure).toBe(0)
    expect(s.currentNoteIndex).toBe(0)
    expect(s.isFollowing).toBe(false)
  })

  it('3.15 setCurrentPosition 设置位置', () => {
    useScoreStore.getState().setCurrentPosition(5, 12)
    const s = useScoreStore.getState()
    expect(s.currentMeasure).toBe(5)
    expect(s.currentNoteIndex).toBe(12)
  })

  it('3.16 reset 重置状态', () => {
    useScoreStore.getState().setCurrentPosition(10, 20)
    useScoreStore.getState().setFollowing(true)
    useScoreStore.getState().reset()
    const s = useScoreStore.getState()
    expect(s.currentMeasure).toBe(0)
    expect(s.currentNoteIndex).toBe(0)
    expect(s.isFollowing).toBe(false)
  })
})
