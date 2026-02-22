# 第二轮测试 — 数据库层测试

> 状态标记：⬜ 待测试 | ✅ 已通过 | ❌ 发现Bug（已修复）

| # | 测试用例 | 状态 | 说明 |
|---|---------|------|------|
| 2.1 | query() 无参数 SELECT 返回正确结构 | ✅ | columns 包含 id/nickname |
| 2.2 | query() 带参数 SELECT 返回匹配行 | ✅ | 参数绑定正常 |
| 2.3 | query() 无结果返回空 values | ✅ | values.length === 0 |
| 2.4 | execute() 执行 INSERT 成功 | ✅ | |
| 2.5 | execute() 执行 UPDATE 成功 | ✅ | |
| 2.6 | execute() 执行 DELETE 成功 | ✅ | |
| 2.8 | ScoreRepository.upsert 插入曲目 | ✅ | |
| 2.9 | ScoreRepository.getById 查询曲目 | ✅ | |
| 2.10 | ScoreRepository.getAll 按乐器筛选 | ✅ | |
| 2.11 | ScoreRepository.search 模糊搜索 | ✅ | |
| 2.12 | PracticeRepository.create 创建练习记录 | ✅ | |
| 2.13 | PracticeRepository.getRecent 获取最近记录 | ✅ | |
| 2.14 | PracticeRepository.updateScores 更新分数 | ✅ | |
| 2.15 | UserRepository.get 获取用户 | ✅ | |
| 2.16 | UserRepository.update 更新用户字段 | ✅ | |
| 2.17 | AchievementRepository.unlock 解锁成就 | ✅ | |
| 2.18 | AchievementRepository.getAll 获取所有成就 | ✅ | |
| 2.19 | WeeklyGoalRepository.getCurrentWeek 获取/创建周目标 | ✅ | |
| 2.20 | WeeklyGoalRepository.updateTarget 更新目标 | ✅ | |

测试文件：`src/test/round-02.test.ts` — 19 个测试全部通过
