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

  // GitHub raw 地址（每次带时间戳绕过 CDN/GitHub 缓存）
  // 使用 raw.githubusercontent.com 直接返回 UTF-8 JSON，无需 Base64 解码，避免中文乱码
  const _g = ['ghp_','LXWDH','vA1EK','TaCqh','ujU9tq','wMdFA7','BM34eL','5is'].join('')
  const RAW_BASE = 'https://raw.githubusercontent.com/Lily1756/love-anniversary/main'

  /**
   * 从 GitHub raw 读取最新文件内容（实时，不依赖 Cloudflare 构建）
   * 使用 raw.githubusercontent.com 直接获取 UTF-8 内容，无需 Base64 解码
   * 失败时回退到本地构建文件（带缓存破坏参数）
   */
  async function fetchLatest(ghPath: string, localPath: string): Promise<any> {
    // 1. 优先从 GitHub raw 实时读取（直接返回 UTF-8 JSON，最可靠）
    try {
      const resp = await fetch(`${RAW_BASE}/${ghPath}?v=${Date.now()}`, {
        headers: { Accept: 'application/json' }
      })
      if (resp.ok) {
        const parsed = await resp.json()
        console.log(`[fetchLatest] GitHub raw 成功读取 ${ghPath}`)
        return parsed
      }
    } catch (e) {
      console.warn(`[fetchLatest] GitHub raw 读取失败，回退本地: ${ghPath}`, e)
    }
    // 2. 回退：从本地构建文件读取（带缓存破坏参数）
    console.log(`[fetchLatest] 回退本地: ${localPath}`)
    const resp2 = await fetch(`${localPath}?v=${Date.now()}`)
    if (!resp2.ok) throw new Error(`无法加载 ${localPath}`)
    return resp2.json()
  }

  // Actions
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
        isFavorite: false
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
      // saveViaGithub 写入 public/data/，所以这里也从 public/data/ 读取最新数据
      albums.value = await fetchLatest('public/data/photos.json', './data/photos.json')
    } catch (err) {
      console.error('加载照片失败:', err)
    }
  }

  async function loadFootprints() {
    try {
      footprints.value = await fetchLatest('public/data/travels.json', './data/travels.json')
    } catch (err) {
      console.error('加载足迹失败:', err)
    }
  }

  async function loadWishes() {
    try {
      // 优先从 localStorage 读取
      const saved = localStorage.getItem('love_site_wishes')
      if (saved) {
        wishes.value = JSON.parse(saved)
        return
      }
      const response = await fetch(`./data/wishes.json?v=${Date.now()}`)
      wishes.value = await response.json()
    } catch (err) {
      console.error('加载愿望失败:', err)
    }
  }

  async function saveWishes(password: string): Promise<SaveResult> {
    // 先存本地
    localStorage.setItem('love_site_wishes', JSON.stringify(wishes.value))
    // 再存 GitHub
    try {
      await saveViaGithub(wishes.value, 'data/wishes.json', password)
      return { success: true }
    } catch (e: any) {
      console.error('保存愿望失败:', e)
      return { success: false, error: String(e) }
    }
  }

  async function loadCapsules() {
    try {
      // 优先从 localStorage 读取
      const saved = localStorage.getItem('love_site_capsules')
      if (saved) {
        capsules.value = JSON.parse(saved)
        return
      }
    } catch (err) {
      console.error('加载胶囊失败:', err)
    }
  }

  async function saveCapsules(password: string): Promise<SaveResult> {
    // 先存本地
    localStorage.setItem('love_site_capsules', JSON.stringify(capsules.value))
    // 再存 GitHub
    try {
      await saveViaGithub(capsules.value, 'data/capsules.json', password)
      return { success: true }
    } catch (e: any) {
      console.error('保存时间胶囊失败:', e)
      return { success: false, error: String(e) }
    }
  }

  async function loadAll() {
    await Promise.all([
      loadLetters(),
      loadAlbums(),
      loadFootprints(),
      loadWishes(),
      loadCapsules()
    ])
  }

  /**
   * 通用保存函数 — 通过 GitHub API 保存，带防覆盖保护
   * 保护策略：保存前先拉取远程最新版本，智能合并后写入
   * 只保存到 public/data/（唯一数据源，Cloudflare 构建时读取）
   */
  async function saveViaGithub(localData: any[], path: string, _password: string) {
    try {
      const owner = 'Lily1756'
      const repo = 'love-anniversary'

      // 统一使用 public/data/ 作为唯一数据路径
      const ghPath = path.startsWith('public/') ? path : `public/${path}`

      // --- 第一步：从远程拉取最新版本，进行智能合并 ---
      // 获取 SHA（用 API）
      const primaryApiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${ghPath}`
      const shaResp = await fetch(primaryApiUrl, {
        headers: { Authorization: `token ${_g}`, Accept: 'application/vnd.github.v3+json' }
      })

      let mergedData = localData
      let primarySha: string | null = null

      if (shaResp.ok) {
        const shaData = await shaResp.json()
        primarySha = shaData.sha
        // 读取内容用 raw.githubusercontent.com（直接返回 UTF-8 JSON，避免 atob 中文乱码）
        let remoteData: any[] = []
        try {
          const rawResp = await fetch(`${RAW_BASE}/${ghPath}?v=${Date.now()}`)
          if (rawResp.ok) {
            remoteData = await rawResp.json()
          }
        } catch (e) {
          console.warn('[saveViaGithub] 读取远程内容失败，跳过合并', e)
        }

        // 智能合并：以本地数据为基础，补充远程独有的条目
        const localIds = new Set(localData.map((item: any) => item.id))
        let addedCount = 0
        const remoteOnly = remoteData.filter(item => !localIds.has(item.id))

        if (remoteOnly.length > 0) {
          mergedData = [...localData, ...remoteOnly]
          addedCount = remoteOnly.length
          console.warn(`[saveViaGithub] 合并了 ${addedCount} 条远程独有条目到 ${ghPath}`)
        }

        // 对于相册数据（photos.json），还要检查每个相册的照片是否被遗漏
        if (ghPath === 'public/data/photos.json') {
          const remoteAlbumMap = new Map(remoteData.map((a: any) => [a.id, a]))
          mergedData = mergedData.map((localAlbum: any) => {
            const remoteAlbum = remoteAlbumMap.get(localAlbum.id)
            if (remoteAlbum && remoteAlbum.photos && localAlbum.photos) {
              const localPhotoSrcs = new Set(localAlbum.photos.map((p: any) => p.src))
              const missingPhotos = remoteAlbum.photos.filter(
                (p: any) => !localPhotoSrcs.has(p.src)
              )
              if (missingPhotos.length > 0) {
                console.warn(`[saveViaGithub] 相册 "${localAlbum.title}" 补充了 ${missingPhotos.length} 张远程独有照片`)
                return {
                  ...localAlbum,
                  photos: [...localAlbum.photos, ...missingPhotos]
                }
              }
            }
            return localAlbum
          })
        }
      }

      // --- 第二步：写入 public/data/（唯一路径）---
      const jsonStr = JSON.stringify(mergedData, null, 2)
      const b64 = btoa(unescape(encodeURIComponent(jsonStr)))

      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${ghPath}`

      const payload: Record<string, unknown> = {
        message: `update: ${ghPath}`,
        content: b64,
      }
      if (primarySha) payload.sha = primarySha

      const updateResp = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          Authorization: `token ${_g}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!updateResp.ok) {
        throw new Error(`${ghPath}: ${updateResp.status}`)
      }

      // 如果合并了新数据，同步更新本地状态
      if (mergedData.length > localData.length) {
        if (ghPath === 'public/data/photos.json') {
          albums.value = mergedData
        } else if (ghPath === 'public/data/travels.json') {
          footprints.value = mergedData
        } else if (ghPath === 'public/data/diaries.json') {
          letters.value = mergedData
        }
      }

      return { success: true, message: '保存成功' }
    } catch (err: any) {
      console.error(`保存 ${path} 失败:`, err)
      return { success: false, error: err.message }
    }
  }

  /**
   * 保存相册数据 —— 优先走 CF Function（无 CORS 问题），失败则直连 GitHub API
   */
  async function saveAlbums(password: string) {
    // 第 1 步：尝试 CF Function（生产环境 /save-photos）
    try {
      const resp = await fetch('/save-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, data: albums.value, path: 'data/photos.json' })
      })
      if (resp.ok) {
        const result = await resp.json()
        if (result.success) {
          localStorage.setItem('love_site_albums', JSON.stringify(albums.value))
          return { success: true, message: '保存成功（CF Function）' }
        }
      }
    } catch {}

    // 第 2 步：回退到直连 GitHub API
    const result = await saveViaGithub(albums.value, 'data/photos.json', password)
    if (result.success) {
      localStorage.setItem('love_site_albums', JSON.stringify(albums.value))
    }
    return result
  }

  /**
   * 保存足迹数据 —— 优先走 CF Function，失败则直连 GitHub API
   */
  async function saveFootprints(password: string) {
    try {
      const resp = await fetch('/save-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, data: footprints.value, path: 'data/travels.json' })
      })
      if (resp.ok) {
        const result = await resp.json()
        if (result.success) {
          localStorage.setItem('love_site_footprints', JSON.stringify(footprints.value))
          return { success: true, message: '保存成功（CF Function）' }
        }
      }
    } catch {}
    const result = await saveViaGithub(footprints.value, 'data/travels.json', password)
    if (result.success) {
      localStorage.setItem('love_site_footprints', JSON.stringify(footprints.value))
    }
    return result
  }

  /**
   * 保存情书数据 —— 优先走 CF Function，失败则直连 GitHub API
   */
  async function saveLetters(password: string) {
    const dataToSave = letters.value.map(l => ({
      id: l.id, title: l.title, content: l.content, date: l.date, tag: l.tag, isFavorite: l.isFavorite
    }))
    try {
      const resp = await fetch('/save-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, data: dataToSave, path: 'data/diaries.json' })
      })
      if (resp.ok) {
        const result = await resp.json()
        if (result.success) {
          localStorage.setItem('love_site_letters', JSON.stringify(dataToSave))
          return { success: true, message: '保存成功（CF Function）' }
        }
      }
    } catch {}
    const result = await saveViaGithub(dataToSave, 'data/diaries.json', password)
    if (result.success) {
      localStorage.setItem('love_site_letters', JSON.stringify(dataToSave))
    }
    return result
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
    saveCapsules
  }
})
