# 第七轮测试 — 音频引擎测试

> 状态标记：⬜ 待测试 | ✅ 已通过 | ❌ 发现Bug（已修复）

| # | 测试用例 | 状态 | 说明 |
|---|---------|------|------|
| 7.1 | ChromaExtractor 纯正弦波提取正确 chroma bin | ✅ | |
| 7.2 | ChromaExtractor 静音输入返回全零 chroma | ✅ | |
| 7.3 | ChromaExtractor 归一化后最大值为 1 | ✅ | |
| 7.4 | NoiseFilter 未校准时直接返回原始数据 | ✅ | Float32精度需用toBeCloseTo |
| 7.5 | NoiseFilter 校准后 isCalibrated 为 true | ✅ | |
| 7.6 | NoiseFilter 频谱减法正确过滤噪声 | ✅ | |
| 7.7 | NoiseFilter 噪声门限判断正确 | ✅ | |
| 7.8 | NoiseFilter AGC 将信号归一化到目标 RMS | ✅ | |
| 7.9 | NoiseFilter AGC 静音信号不放大 | ✅ | |
| 7.10 | NoiseFilter reset 清除校准状态 | ✅ | |
| 7.11 | EchoCanceller 纯回声信号逐步收敛 | ✅ | |
| 7.12 | EchoCanceller processBuffer 长度正确 | ✅ | |
| 7.13 | EchoCanceller reset 清除权重 | ✅ | |
| 7.14 | OnsetDetector 首帧返回 null | ✅ | |
| 7.15 | OnsetDetector 能量突增检测到 onset | ✅ | |
| 7.16 | OnsetDetector cooldown 期间不重复触发 | ✅ | |
| 7.17 | BPMTracker 稳定节拍估算正确 BPM | ✅ | |
| 7.18 | BPMTracker 不足3拍返回0 | ✅ | |
| 7.19 | BPMTracker 稳定性指标合理 | ✅ | |
