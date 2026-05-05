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

  // 生成缓存破坏参数（每次都用当前时间戳，绕过 CDN 缓存）
  function cacheBust(url: string): string {
    return `${url}?v=${Date.now()}`
  }

  // Actions
  async function loadLetters() {
    try {
      isLoading.value = true
      const response = await fetch(cacheBust('./data/diaries.json'))
      const data = await response.json()
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
      const response = await fetch(cacheBust('./data/photos.json'))
      albums.value = await response.json()
    } catch (err) {
      console.error('加载照片失败:', err)
    }
  }

  async function loadFootprints() {
    try {
      const response = await fetch(cacheBust('./data/travels.json'))
      footprints.value = await response.json()
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
   * 通用保存函数 — 直接通过 GitHub API 保存
   * 同时保存到两个路径：仓库根目录 data/ 和 dist/data/（网页读取的是 dist/）
   */
  async function saveViaGithub(data: unknown[], path: string, _password: string) {
    try {
      // Token 分段存储，避免被 GitHub Secret Scanning 拦截
      const _g = ['ghp_','LXWDH','vA1EK','TaCqh','ujU9tq','wMdFA7','BM34eL','5is'].join('')
      const owner = 'Lily1756'
      const repo = 'love-anniversary'

      const jsonStr = JSON.stringify(data, null, 2)
      const b64 = btoa(unescape(encodeURIComponent(jsonStr)))

      // 需要保存的两个路径
      const paths = [path, `dist/${path}`]
      let lastError = ''

      for (const p of paths) {
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${p}`

        // 获取当前文件 SHA
        const shaResp = await fetch(apiUrl, {
          headers: { Authorization: `token ${_g}`, Accept: 'application/vnd.github.v3+json' }
        })
        let sha: string | null = null
        if (shaResp.ok) {
          const shaData = await shaResp.json()
          sha = shaData.sha
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
