# 第六轮测试 — ScoreParser 解析测试

> 状态标记：⬜ 待测试 | ✅ 已通过 | ❌ 发现Bug（已修复）

| # | 测试用例 | 状态 | 说明 |
|---|---------|------|------|
| 6.1 | 解析包含标题和作曲家的 MusicXML | ✅ | |
| 6.2 | 解析空 XML 抛出错误 | ✅ | |
| 6.3 | 解析无标题的 MusicXML 返回 'Untitled' | ✅ | |
| 6.4 | 正确解析拍号信息 | ✅ | |
| 6.5 | 正确解析调号信息 | ✅ | |
| 6.6 | 正确解析速度标记 | ✅ | |
| 6.7 | 正确解析音符的 MIDI 编号 (pitchToMidi) | ✅ | |
| 6.8 | 正确解析和弦（chord 标记） | ✅ | |
| 6.9 | 正确解析休止符（不生成音符） | ✅ | |
| 6.10 | 正确处理 forward/backup 元素 | ✅ | |
| 6.11 | 解析多声部（多 part）乐谱 | ✅ | |
| 6.12 | DifficultyCalculator 空乐谱计算 | ✅ | |
| 6.13 | DifficultyCalculator 简单乐谱为 beginner | ✅ | |
| 6.14 | DifficultyCalculator 复杂乐谱为 advanced | ✅ | |
| 6.15 | extractPerformanceMarks 提取力度标记 | ✅ | |
