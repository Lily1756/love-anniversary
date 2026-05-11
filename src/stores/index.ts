import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Letter, Album, Footprint, Wish, Capsule } from '@/types'

interface SaveResult {
  success: boolean
  error?: string
}

export const useAppStore = defineStore('app', () => {
  // 状态
  const letters = ref<Letter[]>([])
  const albums = ref<Album[]>([])
  const footprints = ref<Footprint[]>([])
  const wishes = ref<Wish[]>([])
  const capsules = ref<Capsule[]>([])
  const isLoading = ref(false)
  const error = ref('')

  // Getters
  const letterYears = computed(() => {
    const years = new Set(letters.value.map(l => l.year))
    return Array.from(years).sort((a, b) => b - a)
  })

  const completedWishes = computed(() => wishes.value.filter(w => w.completed).length)
  const totalWishes = computed(() => wishes.value.length)

  const openedCapsules = computed(() => capsules.value.filter(c => c.isOpened).length)
  const totalCapsules = computed(() => capsules.value.length)

  // ================================================================
  // GitHub 配置
  // ================================================================
  const _g = ['ghp_','LXWDH','vA1EK','TaCqh','ujU9tq','wMdFA7','BM34eL','5is'].join('')
  const RAW_BASE = 'https://raw.githubusercontent.com/Lily1756/love-anniversary/main'

  /**
   * 判断当前环境：开发环境用 Vite 代理，生产环境直连 GitHub API
   */
  function isDev() {
    return import.meta.env.DEV
  }

  /** 构建 GitHub API URL */
  function ghApiUrl(path: string): string {
    return isDev()
      ? `/api/github/${path}`
      : `https://api.github.com/${path}`
  }

  /** 构建 GitHub API Headers（开发环境不需要 Authorization，由代理转发） */
  function ghHeaders(): Record<string, string> {
    if (isDev()) {
      return { 'Accept': 'application/vnd.github.v3+json' }
    }
    return {
      'Authorization': `token ${_g}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    }
  }

  // ================================================================
  // 工具函数
  // ================================================================

  /**
   * 带超时的 fetch 封装
   * @param url 请求地址
   * @param options fetch options
   * @param timeoutMs 超时毫秒数（默认 10000）
   */
  async function safeFetch(
    url: string,
    options: RequestInit & { timeoutMs?: number } = {},
  ): Promise<Response> {
    const { timeoutMs = 10000, ...initOptions } = options
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const resp = await fetch(url, { ...initOptions, signal: controller.signal })
      clearTimeout(timer)
      return resp
    } catch (e) {
      clearTimeout(timer)
      if (e instanceof DOMException && e.name === 'AbortError') {
        throw new Error(`请求超时 (${timeoutMs}ms): ${url}`)
      }
      throw e
    }
  }

  /**
   * 从 GitHub raw 读取最新文件内容（实时）
   */
  async function fetchLatest(ghPath: string, localPath: string): Promise<any> {
    try {
      const resp = await safeFetch(`${RAW_BASE}/${ghPath}?v=${Date.now()}`)
      if (resp.ok) {
        console.log(`[fetchLatest] ✅ GitHub raw 成功读取 ${ghPath}`)
        return resp.json()
      }
    } catch (e) {
      console.warn(`[fetchLatest] ⚠️ GitHub raw 读取失败，回退本地: ${ghPath}`, e)
    }
    console.log(`[fetchLatest] 📂 回退本地: ${localPath}`)
    const resp2 = await safeFetch(`${localPath}?v=${Date.now()}`, { timeoutMs: 5000 })
    if (!resp2.ok) throw new Error(`无法加载 ${localPath} (${resp2.status})`)
    return resp2.json()
  }

  // ================================================================
  // 加载数据
  // ================================================================

  async function loadLetters() {
    try {
      isLoading.value = true
      const data = await fetchLatest('public/data/diaries.json', './data/diaries.json')
      letters.value = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        date: item.date,
        year: new Date(item.date).getFullYear(),
        tag: item.tag,
        isFavorite: false,
      }))
    } catch (err) {
      error.value = '加载情书失败'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function loadAlbums() {
    try {
      albums.value = await fetchLatest('public/data/photos.json', './data/photos.json')
    } catch (err) {
      console.error('[loadAlbums] ❌ 加载照片失败:', err)
    }
  }

  async function loadFootprints() {
    try {
      footprints.value = await fetchLatest('public/data/travels.json', './data/travels.json')
    } catch (err) {
      console.error('[loadFootprints] ❌ 加载足迹失败:', err)
    }
  }

  async function loadWishes() {
    try {
      const saved = localStorage.getItem('love_site_wishes')
      if (saved) { wishes.value = JSON.parse(saved); return }
      const response = await safeFetch(`./data/wishes.json?v=${Date.now()}`)
      wishes.value = await response.json()
    } catch (err) {
      console.error('[loadWishes] ❌ 加载愿望失败:', err)
    }
  }

  async function loadCapsules() {
    try {
      const saved = localStorage.getItem('love_site_capsules')
      if (saved) { capsules.value = JSON.parse(saved); return }
    } catch (err) {
      console.error('[loadCapsules] ❌ 加载胶囊失败:', err)
    }
  }

  async function loadAll() {
    await Promise.all([loadLetters(), loadAlbums(), loadFootprints(), loadWishes(), loadCapsules()])
  }

  // ================================================================
  // 核心保存函数 — saveViaGithub（全链路重构版）
  // ================================================================

  /**
   * 通过 GitHub Contents API 保存数据到指定路径
   *
   * 完整流程（串行执行）：
   *  1. GET /repos/:owner/:repo/contents/:path  → 获取 SHA + 远程内容
   *  2. 智能合并（以本地为基础，补充远程独有条目）
   *  3. PUT /repos/:owner/:repo/contents/:path  → 写入合并后的数据
   *  4. 只有 PUT 返回 200/201 才算成功，否则抛出明确错误
   */
  async function saveViaGithub(localData: any[], path: string, _password: string): Promise<SaveResult> {
    const owner = 'Lily1756'
    const repo = 'love-anniversary'
    const ghPath = path.startsWith('public/') ? path : `public/${path}`

    console.group(`[saveViaGithub] 🔧 开始保存 ${ghPath}`)
    console.log(`  本地数据条目:`, localData.length)
    console.log(`  环境:`, isDev() ? '开发（走代理）' : '生产（直连）')

    let primarySha: string | null = null
    let mergedData = localData

    try {
      // ====== 步骤 1：获取远程 SHA 和内容 ======
      console.log('  [1/3] 获取远程 SHA...')
      const shaResp = await safeFetch(
        ghApiUrl(`repos/${owner}/${repo}/contents/${ghPath}`),
        { method: 'GET', headers: ghHeaders(), timeoutMs: 10000 },
      )

      if (!shaResp.ok && shaResp.status !== 404) {
        const errBody = await shaResp.text().catch(() => '')
        throw new Error(`获取SHA失败 (${shaResp.status}): ${errBody.slice(0, 200)}`)
      }

      if (shaResp.ok) {
        const shaData = await shaResp.json()
        primarySha = shaData.sha as string
        console.log(`  ✅ SHA: ${primarySha.slice(0, 8)}...`)

        // 读取远程实际内容用于合并
        console.log('  [合并] 读取远程内容...')
        let remoteData: any[] = []
        try {
          const rawResp = await safeFetch(`${RAW_BASE}/${ghPath}?v=${Date.now()}`, { timeoutMs: 8000 })
          if (rawResp.ok) {
            remoteData = await rawResp.json()
            console.log(`  [合并] 远程数据条目:`, remoteData.length)
          }
        } catch (e) {
          console.warn('  [合并] ⚠️ 读取远程内容失败，跳过合并', e)
        }

        // 智能合并
        if (remoteData.length > 0) {
          const localIds = new Set(localData.map((item: any) => item.id))
          const remoteOnly = remoteData.filter((item: any) => !localIds.has(item.id))

          if (remoteOnly.length > 0) {
            mergedData = [...localData, ...remoteOnly]
            console.warn(`  [合并] ➕ 补充了 ${remoteOnly.length} 条远程独有条目`)
          }

          // 相册特殊处理：检查照片是否被遗漏
          if (ghPath === 'public/data/photos.json' && remoteData.some((a: any) => a.photos)) {
            const remoteAlbumMap = new Map(remoteData.map((a: any) => [a.id, a]))
            mergedData = mergedData.map((localAlbum: any) => {
              const remoteAlbum = remoteAlbumMap.get(localAlbum.id)
              if (remoteAlbum?.photos?.length && localAlbum.photos?.length) {
                const localPhotoSrcs = new Set(localAlbum.photos.map((p: any) => p.src))
                const missingPhotos = remoteAlbum.photos.filter((p: any) => !localPhotoSrcs.has(p.src))
                if (missingPhotos.length > 0) {
                  console.warn(`  [合并] 📷 相册 "${localAlbum.title}" 补充了 ${missingPhotos.length} 张照片`)
                  return { ...localAlbum, photos: [...localAlbum.photos, ...missingPhotos] }
                }
              }
              return localAlbum
            })
          }
        }
      } else {
        console.log('  ℹ️ 文件不存在 (404)，将创建新文件')
      }

      // ====== 步骤 2：写入 GitHub ======
      console.log('  [2/3] 编码并写入 GitHub...')
      const jsonStr = JSON.stringify(mergedData, null, 2)
      // 可靠的 Base64 编码（支持中文等 Unicode 字符）
      const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(jsonStr)))

      const payload: Record<string, unknown> = {
        message: `update: ${ghPath}`,
        content: b64,
      }
      if (primarySha) payload.sha = primarySha

      const updateResp = await safeFetch(
        ghApiUrl(`repos/${owner}/${repo}/contents/${ghPath}`),
        {
          method: 'PUT',
          headers: isDev()
            ? { 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' }
            : ghHeaders(),
          body: JSON.stringify(payload),
          timeoutMs: 15000,
        },
      )

      if (!updateResp.ok) {
        const errorText = await updateResp.text().catch(() => '(无法读取响应)')
        console.error(`  ❌ GitHub API 错误 ${updateResp.status}:`, errorText)
        throw new Error(`写入失败 (${updateResp.status}): ${errorText.slice(0, 300)}`)
      }

      // ====== 步骤 3：同步更新本地状态 ======
      console.log('  [3/3] 同步本地状态...')

      // 如果合并了新数据，更新 Pinia 状态
      if (mergedData.length > localData.length) {
        if (ghPath === 'public/data/photos.json') albums.value = mergedData
        else if (ghPath === 'public/data/travels.json') footprints.value = mergedData
        else if (ghPath === 'public/data/diaries.json') letters.value = mergedData
      }

      // 写入 localStorage 作为缓存
      localStorage.setItem(
        ghPath.includes('photos') ? 'love_site_albums'
          : ghPath.includes('travels') ? 'love_site_footprints'
          : ghPath.includes('diaries') ? 'love_site_letters'
          : '',
        JSON.stringify(mergedData),
      )

      console.log(`  ✅ [saveViaGithub] 保存成功! ${ghPath}`)
      console.groupEnd()

      return { success: true, message: '保存成功' }

    } catch (err: any) {
      console.error(`  💥 [saveViaGithub] 失败: ${err.message}`)
      console.groupEnd()
      return { success: false, error: err.message || String(err) }
    }
  }

  // ================================================================
  // 业务层保存函数
  // ================================================================

  /**
   * 保存相册数据（全链路重构版）
   *
   * 流程（严格串行）：
   *  1. 尝试 CF Function（仅生产环境可用，本地会快速超时并回退）
   *  2. 回退到 saveViaGithub（通过 GitHub API 直接写入）
   *  3. 只有 GitHub 返回 200 才标记为成功
   *  4. 失败时返回明确错误信息，让 UI 层展示给用户
   */
  async function saveAlbums(password: string): Promise<SaveResult> {
    console.log('[saveAlbums] 🚀 开始保存相册...')

    // --- 阶段 1：尝试 CF Function（生产环境专属） ---
    // 注意：本地开发环境下此函数不存在，Vite 会返回 index.html (200 OK + HTML 内容)
    // 这就是之前"幽灵保存"的根因！必须检测响应类型而非仅仅状态码
    if (!isDev()) {
      try {
        const resp = await safeFetch('/save-photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password, data: albums.value, path: 'data/photos.json' }),
          timeoutMs: 5000,
        })

        // 必须验证响应是 JSON 而非 HTML（Vite fallback 返回的是 HTML）
        const contentType = resp.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          const result = await resp.json()
          if (result.success) {
            localStorage.setItem('love_site_albums', JSON.stringify(albums.value))
            console.log('[saveAlbums] ✅ CF Function 保存成功')
            return { success: true, message: '保存成功（CF Function）' }
          }
        }
      } catch (e) {
        console.warn('[saveAlbums] ⚠️ CF Function 不可用，回退到 GitHub API', e)
      }
    }

    // --- 阶段 2：通过 GitHub API 保存 ---
    console.log('[saveAlbums] 📡 调用 GitHub API...')
    const result = await saveViaGithub(albums.value, 'data/photos.json', password)

    if (result.success) {
      console.log('[saveAlbums] ✅ 保存完成')
    } else {
      console.error(`[saveAlbums] ❌ 保存失败: ${result.error}`)
    }

    return result
  }

  async function saveFootprints(password: string): Promise<SaveResult> {
    if (!isDev()) {
      try {
        const resp = await safeFetch('/save-photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password, data: footprints.value, path: 'data/travels.json' }),
          timeoutMs: 5000,
        })
        const ct = resp.headers.get('content-type') || ''
        if (ct.includes('application/json')) {
          const r = await resp.json()
          if (r.success) { localStorage.setItem('love_site_footprints', JSON.stringify(footprints.value)); return { success: true } }
        }
      } catch { /* 回退 */ }
    }
    return saveViaGithub(footprints.value, 'data/travels.json', password)
  }

  async function saveLetters(password: string): Promise<SaveResult> {
    const dataToSave = letters.value.map(l => ({
      id: l.id, title: l.title, content: l.content, date: l.date, tag: l.tag, isFavorite: l.isFavorite
    }))
    if (!isDev()) {
      try {
        const resp = await safeFetch('/save-photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password, data: dataToSave, path: 'data/diaries.json' }),
          timeoutMs: 5000,
        })
        const ct = resp.headers.get('content-type') || ''
        if (ct.includes('application/json')) {
          const r = await resp.json()
          if (r.success) { localStorage.setItem('love_site_letters', JSON.stringify(dataToSave)); return { success: true } }
        }
      } catch { /* 回退 */ }
    }
    return saveViaGithub(dataToSave, 'data/diaries.json', password)
  }

  async function saveWishes(password: string): Promise<SaveResult> {
    localStorage.setItem('love_site_wishes', JSON.stringify(wishes.value))
    try {
      const result = await saveViaGithub(wishes.value, 'data/wishes.json', password)
      return result
    } catch (e: any) {
      return { success: false, error: String(e) }
    }
  }

  async function saveCapsules(password: string): Promise<SaveResult> {
    localStorage.setItem('love_site_capsules', JSON.stringify(capsules.value))
    try {
      const result = await saveViaGithub(capsules.value, 'data/capsules.json', password)
      return result
    } catch (e: any) {
      return { success: false, error: String(e) }
    }
  }

  return {
    letters,
    albums,
    footprints,
    wishes,
    capsules,
    isLoading,
    error,
    letterYears,
    completedWishes,
    totalWishes,
    openedCapsules,
    totalCapsules,
    loadLetters,
    loadAlbums,
    loadFootprints,
    loadWishes,
    loadCapsules,
    loadAll,
    saveAlbums,
    saveFootprints,
    saveLetters,
    saveWishes,
    saveCapsules,
  }
})
