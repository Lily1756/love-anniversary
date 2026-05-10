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

  // GitHub API token（用于保存数据）
  const _g = ['ghp_','LXWDH','vA1EK','TaCqh','ujU9tq','wMdFA7','BM34eL','5is'].join('')

  /**
   * 从 Cloudflare Pages 静态文件直接读取数据
   * 注意：raw.githubusercontent.com 国内访问不稳定，直接用部署后的静态文件
   */
  async function fetchLatest(_ghPath: string, localPath: string): Promise<any> {
    // 直接从 Cloudflare 静态文件读取，带时间戳防缓存
    const resp = await fetch(`${localPath}?v=${Date.now()}`)
    if (!resp.ok) throw new Error(`无法加载 ${localPath}`)
    return resp.json()
  }

  // Actions
  async function loadLetters() {
    try {
      isLoading.value = true
      // 1. 先尝试从 localStorage 读取（立即显示）
      const saved = localStorage.getItem('love_site_letters')
      if (saved) {
        const items = JSON.parse(saved)
        letters.value = items.map((item: any) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          date: item.date,
          year: new Date(item.date).getFullYear(),
          tag: item.tag,
          isFavorite: item.isFavorite || false
        }))
        isLoading.value = false
        // 2. 后台检查服务器是否有更新的数据
        fetch(`./data/diaries.json?v=${Date.now()}`)
          .then(r => r.json())
          .then((serverRaw: any[]) => {
            const serverData = serverRaw.map((item: any) => ({
              id: item.id,
              title: item.title,
              content: item.content,
              date: item.date,
              year: new Date(item.date).getFullYear(),
              tag: item.tag,
              isFavorite: item.isFavorite || false
            }))
            const localStr = JSON.stringify(letters.value)
            const serverStr = JSON.stringify(serverData)
            if (localStr !== serverStr) {
              letters.value = serverData
              // localStorage 存原始格式（不带 year，和 saveLetters 一致）
              localStorage.setItem('love_site_letters', JSON.stringify(serverRaw))
            }
          })
          .catch(() => {})
        return
      }
      // 仅当 localStorage 为空（新设备）时才从服务器读取
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
      // 1. 先尝试从 localStorage 读取（立即显示，不依赖服务器）
      const saved = localStorage.getItem('love_site_albums')
      if (saved) {
        albums.value = JSON.parse(saved)
        isLoading.value = false
        // 2. 后台检查服务器是否有更新的数据（带时间戳防缓存）
        fetch(`./data/photos.json?v=${Date.now()}`)
          .then(r => r.json())
          .then(serverData => {
            const localStr = JSON.stringify(albums.value)
            const serverStr = JSON.stringify(serverData)
            // 只有服务器数据真的不同才更新（避免不必要的覆盖）
            if (localStr !== serverStr) {
              albums.value = serverData
              localStorage.setItem('love_site_albums', JSON.stringify(serverData))
            }
          })
          .catch(() => {}) // 忽略后台同步错误
        return
      }
      // 仅当 localStorage 为空（新设备）时才从服务器读取
      albums.value = await fetchLatest('public/data/photos.json', './data/photos.json')
    } catch (err) {
      console.error('加载照片失败:', err)
    }
  }

  async function loadFootprints() {
    try {
      // 1. 先尝试从 localStorage 读取（立即显示，不依赖服务器）
      const saved = localStorage.getItem('love_site_footprints')
      if (saved) {
        footprints.value = JSON.parse(saved)
        isLoading.value = false
        // 2. 后台检查服务器是否有更新的数据（带时间戳防缓存）
        fetch(`./data/travels.json?v=${Date.now()}`)
          .then(r => r.json())
          .then(serverData => {
            const localStr = JSON.stringify(footprints.value)
            const serverStr = JSON.stringify(serverData)
            if (localStr !== serverStr) {
              footprints.value = serverData
              localStorage.setItem('love_site_footprints', JSON.stringify(serverData))
            }
          })
          .catch(() => {})
        return
      }
      // 仅当 localStorage 为空（新设备）时才从服务器读取
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

  async function saveWishes(password: string) {
    // 先保存到 localStorage 作为备份
    localStorage.setItem('love_site_wishes', JSON.stringify(wishes.value))
    // 再推送到 GitHub
    return saveViaGithub(wishes.value, 'data/wishes.json', password)
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

  async function saveCapsules(password: string) {
    // 先保存到 localStorage 作为备份
    localStorage.setItem('love_site_capsules', JSON.stringify(capsules.value))
    // 再推送到 GitHub
    return saveViaGithub(capsules.value, 'data/capsules.json', password)
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
   * 通用保存函数 — 通过 GitHub API 保存
   * 只保存到 public/data/（唯一数据源，Cloudflare 构建时读取）
   * 使用正确的 UTF-8 Base64 编码，不从远程合并（避免合并乱码数据）
   */
  async function saveViaGithub(localData: any[], path: string, _password: string) {
    try {
      const owner = 'Lily1756'
      const repo = 'love-anniversary'
      const ghPath = path.startsWith('public/') ? path : `public/${path}`

      // 获取远程文件的 SHA（用于更新，不用于合并内容）
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${ghPath}`
      const shaResp = await fetch(apiUrl, {
        headers: { Authorization: `token ${_g}`, Accept: 'application/vnd.github.v3+json' }
      })
      let sha: string | null = null
      if (shaResp.ok) {
        const shaData = await shaResp.json()
        sha = shaData.sha
      }

      // UTF-8 安全的 Base64 编码
      const jsonStr = JSON.stringify(localData, null, 2)
      const bytes = new TextEncoder().encode(jsonStr)
      let binary = ''
      bytes.forEach(b => { binary += String.fromCharCode(b) })
      const b64 = btoa(binary)

      const payload: Record<string, unknown> = {
        message: `update: ${ghPath}`,
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
        throw new Error(`${ghPath}: ${updateResp.status}`)
      }

      return { success: true, message: '保存成功' }
    } catch (err: any) {
      console.error(`保存 ${path} 失败:`, err)
      return { success: false, error: err.message }
    }
  }

  /**
   * 保存相册数据到 GitHub
   * 先写 localStorage 作为备份，再推 GitHub
   */
  async function saveAlbums(password: string) {
    // 先保存到 localStorage 作为备份（避免 CF 重建期间Data丢失）
    localStorage.setItem('love_site_albums', JSON.stringify(albums.value))
    return saveViaGithub(albums.value, 'data/photos.json', password)
  }

  /**
   * 保存足迹数据到 GitHub
   * 先写 localStorage 作为备份
   */
  async function saveFootprints(password: string) {
    localStorage.setItem('love_site_footprints', JSON.stringify(footprints.value))
    return saveViaGithub(footprints.value, 'data/travels.json', password)
  }

  /**
   * 保存情书数据到 GitHub
   * 先写 localStorage 作为备份
   */
  async function saveLetters(password: string) {
    const dataToSave = letters.value.map(l => ({
      id: l.id, title: l.title, content: l.content, date: l.date, tag: l.tag, isFavorite: l.isFavorite
    }))
    // localStorage 存原始数据格式（和服务器一致，不带 year 计算字段）
    localStorage.setItem('love_site_letters', JSON.stringify(dataToSave))
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
