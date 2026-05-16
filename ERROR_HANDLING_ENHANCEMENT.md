# 错误处理增强方案

**目标**：提升用户体验，针对 GitHub API 限流、鉴权失败等场景提供友好提示

---

## 一、当前错误处理分析

### 1.1 saveViaGithub 错误处理

**当前行为**：
```typescript
// 成功时
return { success: true }

// 失败时
return { success: false, error: err.message }
```

**问题**：
- 错误对象中的 `error` 字段是技术信息（如 `写入失败 (403): ...`）
- UI 层直接 `alert()` 显示，用户体验差
- 未区分错误类型（限流、鉴权、网络错误）

### 1.2 UI 层错误处理

**Gallery.vue**（第 550-571 行）：
```typescript
alert(`⚠️ 保存失败\n\n${errMsg}\n\n请检查网络连接后重试。`)
```

**Letters.vue**（第 282 行）：
```typescript
alert('请填写标题和内容')
```

**问题**：
- 使用原生 `alert()`，样式与网站设计不匹配
- 错误信息过于技术化
- 未区分可恢复错误（如限流）和不可恢复错误（如 Token 失效）

---

## 二、增强方案

### 2.1 错误分类与用户提示

**新增错误类型定义**（`src/types/errors.ts`）：

```typescript
/**
 * GitHub API 错误类型
 */
export enum GitHubErrorType {
  RATE_LIMIT = 'rate_limit',      // 403 - API 限流
  AUTH_FAILED = 'auth_failed',    // 401/403 - Token 失效
  NOT_FOUND = 'not_found',       // 404 - 文件不存在
  NETWORK_ERROR = 'network',     // 网络错误
  UNKNOWN = 'unknown',           // 其他错误
}

/**
 * 用户友好的错误提示
 */
export const ERROR_MESSAGES: Record<GitHubErrorType, string> = {
  [GitHubErrorType.RATE_LIMIT]:
    'GitHub API 请求频率超限（每小时 5000 次）。\n\n请等待 1 分钟后重试，或手动更新数据文件。',
  
  [GitHubErrorType.AUTH_FAILED]:
    'GitHub Token 已失效。\n\n请检查 Token 是否过期，或重新生成 Token。',
  
  [GitHubErrorType.NOT_FOUND]:
    '数据文件不存在，将自动创建。',
    
  [GitHubErrorType.NETWORK_ERROR]:
    '网络连接失败。\n\n请检查网络后重试。',
    
  [GitHubErrorType.UNKNOWN]:
    '保存失败，请稍后重试。',
}
```

### 2.2 增强 saveViaGithub 错误处理

**修改 `src/stores/index.ts`**：

```typescript
import { GitHubErrorType, ERROR_MESSAGES } from '@/types/errors'

/**
 * 解析 GitHub API 错误类型
 */
function parseGitHubError(status: number, errorBody: string): GitHubErrorType {
  if (status === 403) {
    // 检查是否是限流错误
    if (errorBody.includes('rate limit') || errorBody.includes('API rate limit')) {
      return GitHubErrorType.RATE_LIMIT
    }
    return GitHubErrorType.AUTH_FAILED
  }
  
  if (status === 401) {
    return GitHubErrorType.AUTH_FAILED
  }
  
  if (status === 404) {
    return GitHubErrorType.NOT_FOUND
  }
  
  return GitHubErrorType.UNKNOWN
}

// 在 saveViaGithub 中使用
async function saveViaGithub(localData: any[], path: string, _password: string): Promise<SaveResult> {
  try {
    // ... 现有逻辑 ...
    
    if (!updateResp.ok) {
      const errorText = await updateResp.text().catch(() => '(无法读取响应)')
      const errorType = parseGitHubError(updateResp.status, errorText)
      const userMessage = ERROR_MESSAGES[errorType]
      
      console.error(`  ❌ GitHub API 错误 ${updateResp.status}:`, errorText)
      throw new Error(`[${errorType}] ${userMessage}`)
    }
    
    // ... 现有逻辑 ...
  } catch (err: any) {
    console.error(`  💥 [saveViaGithub] 失败: ${err.message}`)
    return { 
      success: false, 
      error: err.message,
      errorType: err.message.match(/^\[([^\]]+)\]/)?.[1] || GitHubErrorType.UNKNOWN
    }
  }
}
```

### 2.3 UI 层错误提示优化

**方案 A：使用现有 Toast 机制**

修改 `saveStatus` 和 `saveMessage` 逻辑：

```typescript
// 在 autoSave 函数中
function autoSave() {
  try {
    const result = await store.saveAlbums('2025')
    
    if (result.success) {
      setSaveState('saved', '保存成功 ✅')
    } else {
      // 解析错误类型，显示友好提示
      const errorMsg = result.error || '保存失败'
      setSaveState('error', errorMsg)
      
      // 如果是限流错误，显示更详细的提示
      if (errorMsg.includes('rate_limit')) {
        alert('⚠️ GitHub API 限流\n\n请等待 1 分钟后重试，或手动编辑 public/data/ 中的文件。')
      }
    }
  } catch (e: any) {
    setSaveState('error', `保存异常: ${e.message}`)
  }
}
```

**方案 B：创建统一错误提示组件**

`src/components/common/ErrorToast.vue`：

```vue
<template>
  <div v-if="visible" class="error-toast" :class="errorClass">
    <div class="error-icon">{{ icon }}</div>
    <div class="error-content">
      <div class="error-title">{{ title }}</div>
      <div class="error-message">{{ message }}</div>
      <div v-if="showAction" class="error-action">
        <button @click="$emit('action')">{{ actionText }}</button>
      </div>
    </div>
    <button class="error-close" @click="visible = false">×</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  type: 'error' | 'warning' | 'info'
  title: string
  message: string
  showAction?: boolean
  actionText?: string
}>()

defineEmits<{
  (e: 'action'): void
}>()

const visible = ref(true)

const icon = computed(() => {
  if (props.type === 'error') return '❌'
  if (props.type === 'warning') return '⚠️'
  return 'ℹ️'
})

const errorClass = computed(() => `error-${props.type}`)
</script>

<style scoped>
.error-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  display: flex;
  padding: 16px;
  z-index: 10000;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.error-warning { border-left: 4px solid #FF9800; }
.error-error { border-left: 4px solid #F44336; }
.error-info { border-left: 4px solid #2196F3; }

.error-icon { font-size: 24px; margin-right: 12px; }
.error-title { font-weight: 600; margin-bottom: 4px; }
.error-message { font-size: 14px; color: #666; }
.error-action { margin-top: 8px; }
.error-action button {
  background: #FE7D9A;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 6px;
  cursor: pointer;
}
.error-close {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}
</style>
```

---

## 三、GitHub Token 失效/限流处理指南

### 3.1 识别问题

**限流错误（403）**：
```
GitHub API 错误 403: API rate limit exceeded
```

**Token 失效（401/403）**：
```
GitHub API 错误 401: Bad credentials
```

### 3.2 手动处理步骤

**步骤 1：检查 Token 状态**

访问：https://github.com/settings/tokens

- 如果 Token 已过期 → 点击 "Regenerate token"
- 如果 Token 被撤销 → 创建新 Token（需要 `repo` 权限）

**步骤 2：更新 Token**

本地开发环境：
```typescript
// src/stores/index.ts 第 35 行
const _g = ['新Token'].join('')
```

Cloudflare Pages 环境变量：
1. 登录 Cloudflare Dashboard
2. 进入 Pages → love-anniversary → Settings → Environment variables
3. 编辑 `GITHUB_TOKEN` → 填入新 Token
4. 重新部署

**步骤 3：限流时手动更新数据**

如果 API 限流，可以直接编辑 `public/data/` 中的 JSON 文件：

```bash
# 1. 编辑数据文件
vim public/data/photos.json

# 2. 提交并推送
git add public/data/photos.json
git commit -m "update: photos.json (manual)"
git push origin main

# 3. Cloudflare Pages 会自动重新构建
```

### 3.3 预防措施

1. **使用环境变量存储 Token**（已完成）
2. **添加请求间隔**（避免并发请求过多）
3. **监控 API 使用量**：https://github.com/settings/tokens 查看

---

## 四、JSON 解析失败降级方案

### 4.1 当前逻辑

`fetchLatest` 函数中：

```typescript
try {
  const data = await resp.json()
  const decoded = decodeGitHubContent(data.content)
  return decoded
} catch (e) {
  console.error('[fetchLatest] ❌ 解析失败', e)
  throw new Error('数据解析失败')
}
```

**问题**：解析失败后直接抛错，没有降级方案。

### 4.2 增强方案

```typescript
async function fetchLatest(ghPath: string, _localPath: string): Promise<any> {
  try {
    // 尝试从 GitHub 读取
    const data = await fetchFromGitHub(ghPath)
    return data
  } catch (e: any) {
    console.error(`[fetchLatest] ❌ GitHub 读取失败: ${ghPath}`, e)
    
    // 降级方案 1：从 localStorage 缓存读取
    const cached = lsGet<any[]>(LS_KEYS[ghPath])
    if (cached && cached.length > 0) {
      console.warn(`[fetchLatest] ⚠️ 使用缓存数据: ${ghPath}`)
      return cached
    }
    
    // 降级方案 2：返回空数组（避免页面崩溃）
    console.error(`[fetchLatest] ❌ 无缓存，返回空数据: ${ghPath}`)
    return []
  }
}
```

---

## 五、实施计划

| 步骤 | 任务 | 优先级 | 预计时间 |
|------|------|--------|----------|
| 1 | 创建 `src/types/errors.ts` | 高 | 15 分钟 |
| 2 | 增强 `saveViaGithub` 错误处理 | 高 | 30 分钟 |
| 3 | 更新 UI 层错误提示 | 中 | 45 分钟 |
| 4 | 创建 `ERROR_HANDLING_GUIDE.md` | 中 | 20 分钟 |
| 5 | 添加 JSON 解析失败降级方案 | 低 | 20 分钟 |

---

## 六、测试清单

- [ ] GitHub API 限流（403）时显示友好提示
- [ ] Token 失效（401）时显示重新生成指引
- [ ] 网络错误时显示重试按钮
- [ ] JSON 解析失败时降级到缓存
- [ ] 所有错误提示与网站设计风格一致

---

*文档生成时间: 2026-05-16 20:15*
