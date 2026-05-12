# AI Agent 协作规范 v1.0

## 🎯 适用范围
任何在本仓库进行代码修改的 AI Agent 必须遵守本规范。

---

## 🚨 本项目特殊约定（优先级最高）

> 本项目**禁止使用 `git push`**，因为网络不稳定经常失败。
> 所有代码同步必须通过 **`python3 push_all_api.py`** 完成（GitHub API 增量推送）。

### 推送流程（必须严格遵守）
```bash
# 1. 修改源码 src/
# 2. 构建
npm run build
# 3. 通过 API 推送（不要用 git push）
python3 push_all_api.py
```

`push_all_api.py` 说明：
- 自动对比远端 SHA，**只推内容有变化的文件**（真正的增量）
- 包含 `src/`、`public/`、`dist/`、`vite.config.ts`、`package.json` 等关键路径
- 支持中文文件名，兼容国内网络

---

## 📋 数据层核心规范（禁止破坏）

### localStorage 缓存架构（核心资产）
`src/stores/index.ts` 中的缓存逻辑**不能被删除或简化**：

```
load 流程：优先读 localStorage → 缓存未命中时请求 GitHub → 写入缓存
save 流程：写入 GitHub（读→改→写）→ 成功后同步更新 localStorage
```

缓存 key 常量（`LS_KEYS`）：
| Key 常量 | localStorage Key | 对应数据 |
|----------|-----------------|---------|
| `LS_KEYS.letters` | `love_site_letters` | 情书/日记 |
| `LS_KEYS.albums` | `love_site_albums` | 相册 |
| `LS_KEYS.footprints` | `love_site_footprints` | 足迹 |
| `LS_KEYS.wishes` | `love_site_wishes` | 愿望清单 |
| `LS_KEYS.capsules` | `love_site_capsules` | 时间胶囊 |

### GitHub 数据写入规范
`saveViaGithub()` 必须保持**读→改→写**三步流程：
1. `GET /repos/.../contents/:path` → 获取远端 SHA + 内容
2. 智能合并（补充远端独有条目，不能丢数据）
3. `PUT /repos/.../contents/:path` → 写回，携带 SHA

**绝对禁止**：直接 PUT 一个全新的 JSON（会产生 409 冲突或丢失并发写入的数据）。

### base64 解码规范
GitHub Contents API 返回 base64 编码内容，**必须用 TextDecoder 解码**（支持中文）：
```ts
// ✅ 正确
const binaryStr = atob(cleaned)
const bytes = new Uint8Array(binaryStr.length)
for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)
const jsonStr = new TextDecoder('utf-8').decode(bytes)

// ❌ 错误（中文乱码）
const jsonStr = atob(cleaned)  // latin1，不支持 UTF-8 中文
```

---

## 📋 标准 Git 操作规范

### 修改前
1. 明确告知用户将修改的**具体文件列表**
2. 只修改事先声明的文件

### 提交规范
```bash
# 格式：<类型>: <描述>
git commit -m "feat: 修复相册保存功能"
```

提交类型：
- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式
- `refactor:` 重构
- `chore:` 构建/工具

### 禁止事项
- ❌ 禁止 `git push`（用 `python3 push_all_api.py` 替代）
- ❌ 禁止 `git add .` 或 `git add --all`（使用精确路径）
- ❌ 禁止提交 `dist/`、`node_modules/`（由 push_all_api.py 按需处理）
- ❌ 禁止删除 `localStorage` 缓存逻辑
- ❌ 禁止将 `saveViaGithub` 改为全量覆盖模式

---

## 🔍 每次开始工作的检查清单
- [ ] 已阅读本文件
- [ ] 了解项目使用 `push_all_api.py` 而非 `git push`
- [ ] 确认 `src/stores/index.ts` 的 `LS_KEYS` 和 `lsGet/lsSet` 函数存在
- [ ] 确认 `saveViaGithub` 保持读→改→写三步流程

---

## 📚 项目技术栈速查
- **框架**：Vue 3 + Vite + TypeScript + Pinia
- **部署**：Cloudflare Pages（监听 main 分支自动构建）
- **图床**：Cloudinary（cloud name: `dcpzdsdxc`）
- **数据存储**：GitHub 仓库 `Lily1756/love-anniversary`，路径 `public/data/`
- **开发代理**：`/api/github` → `api.github.com`（vite.config.ts 中配置）

---

*最后更新：2026-05-13*
*本规范对所有 AI Agent 具有强制约束力*
