# 第九轮测试 — MIDI 相关测试

> 状态标记：⬜ 待测试 | ✅ 已通过 | ❌ 发现Bug（已修复）

| # | 测试用例 | 状态 | 说明 |
|---|---------|------|------|
| 9.1 | MidiPlayer 初始状态 isPlaying=false | ✅ | |
| 9.2 | MidiPlayer setPlaybackRate 限制在 0.25-1.5 | ✅ | |
| 9.3 | MidiPlayer 未加载 MIDI 时 play 抛出错误 | ✅ | |
| 9.4 | MidiPlayer getMidi 初始返回 null | ✅ | |
| 9.5 | MetronomeEngine 初始 BPM 为 120 | ✅ | |
| 9.6 | MetronomeEngine setBPM 限制在 20-300 | ✅ | |
| 9.7 | MetronomeEngine 初始 isPlaying=false | ✅ | |
| 9.8 | ScoringEngine 空输入不崩溃 | ✅ | |
| 9.9 | ScoringEngine 完美输入得高分 | ✅ | |
| 9.10 | ScoringEngine 全部 missed 得低分 | ✅ | |
| 9.11 | ScoringEngine diagnostics 按严重度排序 | ✅ | |
| 9.12 | SuggestionEngine 低分维度生成建议 | ✅ | |
| 9.13 | SuggestionEngine 高分维度不生成建议 | ✅ | |
| 9.14 | SuggestionEngine 建议按优先级排序 | ✅ | |
