import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 循环模式枚举
export const LoopMode = {
  ALL: 'all',   // 列表循环（默认）
  ONE: 'one',   // 单曲循环
  NONE: 'none', // 不循环
} as const

export type LoopModeValue = typeof LoopMode[keyof typeof LoopMode]

export interface Song {
  id: number
  name: string
  artist: string
  url: string
}

// 播放列表（AAC M4A 128kbps，文件约 4MB，比 320kbps MP3 的 11MB 小 60%）
const PLAYLIST: Song[] = [
  { id: 1, name: '一次就好', artist: '杨宗纬', url: '/music/一次就好.m4a' },
  { id: 2, name: '三生三幸', artist: '海来阿木', url: '/music/三生三幸-海来阿木.m4a' },
  { id: 3, name: '50年以后', artist: '海来阿木', url: '/music/海来阿木-50年以后.mp3' },
]

const LS_KEY = 'musicState'

export const useMusicStore = defineStore('music', () => {
  const playlist = ref<Song[]>(PLAYLIST)
  const currentIndex = ref(0)
  const isPlaying = ref(false)
  const loopMode = ref<LoopModeValue>(LoopMode.ALL)

  // ─── Computed ──────────────────────────────────────────────
  const currentSong = computed(() => playlist.value[currentIndex.value])

  const loopModeLabel = computed(() => {
    switch (loopMode.value) {
      case LoopMode.ALL:  return '列表循环'
      case LoopMode.ONE:  return '单曲循环'
      case LoopMode.NONE: return '不循环'
    }
  })

  // ─── Storage ───────────────────────────────────────────────
  function saveToStorage() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        currentIndex: currentIndex.value,
        loopMode: loopMode.value,
        isPlaying: isPlaying.value,
      }))
    } catch (_) { /* ignore */ }
  }

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (!raw) return
      const data = JSON.parse(raw)
      if (typeof data.currentIndex === 'number') {
        currentIndex.value = Math.min(data.currentIndex, playlist.value.length - 1)
      }
      if (Object.values(LoopMode).includes(data.loopMode)) {
        loopMode.value = data.loopMode
      }
      // isPlaying 不恢复（浏览器策略会阻止自动播放）
    } catch (_) { /* ignore */ }
  }

  // ─── Actions ───────────────────────────────────────────────
  function selectSong(index: number) {
    currentIndex.value = index
    isPlaying.value = true
    saveToStorage()
  }

  function nextSong() {
    if (loopMode.value === LoopMode.ONE) return // 单曲循环由 audio loop 属性处理
    if (loopMode.value === LoopMode.NONE) {
      if (currentIndex.value >= playlist.value.length - 1) {
        // 已经是最后一首，停止
        isPlaying.value = false
        saveToStorage()
        return
      }
    }
    currentIndex.value = (currentIndex.value + 1) % playlist.value.length
    isPlaying.value = true
    saveToStorage()
  }

  function prevSong() {
    currentIndex.value = (currentIndex.value - 1 + playlist.value.length) % playlist.value.length
    isPlaying.value = true
    saveToStorage()
  }

  function toggleLoopMode() {
    const modes: LoopModeValue[] = [LoopMode.ALL, LoopMode.ONE, LoopMode.NONE]
    const i = modes.indexOf(loopMode.value)
    const next = modes[(i + 1) % modes.length]
    if (next) loopMode.value = next
    saveToStorage()
  }

  function setPlaying(val: boolean) {
    isPlaying.value = val
    saveToStorage()
  }

  // 初始化时恢复状态
  loadFromStorage()

  return {
    playlist,
    currentIndex,
    isPlaying,
    loopMode,
    currentSong,
    loopModeLabel,
    selectSong,
    nextSong,
    prevSong,
    toggleLoopMode,
    setPlaying,
  }
})
