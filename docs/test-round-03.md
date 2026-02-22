# 第三轮测试 — Store 状态管理测试

> 状态标记：⬜ 待测试 | ✅ 已通过 | ❌ 发现Bug（已修复）

| # | 测试用例 | 状态 | 说明 |
|---|---------|------|------|
| 3.1 | useAppStore 初始状态正确 | ✅ | instrument=piano, skillLevel=beginner, language=en |
| 3.2 | useAppStore.setInstrument 切换乐器 | ✅ | |
| 3.3 | useAppStore.setSkillLevel 切换难度 | ✅ | |
| 3.4 | useAppStore.setLanguage 切换语言 | ✅ | |
| 3.5 | usePracticeStore 初始状态正确 | ✅ | status=idle, trackId=null |
| 3.6 | usePracticeStore.setTrack 设置曲目 | ✅ | |
| 3.7 | usePracticeStore.setStatus 状态流转 | ✅ | idle->countdown->recording->completed |
| 3.8 | usePracticeStore.toggleMetronome 切换节拍器 | ✅ | |
| 3.9 | usePracticeStore.toggleAccompaniment 切换伴奏 | ✅ | |
| 3.10 | usePracticeStore.reset 重置所有状态 | ✅ | |
| 3.11 | useAudioStore 初始状态正确 | ✅ | isCapturing=false |
| 3.12 | useAudioStore.setCapturing 切换采集状态 | ✅ | |
| 3.13 | useAudioStore.setCurrentPitch 设置音高 | ✅ | |
| 3.14 | useScoreStore 初始状态正确 | ✅ | currentMeasure=0 |
| 3.15 | useScoreStore.setCurrentPosition 设置位置 | ✅ | |
| 3.16 | useScoreStore.reset 重置状态 | ✅ | |

测试文件：`src/test/round-03.test.ts` — 16 个测试全部通过
