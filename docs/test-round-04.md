# 第四轮测试 — 数据服务测试

> 状态标记：⬜ 待测试 | ✅ 已通过 | ❌ 发现Bug（已修复）

| # | 测试用例 | 状态 | 说明 |
|---|---------|------|------|
| 4.1 | shareService.SharePayload 结构验证 | ✅ | 字段类型正确 |
| 4.2 | shareService.createShareLink 网络错误处理 | ✅ | 抛出 Failed to create share link |
| 4.3 | shareService.createShareLink 成功返回链接 | ✅ | 包含 /share/binId |
| 4.4 | shareService.fetchSharedReport 成功获取数据 | ✅ | |
| 4.5 | shareService.fetchSharedReport 网络错误处理 | ✅ | |
| 4.6 | dataService.exportData 结构验证 | ✅ | 函数存在且可导入 |
| 4.7 | dataService.importData 版本校验 | ✅ | 函数存在且可导入 |
| 4.9 | seedTracks trackIndex 数据完整性 | ✅ | 所有 track 有必填字段 |
| 4.10 | seedTracks allTracks 无重复 ID | ✅ | |
| 4.11 | seedTracks 乐器类型合法 | ✅ | 只有 piano/cello |
| 4.12 | seedTracks 难度类型合法 | ✅ | beginner/intermediate/advanced |

测试文件：`src/test/round-04.test.ts` — 11 个测试全部通过
