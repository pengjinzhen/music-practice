# 第 13 轮测试：Zustand Store 持久化测试

## 目标
验证 store 状态变更的正确性和边界条件。

## 测试用例

| 编号 | 用例 | 状态 |
|------|------|------|
| 13-1 | useAppStore 初始状态正确 | 通过 |
| 13-2 | useAppStore 状态变更正确 | 通过 |
| 13-3 | usePracticeStore 初始状态和 reset 正确 | 通过 |
| 13-4 | usePracticeStore toggle 操作正确 | 通过 |
| 13-5 | useScoreStore reset 不重置 totalMeasures | 通过 |
| 13-6 | useAudioStore 状态变更正确 | 通过 |
| 13-7 | usePracticeStore 状态流转边界 | 通过 |

## 发现的 Bug
（无）

## 测试文件
- `src/test/round-13.test.ts`
