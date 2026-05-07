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

  // Actions
  async function loadLetters() {
    try {
      isLoading.value = true
      const response = await fetch('./data/diaries.json')
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
      const response = await fetch('./data/photos.json')
      albums.value = await response.json()
    } catch (err) {
      console.error('加载照片失败:', err)
    }
  }

  async function loadFootprints() {
    try {
      const response = await fetch('./data/travels.json')
      footprints.value = await response.json()
    } catch (err) {
      console.error('加载足迹失败:', err)
    }
  }

  async function loadWishes() {
    try {
      const response = await fetch('./data/wishes.json')
      wishes.value = await response.json()
    } catch (err) {
      console.error('加载愿望失败:', err)
    }
  }

  async function loadAll() {
    await Promise.all([
      loadLetters(),
      loadAlbums(),
      loadFootprints(),
      loadWishes()
    ])
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
    loadAll
  }
})
