# AI 音乐陪练系统 — 技术方案

> 工作名称：AI Music Practice（正式名称待定）

## 一、整体架构

### 1.1 架构概览

采用纯前端 SPA 架构，所有计算（音频分析、评分、乐谱渲染）在浏览器端完成，通过静态托管部署。

```
┌─────────────────────────────────────────────────────────┐
│                    用户浏览器 (Client)                     │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │ UI Layer │  │  Audio   │  │  Score   │  │  Data  │  │
│  │ React +  │  │ Engine   │  │ Engine   │  │ Layer  │  │
│  │ shadcn/ui│  │ Web Audio│  │  OSMD    │  │sql.js  │  │
│  │ Tailwind │  │ + WASM   │  │          │  │(SQLite)│  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘  │
│       │              │              │             │       │
│  ┌────┴──────────────┴──────────────┴─────────────┴────┐ │
│  │              State Management (Zustand)              │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │           Service Worker (PWA Offline)               │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                    静态资源托管
              (Cloudflare Pages / Vercel)
```

### 1.2 技术栈总览

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| 框架 | React 18 + TypeScript | SPA，Vite 构建 |
| 路由 | React Router v6 | 客户端路由 |
| 状态管理 | Zustand | 轻量、TypeScript 友好 |
| UI 组件 | shadcn/ui (Radix + Tailwind) | 组件源码复制到项目中 |
| 样式 | Tailwind CSS 3.4 | 原子化 CSS |
| 图标 | FontAwesome 6 + Lucide Icons | shadcn/ui 默认用 Lucide |
| 图表 | Recharts | 雷达图、趋势图 |
| 乐谱渲染 | OpenSheetMusicDisplay (OSMD) | MusicXML → 五线谱 |
| 音频引擎 | Web Audio API + AudioWorklet | 实时音频处理 |
| 音高检测(单音) | Pitchy + Essentia.js (WASM) | 大提琴实时音准 |
| 音高检测(多音) | @spotify/basic-pitch-ts | 钢琴多声部识别 |
| MIDI 合成 | Tone.js + @tonejs/midi | 示范播放、伴奏 |
| 乐谱跟随 | 自研 DTW 算法 | 基于 chroma 特征匹配 |
| 数据库 | sql.js (SQLite WASM) | 浏览器端 SQLite |
| 国际化 | react-i18next | EN/ZH 双语 |
| PWA | Workbox | Service Worker 离线缓存 |
| 部署 | Cloudflare Pages | 静态托管，全球 CDN |

### 1.3 CDN 策略（中国国内可访问）

所有外部依赖通过 npm 安装并打包，不依赖运行时 CDN。以下 CDN 仅用于开发参考：

| 资源 | CDN 地址 |
|------|---------|
| sql.js WASM | `https://cdn.jsdelivr.net/npm/sql.js@1.14.0/dist/sql-wasm.wasm` |
| FontAwesome | `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6/` |
| Google Fonts 替代 | 使用 `fonts.loli.net` 或内嵌字体文件 |
| Unsplash 图片 | `https://images.unsplash.com/` （国内可访问） |

> jsdelivr 在国内有 CDN 节点，访问稳定。npmmirror (`registry.npmmirror.com`) 作为备选。

---

## 二、项目结构

```
src/
├── app/                          # 应用入口与路由
│   ├── App.tsx
│   ├── routes.tsx
│   └── providers.tsx             # 全局 Provider 组合
│
├── components/                   # UI 组件
│   ├── ui/                       # shadcn/ui 基础组件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── progress.tsx
│   │   ├── slider.tsx
│   │   ├── tabs.tsx
│   │   ├── tooltip.tsx
│   │   └── ...
│   ├── layout/                   # 布局组件
│   │   ├── Sidebar.tsx           # 左侧导航栏
│   │   ├── MainLayout.tsx        # 主布局（侧边栏+内容区）
│   │   └── MobileLayout.tsx      # 手机只读布局
│   ├── score/                    # 乐谱相关组件
│   │   ├── ScoreViewer.tsx       # OSMD 乐谱渲染容器
│   │   ├── ScoreCursor.tsx       # 光标跟随控制
│   │   └── ScoreAnnotation.tsx   # 错误标注覆盖层
│   ├── audio/                    # 音频相关组件
│   │   ├── Recorder.tsx          # 录制控制面板
│   │   ├── WaveformDisplay.tsx   # 实时波形显示
│   │   ├── Metronome.tsx         # 节拍器 UI
│   │   └── Tuner.tsx             # 调音器 UI
│   ├── report/                   # 报告相关组件
│   │   ├── RadarChart.tsx        # 五维雷达图
│   │   ├── DiagnosticCard.tsx    # 诊断分析卡片
│   │   ├── ErrorTimeline.tsx     # 错误时间线
│   │   └── ShareCard.tsx         # 分享卡片生成
│   └── common/                   # 通用组件
│       ├── InstrumentSwitch.tsx  # 乐器切换
│       ├── DifficultyBadge.tsx   # 难度标签
│       └── AchievementBadge.tsx  # 成就徽章
│
├── pages/                        # 页面组件
│   ├── HomePage.tsx              # 首页/仪表盘
│   ├── LibraryPage.tsx           # 曲库浏览
│   ├── PracticePage.tsx          # 练习界面
│   ├── ReportPage.tsx            # 评测报告
│   ├── SectionPracticePage.tsx   # 片段练习
│   ├── TunerPage.tsx             # 调音器
│   ├── ProfilePage.tsx           # 用户中心
│   └── ShareReportPage.tsx       # 分享报告（只读）
│
├── engines/                      # 核心引擎
│   ├── audio/                    # 音频引擎
│   │   ├── AudioCapture.ts       # 麦克风采集管理
│   │   ├── PitchDetector.ts      # 音高检测（单音/多音调度）
│   │   ├── MonoPitchDetector.ts  # 单音音高检测（Pitchy）
│   │   ├── PolyPitchDetector.ts  # 多音音高检测（basic-pitch）
│   │   ├── OnsetDetector.ts      # 音符起始点检测
│   │   ├── BPMTracker.ts         # 实时 BPM 估算
│   │   ├── EchoCanceller.ts      # 自适应回声消除
│   │   ├── NoiseFilter.ts        # 环境噪声过滤
│   │   └── worklets/             # AudioWorklet 处理器
│   │       ├── pitch-processor.ts
│   │       └── onset-processor.ts
│   ├── score/                    # 乐谱引擎
│   │   ├── ScoreParser.ts        # MusicXML 解析
│   │   ├── ScoreFollower.ts      # 实时乐谱跟随（DTW）
│   │   ├── NoteAligner.ts        # 音符对齐匹配
│   │   └── DifficultyCalculator.ts # 难度自动计算
│   ├── scoring/                  # 评分引擎
│   │   ├── ScoringEngine.ts      # 评分总调度
│   │   ├── SpeedScorer.ts        # 速度评分
│   │   ├── RhythmScorer.ts       # 节奏评分
│   │   ├── IntonationScorer.ts   # 音准评分
│   │   ├── SmoothnessScorer.ts   # 流畅度评分
│   │   ├── CompletenessScorer.ts # 完整度评分
│   │   └── ToleranceConfig.ts    # 容忍度配置（按水平）
│   └── midi/                     # MIDI 引擎
│       ├── MidiPlayer.ts         # MIDI 合成播放
│       ├── MetronomeEngine.ts    # 节拍器引擎
│       └── AccompanimentPlayer.ts # 伴奏播放
│
├── instruments/                  # 乐器抽象层
│   ├── Instrument.ts             # 乐器基类接口
│   ├── Piano.ts                  # 钢琴实现
│   ├── Cello.ts                  # 大提琴实现
│   └── InstrumentFactory.ts      # 乐器工厂
│
├── db/                           # 数据库层
│   ├── database.ts               # sql.js 初始化与管理
│   ├── schema.sql                # 建表语句
│   ├── migrations/               # 数据库迁移
│   ├── repositories/             # 数据访问层
│   │   ├── UserRepository.ts
│   │   ├── PracticeRepository.ts
│   │   ├── ScoreRepository.ts
│   │   └── AchievementRepository.ts
│   └── backup.ts                 # 导出/导入逻辑
│
├── stores/                       # Zustand 状态管理
│   ├── useAppStore.ts            # 全局应用状态
│   ├── usePracticeStore.ts       # 练习会话状态
│   ├── useAudioStore.ts          # 音频引擎状态
│   └── useScoreStore.ts          # 乐谱状态
│
├── i18n/                         # 国际化
│   ├── index.ts
│   ├── en.json
│   └── zh.json
│
├── hooks/                        # 自定义 Hooks
│   ├── useAudioCapture.ts
│   ├── usePitchDetection.ts
│   ├── useScoreFollowing.ts
│   ├── useMetronome.ts
│   └── useDatabase.ts
│
├── utils/                        # 工具函数
│   ├── music.ts                  # 音乐理论工具（频率↔音名转换等）
│   ├── dsp.ts                    # DSP 工具（FFT、窗函数等）
│   └── share.ts                  # 分享功能工具
│
├── assets/                       # 静态资源
│   ├── scores/                   # 内置 MusicXML 乐谱
│   ├── midi/                     # 内置 MIDI 文件
│   ├── sounds/                   # 音效文件（节拍器、提示音）
│   └── images/                   # 图片资源
│
└── types/                        # TypeScript 类型定义
    ├── music.ts
    ├── scoring.ts
    ├── database.ts
    └── instrument.ts
```

---

## 三、核心引擎设计

### 3.1 音频引擎

#### 3.1.1 音频采集管线

```
麦克风 → getUserMedia → MediaStream
  → AudioContext.createMediaStreamSource()
  → AnalyserNode (实时波形/频谱显示)
  → AudioWorkletNode (实时音高/onset 检测)
  → MediaRecorder (录音保存)
```

关键参数：
- 采样率：48000Hz（浏览器默认）
- 缓冲区大小：2048 samples（约 42ms 延迟，满足 <100ms 要求）
- 分析窗口：4096 samples（频率分辨率 ~11.7Hz）

#### 3.1.2 音高检测策略

根据乐器类型动态选择检测算法：

**大提琴（单音检测）：**
- 使用 Pitchy 库（McLeod Pitch Method）
- 在 AudioWorklet 中实时运行
- 输出：频率 (Hz) + 清晰度 (0~1)
- 延迟 < 50ms
- 精度：±5 音分

**钢琴（多音检测）：**
- 实时跟随：使用 Essentia.js WASM 的 HPCP（Harmonic Pitch Class Profile）
  - 提取 chroma 特征向量，与乐谱期望的 chroma 对比
  - 延迟 < 100ms，适合实时跟随
- 精确评分：使用 @spotify/basic-pitch-ts
  - 录制完成后离线分析，输出完整的 MIDI note 序列
  - 包含每个音符的 onset、offset、pitch、confidence
  - 用于生成精确的评测报告

```typescript
// 乐器抽象层接口
interface InstrumentAnalyzer {
  // 实时分析（用于跟随和即时反馈）
  analyzeRealtime(audioBuffer: Float32Array): RealtimeResult;
  // 离线分析（用于完整评分报告）
  analyzeOffline(audioBuffer: AudioBuffer): Promise<OfflineResult>;
}

interface RealtimeResult {
  detectedNotes: DetectedNote[];  // 当前检测到的音符
  confidence: number;             // 检测置信度
  timestamp: number;              // 时间戳
}

interface OfflineResult {
  notes: NoteEvent[];             // 完整音符序列
  onsets: number[];               // 所有 onset 时间点
  bpmCurve: number[];             // BPM 变化曲线
}
```

#### 3.1.3 音源分离方案

采用"已知参考信号自适应消除"策略：

```
麦克风信号 = 乐器声 + 扬声器泄漏（伴奏+节拍器+音效）

已知信号：伴奏/节拍器/音效的原始音频数据
未知因素：房间传递函数（混响、延迟）

方案：在 AudioWorklet 中实现 NLMS（归一化最小均方）自适应滤波器
  1. 将扬声器播放的音频作为参考信号
  2. 估算房间传递函数
  3. 从麦克风信号中减去估算的泄漏信号
  4. 输出净化后的乐器声
```

```typescript
// AudioWorklet 中的 NLMS 自适应滤波器
class EchoCancellerProcessor extends AudioWorkletProcessor {
  private filterCoeffs: Float32Array;  // 自适应滤波器系数
  private filterLength = 1024;          // 滤波器长度
  private stepSize = 0.01;              // 学习步长

  process(inputs: Float32Array[][], outputs: Float32Array[][]) {
    const micSignal = inputs[0][0];     // 麦克风输入
    const refSignal = inputs[1][0];     // 参考信号（扬声器播放内容）
    // NLMS 算法：估算并消除回声
    // ... 输出净化后的乐器声
    return true;
  }
}
```

补充措施：
- 浏览器原生 `echoCancellation: true` 作为第一层过滤
- NLMS 自适应滤波作为第二层精细消除
- 如果用户使用耳机听伴奏，则跳过音源分离（最佳体验）

#### 3.1.4 节奏检测

```typescript
class OnsetDetector {
  // 基于频谱通量（Spectral Flux）的 onset 检测
  // 1. 计算相邻帧的频谱差异
  // 2. 应用自适应阈值
  // 3. 输出 onset 时间点

  detectOnset(spectrum: Float32Array, prevSpectrum: Float32Array): boolean;

  // BPM 估算：基于 onset 间隔的自相关分析
  estimateBPM(onsets: number[]): number;
}
```

### 3.2 乐谱引擎

#### 3.2.1 乐谱渲染（OSMD）

使用 OpenSheetMusicDisplay 渲染 MusicXML：

```typescript
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

class ScoreRenderer {
  private osmd: OpenSheetMusicDisplay;

  async loadScore(musicXml: string) {
    await this.osmd.load(musicXml);
    this.osmd.render();
  }

  // 光标控制
  showCursor() { this.osmd.cursor.show(); }
  moveCursorTo(measureIndex: number, noteIndex: number) { /* ... */ }

  // 音符着色
  colorNote(note: GraphicalNote, color: string) {
    note.sourceNote.NoteheadColor = color;
    this.osmd.render();  // 或局部重绘
  }

  // 配置项
  options = {
    followCursor: true,           // 光标跟随时自动滚动
    coloringEnabled: true,        // 启用着色
    drawingParameters: 'compacttight', // 紧凑布局
    darkMode: false,
  };
}
```

OSMD 原生支持的关键能力：
- MusicXML 解析与五线谱渲染
- 光标（Cursor）显示与移动
- 音符颜色自定义（NoteheadColor）
- 自动滚动跟随（followCursor）
- 指法、弓法、踏板等标记渲染（从 MusicXML 解析）
- 小节编号显示

#### 3.2.2 实时乐谱跟随算法

采用在线 DTW（Dynamic Time Warping）实现实时乐谱跟随：

```
乐谱序列：从 MusicXML 提取的标准音符序列 [n1, n2, n3, ...]
演奏序列：实时检测到的音符序列 [d1, d2, d3, ...]

DTW 匹配：找到演奏序列中每个音符在乐谱序列中的最佳对应位置
```

```typescript
class ScoreFollower {
  private scoreNotes: ScoreNote[];      // 乐谱音符序列
  private currentPosition: number = 0;  // 当前跟随位置
  private dtwWindow: number = 20;       // DTW 搜索窗口大小

  // 每次检测到新音符时调用
  onNoteDetected(detected: DetectedNote): FollowResult {
    // 1. 在当前位置附近搜索最佳匹配
    const searchStart = Math.max(0, this.currentPosition - 2);
    const searchEnd = Math.min(
      this.scoreNotes.length,
      this.currentPosition + this.dtwWindow
    );

    // 2. 计算距离（音高距离 + 时间距离的加权和）
    let bestMatch = -1;
    let bestDistance = Infinity;
    for (let i = searchStart; i < searchEnd; i++) {
      const dist = this.noteDistance(detected, this.scoreNotes[i]);
      if (dist < bestDistance) {
        bestDistance = dist;
        bestMatch = i;
      }
    }

    // 3. 更新位置并返回结果
    if (bestDistance < this.threshold) {
      this.currentPosition = bestMatch + 1;
      return { matched: true, scorePosition: bestMatch, error: null };
    } else {
      return { matched: false, scorePosition: this.currentPosition,
               error: this.classifyError(detected, this.scoreNotes[this.currentPosition]) };
    }
  }

  // 音符距离计算
  private noteDistance(detected: DetectedNote, expected: ScoreNote): number {
    const pitchDist = Math.abs(detected.midiNote - expected.midiNote);
    const timeDist = Math.abs(detected.time - expected.expectedTime);
    return pitchDist * 2.0 + timeDist * 1.0;  // 音高权重更高
  }
}
```

容错机制：
- 速度波动容忍：搜索窗口随演奏速度动态调整
- 跳音处理：如果连续多个音符未匹配，尝试向前跳跃搜索
- 重复音处理：允许同一乐谱位置被多次匹配（犹豫重弹）

#### 3.2.3 曲目难度自动计算

```typescript
class DifficultyCalculator {
  calculate(score: ParsedScore): DifficultyLevel {
    const features = {
      noteDensity: this.calcNoteDensity(score),       // 音符密度（个/秒）
      pitchRange: this.calcPitchRange(score),          // 音域跨度（半音数）
      rhythmComplexity: this.calcRhythmComplexity(score), // 节奏复杂度
      chordFrequency: this.calcChordFrequency(score),  // 和弦频率
      tempoRange: this.calcTempoRange(score),          // 速度范围
      keySignature: this.calcKeyComplexity(score),     // 调号复杂度
    };

    // 加权评分
    const score = features.noteDensity * 0.25
                + features.pitchRange * 0.15
                + features.rhythmComplexity * 0.25
                + features.chordFrequency * 0.15
                + features.tempoRange * 0.10
                + features.keySignature * 0.10;

    if (score < 0.33) return 'beginner';
    if (score < 0.66) return 'intermediate';
    return 'advanced';
  }
}
```

### 3.3 评分引擎

#### 3.3.1 评分流程

```
录制完成 → 离线音频分析（basic-pitch / essentia.js）
  → 生成完整音符序列 [NoteEvent]
  → 与乐谱标准序列对齐（DTW）
  → 五维独立评分
  → 汇总生成报告
```

#### 3.3.2 五维评分算法

```typescript
interface ScoringConfig {
  level: 'beginner' | 'intermediate' | 'advanced';
  instrument: 'piano' | 'cello';
  targetBPM?: number;  // 用户设定的目标速度
}

class ScoringEngine {
  score(
    detected: NoteEvent[],
    expected: ScoreNote[],
    alignment: AlignmentResult,
    config: ScoringConfig
  ): ScoreReport {
    const tolerance = ToleranceConfig.get(config.level);

    return {
      speed: new SpeedScorer().score(detected, expected, config),
      rhythm: new RhythmScorer().score(detected, expected, alignment, tolerance),
      intonation: new IntonationScorer().score(detected, expected, alignment, tolerance, config.instrument),
      smoothness: new SmoothnessScorer().score(detected, expected, alignment),
      completeness: new CompletenessScorer().score(detected, expected, alignment),
      errors: this.collectErrors(detected, expected, alignment),
    };
  }
}
```

**速度评分（SpeedScorer）：**
```typescript
class SpeedScorer {
  score(detected: NoteEvent[], expected: ScoreNote[], config: ScoringConfig): DimensionScore {
    // 1. 估算实际演奏 BPM
    const actualBPM = this.estimateAverageBPM(detected);
    const targetBPM = config.targetBPM || expected[0].bpm;

    // 2. 计算 BPM 偏差率
    const deviation = Math.abs(actualBPM - targetBPM) / targetBPM;

    // 3. 计算 BPM 稳定性（方差）
    const bpmVariance = this.calcBPMVariance(detected);

    // 4. 综合评分（偏差 60% + 稳定性 40%）
    const deviationScore = this.deviationToScore(deviation);
    const stabilityScore = this.varianceToScore(bpmVariance);
    const total = deviationScore * 0.6 + stabilityScore * 0.4;

    return { score: Math.round(total * 20), maxScore: 20, details: { actualBPM, targetBPM, deviation, bpmVariance } };
  }
}
```

**音准评分（IntonationScorer）：**
```typescript
class IntonationScorer {
  score(detected: NoteEvent[], expected: ScoreNote[],
        alignment: AlignmentResult, tolerance: Tolerance,
        instrument: string): DimensionScore {

    let correctCount = 0;
    let totalCount = alignment.pairs.length;
    const errors: IntonationError[] = [];

    for (const pair of alignment.pairs) {
      if (instrument === 'piano') {
        // 钢琴：二值判断（MIDI note 是否匹配）
        if (pair.detected.midiNote === pair.expected.midiNote) {
          correctCount++;
        } else {
          errors.push({ measure: pair.expected.measure, expected: pair.expected.midiNote,
                        actual: pair.detected.midiNote, type: 'wrong_note' });
        }
      } else {
        // 大提琴：音分级精度
        const centDeviation = this.calcCentDeviation(pair.detected.frequency, pair.expected.frequency);
        if (Math.abs(centDeviation) <= tolerance.intonationCents) {
          correctCount++;
        } else {
          errors.push({ measure: pair.expected.measure, centDeviation, type: 'pitch_deviation' });
        }
      }
    }

    const accuracy = correctCount / totalCount;
    return { score: Math.round(accuracy * 20), maxScore: 20, errors };
  }
}
```

#### 3.3.3 容忍度配置

```typescript
const ToleranceConfig = {
  beginner:     { intonationCents: 50, rhythmPercent: 0.30, speedPercent: 0.40 },
  intermediate: { intonationCents: 25, rhythmPercent: 0.15, speedPercent: 0.20 },
  advanced:     { intonationCents: 10, rhythmPercent: 0.08, speedPercent: 0.10 },
};
```

### 3.4 MIDI 引擎

#### 3.4.1 示范播放与伴奏

```typescript
import * as Tone from 'tone';
import { Midi } from '@tonejs/midi';

class MidiPlayer {
  private synth: Tone.PolySynth;
  private transport = Tone.getTransport();

  async loadAndPlay(midiUrl: string, bpmScale: number = 1.0) {
    const midi = await Midi.fromUrl(midiUrl);
    this.transport.bpm.value = midi.header.tempos[0].bpm * bpmScale;

    midi.tracks.forEach(track => {
      track.notes.forEach(note => {
        this.transport.schedule(time => {
          this.synth.triggerAttackRelease(
            note.name, note.duration, time, note.velocity
          );
        }, note.time);
      });
    });

    this.transport.start();
  }

  setSpeed(scale: number) {
    this.transport.bpm.value = this.baseBPM * scale;
  }

  stop() { this.transport.stop(); this.transport.cancel(); }
}
```

#### 3.4.2 节拍器引擎

```typescript
class MetronomeEngine {
  private clickSynth: Tone.MembraneSynth;
  private pattern: Tone.Pattern;

  start(bpm: number, timeSignature: [number, number] = [4, 4]) {
    Tone.getTransport().bpm.value = bpm;
    // 强拍用高音，弱拍用低音
    let beatIndex = 0;
    this.pattern = new Tone.Loop(time => {
      const isDownbeat = beatIndex % timeSignature[0] === 0;
      this.clickSynth.triggerAttackRelease(
        isDownbeat ? 'C5' : 'C4', '16n', time
      );
      beatIndex++;
    }, `${timeSignature[1]}n`);
    this.pattern.start(0);
    Tone.getTransport().start();
  }
}
```

---

## 四、数据库设计（SQLite via sql.js）

### 4.1 初始化与持久化

```typescript
import initSqlJs, { Database } from 'sql.js';

class DatabaseManager {
  private db: Database;
  private readonly DB_KEY = 'music_practice_db';

  async init() {
    const SQL = await initSqlJs({
      locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1.14.0/dist/${file}`
    });

    // 尝试从 IndexedDB 加载已有数据库
    const savedData = await this.loadFromIndexedDB();
    this.db = savedData ? new SQL.Database(savedData) : new SQL.Database();

    if (!savedData) {
      this.runMigrations();
    }
  }

  // 每次数据变更后持久化到 IndexedDB
  async persist() {
    const data = this.db.export();
    await this.saveToIndexedDB(new Uint8Array(data));
  }

  // 导出为文件（用于备份）
  exportToFile(): Uint8Array {
    return new Uint8Array(this.db.export());
  }

  // 从文件导入（用于恢复）
  async importFromFile(data: Uint8Array) {
    const SQL = await initSqlJs();
    this.db = new SQL.Database(data);
    await this.persist();
  }
}
```

### 4.2 数据库 Schema

```sql
-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  nickname TEXT DEFAULT 'Musician',
  avatar_url TEXT,
  level TEXT CHECK(level IN ('beginner','intermediate','advanced')) DEFAULT 'beginner',
  preferred_instrument TEXT CHECK(preferred_instrument IN ('piano','cello')) DEFAULT 'piano',
  locale TEXT DEFAULT 'en',
  sound_feedback_enabled INTEGER DEFAULT 0,
  weekly_goal_days INTEGER DEFAULT 5,
  weekly_goal_minutes INTEGER DEFAULT 120,
  reference_pitch REAL DEFAULT 440.0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 曲目表
CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  composer TEXT,
  instrument TEXT CHECK(instrument IN ('piano','cello')) NOT NULL,
  difficulty TEXT CHECK(difficulty IN ('beginner','intermediate','advanced')),
  difficulty_score REAL,           -- 算法计算的难度分值 0~1
  duration_seconds INTEGER,
  category TEXT,                   -- 'etude','classical','exam' 等
  musicxml_path TEXT,              -- 内置乐谱的资源路径
  midi_path TEXT,                  -- 内置 MIDI 的资源路径
  is_builtin INTEGER DEFAULT 1,   -- 1=内置, 0=用户上传
  thumbnail_url TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 用户上传乐谱（MusicXML 内容存储）
CREATE TABLE IF NOT EXISTS user_scores (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT REFERENCES users(id),
  track_id TEXT REFERENCES tracks(id),
  musicxml_content TEXT NOT NULL,  -- MusicXML 原始内容
  created_at TEXT DEFAULT (datetime('now'))
);

-- 练习记录表
CREATE TABLE IF NOT EXISTS practice_sessions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT REFERENCES users(id),
  track_id TEXT REFERENCES tracks(id),
  instrument TEXT NOT NULL,
  mode TEXT CHECK(mode IN ('musical_piece','single_note')) NOT NULL,
  status TEXT CHECK(status IN ('in_progress','completed','abandoned')) DEFAULT 'in_progress',
  target_bpm INTEGER,
  actual_avg_bpm REAL,
  duration_seconds INTEGER,
  -- 五维评分
  score_speed INTEGER CHECK(score_speed BETWEEN 0 AND 20),
  score_rhythm INTEGER CHECK(score_rhythm BETWEEN 0 AND 20),
  score_intonation INTEGER CHECK(score_intonation BETWEEN 0 AND 20),
  score_smoothness INTEGER CHECK(score_smoothness BETWEEN 0 AND 20),
  score_completeness INTEGER CHECK(score_completeness BETWEEN 0 AND 20),
  score_total INTEGER CHECK(score_total BETWEEN 0 AND 100),
  -- 录音数据（Blob 存 IndexedDB，这里存引用 key）
  recording_blob_key TEXT,
  -- 中断续录信息
  resume_position INTEGER,        -- 中断时的乐谱位置（小节号）
  resume_audio_offset REAL,       -- 中断时的音频偏移（秒）
  started_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT
);

-- 错误详情表
CREATE TABLE IF NOT EXISTS practice_errors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT REFERENCES practice_sessions(id) ON DELETE CASCADE,
  measure_number INTEGER NOT NULL,
  beat_position REAL,
  error_type TEXT CHECK(error_type IN (
    'wrong_note','pitch_deviation','rhythm_early','rhythm_late',
    'missed_note','extra_note','pause'
  )) NOT NULL,
  expected_note TEXT,             -- 期望的 MIDI note 名称
  actual_note TEXT,               -- 实际检测到的 note
  deviation_cents REAL,           -- 音准偏差（音分）
  deviation_ms REAL,              -- 节奏偏差（毫秒）
  severity TEXT CHECK(severity IN ('minor','moderate','major')) DEFAULT 'moderate',
  hand TEXT CHECK(hand IN ('left','right','both')),  -- 钢琴左右手
  timestamp_ms REAL               -- 在录音中的时间位置
);

-- 诊断分析表
CREATE TABLE IF NOT EXISTS diagnostics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT REFERENCES practice_sessions(id) ON DELETE CASCADE,
  dimension TEXT NOT NULL,        -- 'speed','rhythm','intonation','smoothness','completeness'
  problem TEXT NOT NULL,          -- 问题描述
  cause TEXT,                     -- 原因分析
  solution TEXT,                  -- 解决方案
  severity TEXT CHECK(severity IN ('minor','moderate','major')),
  related_measures TEXT           -- JSON 数组，关联的小节号
);

-- 成就表
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  type TEXT NOT NULL,             -- 'first_perfect','streak_7','track_mastered' 等
  track_id TEXT REFERENCES tracks(id),
  unlocked_at TEXT DEFAULT (datetime('now')),
  metadata TEXT                   -- JSON，额外数据
);

-- 练习目标表
CREATE TABLE IF NOT EXISTS weekly_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT REFERENCES users(id),
  week_start TEXT NOT NULL,       -- ISO 周起始日期
  target_days INTEGER DEFAULT 5,
  target_minutes INTEGER DEFAULT 120,
  actual_days INTEGER DEFAULT 0,
  actual_minutes INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_sessions_user ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_track ON practice_sessions(track_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON practice_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_errors_session ON practice_errors(session_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
```

### 4.3 大文件存储策略

SQLite（sql.js）适合存储结构化数据，但不适合存储大型二进制文件。采用混合策略：

| 数据类型 | 存储位置 | 说明 |
|---------|---------|------|
| 用户信息、评分、错误记录 | SQLite (sql.js) | 结构化查询 |
| 录音文件 (WAV/WebM) | IndexedDB (直接) | Blob 存储，SQLite 存引用 key |
| 用户上传的 MusicXML | SQLite (TEXT 字段) | 文本数据，体积可控 |
| 内置曲库资源 | 静态文件 + SW 缓存 | 随应用打包 |
| SQLite 数据库文件 | IndexedDB | sql.js 导出的 Uint8Array |

---

## 五、乐器抽象层设计

为未来扩展到更多乐器预留架构：

```typescript
// 乐器基类接口
interface Instrument {
  readonly id: string;                    // 'piano' | 'cello' | ...
  readonly name: string;
  readonly type: 'keyboard' | 'string' | 'wind' | 'percussion';
  readonly pitchType: 'discrete' | 'continuous';  // 离散(钢琴) vs 连续(弦乐)
  readonly polyphonic: boolean;           // 是否多声部
  readonly tuningRequired: boolean;       // 是否需要调音
  readonly standardTuning?: number[];     // 标准调音频率（弦乐器各弦）

  // 获取对应的音频分析器
  getAnalyzer(): InstrumentAnalyzer;
  // 获取对应的评分配置
  getScoringConfig(level: string): ScoringConfig;
  // 获取调音器配置（如果需要）
  getTunerConfig?(): TunerConfig;
}

// 钢琴实现
class Piano implements Instrument {
  readonly id = 'piano';
  readonly name = 'Piano';
  readonly type = 'keyboard';
  readonly pitchType = 'discrete';
  readonly polyphonic = true;
  readonly tuningRequired = false;

  getAnalyzer(): InstrumentAnalyzer {
    return new PianoAnalyzer();  // 使用 basic-pitch 多音检测
  }
}

// 大提琴实现
class Cello implements Instrument {
  readonly id = 'cello';
  readonly name = 'Cello';
  readonly type = 'string';
  readonly pitchType = 'continuous';
  readonly polyphonic = false;
  readonly tuningRequired = true;
  readonly standardTuning = [65.41, 98.00, 146.83, 220.00]; // C2, G2, D3, A3

  getAnalyzer(): InstrumentAnalyzer {
    return new CelloAnalyzer();  // 使用 Pitchy 单音检测
  }

  getTunerConfig(): TunerConfig {
    return {
      strings: [
        { name: 'C', frequency: 65.41, octave: 2 },
        { name: 'G', frequency: 98.00, octave: 2 },
        { name: 'D', frequency: 146.83, octave: 3 },
        { name: 'A', frequency: 220.00, octave: 3 },
      ],
      toleranceCents: 5,  // 调准容忍度
    };
  }
}

// 工厂
class InstrumentFactory {
  private static instruments: Map<string, Instrument> = new Map([
    ['piano', new Piano()],
    ['cello', new Cello()],
  ]);

  static get(id: string): Instrument {
    return this.instruments.get(id)!;
  }

  // 未来扩展：注册新乐器
  static register(instrument: Instrument) {
    this.instruments.set(instrument.id, instrument);
  }
}
```

---

## 六、UI/UX 设计方案

### 6.1 设计系统

**色彩体系：**
- 主色：`#6366F1`（Indigo 500）— 代表音乐的优雅与专业
- 辅助色：`#8B5CF6`（Violet 500）— 渐变搭配
- 成功色：`#10B981`（Emerald 500）— 正确音符
- 错误色：`#EF4444`（Red 500）— 错误音符
- 警告色：`#F59E0B`（Amber 500）— 偏差提示
- 背景：深色模式 `#0F172A`（Slate 900）为主，浅色模式 `#F8FAFC`
- 卡片背景：`rgba(255,255,255,0.05)` 半透明毛玻璃效果

**视觉要素：**
- 卡片：圆角 12px，`backdrop-blur-xl` 毛玻璃效果，微妙阴影
- 渐变：主色到辅助色的线性渐变用于关键按钮和进度条
- 阴影：多层阴影 `shadow-lg shadow-indigo-500/20` 营造层次感
- 动画：Framer Motion 微交互（页面切换、卡片进入、数值变化）
- 图片：Unsplash 高质量音乐主题图片作为曲目封面和背景

**字体：**
- 英文：Inter（Google Fonts，通过 `fonts.loli.net` 加载）
- 中文：系统默认（-apple-system, "PingFang SC", "Microsoft YaHei"）
- 等宽：JetBrains Mono（乐谱标记、数据展示）

### 6.2 页面原型设计

#### 6.2.1 首页（Dashboard）

```
┌──────┬──────────────────────────────────────────────────┐
│      │  Welcome back, [Name]!              [EN/ZH] [⚙]  │
│  🏠  │                                                   │
│ Home │  ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│      │  │ 🕐 45min │ │ ⭐ 82pts │ │ 🔥 5 days│            │
│  🎵  │  │ This Week│ │ Avg Score│ │ Streak  │            │
│Library│  └─────────┘ └─────────┘ └─────────┘            │
│      │                                                   │
│  🎹  │  Weekly Goal ━━━━━━━━━━━━━━━━━━━━━━━━━ 75%       │
│Practice│                                                  │
│      │  Recent Practice                    [View All →]  │
│  📊  │  ┌──────────────────────────────────────────────┐ │
│Report│  │ 🎹 Für Elise          85/100    2 hours ago  │ │
│      │  │ 🎻 BWV 1007 Prelude   72/100    Yesterday    │ │
│  👤  │  │ 🎹 Turkish March      ⏸ Resume  3 days ago   │ │
│Profile│  └──────────────────────────────────────────────┘ │
│      │                                                   │
│      │  Skill Radar                Growth Trend          │
│      │  ┌──────────────┐          ┌──────────────┐      │
│      │  │   ╱Speed╲    │          │  📈 折线图    │      │
│      │  │  ╱       ╲   │          │              │      │
│      │  │ Comp   Rhythm│          │              │      │
│      │  │  ╲       ╱   │          │              │      │
│      │  │   ╲Smooth╱   │          │              │      │
│      │  └──────────────┘          └──────────────┘      │
└──────┴──────────────────────────────────────────────────┘
```

设计要点：
- 左侧 72px 宽侧边栏，图标 + 文字导航，当前页高亮
- 顶部三张统计卡片：毛玻璃背景 + 渐变图标 + 数值动画
- 周目标进度条：渐变色填充，达标时金色动效
- 最近练习列表：卡片式，悬停阴影加深，未完成的显示"Resume"按钮
- 底部双栏：左侧五维雷达图（Recharts），右侧成长趋势折线图
- 背景：Unsplash 音乐主题图片，低透明度叠加

#### 6.2.2 曲库页（Library）

```
┌──────┬──────────────────────────────────────────────────┐
│      │  Music Library                                    │
│ Side │                                                   │
│ bar  │  [🎹 Piano] [🎻 Cello]     🔍 Search...          │
│      │                                                   │
│      │  [All] [Beginner] [Intermediate] [Advanced]       │
│      │  [Etude] [Classical] [Exam]  [📤 Upload MusicXML] │
│      │                                                   │
│      │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │
│      │  │ 🖼 img  │ │ 🖼 img  │ │ 🖼 img  │ │ 🖼 img  │    │
│      │  │Für Elise│ │Ode to  │ │Moonlight│ │Turkish │    │
│      │  │Beethoven│ │Joy     │ │Sonata  │ │March   │    │
│      │  │⭐⭐☆ Med│ │⭐☆☆ Easy│ │⭐⭐⭐ Hard│ │⭐⭐☆ Med│    │
│      │  │ 3:20   │ │ 1:45   │ │ 6:10   │ │ 3:50   │    │
│      │  │[Practice]│ │[Practice]│ │[Practice]│ │[Practice]│    │
│      │  └────────┘ └────────┘ └────────┘ └────────┘    │
│      │                                                   │
│      │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │
│      │  │ ...    │ │ ...    │ │ ...    │ │ ...    │    │
│      │  └────────┘ └────────┘ └────────┘ └────────┘    │
└──────┴──────────────────────────────────────────────────┘
```

设计要点：
- 乐器切换：Tabs 组件，选中态渐变底色
- 难度/分类筛选：Badge 按钮组，多选
- 曲目卡片：Unsplash 音乐图片封面 + 渐变遮罩 + 信息叠加
- 难度星级：FontAwesome 星星图标，颜色区分
- 上传入口：虚线边框卡片，拖拽上传 MusicXML
- 网格布局：4 列（桌面）/ 2 列（平板）/ 1 列（手机）

#### 6.2.3 练习页（Practice）

```
┌─────────────────────────────────────────────────────────┐
│ ← Back  Für Elise - Beethoven    🎹 Piano  [⏸][⏹][⚙]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │                                                 │    │
│  │     ♩ ♩ ♩ ♩ ♩ ♩ ♩ ♩    ♩ ♩ ♩ ♩ ♩ ♩ ♩ ♩       │    │
│  │     ▲ (光标跟随位置)                              │    │
│  │     🟢🟢🟢🔴 ⬜⬜⬜⬜    ⬜⬜⬜⬜⬜⬜⬜⬜       │    │
│  │                                                 │    │
│  │     ♩ ♩ ♩ ♩ ♩ ♩ ♩ ♩    ♩ ♩ ♩ ♩ ♩ ♩ ♩ ♩       │    │
│  │                                                 │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ ⏱ 01:23  ▁▂▃▅▇▅▃▂▁▂▃▅▇▅▃  BPM: 108  │ 🎤 REC │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌───────────┐   │
│  │🎵 Mode  │ │⏱ Speed  │ │🥁 Metro  │ │🎶 Accomp  │   │
│  │Piece ▾  │ │ 75% ▾   │ │ ON  🔊   │ │ OFF 🔇    │   │
│  └─────────┘ └─────────┘ └──────────┘ └───────────┘   │
└─────────────────────────────────────────────────────────┘
```

设计要点：
- 全屏沉浸式，隐藏侧边栏，顶部极简工具栏
- 乐谱区域占据 60-70% 高度，OSMD 渲染
- 光标跟随：半透明蓝色竖条，平滑动画移动
- 音符着色：绿色=正确，红色=错误，灰色=未弹，白色=待弹
- 错误气泡：红色半透明气泡浮在错误音符上方，显示偏差信息
- 底部控制栏：录制状态 + 波形 + BPM 显示
- 底部工具栏：模式/速度/节拍器/伴奏，使用 Dropdown 和 Switch 组件
- 深色背景，乐谱区域白色/浅色，形成视觉焦点

#### 6.2.4 评测报告页（Report）

```
┌──────┬──────────────────────────────────────────────────┐
│      │  Performance Report                [📤Share][🔗]  │
│ Side │  Für Elise - Beethoven  |  🎹 Piano  |  3:20     │
│ bar  │                                                   │
│      │  ┌──────────────────┐  ┌──────────────────────┐  │
│      │  │    Total Score   │  │     Radar Chart      │  │
│      │  │                  │  │      ╱Speed╲         │  │
│      │  │      85          │  │     ╱  18   ╲        │  │
│      │  │     /100         │  │   Comp       Rhythm  │  │
│      │  │                  │  │    19╲       ╱15     │  │
│      │  │  ⭐ Personal Best│  │      ╲Smooth╱        │  │
│      │  └──────────────────┘  │       17             │  │
│      │                        │   Intonation: 16     │  │
│      │                        └──────────────────────┘  │
│      │                                                   │
│      │  [🎵 Both Hands] [👈 Left] [👉 Right]             │
│      │                                                   │
│      │  🔊 Playback  ━━━━━━━━━━━━━━━━━━━━━━ 01:23/03:20 │
│      │                                                   │
│      │  Issues Found (3)                                 │
│      │  ┌──────────────────────────────────────────────┐ │
│      │  │ 🔴 Measure 12: Wrong note (E4 → D4)         │ │
│      │  │    Cause: Finger positioning error           │ │
│      │  │    Fix: Practice m.12 slowly at 50% speed    │ │
│      │  │    [▶ Practice This Section]                 │ │
│      │  ├──────────────────────────────────────────────┤ │
│      │  │ 🟡 Measure 8-10: Rhythm unstable             │ │
│      │  │    ...                                       │ │
│      │  └──────────────────────────────────────────────┘ │
│      │                                                   │
│      │  Score with Error Annotations                     │
│      │  ┌──────────────────────────────────────────────┐ │
│      │  │  ♩♩♩♩ ♩♩♩♩  [🔴m12] ♩♩♩♩  ♩♩♩♩             │ │
│      │  └──────────────────────────────────────────────┘ │
└──────┴──────────────────────────────────────────────────┘
```

设计要点：
- 顶部大号总分数字，渐变色，数值进入动画
- 五维雷达图：Recharts RadarChart，填充半透明渐变
- 左右手切换：Tabs 组件（仅钢琴显示）
- 录音回放：自定义播放器，进度条与乐谱光标同步
- 问题列表：可展开的 Accordion 卡片，按严重程度颜色编码
- 每个问题卡片包含：问题描述、原因分析、解决方案、"练习此片段"按钮
- 底部带错误标注的乐谱缩略视图，红色高亮出错小节
- 分享按钮：生成精美分享卡片（Canvas 绘制）

#### 6.2.5 调音器页（Tuner）

```
┌──────┬──────────────────────────────────────────────────┐
│      │  Cello Tuner                    A4 = 440 Hz [⚙]  │
│ Side │                                                   │
│ bar  │           ┌─────────────────────┐                │
│      │           │                     │                │
│      │           │    ◀━━━━━|━━━━━▶    │                │
│      │           │         A3          │                │
│      │           │      220.0 Hz       │                │
│      │           │      +3 cents       │                │
│      │           │                     │                │
│      │           └─────────────────────┘                │
│      │                                                   │
│      │    ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│      │    │  C2  │ │  G2  │ │  D3  │ │  A3  │          │
│      │    │ 🟢   │ │ 🟡   │ │ ⬜   │ │ 🔴   │          │
│      │    │ ✓ OK │ │ +12¢ │ │ ---  │ │ -8¢  │          │
│      │    └──────┘ └──────┘ └──────┘ └──────┘          │
│      │                                                   │
│      │    [🎵 Play Reference Tone]                       │
└──────┴──────────────────────────────────────────────────┘
```

设计要点：
- 中央大型仪表盘：圆弧指针显示音高偏差
- 当前检测到的音名和频率大号显示
- 偏差值：绿色=准确，黄色=微偏，红色=偏差大
- 四根弦状态卡片：独立显示每根弦的调音状态
- 智能弦位识别：自动高亮当前正在调的弦
- 参考音播放按钮：播放标准音高供用户对照

#### 6.2.6 用户中心页（Profile）

```
┌──────┬──────────────────────────────────────────────────┐
│      │  Profile                                          │
│ Side │                                                   │
│ bar  │  ┌──────────────────────────────────────────────┐ │
│      │  │  [Avatar]  Musician Name                     │ │
│      │  │  Level: Intermediate  |  🎹 Piano preferred  │ │
│      │  │  Member since: Jan 2025                      │ │
│      │  └──────────────────────────────────────────────┘ │
│      │                                                   │
│      │  Settings                                         │
│      │  ┌──────────────────────────────────────────────┐ │
│      │  │  Skill Level     [Beginner ▾]                │ │
│      │  │  Language         [English ▾]                 │ │
│      │  │  Sound Feedback   [○ OFF]                     │ │
│      │  │  Reference Pitch  [440 Hz ▾]                  │ │
│      │  └──────────────────────────────────────────────┘ │
│      │                                                   │
│      │  Statistics                                        │
│      │  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│      │  │ 📊 156   │ │ ⏱ 24h    │ │ 🏆 12    │         │
│      │  │ Sessions │ │ Total    │ │ Achieve  │         │
│      │  └──────────┘ └──────────┘ └──────────┘         │
│      │                                                   │
│      │  Achievements                                     │
│      │  🏅🏅🏅🏅🏅🔒🔒🔒🔒🔒                          │
│      │                                                   │
│      │  Data Management                                  │
│      │  [📥 Export Data]  [📤 Import Data]               │
└──────┴──────────────────────────────────────────────────┘
```

### 6.3 响应式断点

| 断点 | 宽度 | 布局 | 功能 |
|------|------|------|------|
| Desktop | ≥1280px | 侧边栏 + 全功能 | 完整功能 |
| Tablet | 768-1279px | 可折叠侧边栏 + 全功能 | 完整功能 |
| Mobile | <768px | 底部 Tab 导航 + 只读 | 曲库浏览、报告查看 |

### 6.4 关键组件的视觉规范

**卡片组件：**
```css
/* 标准卡片 */
.card {
  @apply rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl;
  @apply shadow-lg shadow-black/5;
  @apply transition-all duration-200 hover:shadow-xl hover:bg-white/8;
}

/* 渐变强调卡片 */
.card-accent {
  @apply bg-gradient-to-br from-indigo-500/20 to-violet-500/20;
  @apply border-indigo-500/30;
}
```

**按钮组件：**
```css
/* 主按钮 */
.btn-primary {
  @apply bg-gradient-to-r from-indigo-500 to-violet-500;
  @apply hover:from-indigo-600 hover:to-violet-600;
  @apply shadow-lg shadow-indigo-500/25;
  @apply text-white font-medium rounded-lg px-6 py-2.5;
}
```

**进度条：**
```css
.progress-bar {
  @apply h-2 rounded-full bg-slate-800;
}
.progress-fill {
  @apply h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500;
  @apply transition-all duration-500 ease-out;
}
```

---

## 七、PWA 与离线策略

### 7.1 Service Worker 缓存策略

```typescript
// workbox-config.ts
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';

// 预缓存：构建产物（JS/CSS/HTML）
precacheAndRoute(self.__WB_MANIFEST);

// 内置曲库资源：Cache First（首次加载后永久缓存）
registerRoute(
  ({ url }) => url.pathname.startsWith('/assets/scores/') ||
               url.pathname.startsWith('/assets/midi/'),
  new CacheFirst({ cacheName: 'music-library' })
);

// sql.js WASM 文件：Cache First
registerRoute(
  ({ url }) => url.pathname.includes('sql-wasm'),
  new CacheFirst({ cacheName: 'wasm-cache' })
);

// Unsplash 图片：Cache First + 过期策略
registerRoute(
  ({ url }) => url.hostname === 'images.unsplash.com',
  new CacheFirst({
    cacheName: 'unsplash-images',
    plugins: [{ maxEntries: 50, maxAgeSeconds: 30 * 24 * 3600 }]
  })
);
```

### 7.2 离线功能矩阵

| 功能 | 离线可用 | 说明 |
|------|---------|------|
| 乐谱渲染 | ✅ | OSMD + 缓存的 MusicXML |
| 录制练习 | ✅ | Web Audio API 纯本地 |
| 实时跟随 | ✅ | 音频分析纯前端 |
| 评分报告 | ✅ | 评分引擎纯前端 |
| 曲库浏览 | ✅ | 首次加载后缓存 |
| MIDI 播放 | ✅ | Tone.js 纯前端合成 |
| 报告链接分享 | ❌ | 需要第三方存储服务 |
| 图片分享 | ✅ | Canvas 本地生成 |
| 数据导出 | ✅ | 本地文件下载 |

---

## 八、分享功能方案

### 8.1 图片分享

使用 Canvas API 生成分享卡片：

```typescript
class ShareCardGenerator {
  async generateImage(report: ScoreReport): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;  // 社交媒体推荐尺寸
    const ctx = canvas.getContext('2d')!;

    // 绘制渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, '#6366F1');
    gradient.addColorStop(1, '#8B5CF6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    // 绘制总分、曲目名、雷达图等...
    return new Promise(resolve => canvas.toBlob(resolve!, 'image/png'));
  }
}
```

### 8.2 链接分享

报告数据压缩后编码到 URL（小数据量）或上传到免费 JSON 存储服务（大数据量）：

```typescript
class ReportSharer {
  async shareViaLink(report: ScoreReport): Promise<string> {
    const data = JSON.stringify(report);
    const compressed = pako.deflate(data);
    const base64 = btoa(String.fromCharCode(...compressed));

    // 小数据量：直接编码到 URL hash
    if (base64.length < 2000) {
      return `${window.location.origin}/share#data=${encodeURIComponent(base64)}`;
    }
    // 大数据量：上传到 jsonbin.io 等免费服务
    const response = await fetch('https://api.jsonbin.io/v3/b', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data,
    });
    const { metadata } = await response.json();
    return `${window.location.origin}/share/${metadata.id}`;
  }
}
```

---

## 九、国际化方案

```typescript
// i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './en.json';
import zh from './zh.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, zh: { translation: zh } },
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
```

翻译文件覆盖范围：导航、评分维度、练习控制、报告、设置、成就、错误提示等全部 UI 文案。

---

## 十、关键依赖清单

### 10.1 核心依赖

| 类别 | 包名 | 版本 | 用途 |
|------|------|------|------|
| 框架 | react, react-dom | ^18.3 | UI 框架 |
| 路由 | react-router-dom | ^6.26 | 客户端路由 |
| 状态 | zustand | ^4.5 | 状态管理 |
| 乐谱 | opensheetmusicdisplay | ^1.9 | MusicXML 渲染 |
| 音频合成 | tone, @tonejs/midi | ^15.0, ^2.0 | MIDI 播放 |
| 音高(单音) | pitchy | ^4.1 | 大提琴实时音准 |
| 音高(多音) | @spotify/basic-pitch | ^1.0 | 钢琴多声部 |
| 音频分析 | essentia.js | ^0.1 | WASM 音频特征 |
| 数据库 | sql.js | ^1.14 | 浏览器端 SQLite |
| 图表 | recharts | ^2.12 | 雷达图/趋势图 |
| 国际化 | react-i18next, i18next | ^14.1, ^23.11 | 双语 |
| 动画 | framer-motion | ^11.0 | 微交互动画 |
| 压缩 | pako | ^2.1 | 分享数据压缩 |
| UI 原语 | @radix-ui/* | ^1.1 | shadcn/ui 底层 |
| 样式工具 | tailwind-merge, clsx, cva | latest | 样式合并 |
| 图标 | lucide-react, @fortawesome/fontawesome-free | latest | 图标库 |

### 10.2 依赖体积预估

| 依赖 | 体积（gzip） | 加载策略 |
|------|-------------|---------|
| React + ReactDOM | ~45KB | 首屏 |
| OSMD | ~800KB | 练习页懒加载 |
| Tone.js | ~150KB | 练习页懒加载 |
| sql.js WASM | ~400KB | 首屏（数据库初始化） |
| Essentia.js WASM | ~300KB | 练习页懒加载 |
| basic-pitch model | ~8MB | 评分时按需加载 |
| Recharts | ~80KB | 首页/报告页懒加载 |
| 其他 | ~150KB | 首屏 |
| **首屏总计** | **~600KB** | |
| **完整加载** | **~2MB + 8MB 模型** | |

> basic-pitch 的 TF.js 模型（~8MB）采用懒加载：仅在录制完成需要生成精确报告时才下载。实时跟随使用轻量的 Essentia.js + Pitchy。

---

## 十一、性能优化策略

| 优化点 | 方案 |
|--------|------|
| 音频处理不阻塞 UI | AudioWorklet 独立线程 + Web Worker |
| 乐谱渲染性能 | OSMD Canvas 模式，局部重绘 |
| React 渲染优化 | React.memo + useMemo + 虚拟列表 |
| 波形显示 | requestAnimationFrame + Canvas 直绘 |
| 代码分割 | React.lazy 路由级分割 |
| 模型懒加载 | basic-pitch 仅评分时加载 |
| 图片优化 | Unsplash `?w=400&q=80` 参数控制 |
| 缓存策略 | Service Worker Cache First |

---

## 十二、数据导出/导入格式

```typescript
interface ExportData {
  version: string;                    // 数据格式版本号
  exportedAt: string;                 // 导出时间
  user: UserProfile;                  // 用户信息
  practiceHistory: PracticeSession[]; // 练习记录（不含录音）
  achievements: Achievement[];        // 成就
  weeklyGoals: WeeklyGoal[];         // 目标记录
  userScores?: UserScore[];          // 用户上传的乐谱（可选）
  includeRecordings: boolean;        // 是否包含录音
  recordings?: {                     // 录音文件（可选，base64）
    sessionId: string;
    data: string;
  }[];
}
```

导出为 `.json` 文件下载，导入时校验版本号并提供合并/覆盖选项。
