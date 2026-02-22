import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '@/stores/useAppStore'
import { usePracticeStore } from '@/stores/usePracticeStore'
import { useScoreStore } from '@/stores/useScoreStore'
import { useAudioStore } from '@/stores/useAudioStore'

describe('第13轮：Zustand Store 测试', () => {
  describe('useAppStore', () => {
    beforeEach(() => {
      useAppStore.setState({
        instrument: 'piano', skillLevel: 'beginner', language: 'en',
      })
    })

    it('13-1: 初始状态正确', () => {
      const s = useAppStore.getState()
      expect(s.instrument).toBe('piano')
      expect(s.skillLevel).toBe('beginner')
      expect(s.language).toBe('en')
    })

    it('13-2: 状态变更正确', () => {
      const s = useAppStore.getState()
      s.setInstrument('cello')
      expect(useAppStore.getState().instrument).toBe('cello')
      s.setSkillLevel('advanced')
      expect(useAppStore.getState().skillLevel).toBe('advanced')
      s.setLanguage('zh')
      expect(useAppStore.getState().language).toBe('zh')
    })
  })

  describe('usePracticeStore', () => {
    beforeEach(() => {
      usePracticeStore.getState().reset()
    })

    it('13-3: 初始状态和 reset 正确', () => {
      const s = usePracticeStore.getState()
      s.setTrack('track-1')
      s.setStatus('recording')
      s.setElapsedSeconds(120)
      s.reset()
      const after = usePracticeStore.getState()
      expect(after.trackId).toBeNull()
      expect(after.status).toBe('idle')
      expect(after.elapsedSeconds).toBe(0)
      expect(after.scoringMode).toBe('piece')
    })

    it('13-4: toggle 操作正确', () => {
      const s = usePracticeStore.getState()
      expect(s.metronomeEnabled).toBe(false)
      s.toggleMetronome()
      expect(usePracticeStore.getState().metronomeEnabled).toBe(true)
      s.toggleMetronome()
      expect(usePracticeStore.getState().metronomeEnabled).toBe(false)

      expect(s.accompanimentEnabled).toBe(false)
      s.toggleAccompaniment()
      expect(usePracticeStore.getState().accompanimentEnabled).toBe(true)
    })

    it('13-7: 状态流转边界', () => {
      const s = usePracticeStore.getState()
      s.setStatus('countdown')
      s.setStatus('recording')
      s.setStatus('paused')
      s.setStatus('recording')
      s.setStatus('completed')
      expect(usePracticeStore.getState().status).toBe('completed')
    })
  })

  describe('useScoreStore', () => {
    beforeEach(() => {
      useScoreStore.setState({
        currentMeasure: 0, currentNoteIndex: 0,
        totalMeasures: 0, isFollowing: false,
      })
    })

    it('13-5: reset 不重置 totalMeasures', () => {
      const s = useScoreStore.getState()
      s.setTotalMeasures(50)
      s.setCurrentPosition(10, 3)
      s.setFollowing(true)
      s.reset()
      const after = useScoreStore.getState()
      expect(after.currentMeasure).toBe(0)
      expect(after.currentNoteIndex).toBe(0)
      expect(after.isFollowing).toBe(false)
      // totalMeasures 不被 reset 重置
      expect(after.totalMeasures).toBe(50)
    })
  })

  describe('useAudioStore', () => {
    it('13-6: 状态变更正确', () => {
      const s = useAudioStore.getState()
      s.setCapturing(true)
      expect(useAudioStore.getState().isCapturing).toBe(true)
      s.setAudioLevel(0.75)
      expect(useAudioStore.getState().audioLevel).toBe(0.75)
      s.setCurrentBPM(120)
      expect(useAudioStore.getState().currentBPM).toBe(120)
      const note = {
        frequency: 440, midiNumber: 69,
        confidence: 0.95, timestamp: 1.5,
      }
      s.setCurrentPitch(note)
      expect(useAudioStore.getState().currentPitch).toEqual(note)
      s.setCurrentPitch(null)
      expect(useAudioStore.getState().currentPitch).toBeNull()
    })
  })
})
