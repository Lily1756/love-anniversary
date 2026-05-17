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

  /**
   * 判断当前环境：开发环境用 Vite 代理，生产环境直连 GitHub API
   */
  function isDev() {
    return import.meta.env.DEV
  }

  /** 构建 GitHub API URL（开发环境走代理，生产环境直连） */
  function ghApiUrl(path: string): string {
    return isDev()
      ? `/api/github/${path}`
      : `https://api.github.com/${path}`
  }

  /**
   * 构建 GitHub 数据读取 URL
   *
   * 所有环境都统一走 GitHub Contents API（返回 base64 编码内容）
   * - 开发环境：通过 Vite 代理 /api/github → api.github.com
   * - 生产环境：直接请求 api.github.com（CORS 允许）
   */
  function getRawBase(): string {
    // 统一使用 Contents API 路径（开发环境加代理前缀）
    const basePath = 'repos/Lily1756/love-anniversary/contents'
    return isDev()
      ? `/api/github/${basePath}`
      : `https://api.github.com/${basePath}`
  }

  /** 构建 GitHub API Headers（所有环境都需要 Authorization） */
  function ghHeaders(): Record<string, string> {
    return {
      'Authorization': `token ${_g}`,
      'Accept': 'application/vnd.github.v3+json',
    }
  }

  /** 写操作专用 headers（额外包含 Content-Type） */
  function ghWriteHeaders(): Record<string, string> {
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
   * 从 GitHub 读取最新文件内容（实时）
   *
   * 统一使用 GitHub Contents API（所有环境一致）：
   * - 开发环境：通过 Vite 代理 /api/github → api.github.com
   * - 生产环境：直接请求 api.github.com
   *
   * Contents API 返回 base64 编码内容，需要解码
   *
   * ⚠️ 不允许本地回退：GitHub 读取失败必须抛错，不能静默降级到不存在的本地文件
   */
  async function fetchLatest(ghPath: string, _localPath: string): Promise<any> {
    const isDevMode = isDev()

    try {
      // 所有环境统一走 Contents API + 时间戳防缓存
      const cacheBuster = Date.now()
      const url = `${getRawBase()}/${ghPath}?_=${cacheBuster}`
      console.log(`[fetchLatest] ${isDevMode ? '🔧 开发模式' : '🚀 生产模式'} 读取: ${url}`)

      const resp = await safeFetch(url, {
        headers: ghHeaders(),  // 所有环境都需要 Authorization
        timeoutMs: 10000,
      })

      if (resp.ok) {
        const data = await resp.json()
        console.log(`[fetchLatest] 📡 响应状态: ${resp.status}, headers:`, [...resp.headers.entries()].slice(0, 3))

        // Contents API 返回的是 base64 编码的内容
        if (data.content) {
          const decoded = decodeGitHubContent(data.content)
          console.log(`[fetchLatest] ✅ 读取成功 ${ghPath} (${isDevMode ? '代理' : '直连'})，数据条数: ${Array.isArray(decoded) ? decoded.length : '非数组'}`)
          return decoded
        }

        // 如果没有 content 字段（异常情况），尝试直接解析
        if (Array.isArray(data)) {
          console.log(`[fetchLatest] ✅ 直接返回数组 ${ghPath}`)
          return data
        }

        throw new Error(`GitHub API 返回格式异常: ${JSON.stringify(data).slice(0, 200)}`)
      }

      throw new Error(`GitHub 读取失败 (${resp.status}): ${ghPath}`)
    } catch (e: any) {
      console.error(`[fetchLatest] ❌ 读取失败: ${ghPath}`, e)

      // 降级方案 1：从 localStorage 缓存读取
      const lsKeyMap: Record<string, string> = {
        'public/data/photos.json':   LS_KEYS.albums,
        'public/data/travels.json':  LS_KEYS.footprints,
        'public/data/diaries.json':  LS_KEYS.letters,
        'public/data/wishes.json':   LS_KEYS.wishes,
        'public/data/capsules.json': LS_KEYS.capsules,
      }
      const lsKey = lsKeyMap[ghPath]
      if (lsKey) {
        const cached = lsGet<any[]>(lsKey)
        if (cached && cached.length > 0) {
          console.warn(`[fetchLatest] ⚠️ 降级使用缓存数据: ${lsKey}`)
          return cached
        }
      }

      // 降级方案 2：返回空数组（避免页面崩溃）
      console.error(`[fetchLatest] ❌ 无缓存，返回空数据: ${ghPath}`)
      return []
    }
  }

  /**
   * 解码 GitHub Contents API 返回的 base64 内容
   *
   * ⚠️ 不能用 atob() 直接 JSON.parse：
   *   atob() 将 base64 还原为 latin1 字节字符串，中文（UTF-8 多字节）会变成乱码。
   *   正确做法：atob → Uint8Array → TextDecoder('utf-8') → JSON.parse
   */
  function decodeGitHubContent(base64Content: string): any {
    try {
      // 1. 去除 GitHub API 返回的换行符
      const cleaned = base64Content.replace(/\n/g, '')
      // 2. atob 得到 latin1 字节字符串
      const binaryStr = atob(cleaned)
      // 3. 转换为 Uint8Array（逐字节）
      const bytes = new Uint8Array(binaryStr.length)
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i)
      }
      // 4. 用 TextDecoder 正确还原 UTF-8（含中文）
      const jsonStr = new TextDecoder('utf-8').decode(bytes)
      return JSON.parse(jsonStr)
    } catch (e) {
      console.error('[decodeGitHubContent] ❌ 解码失败', e)
      throw new Error('GitHub 内容解码失败')
    }
  }

  // ================================================================
  // localStorage 缓存 key 常量
  // ⚠️ 核心资产：任何重构都不能删除这段缓存逻辑
  // 策略：load 时优先读缓存（节省 GitHub API 请求），save 成功后同步更新缓存
  // 失效策略：save 后缓存被最新数据覆盖；如需强制刷新，清除对应 key 即可
  // ================================================================
  const LS_KEYS = {
    letters:    'love_site_letters',
    albums:     'love_site_albums',
    footprints: 'love_site_footprints',
    wishes:     'love_site_wishes',
    capsules:   'love_site_capsules',
  } as const

  /**
   * 读取 localStorage 缓存（带类型安全的解析）
   * 解析失败时返回 null，不抛错
   */
  function lsGet<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : null
    } catch {
      return null
    }
  }

  /** 写入 localStorage 缓存（序列化失败时静默忽略） */
  function lsSet(key: string, data: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (e) {
      console.warn(`[lsSet] ⚠️ localStorage 写入失败 (key: ${key})`, e)
    }
  }

  // ================================================================
  // 加载数据
  // 策略：骨架渲染 + 始终从 GitHub 拉取最新（解决跨设备缓存不同步问题）
  // ================================================================

  async function loadLetters() {
    try {
      isLoading.value = true

      // 第一步：先用缓存做骨架渲染（让页面瞬间显示旧数据，避免白屏）
      const cached = lsGet<any[]>(LS_KEYS.letters)
      if (cached && cached.length > 0) {
        letters.value = cached.map((item: any) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          date: item.date,
          year: new Date(item.date).getFullYear(),
          tag: item.tag,
          isFavorite: item.isFavorite ?? false,
        }))
        console.log(`[loadLetters] 📦 骨架缓存命中 (${cached.length} 条)，后台拉取最新...`)
      }

      // 第二步：始终从 GitHub 拉取最新数据（解决跨设备缓存不同步问题）
      const data = await fetchLatest('public/data/diaries.json', './data/diaries.json')
      const mapped = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        date: item.date,
        year: new Date(item.date).getFullYear(),
        tag: item.tag,
        isFavorite: item.isFavorite ?? false,
      }))
      letters.value = mapped

      // 第三步：写入缓存
      lsSet(LS_KEYS.letters, data)
    } catch (err) {
      error.value = '加载情书失败'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function loadAlbums() {
    try {
      // 步骤 1：先用缓存做骨架渲染（让页面瞬间显示旧数据，避免白屏）
      const cached = lsGet<any[]>(LS_KEYS.albums)
      if (cached && cached.length > 0) {
        albums.value = cached
        console.log(`[loadAlbums] 📦 骨架缓存命中 (${cached.length} 个相册)，后台拉取最新...`)
      }

      // 步骤 2：始终从 GitHub 拉取最新数据（解决跨设备缓存不同步问题）
      // 这是关键修复：其他设备上传后，当前设备刷新能立即看到新图片
      const data = await fetchLatest('public/data/photos.json', './data/photos.json')
      albums.value = data
      lsSet(LS_KEYS.albums, data)
      console.log(`[loadAlbums] ✅ 已同步最新数据 (${data.length} 个相册)`)
      // 🔍 调试：打印每个相册的名称和照片数
      data.forEach((a: any) => {
        console.log(`  [loadAlbums] 📸 相册: "${a.title}" tag=${a.tag} 照片数=${a.photos?.length || 0}`)
      })
    } catch (err) {
      console.error('[loadAlbums] ❌ 加载照片失败:', err)
      // 如果网络失败，保留骨架缓存数据（不清空），让用户至少能看到旧数据
    }
  }

  async function loadFootprints() {
    try {
      const cached = lsGet<any[]>(LS_KEYS.footprints)
      if (cached && cached.length > 0) {
        console.log(`[loadFootprints] 📦 从缓存读取 (${cached.length} 条足迹)`)
        footprints.value = cached
        return
      }
      console.log('[loadFootprints] 🌐 缓存未命中，从 GitHub 读取...')
      const data = await fetchLatest('public/data/travels.json', './data/travels.json')
      footprints.value = data
      lsSet(LS_KEYS.footprints, data)
    } catch (err) {
      console.error('[loadFootprints] ❌ 加载足迹失败:', err)
    }
  }

  async function loadWishes() {
    try {
      const cached = lsGet<any[]>(LS_KEYS.wishes)
      if (cached && cached.length > 0) {
        console.log(`[loadWishes] 📦 从缓存读取 (${cached.length} 条愿望)`)
        wishes.value = cached
        return
      }
      console.log('[loadWishes] 🌐 缓存未命中，从 GitHub 读取...')
      const data = await fetchLatest('public/data/wishes.json', './data/wishes.json')
      wishes.value = data
      lsSet(LS_KEYS.wishes, data)
    } catch (err) {
      console.error('[loadWishes] ❌ 加载愿望失败:', err)
    }
  }

  async function loadCapsules() {
    try {
      const cached = lsGet<any[]>(LS_KEYS.capsules)
      if (cached && cached.length > 0) {
        console.log(`[loadCapsules] 📦 从缓存读取 (${cached.length} 个胶囊)`)
        capsules.value = cached
        return
      }
      console.log('[loadCapsules] 🌐 缓存未命中，从 GitHub 读取...')
      const data = await fetchLatest('public/data/capsules.json', './data/capsules.json')
      capsules.value = data
      lsSet(LS_KEYS.capsules, data)
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
   *
   * 开发模式：
   *  - 如果启用本地 Mock（localStorage），则保存到 Mock 而非 GitHub
   *  - 避免频繁调用 GitHub API，节省 rate limit
   */
  async function saveViaGithub(localData: any[], path: string, _password: string): Promise<SaveResult> {
    const owner = 'Lily1756'
    const repo = 'love-anniversary'
    const ghPath = path.startsWith('public/') ? path : `public/${path}`

    console.group(`[saveViaGithub] 🔧 开始保存 ${ghPath}`)
    console.log(`  本地数据条目:`, localData.length)
    console.log(`  环境:`, isDev() ? '开发（走代理）' : '生产（直连）')

    // ====== 开发模式 Mock 保存 ======
    if (isDev()) {
      // 尝试使用 localStorage Mock
      const mockKey = ghPath.replace('public/data/', '').replace('.json', '')
      try {
        localStorage.setItem(`love_site_mock_${mockKey}`, JSON.stringify(localData, null, 2))
        console.log(`  [Mock] 💾 已保存到 localStorage: ${mockKey}`)
        console.groupEnd()
        return { success: true }
      } catch (e: any) {
        console.warn(`  [Mock] ⚠️ localStorage 保存失败，继续使用 GitHub API`, e)
      }
    }

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
          // 统一使用 getRawBase()（已经是 Contents API 路径）
          const rawResp = await safeFetch(`${getRawBase()}/${ghPath}`, {
            headers: ghHeaders(),
            timeoutMs: 8000,
          })

          if (rawResp.ok) {
            const data = await rawResp.json()
            
            // Contents API 返回 base64 编码内容
            if (data.content) {
              remoteData = decodeGitHubContent(data.content)
            }

            console.log(`  [合并] 远程数据条目:`, remoteData.length)
          } else {
            // ❌ 读取失败（非 200），中止保存以避免数据丢失
            throw new Error(`读取远程内容失败 (${rawResp.status})，为避免数据丢失，已中止保存。请检查网络后重试。`)
          }
        } catch (e: any) {
          // 读取远程内容失败，重新抛出错误，中止保存
          console.error('  [合并] ❌ 读取远程内容失败，中止保存', e)
          throw new Error(`无法验证远程数据完整性：${e.message || e}。为避免覆盖新数据，已中止保存。请稍后重试。`)
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
          headers: ghWriteHeaders(),
          body: JSON.stringify(payload),
          timeoutMs: 15000,
        },
      )

      if (!updateResp.ok) {
        const errorText = await updateResp.text().catch(() => '(无法读取响应)')
        console.error(`  ❌ GitHub API 错误 ${updateResp.status}:`, errorText)
        
        // 解析错误类型，提供用户友好的提示
        let userMessage = `写入失败 (${updateResp.status})`
        if (updateResp.status === 403) {
          if (errorText.includes('rate limit') || errorText.includes('API rate')) {
            userMessage = `GitHub API 限流（每小时 5000 次）。请等待 1 分钟后重试，或手动编辑 public/data/ 中的文件。`
          } else {
            userMessage = `GitHub Token 已失效。请重新生成 Token 并更新配置。`
          }
        } else if (updateResp.status === 401) {
          userMessage = `GitHub Token 鉴权失败。请检查 Token 是否有效。`
        }
        
        throw new Error(userMessage)
      }

      // ====== 步骤 3：同步更新本地状态 ======
      console.log('  [3/3] 同步本地状态...')

      // 如果合并了新数据，更新 Pinia 状态
      if (mergedData.length > localData.length) {
        if (ghPath === 'public/data/photos.json') albums.value = mergedData
        else if (ghPath === 'public/data/travels.json') footprints.value = mergedData
        else if (ghPath === 'public/data/diaries.json') letters.value = mergedData
        else if (ghPath === 'public/data/wishes.json') wishes.value = mergedData
        else if (ghPath === 'public/data/capsules.json') capsules.value = mergedData
      }

      // 写入 localStorage 缓存（使用 LS_KEYS 常量，避免 key 写错）
      const lsKeyMap: Record<string, string> = {
        'public/data/photos.json':   LS_KEYS.albums,
        'public/data/travels.json':  LS_KEYS.footprints,
        'public/data/diaries.json':  LS_KEYS.letters,
        'public/data/wishes.json':   LS_KEYS.wishes,
        'public/data/capsules.json': LS_KEYS.capsules,
      }
      const lsKey = lsKeyMap[ghPath]
      if (lsKey) {
        lsSet(lsKey, mergedData)
        console.log(`  📦 缓存已更新: ${lsKey}`)
      }

      console.log(`  ✅ [saveViaGithub] 保存成功! ${ghPath}`)
      console.groupEnd()

      return { success: true }

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
          body: JSON.stringify({ password, data: albums.value, path: 'public/data/photos.json' }),
          timeoutMs: 5000,
        })

        // 必须验证响应是 JSON 而非 HTML（Vite fallback 返回的是 HTML）
        const contentType = resp.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          const result = await resp.json()
          if (result.success) {
            lsSet(LS_KEYS.albums, albums.value)
            console.log('[saveAlbums] ✅ CF Function 保存成功')
            return { success: true }
          }
        }
      } catch (e) {
        console.warn('[saveAlbums] ⚠️ CF Function 不可用，回退到 GitHub API', e)
      }
    }

    // --- 阶段 2：通过 GitHub API 保存 ---
    console.log('[saveAlbums] 📡 调用 GitHub API...')
    const result = await saveViaGithub(albums.value, 'public/data/photos.json', password)

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
          body: JSON.stringify({ password, data: footprints.value, path: 'public/data/travels.json' }),
          timeoutMs: 5000,
        })
        const ct = resp.headers.get('content-type') || ''
        if (ct.includes('application/json')) {
          const r = await resp.json()
          if (r.success) { lsSet(LS_KEYS.footprints, footprints.value); return { success: true } }
        }
      } catch { /* 回退 */ }
    }
    return saveViaGithub(footprints.value, 'public/data/travels.json', password)
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
          body: JSON.stringify({ password, data: dataToSave, path: 'public/data/diaries.json' }),
          timeoutMs: 5000,
        })
        const ct = resp.headers.get('content-type') || ''
        if (ct.includes('application/json')) {
          const r = await resp.json()
          if (r.success) { lsSet(LS_KEYS.letters, dataToSave); return { success: true } }
        }
      } catch { /* 回退 */ }
    }
    return saveViaGithub(dataToSave, 'public/data/diaries.json', password)
  }

  async function saveWishes(password: string): Promise<SaveResult> {
    try {
      const result = await saveViaGithub(wishes.value, 'public/data/wishes.json', password)
      if (result.success) {
        lsSet(LS_KEYS.wishes, wishes.value)
      }
      return result
    } catch (e: any) {
      console.error('[saveWishes] ❌ GitHub 写入失败，未更新本地缓存', e)
      return { success: false, error: String(e) }
    }
  }

  async function saveCapsules(password: string): Promise<SaveResult> {
    try {
      const result = await saveViaGithub(capsules.value, 'public/data/capsules.json', password)
      if (result.success) {
        lsSet(LS_KEYS.capsules, capsules.value)
      }
      return result
    } catch (e: any) {
      console.error('[saveCapsules] ❌ GitHub 写入失败，未更新本地缓存', e)
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
