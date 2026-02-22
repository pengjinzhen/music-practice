# 第五轮测试 — 成就系统测试

> 状态标记：⬜ 待测试 | ✅ 已通过 | ❌ 发现Bug（已修复）

| # | 测试用例 | 状态 | 说明 |
|---|---------|------|------|
| 5.1 | AchievementEngine.getDefinitions 返回所有成就定义 | ✅ | >= 8 个定义 |
| 5.2 | 成就定义包含必要字段 | ✅ | id/type/title/titleZh/description/descriptionZh/check |
| 5.3 | 成就 ID 无重复 | ✅ | |
| 5.5 | checkAll 已解锁的成就不重复解锁 | ✅ | |
| 5.7 | first-practice 成就：1次练习即解锁 | ✅ | |
| 5.8 | perfect-score 成就：满分100解锁 | ✅ | |
| 5.9 | tracks-5 成就：5首不同曲目解锁 | ✅ | |
| 5.10 | hours-10 成就：36000秒解锁 | ✅ | |
| 5.11 | sessions-50 成就：50次练习解锁 | ✅ | |
| 5.12 | 成就类型合法 | ✅ | milestone/score/streak |

测试文件：`src/test/round-05.test.ts` — 10 个测试全部通过
