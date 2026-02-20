# AI 音乐陪练系统 — 测试计划

> 状态标记：⬜ 待测试 | 🔄 测试中 | ✅ 已通过 | ❌ 发现Bug（已修复）

---

## 一、单元测试 — 工具函数

| # | 测试用例 | 状态 | 说明 |
|---|---------|------|------|
| 1.1 | midiToFrequency 基本转换 | ✅ | A4=440Hz, C4=261.63Hz |
| 1.2 | frequencyToMidi 反向转换 | ✅ | 440→69, 261.63→60 |
| 1.3 | midiToNoteName 音名映射 | ✅ | 69→A4, 60→C4, 72→C5 |
| 1.4 | noteNameToMidi 解析 | ✅ | C4→60, A4→69, C#4→61, 无效→null |
| 1.5 | centsBetween 音分计算 | ✅ | 同频=0, 半音≈100, 八度≈1200 |
| 1.6 | centsFromNearest 最近音偏差 | ✅ | 精确A4偏差<1 |
| 1.7 | isInTune 音准判断 | ✅ | 440Hz对A4在10音分内=true |

## 二、单元测试 — 评分引擎

| # | 测试用例 | 状态 | 说明 |
|---|---------|------|------|
| 2.1 | SpeedScorer 完美速度得满分 | ✅ | 目标BPM=120，检测全部120，应得20分 |
| 2.2 | SpeedScorer 无数据得0分 | ✅ | 空数组应返回0分 |
| 2.3 | SpeedScorer 偏差较大扣分 | ✅ | 目标120实际150，应扣分 |
| 2.4 | RhythmScorer 完美节奏得满分 | ✅ | 所有偏差为0，应得20分 |
| 2.5 | RhythmScorer 无数据得0分 | ✅ | 空数组应返回0分 |
| 2.6 | RhythmScorer 部分偏差扣分 | ✅ | 混合偏差，验证分数合理 |
| 2.7 | IntonationScorer 钢琴全对满分 | ✅ | 所有音符correct=true，应得20分 |
| 2.8 | IntonationScorer 钢琴无数据0分 | ✅ | 空数组应返回0分 |
| 2.9 | IntonationScorer 大提琴精准满分 | ✅ | 所有偏差0cents，应得20分 |
| 2.10 | IntonationScorer 大提琴偏差扣分 | ✅ | 偏差较大，验证扣分逻辑 |
| 2.11 | SmoothnessScorer 流畅演奏满分 | ✅ | 均匀间隔无停顿，应得20分 |
| 2.12 | SmoothnessScorer 少于2音符得20分 | ✅ | 数据不足时返回满分 |
| 2.13 | SmoothnessScorer 有停顿扣分 | ✅ | 插入长间隔，验证扣分 |
| 2.14 | CompletenessScorer 全部演奏满分 | ✅ | 音符数=乐谱数，无跳小节，应得20分 |
| 2.15 | CompletenessScorer 空乐谱满分 | ✅ | totalScoreNotes=0时返回20分 |
| 2.16 | CompletenessScorer 部分缺失扣分 | ✅ | 只弹一半+跳小节，验证扣分 |

## 三、单元测试 — 音符对齐器

| # | 测试用例 | 状态 | 说明 |
|---|---------|------|------|
| 3.1 | NoteAligner 完美匹配 | ✅ | 检测音符与乐谱完全对应，全部correct |
| 3.2 | NoteAligner 音高偏差标记wrong-pitch | ✅ | MIDI号不同，标记为wrong-pitch |
| 3.3 | NoteAligner 漏弹标记missed | ✅ | 无检测音符匹配，标记missed |
| 3.4 | NoteAligner 容忍度设置 | ✅ | setTolerance后验证新阈值生效 |

## 四、单元测试 — 难度计算器

| # | 测试用例 | 状态 | 说明 |
|---|---------|------|------|
| 4.1 | DifficultyCalculator 简单曲目 | ✅ | 少量音符、窄音域→beginner |
| 4.2 | DifficultyCalculator 复杂曲目 | ✅ | 大量音符、宽音域、多声部→advanced |
| 4.3 | DifficultyCalculator 空乐谱 | ✅ | 无音符时不崩溃 |

## 五、单元测试 — BPM追踪器

| # | 测试用例 | 状态 | 说明 |
|---|---------|------|------|
| 5.1 | BPMTracker 稳定120BPM | ✅ | 每0.5秒一个onset→BPM≈120 |
| 5.2 | BPMTracker 不足3个onset返回0 | ✅ | 少于3个数据点BPM=0 |
| 5.3 | BPMTracker 稳定性计算 | ✅ | 均匀间隔stability接近1 |
| 5.4 | BPMTracker reset清空 | ✅ | reset后BPM=0 |

## 六、单元测试 — Onset检测器

| # | 测试用例 | 状态 | 说明 |
|---|---------|------|------|
| 6.1 | OnsetDetector 首帧无检测 | ✅ | 第一帧返回null（无前帧对比） |
| 6.2 | OnsetDetector 突变检测onset | ✅ | 频谱突增超阈值→返回OnsetEvent |
| 6.3 | OnsetDetector 冷却期抑制 | ✅ | 冷却期内不重复触发 |
| 6.4 | OnsetDetector 能量包络检测 | ✅ | detectFromEnergy高能量→触发 |

## 七、单元测试 — 练习建议引擎

| # | 测试用例 | 状态 | 说明 |
|---|---------|------|------|
| 7.1 | 高分不生成建议 | ✅ | 所有维度≥18→空数组 |
| 7.2 | 低分生成建议 | ✅ | 低分维度生成对应建议 |
| 7.3 | 优先级排序 | ✅ | 最低分维度排最前 |
| 7.4 | 双语文本 | ✅ | 包含中英文标题和描述 |

## 八、单元测试 — 构建验证

| # | 测试用例 | 状态 | 说明 |
|---|---------|------|------|
| 8.1 | TypeScript 类型检查通过 | ✅ | `tsc --noEmit` 无错误 |
| 8.2 | ESLint 检查通过 | ❌ | 修复20个lint错误（未使用变量、setState-in-effect、immutability等） |
| 8.3 | Vite 构建成功 | ❌ | 修复5个TS错误（ScoreUploader导出、ScoreViewer props、ReportPage字段） |

---

## 测试统计

| 分类 | 用例数 | 已通过 |
|------|--------|--------|
| 一、工具函数 | 7 | 7 |
| 二、评分引擎 | 16 | 16 |
| 三、音符对齐器 | 4 | 4 |
| 四、难度计算器 | 3 | 3 |
| 五、BPM追踪器 | 4 | 4 |
| 六、Onset检测器 | 4 | 4 |
| 七、练习建议引擎 | 4 | 4 |
| 八、构建验证 | 3 | 3 |
| **合计** | **45** | **45** |
