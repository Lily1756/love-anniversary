<template>
  <div class="gallery-page page-container">
    <div class="page-header">
      <h2 class="page-title">
        照片墙
        <span class="count">({{ totalPhotos }})</span>
      </h2>
      <div class="header-actions">
        <button v-if="!isEditMode" class="edit-btn" @click="openAuthModal">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          编辑
        </button>
        <template v-else>
          <button class="add-btn" @click="showAlbumModal = true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            相册
          </button>
          <button class="done-btn" @click="exitEditMode">完成</button>
        </template>
      </div>
    </div>

    <!-- 隐藏的文件输入：修改封面 -->
    <input
      ref="coverUploadInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleCoverChange"
    />

    <!-- 保存状态提示 -->
    <div v-if="saveStatus !== 'idle'" class="save-toast" :class="saveStatus">
      <span>{{ saveMessage }}</span>
    </div>

    <!-- 相册网格 -->
    <div class="albums-grid">
      <div
        v-for="album in store.albums"
        :key="album.id"
        class="album-card"
        :class="{ 'edit-mode': isEditMode }"
        @click="openAlbum(album)"
      >
        <div class="album-cover">
          <img :src="album.cover" :alt="album.title" loading="lazy" />
          <div class="album-overlay">
            <span class="album-count">{{ album.photos.length }} 张</span>
          </div>
          <!-- 编辑模式按钮组 -->
          <template v-if="isEditMode">
            <button class="album-edit" @click.stop="triggerCoverUpload(album)" title="修改封面">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </button>
            <button class="album-delete" @click.stop="deleteAlbum(album.id)" title="删除相册">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </template>
        </div>
        <div class="album-info">
          <h3 class="album-title">{{ album.title }}</h3>
          <span class="album-date">{{ album.date }}</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="store.albums.length === 0" class="empty-state">
      <p>暂无照片，记录我们的美好时光吧 📸</p>
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

      <div v-if="isEditMode && currentAlbum" class="viewer-actions">
        <input
          ref="uploadInput"
          type="file"
          accept="image/*"
          multiple
          class="hidden"
          @change="handleUpload"
        />
        <button class="upload-btn" @click="uploadInput?.click()">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          添加照片
        </button>
        <button class="delete-photo-btn" @click="deleteCurrentPhoto">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          删除照片
        </button>
      </div>

      <!-- 上传进度 -->
      <div v-if="upload.tasks.value.length > 0" class="upload-progress">
        <div v-for="task in upload.tasks.value" :key="task.id" class="upload-task">
          <span class="task-name">{{ task.name }}</span>
          <span class="task-status" :class="task.status">{{ taskStatusText(task.status) }}</span>
        </div>
      </div>
    </Modal>

    <EditAuthModal
      v-model="showAuth"
      :password="authPassword"
      :error="authError"
      @update:password="authPassword = $event"
      @confirm="verifyAuth"
    />

    <!-- 新建相册弹窗 -->
    <Modal v-model="showAlbumModal" title="新建相册">
      <div class="album-form">
        <div class="form-group">
          <label>相册名称</label>
          <input v-model="newAlbum.title" type="text" placeholder="例如：甜蜜日常" />
        </div>
        <div class="form-group">
          <label>分类</label>
          <select v-model="newAlbum.tag">
            <option value="daily">日常</option>
            <option value="date">约会</option>
            <option value="travel">旅行</option>
            <option value="anniversary">纪念日</option>
          </select>
        </div>
        <div class="form-group">
          <label>日期</label>
          <input v-model="newAlbum.date" type="date" />
        </div>
      </div>
      <template #footer>
        <button class="btn-text" @click="showAlbumModal = false">取消</button>
        <button class="btn-primary" @click="createAlbum">创建</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores'
import Modal from '@/components/common/Modal.vue'
import EditAuthModal from '@/components/common/EditAuthModal.vue'
import { useUpload } from '@/composables/useUpload'
import { useEditAuth } from '@/composables/useEditAuth'
import { useDebouncedSave } from '@/composables/useDebouncedSave'
import type { Album } from '@/types'

const store = useAppStore()
const upload = useUpload()

const showViewer = ref(false)
const currentAlbum = ref<Album | null>(null)
const currentPhotoIndex = ref(0)

const { isEditMode, showAuth, authPassword, authError, openAuthModal, verifyAuth, exitEditMode } = useEditAuth({
  password: '2025',
})

const showAlbumModal = ref(false)
const newAlbum = ref({ title: '', tag: 'daily', date: new Date().toISOString().split('T')[0] })

const uploadInput = ref<HTMLInputElement>()
const coverUploadInput = ref<HTMLInputElement>()
const currentEditAlbum = ref<Album | null>(null)

const { saveStatus, saveMessage, setSaveState, triggerDebouncedSave } = useDebouncedSave()

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

function createAlbum() {
  if (!newAlbum.value.title.trim()) return
  const album: Album = {
    id: 'album-' + Date.now(),
    title: newAlbum.value.title.trim(),
    tag: newAlbum.value.tag,
    cover: '',
    date: (newAlbum.value.date || new Date().toISOString().split('T')[0]) as string,
    photos: [],
  }
  store.albums.push(album)
  showAlbumModal.value = false
  newAlbum.value = { title: '', tag: 'daily', date: new Date().toISOString().split('T')[0] }
  autoSave()
}

function deleteAlbum(id: string) {
  if (!confirm('确定要删除这个相册吗？相册内的所有照片也会被删除。')) return
  store.albums = store.albums.filter((a) => a.id !== id)
  autoSave()
}

async function handleUpload(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files || !currentAlbum.value) return

  const urls = await upload.uploadFiles(files)
  urls.forEach((url) => {
    currentAlbum.value!.photos.push({ src: url, caption: '' })
  })

  if (urls.length > 0 && !currentAlbum.value.cover) {
    currentAlbum.value.cover = urls[0]!
  }

  // 重置input
  if (uploadInput.value) uploadInput.value.value = ''
  autoSave()
}

function deleteCurrentPhoto() {
  if (!currentAlbum.value) return
  if (!confirm('确定要删除这张照片吗？')) return
  currentAlbum.value.photos.splice(currentPhotoIndex.value, 1)
  if (currentPhotoIndex.value >= currentAlbum.value.photos.length) {
    currentPhotoIndex.value = Math.max(0, currentAlbum.value.photos.length - 1)
  }
  if (currentAlbum.value.photos.length === 0) {
    currentAlbum.value.cover = ''
    showViewer.value = false
  }
  autoSave()
}

/* ---------- 修改封面 ---------- */
function triggerCoverUpload(album: Album) {
  currentEditAlbum.value = album
  coverUploadInput.value?.click()
}

async function handleCoverChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0 || !currentEditAlbum.value) return

  try {
    setSaveState('saving', '正在上传封面...')
    const urls = await upload.uploadFiles(files)
    if (urls.length > 0 && currentEditAlbum.value) {
      currentEditAlbum.value.cover = urls[0]!
      setSaveState('saved', '封面已更新')
      await autoSave()
    }
  } catch (err: any) {
    setSaveState('error', '封面上传失败: ' + err.message)
  } finally {
    if (coverUploadInput.value) coverUploadInput.value.value = ''
    currentEditAlbum.value = null
  }
}

async function autoSave() {
  triggerDebouncedSave(() => store.saveAlbums('2025'))
}

function taskStatusText(status: string): string {
  const map: Record<string, string> = {
    pending: '等待中',
    compressing: '压缩中',
    uploading: '上传中',
    done: '完成',
    error: '失败',
  }
  return map[status] || status
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

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
}

.header-actions {
  display: flex;
  gap: var(--space-sm);
}

.edit-btn, .add-btn, .done-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
}

.edit-btn {
  background: var(--bg-surface);
  color: var(--text-secondary);
  border: 1px solid var(--border-base);
}
.edit-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.add-btn {
  background: var(--color-primary);
  color: white;
}
.add-btn:hover {
  background: #b8979a;
}

.done-btn {
  background: var(--bg-surface);
  color: var(--text-secondary);
  border: 1px solid var(--border-base);
}

/* 编辑模式 */
.album-card.edit-mode {
  position: relative;
}
.album-edit {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: rgba(80, 140, 200, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  transition: all var(--transition-fast);
}
.album-edit:hover {
  background: rgba(80, 140, 200, 1);
  transform: scale(1.1);
}
.album-delete {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 32px;
  height: 32px;
  background: rgba(220, 100, 100, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  transition: all var(--transition-fast);
}
.album-delete:hover {
  background: rgba(220, 100, 100, 1);
  transform: scale(1.1);
}

/* 保存状态提示 */
.save-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 24px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  z-index: 1000;
  animation: fadeInDown 0.3s ease;
}
.save-toast.saving {
  background: var(--color-primary);
  color: white;
}
.save-toast.saved {
  background: #5a7050;
  color: white;
}
.save-toast.error {
  background: #c97070;
  color: white;
}
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* 相册表单 */
.album-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-md) 0;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}
.form-group label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}
.form-group input,
.form-group select {
  padding: 10px 14px;
  border: 1px solid var(--border-base);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: var(--font-size-base);
}
.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: var(--shadow-focus);
}

/* 查看器操作 */
.viewer-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  padding: var(--space-md);
  border-top: 1px solid var(--border-light);
}
.upload-btn, .delete-photo-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
}
.upload-btn {
  background: var(--color-primary);
  color: white;
}
.delete-photo-btn {
  background: rgba(220, 100, 100, 0.1);
  color: #c97070;
}

/* 上传进度 */
.upload-progress {
  padding: var(--space-md);
  border-top: 1px solid var(--border-light);
}
.upload-task {
  display: flex;
  justify-content: space-between;
  padding: var(--space-xs) 0;
  font-size: var(--font-size-sm);
}
.task-name {
  color: var(--text-secondary);
}
.task-status {
  font-weight: var(--font-weight-medium);
}
.task-status.done { color: #5a7050; }
.task-status.error { color: #c97070; }
.task-status.uploading { color: var(--color-primary); }

.hidden { display: none; }

@media (max-width: 768px) {
  .albums-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
  }
  .viewer-nav {
    display: none;
  }
}
</style>
