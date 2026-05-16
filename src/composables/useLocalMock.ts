/**
 * 本地开发 Mock Composable
 *
 * 功能：
 * - 开发环境下拦截数据保存操作，模拟成功响应
 * - 将保存数据存储到 localStorage，便于调试
 * - 不实际调用 GitHub API，避免 rate limit
 *
 * 使用方式：
 * ```typescript
 * import { useLocalMock } from '@/composables/useLocalMock'
 *
 * const { isMockMode, saveMock, loadMock } = useLocalMock()
 *
 * // 开发环境下自动启用
 * if (isMockMode.value) {
 *   // 使用 Mock 数据
 * }
 * ```
 */

import { ref, computed } from 'vue'

// 是否启用 Mock 模式（仅开发环境）
const isMockMode = import.meta.env.DEV

// localStorage 前缀
const MOCK_PREFIX = 'love_site_mock_'

/**
 * Mock 数据管理器
 */
export function useLocalMock() {
  /**
   * 保存数据到 localStorage Mock
   */
  function saveMock(key: string, data: unknown): boolean {
    if (!isMockMode) {
      console.warn('[LocalMock] ⚠️ Mock 模式未启用，跳过保存')
      return false
    }

    try {
      const storageKey = `${MOCK_PREFIX}${key}`
      const jsonStr = JSON.stringify(data, null, 2)
      localStorage.setItem(storageKey, jsonStr)
      console.log(`[LocalMock] 💾 已保存到 localStorage: ${storageKey} (${(jsonStr.length / 1024).toFixed(1)} KB)`)
      return true
    } catch (e: any) {
      console.error(`[LocalMock] ❌ 保存失败:`, e)
      return false
    }
  }

  /**
   * 从 localStorage Mock 读取数据
   */
  function loadMock<T = unknown>(key: string): T | null {
    if (!isMockMode) {
      return null
    }

    try {
      const storageKey = `${MOCK_PREFIX}${key}`
      const raw = localStorage.getItem(storageKey)
      if (!raw) {
        console.log(`[LocalMock] 📭 无 Mock 数据: ${storageKey}`)
        return null
      }
      const data = JSON.parse(raw) as T
      console.log(`[LocalMock] 📂 已加载 Mock 数据: ${storageKey}`)
      return data
    } catch (e: any) {
      console.error(`[LocalMock] ❌ 读取失败:`, e)
      return null
    }
  }

  /**
   * 清除所有 Mock 数据
   */
  function clearMockData(): number {
    let count = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(MOCK_PREFIX)) {
        localStorage.removeItem(key)
        count++
      }
    }
    console.log(`[LocalMock] 🗑️ 已清除 ${count} 个 Mock 数据项`)
    return count
  }

  /**
   * 列出所有 Mock 数据键
   */
  function listMockKeys(): string[] {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(MOCK_PREFIX)) {
        keys.push(key.replace(MOCK_PREFIX, ''))
      }
    }
    return keys
  }

  /**
   * Mock 保存操作（模拟 saveViaGithub）
   */
  function mockSave(
    data: unknown,
    fileName: string,
    options?: {
      onSuccess?: () => void
      onError?: (error: string) => void
    }
  ): { success: boolean; error?: string } {
    if (!isMockMode) {
      options?.onError?.('Mock 模式未启用')
      return { success: false, error: 'Mock 模式未启用' }
    }

    console.group(`[LocalMock] 📤 模拟保存: ${fileName}`)
    console.log('数据大小:', JSON.stringify(data).length, 'bytes')
    console.log('数据预览:', JSON.stringify(data).slice(0, 200) + '...')

    // 保存到 localStorage
    const key = fileName.replace('public/data/', '').replace('.json', '')
    saveMock(key, data)

    console.log('[LocalMock] ✅ 模拟保存成功')
    console.groupEnd()

    options?.onSuccess?.()
    return { success: true }
  }

  /**
   * Mock 加载操作（模拟 fetchLatest）
   */
  async function mockLoad<T = unknown>(
    fileName: string
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    if (!isMockMode) {
      return { success: false, error: 'Mock 模式未启用' }
    }

    console.group(`[LocalMock] 📥 模拟加载: ${fileName}`)

    const key = fileName.replace('public/data/', '').replace('.json', '')
    const data = loadMock<T>(key)

    if (data) {
      console.log('[LocalMock] ✅ 模拟加载成功')
      console.groupEnd()
      return { success: true, data }
    } else {
      console.log('[LocalMock] 📭 无 Mock 数据，将使用空数组')
      console.groupEnd()
      return { success: false, error: '无 Mock 数据' }
    }
  }

  return {
    isMockMode: computed(() => isMockMode),
    saveMock,
    loadMock,
    clearMockData,
    listMockKeys,
    mockSave,
    mockLoad,
  }
}

/**
 * 开发调试工具（可在控制台使用）
 *
 * 在浏览器控制台输入：
 * ```javascript
 * import('/src/composables/useLocalMock.js').then(m => {
 *   window.__mock = m.useLocalMock()
 * })
 * window.__mock.listMockKeys()  // 列出所有 Mock 数据
 * window.__mock.clearMockData() // 清除所有 Mock 数据
 * ```
 */
if (import.meta.env.DEV) {
  // 暴露到全局，便于控制台调试
  ;(window as any).__localMock = {
    isEnabled: isMockMode,
    listKeys: () => {
      const { listMockKeys } = useLocalMock()
      console.table(listMockKeys().map(k => ({ key: k })))
    },
    clear: () => {
      const { clearMockData } = useLocalMock()
      clearMockData()
    },
    get: (key: string) => {
      const { loadMock } = useLocalMock()
      return loadMock(key)
    },
    set: (key: string, data: unknown) => {
      const { saveMock } = useLocalMock()
      saveMock(key, data)
    },
  }

  console.log('%c🛠️ LocalMock 已启用', 'color: #4CAF50; font-weight: bold;')
  console.log('使用 window.__localMock 进行调试:')
  console.log('  - __localMock.listKeys() 列出所有 Mock 数据')
  console.log('  - __localMock.clear() 清除所有 Mock 数据')
  console.log('  - __localMock.get("key") 获取 Mock 数据')
  console.log('  - __localMock.set("key", data) 保存 Mock 数据')
}
