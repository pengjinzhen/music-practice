# 第八轮测试 — 乐谱跟踪测试

> 状态标记：⬜ 待测试 | ✅ 已通过 | ❌ 发现Bug（已修复）

| # | 测试用例 | 状态 | 说明 |
|---|---------|------|------|
| 8.1 | ScoreFollower 空乐谱返回位置 0 | ✅ | |
| 8.2 | ScoreFollower 未激活时不更新位置 | ✅ | |
| 8.3 | ScoreFollower 相同 chroma 跟踪到正确位置 | ✅ | |
| 8.4 | ScoreFollower 位置只前进不后退 | ✅ | |
| 8.5 | ScoreFollower getProgress 返回 0-1 范围 | ✅ | |
| 8.6 | ScoreFollower reset 重置位置 | ✅ | |
| 8.7 | ScoreFollower costMatrix 有界不无限增长 | ✅ | |
| 8.8 | NoteAligner 完美匹配全部 correct | ✅ | |
| 8.9 | NoteAligner 无检测音符全部 missed | ✅ | |
| 8.10 | NoteAligner 音高偏差标记 wrong-pitch | ✅ | |
| 8.11 | NoteAligner 时间偏差计算正确 | ✅ | |
| 8.12 | NoteAligner setTolerance 生效 | ✅ | |
| 8.13 | chromaDistance 相同向量距离为 0 | ✅ | |
| 8.14 | chromaDistance 正交向量距离大于 0 | ✅ | |
