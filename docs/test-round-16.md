# 第16轮测试：构建与打包测试

## 测试目标
验证 Vite 构建、TypeScript 类型检查、ESLint 规则

## 测试用例

### TC-16-01: TypeScript 类型检查
- 描述：运行 `tsc -b` 确保无类型错误
- 状态：⏳ 待测试

### TC-16-02: ESLint 检查
- 描述：运行 `eslint .` 确保无 lint 错误
- 状态：⏳ 待测试

### TC-16-03: Vite 构建
- 描述：运行 `vite build` 确保构建成功
- 状态：⏳ 待测试

### TC-16-04: 路径别名配置一致性
- 描述：验证 tsconfig 和 vite.config 的 @ 别名一致
- 状态：⏳ 待测试

### TC-16-05: 构建产物完整性
- 描述：验证 dist 目录包含必要文件（html/js/css/wasm）
- 状态：⏳ 待测试
