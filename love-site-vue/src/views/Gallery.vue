<template>
  <div class="gallery-page page-container">
    <h2 class="page-title">
      照片墙
      <span class="count">({{ totalPhotos }})</span>
    </h2>

    <!-- 相册网格 -->
    <div class="albums-grid">
      <div
        v-for="album in store.albums"
        :key="album.id"
        class="album-card"
        @click="openAlbum(album)"
      >
        <div class="album-cover">
          <img :src="album.cover" :alt="album.title" loading="lazy" />
          <div class="album-overlay">
            <span class="album-count">{{ album.photos.length }} 张</span>
          </div>
        </div>
        <div class="album-info">
          <h3 class="album-title">{{ album.title }}</h3>
          <span class="album-date">{{ album.date }}</span>
        </div>
      </div>
    </div>

    <!-- 照片查看器 -->
    <Modal v-model="showViewer" :fullscreen="true">
      <template #header>
        <div class="viewer-header">
          <h3>{{ currentAlbum?.title }}</h3>
          <span>{{ currentPhotoIndex + 1 }} / {{ currentAlbum?.photos.length }}</span>
        </div>
      </template>
      
      <div v-if="currentAlbum && currentAlbum.photos[currentPhotoIndex]" class="photo-viewer">
        <button class="viewer-nav prev" @click="prevPhoto">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        
        <img
          :src="currentAlbum.photos[currentPhotoIndex]!.src"
          :alt="currentAlbum.photos[currentPhotoIndex]!.caption"
          class="viewer-image"
        />
        
        <button class="viewer-nav next" @click="nextPhoto">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
      
      <p v-if="currentAlbum && currentAlbum.photos[currentPhotoIndex]" class="viewer-caption">
        {{ currentAlbum.photos[currentPhotoIndex]!.caption }}
      </p>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores'
import Modal from '@/components/common/Modal.vue'
import type { Album } from '@/types'

const store = useAppStore()

const showViewer = ref(false)
const currentAlbum = ref<Album | null>(null)
const currentPhotoIndex = ref(0)

const totalPhotos = computed(() => {
  return store.albums.reduce((sum, a) => sum + a.photos.length, 0)
})

const openAlbum = (album: Album) => {
  currentAlbum.value = album
  currentPhotoIndex.value = 0
  showViewer.value = true
}

const prevPhoto = () => {
  if (currentAlbum.value && currentPhotoIndex.value > 0) {
    currentPhotoIndex.value--
  }
}

const nextPhoto = () => {
  if (currentAlbum.value && currentPhotoIndex.value < currentAlbum.value.photos.length - 1) {
    currentPhotoIndex.value++
  }
}

onMounted(() => {
  if (store.albums.length === 0) {
    store.loadAlbums()
  }
})
</script>

<style scoped>
.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-md);
}

.album-card {
  cursor: pointer;
  background: var(--bg-container);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}

.album-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--border-base);
}

.album-cover {
  position: relative;
  aspect-ratio: 4/3;
  overflow: hidden;
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.album-card:hover .album-cover img {
  transform: scale(1.05);
}

.album-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%);
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: var(--space-md);
}

.album-count {
  color: white;
  font-size: var(--font-size-sm);
  padding: 4px 10px;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-full);
}

.album-info {
  padding: var(--space-md);
}

.album-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: 4px;
}

.album-date {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

/* 查看器 */
.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.viewer-header h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
}

.viewer-header span {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.photo-viewer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  min-height: 50vh;
}

.viewer-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: var(--radius-md);
}

.viewer-nav {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: var(--bg-surface);
  color: var(--text-primary);
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.viewer-nav:hover {
  background: var(--color-primary);
  color: white;
}

.viewer-caption {
  text-align: center;
  padding: var(--space-md);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

@media (max-width: 768px) {
  .albums-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .viewer-nav {
    display: none;
  }
}
</style>
