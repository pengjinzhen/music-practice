# 第 14 轮测试：工具函数边界测试

## 目标
测试 music.ts 工具函数的极端输入（负数、NaN、超大值、0 等）。

## 测试用例

| 编号 | 用例 | 状态 |
|------|------|------|
| 14-1 | midiToFrequency 负数 MIDI 不崩溃 | 通过 |
| 14-2 | midiToFrequency 超大 MIDI 值返回有限数 | 通过 |
| 14-3 | frequencyToMidi 输入 0 或负数的行为 | 通过 |
| 14-4 | frequencyToMidi 输入 NaN 的行为 | 通过 |
| 14-5 | centsBetween 输入 0 频率的行为 | 通过 |
| 14-6 | midiToNoteName 负数 MIDI 不崩溃 | 通过 |
| 14-7 | noteNameToMidi 各种无效输入返回 null | 通过 |
| 14-8 | isInTune 容差为 0 的精确匹配 | 通过 |
| 14-9 | centsFromNearest 输入极小频率 | 通过 |

## 发现的 Bug
（无）

## 测试文件
- `src/test/round-14.test.ts`
