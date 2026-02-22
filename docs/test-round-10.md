# 第十轮测试 — 代码质量审查

> 状态标记：⬜ 待测试 | ✅ 已通过 | ❌ 发现Bug（已修复）

## 代码审查发现

| # | 审查项 | 状态 | 说明 |
|---|--------|------|------|
| 10.1 | PracticeRepository SQL 模板拼接 days 参数 | ❌ | 已修复：改用参数化查询 |
| 10.2 | WeeklyGoalRepository getWeekStart 修改原始 Date | ❌ | 已修复：使用 new Date(y,m,d) 避免副作用 |

## 单元测试

| # | 测试用例 | 状态 | 说明 |
|---|---------|------|------|
| 10.3 | music.ts midiToFrequency A4=69 返回 440 | ✅ | |
| 10.4 | music.ts frequencyToMidi 440Hz 返回 69 | ✅ | |
| 10.5 | music.ts midiToNoteName 60 返回 C4 | ✅ | |
| 10.6 | music.ts noteNameToMidi C4 返回 60 | ✅ | |
| 10.7 | music.ts noteNameToMidi 无效输入返回 null | ✅ | |
| 10.8 | music.ts centsBetween 相同频率返回 0 | ✅ | |
| 10.9 | music.ts isInTune 在容差内返回 true | ✅ | |
| 10.10 | InstrumentFactory 创建 piano 和 cello | ✅ | |
| 10.11 | InstrumentFactory 未知类型抛出错误 | ✅ | |
| 10.12 | Piano getStaffHint 高音谱号/低音谱号 | ✅ | |
| 10.13 | Cello identifyString 正确识别弦 | ✅ | |
| 10.14 | Cello identifyString 超出范围返回 null | ✅ | |
| 10.15 | BaseInstrument getTolerance 默认 beginner | ✅ | |
