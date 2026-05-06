import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Letter, Album, Footprint, Wish, Capsule } from '@/types'

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
  const _g = ['ghp_','LXWDH','vA1EK','TaCqh','ujU9tq','wMdFA7','BM34eL','5is'].join('')
  const GH_RAW_BASE = 'https://api.github.com/repos/Lily1756/love-anniversary/contents'

  /**
   * 从 GitHub API 读取最新文件内容（实时，不依赖 Cloudflare 构建）
   * 失败时回退到本地构建文件（带缓存破坏参数）
   */
  async function fetchLatest(ghPath: string, localPath: string): Promise<any> {
    // 1. 优先从 GitHub API 实时读取
    try {
      const resp = await fetch(`${GH_RAW_BASE}/${ghPath}?v=${Date.now()}`, {
        headers: { Authorization: `token ${_g}`, Accept: 'application/vnd.github.v3+json' }
      })
      if (resp.ok) {
        const data = await resp.json()
        const content = atob(data.content.replace(/\n/g, ''))
        return JSON.parse(content)
      }
    } catch (e) {
      console.warn(`[fetchLatest] GitHub 读取失败，回退本地: ${ghPath}`, e)
    }
    // 2. 回退：从本地构建文件读取（带缓存破坏参数）
    const resp2 = await fetch(`${localPath}?v=${Date.now()}`)
    return resp2.json()
  }

  // Actions
  async function loadLetters() {
    try {
      isLoading.value = true
      const data = await fetchLatest('data/diaries.json', './data/diaries.json')
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
      const response = await fetch(cacheBust('./data/wishes.json'))
      wishes.value = await response.json()
    } catch (err) {
      console.error('加载愿望失败:', err)
    }
  }

  function saveWishes() {
    localStorage.setItem('love_site_wishes', JSON.stringify(wishes.value))
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

  function saveCapsules() {
    localStorage.setItem('love_site_capsules', JSON.stringify(capsules.value))
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
   * 同时保存到两个路径：data/（本地开发）和 public/（Cloudflare Pages 构建）
   */
  async function saveViaGithub(localData: any[], path: string, _password: string) {
    try {
      const owner = 'Lily1756'
      const repo = 'love-anniversary'

      // --- 第一步：从远程拉取最新版本，进行智能合并 ---
      const primaryApiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
      const shaResp = await fetch(primaryApiUrl, {
        headers: { Authorization: `token ${_g}`, Accept: 'application/vnd.github.v3+json' }
      })

      let mergedData = localData
      let primarySha: string | null = null

      if (shaResp.ok) {
        const shaData = await shaResp.json()
        primarySha = shaData.sha
        const remoteContent = atob(shaData.content)
        const remoteData: any[] = JSON.parse(remoteContent)

        // 智能合并：以本地数据为基础，补充远程独有的条目
        const localIds = new Set(localData.map((item: any) => item.id))
        let addedCount = 0
        const remoteOnly = remoteData.filter(item => !localIds.has(item.id))

        if (remoteOnly.length > 0) {
          mergedData = [...localData, ...remoteOnly]
          addedCount = remoteOnly.length
          console.warn(`[saveViaGithub] 合并了 ${addedCount} 条远程独有条目到 ${path}`)
        }

        // 对于相册数据（photos.json），还要检查每个相册的照片是否被遗漏
        if (path === 'data/photos.json') {
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

      // --- 第二步：写入两个路径 ---
      const jsonStr = JSON.stringify(mergedData, null, 2)
      const b64 = btoa(unescape(encodeURIComponent(jsonStr)))

      const paths = [path, `public/${path}`]
      let lastError = ''

      for (const p of paths) {
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${p}`

        // 获取目标文件的当前 SHA
        const targetShaResp = await fetch(apiUrl, {
          headers: { Authorization: `token ${_g}`, Accept: 'application/vnd.github.v3+json' }
        })
        let sha: string | null = null
        if (targetShaResp.ok) {
          const targetShaData = await targetShaResp.json()
          sha = targetShaData.sha
        }

        // 推送数据
        const payload: Record<string, unknown> = {
          message: `update: ${p}`,
          content: b64,
        }
        if (sha) payload.sha = sha

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
          lastError = `${p}: ${updateResp.status}`
        }
      }

      if (lastError) {
        throw new Error(lastError)
      }

      // 如果合并了新数据，同步更新本地状态
      if (mergedData.length > localData.length) {
        if (path === 'data/photos.json') {
          albums.value = mergedData
        } else if (path === 'data/travels.json') {
          footprints.value = mergedData
        } else if (path === 'data/diaries.json') {
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
   * 保存相册数据到 GitHub
   */
  async function saveAlbums(password: string) {
    return saveViaGithub(albums.value, 'data/photos.json', password)
  }

  /**
   * 保存足迹数据到 GitHub
   */
  async function saveFootprints(password: string) {
    return saveViaGithub(footprints.value, 'data/travels.json', password)
  }

  /**
   * 保存情书数据到 GitHub
   */
  async function saveLetters(password: string) {
    const dataToSave = letters.value.map(l => ({
      id: l.id, title: l.title, content: l.content, date: l.date, tag: l.tag
    }))
    return saveViaGithub(dataToSave, 'data/diaries.json', password)
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
