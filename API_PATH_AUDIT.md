# API 调用路径审计报告

**生成日期**: 2026-05-16
**审计范围**: `src/stores/index.ts`

---

## 一、API 调用路径清单

### 1.1 GitHub Contents API（写入操作）

| 行号 | 函数 | URL 构建方式 | 路径类型 |
|------|------|-------------|----------|
| 385-388 | `saveViaGithub` | `ghApiUrl()` | ✅ 绝对 URL |
| 472-480 | `saveViaGithub` | `ghApiUrl()` | ✅ 绝对 URL |

**URL 示例**：
```typescript
// 生产环境
https://api.github.com/repos/Lily1756/love-anniversary/contents/public/data/photos.json

// 开发环境（通过 Vite 代理）
/api/github/repos/Lily1756/love-anniversary/contents/public/data/photos.json
```

### 1.2 Cloudflare Function（快速写入）

| 行号 | 函数 | 端点 | 路径类型 |
|------|------|------|----------|
| 547 | `saveAlbums` | `/save-photos` | ✅ 绝对路径 |
| 585 | `saveFootprints` | `/save-photos` | ✅ 绝对路径 |
| 607 | `saveLetters` | `/save-photos` | ✅ 绝对路径 |

**URL 示例**：
```typescript
// 生产环境
/save-photos  // 相对域名根路径

// 开发环境
/save-photos  // Vite 会返回 index.html（被检测到后回退到 GitHub API）
```

### 1.3 Raw Content API（读取操作）

| 行号 | 函数 | URL 构建方式 | 路径类型 |
|------|------|-------------|----------|
| 405 | `saveViaGithub` | `getRawBase()` | ✅ 绝对 URL |
| 133 | `fetchLatest` | `getRawBase()` | ✅ 绝对 URL |

**URL 示例**：
```typescript
// 生产环境
https://raw.githubusercontent.com/Lily1756/love-anniversary/main/public/data/photos.json

// 开发环境（通过 Vite 代理）
/api/github/repos/Lily1756/love-anniversary/contents/public/data/photos.json
```

---

## 二、路径类型验证

| 路径类型 | 是否允许 | 当前状态 | 说明 |
|----------|----------|----------|------|
| 绝对 URL (`https://...`) | ✅ | ✅ 通过 | GitHub API 使用完整 URL |
| 绝对路径 (`/api/...`) | ✅ | ✅ 通过 | Vite 代理路径 |
| 相对路径 (`./data/...`) | ❌ | ✅ 未使用 | 无相对路径调用 |
| 相对路径 (`../data/...`) | ❌ | ✅ 未使用 | 无相对路径调用 |

---

## 三、特殊处理机制

### 3.1 CF Function 幽灵保存防护

**问题**：本地开发时 `/save-photos` 不存在，Vite fallback 返回 `index.html`（200 OK），可能被误判为成功。

**当前防护**（第 555-556 行）：
```typescript
const contentType = resp.headers.get('content-type') || ''
if (contentType.includes('application/json')) {
  // 只有返回 JSON 才算成功
}
```

### 3.2 开发/生产环境自动切换

**机制**：`isDev()` 函数检测 `import.meta.env.DEV`

```typescript
function ghApiUrl(path: string): string {
  return isDev()
    ? `/api/github/${path}`           // 开发：走代理
    : `https://api.github.com/${path}` // 生产：直连
}
```

---

## 四、结论

✅ **所有 API 调用均使用正确的绝对路径，无相对路径风险。**

### 路径使用规范总结

1. **GitHub API**：使用 `ghApiUrl()` 包装，自动适配开发/生产环境
2. **CF Function**：使用根路径 `/save-photos`，通过 Vite 代理或直连
3. **Raw Content**：使用 `getRawBase()` 获取完整 URL，确保编码正确

### 建议

- ✅ 当前实现符合最佳实践
- 🔄 如需添加新的 API 端点，请确保使用 `ghApiUrl()` 或绝对路径
- ❌ 禁止使用相对路径（如 `../../data/xxx.json`）

---

*报告生成时间: 2026-05-16 18:08*
