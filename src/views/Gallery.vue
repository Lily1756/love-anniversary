<template>
  <div class="gallery-page page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">
        <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="M21 15l-5-5L5 21"/>
        </svg>
        照片墙
      </h2>
      <div class="header-actions">
        <button v-if="!isEditMode" class="edit-btn" @click="openAuthModal">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          编辑
        </button>
        <template v-else>
          <button class="add-btn" @click="openAlbumModal()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            相册
          </button>
          <button class="add-photo-btn" @click="openPhotoModal">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            照片
          </button>
          <button class="done-btn" @click="exitEditMode">完成</button>
        </template>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="photo-stats">
      <div class="stats-item">
        <span class="stats-number">{{ filteredAlbums.length }}</span> 个相册
      </div>
      <div class="stats-item">
        <span class="stats-number">{{ totalPhotosFiltered }}</span> 张照片
      </div>
    </div>

    <!-- 标签筛选 -->
    <div class="filter-bar">
      <button
        v-for="tag in filterTags"
        :key="tag.value"
        class="filter-tag"
        :class="{ active: currentTag === tag.value }"
        @click="currentTag = tag.value"
      >
        <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="tag.icon"/>
        {{ tag.label }}
      </button>
    </div>

    <!-- 保存状态提示 -->
    <div v-if="saveStatus !== 'idle'" class="save-toast" :class="saveStatus">
      <span>{{ saveMessage }}</span>
    </div>

    <!-- 相册网格 -->
    <div class="albums-grid">
      <div
        v-for="album in filteredAlbums"
        :key="album.id"
        class="album-card"
        :class="{ 'edit-mode': isEditMode }"
        @click="openAlbum(album)"
      >
        <div class="album-cover">
          <img :src="album.cover || fallbackCover" :alt="album.title" loading="lazy" @error="($event.target as HTMLImageElement).src=fallbackCover" />
          <span class="album-tag-badge">{{ getTagLabel(album.tag) }}</span>
          <div class="album-overlay">
            <span class="album-count">{{ album.photos.length }} 张</span>
          </div>
          <!-- 编辑模式按钮组 -->
          <template v-if="isEditMode">
            <button class="album-edit" @click.stop="openAlbumModal(album)" title="编辑相册">
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
    <div v-if="filteredAlbums.length === 0" class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="#a08080" stroke-width="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="M21 15l-5-5L5 21"/>
      </svg>
      <p class="empty-text">还没有相册哦～</p>
      <p v-if="isEditMode" class="empty-sub">点击右上角「新建相册」开始记录吧</p>
    </div>

    <!-- ==================== 照片查看器 ==================== -->
    <Modal v-model="showViewer" :fullscreen="true">
      <template #header>
        <div class="viewer-header">
          <button class="viewer-back" @click="closeViewer">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            返回相册
          </button>
          <span class="viewer-counter">{{ currentPhotoIndex + 1 }} / {{ currentAlbum?.photos.length }}</span>
        </div>
      </template>

      <div
        v-if="currentAlbum && currentAlbum.photos[currentPhotoIndex]"
        class="photo-viewer"
        ref="viewerMainRef"
        @click="handleViewerClick"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
      >
        <button class="viewer-nav prev" @click.stop="prevPhoto">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>

        <img
          :src="currentAlbum.photos[currentPhotoIndex]!.src"
          :alt="currentAlbum.photos[currentPhotoIndex]!.caption"
          class="viewer-image"
          :class="{ zoomed: isZoomed }"
          @click.stop="toggleZoom"
          @error="($event.target as HTMLImageElement).src=fallbackCover"
        />

        <button class="viewer-nav next" @click.stop="nextPhoto">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      <p
        v-if="currentAlbum && currentAlbum.photos[currentPhotoIndex]?.caption"
        class="viewer-caption"
        :class="{ show: !!currentAlbum.photos[currentPhotoIndex]?.caption }"
      >
        {{ currentAlbum.photos[currentPhotoIndex]!.caption }}
      </p>

      <!-- 缩略图条 -->
      <div v-if="currentAlbum && currentAlbum.photos.length > 1" class="viewer-thumbs">
        <div
          v-for="(photo, idx) in currentAlbum.photos"
          :key="idx"
          class="thumb-item"
          :class="{ active: idx === currentPhotoIndex }"
          @click="currentPhotoIndex = idx"
        >
          <img :src="photo.src" :alt="photo.caption" loading="lazy" @error="($event.target as HTMLImageElement).style.opacity='0.2'" />
        </div>
      </div>

      <!-- 编辑模式操作栏 -->
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
        <button class="edit-caption-btn" @click="showCaptionEditor = true">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          编辑描述
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

    <!-- ==================== 编辑认证弹窗 ==================== -->
    <EditAuthModal
      v-model="showAuth"
      :password="authPassword"
      :error="authError"
      @update:password="authPassword = $event"
      @confirm="verifyAuth"
    />

    <!-- ==================== 新建/编辑相册弹窗 ==================== -->
    <Modal v-model="showAlbumModal" :title="editingAlbum ? '编辑相册' : '新建相册'">
      <div class="album-form">
        <div class="form-group">
          <label>相册名称</label>
          <input v-model="albumForm.title" type="text" placeholder="给相册起个名字" maxlength="30" />
        </div>
        <div class="form-group">
          <label>标签分类</label>
          <select v-model="albumForm.tag">
            <option value="daily">日常</option>
            <option value="date">约会</option>
            <option value="travel">旅行</option>
            <option value="anniversary">纪念日</option>
          </select>
        </div>

        <!-- 封面上传区域 -->
        <div class="form-group">
          <label>相册封面 <span class="label-hint">(拖拽或点击上传)</span></label>
          <div
            class="cover-upload-area"
            :class="{ dragover: coverDragover, uploading: coverUploading }"
            @click="coverFileInput?.click()"
            @dragover.prevent="coverDragover = true"
            @dragleave.prevent="coverDragover = false"
            @drop.prevent="handleCoverDrop"
          >
            <input
              ref="coverFileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleCoverFileSelect"
            />
            <!-- 占位状态 -->
            <div v-if="!albumForm.cover && !coverUploading" class="cover-placeholder">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
              <span>点击或拖拽上传封面</span>
            </div>
            <!-- 预览状态 -->
            <div v-else-if="albumForm.cover && !coverUploading" class="cover-preview">
              <img v-if="!coverPreviewFailed" :src="albumForm.cover" alt="封面预览" @error="handleCoverPreviewError" loading="lazy" />
              <div v-else class="cover-preview-failed">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                  <line x1="2" y1="2" x2="22" y2="22" stroke="var(--color-danger, #e74c3c)" stroke-width="2"/>
                </svg>
                <span>图片加载失败</span>
                <button type="button" class="cover-retry-btn" @click.stop="coverPreviewFailed = false">重试</button>
              </div>
              <button type="button" class="cover-remove-btn" @click.stop="albumForm.cover = ''; coverPreviewFailed = false" title="更换封面">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <!-- 上传中 -->
            <div v-if="coverUploading" class="cover-upload-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: coverProgress + '%' }"></div>
              </div>
              <div class="progress-text">{{ coverProgressText }}</div>
            </div>
          </div>
        </div>

        <!-- URL 输入（高级） -->
        <div class="form-group form-group-advanced">
          <label class="checkbox-label" @click="showCoverUrl = !showCoverUrl">
            <input type="checkbox" v-model="showCoverUrl" />
            <span>使用图片 URL（高级）</span>
          </label>
          <input
            v-if="showCoverUrl"
            v-model="albumForm.cover"
            type="text"
            placeholder="https://..."
            class="url-input"
          />
        </div>

        <div class="form-group">
          <label>创建日期</label>
          <input v-model="albumForm.date" type="date" />
        </div>
      </div>
      <template #footer>
        <button class="btn-text" @click="showAlbumModal = false">取消</button>
        <button class="btn-primary" @click="confirmAlbumModal">
          {{ editingAlbum ? '保存' : '创建' }}
        </button>
      </template>
    </Modal>

    <!-- ==================== 批量添加照片弹窗 ==================== -->
    <Modal v-model="showPhotoModal" title="批量添加照片">
      <div class="photo-form">
        <div class="form-group">
          <label>目标相册</label>
          <select v-model="photoTargetAlbumId">
            <option v-for="album in store.albums" :key="album.id" :value="album.id">
              {{ album.title }}
            </option>
          </select>
        </div>

        <!-- 拖拽上传区域 -->
        <div class="form-group">
          <label>上传照片 <span class="label-hint">(支持拖拽或点击选择)</span></label>
          <div
            class="upload-dropzone"
            :class="{ dragover: photoDragover, uploading: upload.isUploading.value }"
            @click="photoFileInput?.click()"
            @dragover.prevent="photoDragover = true"
            @dragleave.prevent="photoDragover = false"
            @drop.prevent="handlePhotoDrop"
          >
            <input
              ref="photoFileInput"
              type="file"
              multiple
              accept="image/*"
              class="hidden"
              @change="handlePhotoFileSelect"
            />
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span class="dropzone-text">拖拽图片到此处，或点击选择文件</span>
            <span class="dropzone-hint">支持 JPG、PNG、GIF、WebP 格式</span>
          </div>
        </div>

        <!-- 上传进度 -->
        <div v-if="upload.tasks.value.length > 0" class="form-group">
          <label>上传进度</label>
          <div class="upload-progress-list">
            <div v-for="task in upload.tasks.value" :key="task.id" class="upload-progress-item">
              <div class="progress-thumb">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
              </div>
              <div class="progress-info">
                <div class="progress-name">{{ task.name }}</div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: task.progress + '%' }"></div>
                </div>
                <div class="progress-status">{{ taskStatusText(task.status) }}</div>
              </div>
              <div class="progress-percent">{{ task.progress }}%</div>
            </div>
          </div>
        </div>

        <!-- 已上传照片列表 -->
        <div v-if="uploadedPhotosQueue.length > 0" class="form-group">
          <label>已添加照片 <span class="count-badge">({{ uploadedPhotosQueue.length }}张)</span></label>
          <div class="uploaded-photos-list">
            <div v-for="(photo, idx) in uploadedPhotosQueue" :key="idx" class="uploaded-photo-item">
              <img :src="photo.src" alt="" @error="($event.target as HTMLImageElement).style.opacity='0.2'" />
              <button class="remove-btn" @click="removeUploadedPhoto(idx)" title="移除">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <input
                v-model="photo.caption"
                type="text"
                class="caption-input"
                placeholder="添加描述..."
              />
            </div>
          </div>
        </div>

        <!-- URL 输入（高级） -->
        <div class="form-group form-group-advanced">
          <label class="checkbox-label" @click="showPhotoUrl = !showPhotoUrl">
            <input type="checkbox" v-model="showPhotoUrl" />
            <span>使用图片 URL 添加（高级）</span>
          </label>
        </div>

        <div v-if="showPhotoUrl" class="form-group">
          <label>照片列表 <span class="label-hint">(每行一张: URL|描述)</span></label>
          <textarea
            v-model="photoBatchInput"
            rows="4"
            placeholder="https://example.com/photo1.jpg|海边日落&#10;https://example.com/photo2.jpg|开心时刻"
            class="batch-textarea"
          ></textarea>
        </div>

        <!-- URL 批量预览 -->
        <div v-if="batchPreviewPhotos.length > 0" class="form-group">
          <label>预览 <span class="count-badge">({{ batchPreviewPhotos.length }}张)</span></label>
          <div class="batch-preview-list">
            <div v-for="(photo, idx) in batchPreviewPhotos" :key="idx" class="batch-preview-item">
              <img :src="photo.src" :alt="photo.caption" @error="($event.target as HTMLImageElement).style.display='none'" />
              <span class="batch-index">{{ idx + 1 }}</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <button class="btn-text" @click="showPhotoModal = false">取消</button>
        <button class="btn-primary" @click="confirmPhotoModal">添加</button>
      </template>
    </Modal>

    <!-- ==================== 编辑照片描述弹窗 ==================== -->
    <Modal v-model="showCaptionEditor" title="编辑照片描述">
      <div class="form-group">
        <label>照片描述</label>
        <input
          v-model="captionEditValue"
          type="text"
          placeholder="给这张照片写点什么..."
          maxlength="100"
          @keydown.enter="saveCaption"
        />
      </div>
      <template #footer>
        <button class="btn-text" @click="showCaptionEditor = false">取消</button>
        <button class="btn-primary" @click="saveCaption">保存</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useAppStore } from '@/stores'
import Modal from '@/components/common/Modal.vue'
import EditAuthModal from '@/components/common/EditAuthModal.vue'
import { useUpload } from '@/composables/useUpload'
import { useEditAuth } from '@/composables/useEditAuth'
import { useDebouncedSave } from '@/composables/useDebouncedSave'
import type { Album, Photo } from '@/types'

const store = useAppStore()
const upload = useUpload()

// ==================== 标签筛选 ====================
const currentTag = ref('all')
const filterTags = [
  { value: 'all', label: '全部', icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>' },
  { value: 'daily', label: '日常', icon: '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>' },
  { value: 'date', label: '约会', icon: '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>' },
  { value: 'travel', label: '旅行', icon: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>' },
  { value: 'anniversary', label: '纪念日', icon: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>' },
]

const filteredAlbums = computed(() => {
  let list = currentTag.value === 'all'
    ? store.albums
    : store.albums.filter(a => a.tag === currentTag.value)
  return [...list].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0
    const dateB = b.date ? new Date(b.date).getTime() : 0
    return dateB - dateA
  })
})

const totalPhotosFiltered = computed(() => {
  return filteredAlbums.value.reduce((sum, a) => sum + a.photos.length, 0)
})

function getTagLabel(tag: string | undefined): string {
  const map: Record<string, string> = { daily: '日常', date: '约会', travel: '旅行', anniversary: '纪念日' }
  return map[tag || ''] || tag || ''
}

// ==================== 编辑认证 ====================
const { isEditMode, showAuth, authPassword, authError, openAuthModal, verifyAuth, exitEditMode } = useEditAuth({
  password: '2025',
})

// ==================== 保存状态 ====================
const { saveStatus, saveMessage, setSaveState, triggerDebouncedSave } = useDebouncedSave()

let _saveTimer: ReturnType<typeof setTimeout> | null = null
let _errorAutoHideTimer: ReturnType<typeof setTimeout> | null = null

async function autoSave() {
  // 防抖：800ms 内只执行最后一次
  if (_saveTimer) clearTimeout(_saveTimer)
  _saveTimer = setTimeout(async () => {
    // 清除之前的错误自动隐藏计时器
    if (_errorAutoHideTimer) clearTimeout(_errorAutoHideTimer)

    setSaveState('saving', '正在保存到云端...')
    const result = await store.saveAlbums('2025')
    if (result.success) {
      setSaveState('saved', '云端保存成功')
    } else {
      setSaveState('error', result.error || '保存失败，请稍后重试')
      // 错误状态 5 秒后自动消失
      _errorAutoHideTimer = setTimeout(() => {
        if (saveStatus.value === 'error') {
          saveStatus.value = 'idle'
        }
      }, 5000)
    }
  }, 800)
}

// ==================== 照片查看器 ====================
const showViewer = ref(false)
const currentAlbum = ref<Album | null>(null)
const currentPhotoIndex = ref(0)
const isZoomed = ref(false)
const viewerMainRef = ref<HTMLElement>()

const openAlbum = (album: Album) => {
  currentAlbum.value = album
  currentPhotoIndex.value = 0
  isZoomed.value = false
  showViewer.value = true
}

const closeViewer = () => {
  showViewer.value = false
  currentAlbum.value = null
  currentPhotoIndex.value = 0
  isZoomed.value = false
}

const prevPhoto = () => {
  if (!currentAlbum.value) return
  const len = currentAlbum.value.photos.length
  currentPhotoIndex.value = (currentPhotoIndex.value - 1 + len) % len
  isZoomed.value = false
}

const nextPhoto = () => {
  if (!currentAlbum.value) return
  const len = currentAlbum.value.photos.length
  currentPhotoIndex.value = (currentPhotoIndex.value + 1) % len
  isZoomed.value = false
}

const toggleZoom = () => {
  isZoomed.value = !isZoomed.value
}

const handleViewerClick = (e: MouseEvent) => {
  if (e.target === viewerMainRef.value) {
    closeViewer()
  }
}

// 触摸滑动
let touchStartX = 0
const handleTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0]!.clientX
}
const handleTouchEnd = (e: TouchEvent) => {
  const diff = touchStartX - e.changedTouches[0]!.clientX
  if (Math.abs(diff) > 50) {
    diff > 0 ? nextPhoto() : prevPhoto()
  }
}

// 键盘导航
onMounted(() => {
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (!showViewer.value) return
    if (e.key === 'ArrowLeft') prevPhoto()
    if (e.key === 'ArrowRight') nextPhoto()
    if (e.key === 'Escape') closeViewer()
  })
})

// ==================== 相册管理 ====================
const showAlbumModal = ref(false)
const editingAlbum = ref<Album | null>(null)
const albumForm = ref<{ title: string; tag: string; date: string; cover: string }>({ title: '', tag: 'daily', date: new Date().toISOString().split('T')[0] as string, cover: '' })
const showCoverUrl = ref(false)
const coverDragover = ref(false)
const coverUploading = ref(false)
const coverPreviewFailed = ref(false)
const coverProgress = ref(0)
const coverProgressText = ref('')
const coverFileInput = ref<HTMLInputElement>()
const fallbackCover = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%23F0E6E6" width="400" height="300"/><text x="200" y="160" text-anchor="middle" fill="%23C4A8A2" font-size="40">📷</text></svg>'

function openAlbumModal(album?: Album) {
  editingAlbum.value = album || null
  if (album) {
    albumForm.value = { title: album.title, tag: album.tag || 'daily', date: (album.date || new Date().toISOString().split('T')[0]) as string, cover: album.cover }
  } else {
    albumForm.value = { title: '', tag: 'daily', date: new Date().toISOString().split('T')[0] as string, cover: '' }
  }
  showCoverUrl.value = false
  coverUploading.value = false
  coverPreviewFailed.value = false
  coverProgress.value = 0
  showAlbumModal.value = true
}

async function handleCoverFileSelect(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0) return
  const file = files[0]
  if (file) await uploadCover(file)
}

async function handleCoverDrop(e: DragEvent) {
  coverDragover.value = false
  const files = e.dataTransfer?.files
  if (!files || files.length === 0) return
  const imageFile = Array.from(files).find(f => f.type.startsWith('image/'))
  if (imageFile) await uploadCover(imageFile)
}

function handleCoverPreviewError() {
  coverPreviewFailed.value = true
}

async function uploadCover(file: File) {
  coverUploading.value = true
  coverProgress.value = 20
  coverProgressText.value = '压缩图片...'

  try {
    const compressed = await upload.compressImage(file, 1200, 0.85)
    coverProgress.value = 50
    coverProgressText.value = '上传到云端...'

    const formData = new FormData()
    formData.append('file', compressed)
    formData.append('upload_preset', 'love_site_preset')

    const response = await fetch(`https://api.cloudinary.com/v1_1/dcpzdsdxc/image/upload`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) throw new Error('Upload failed')
    const data = await response.json()
    albumForm.value.cover = data.secure_url
    coverPreviewFailed.value = false
    coverProgress.value = 100
    coverProgressText.value = '完成！'
  } catch (err: any) {
    coverProgressText.value = '上传失败: ' + err.message
    setTimeout(() => { coverUploading.value = false }, 2000)
    return
  }

  setTimeout(() => { coverUploading.value = false }, 500)
}

function confirmAlbumModal() {
  const title = albumForm.value.title.trim()
  const cover = albumForm.value.cover.trim()
  if (!title) { setSaveState('error', '请输入相册名称'); return }
  if (!cover) { setSaveState('error', '请上传相册封面'); return }

  const dateStr: string = albumForm.value.date || (new Date().toISOString().split('T')[0] as string)
  const tag: string = albumForm.value.tag || 'daily'

  if (editingAlbum.value) {
    editingAlbum.value.title = title
    editingAlbum.value.tag = tag
    editingAlbum.value.cover = cover
    editingAlbum.value.date = dateStr
  } else {
    const album: Album = {
      id: 'album-' + Date.now(),
      title: title,
      tag: tag,
      cover: cover,
      date: dateStr,
      photos: [],
    }
    store.albums.push(album)
  }

  showAlbumModal.value = false
  autoSave()
}

function deleteAlbum(id: string) {
  if (!confirm('确定要删除这个相册吗？相册内的所有照片也会被删除。')) return
  store.albums = store.albums.filter((a) => a.id !== id)
  autoSave()
}

// ==================== 批量添加照片 ====================
const showPhotoModal = ref(false)
const photoTargetAlbumId = ref('')
const photoDragover = ref(false)
const photoFileInput = ref<HTMLInputElement>()
const uploadedPhotosQueue = ref<Photo[]>([])
const showPhotoUrl = ref(false)
const photoBatchInput = ref('')

const batchPreviewPhotos = computed(() => {
  if (!photoBatchInput.value.trim()) return []
  return photoBatchInput.value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line)
    .map(line => {
      const parts = line.split('|')
      return { src: parts[0]!.trim(), caption: parts[1] ? parts[1].trim() : '' }
    })
    .filter(p => p.src)
})

watch(showPhotoModal, (val) => {
  if (val) {
    uploadedPhotosQueue.value = []
    photoBatchInput.value = ''
    showPhotoUrl.value = false
    photoTargetAlbumId.value = store.albums[0]?.id || ''
    upload.clearTasks()
  }
})

function openPhotoModal() {
  showPhotoModal.value = true
}

async function handlePhotoFileSelect(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  await processPhotoFiles(files)
}

async function handlePhotoDrop(e: DragEvent) {
  photoDragover.value = false
  const files = e.dataTransfer?.files
  if (!files) return
  await processPhotoFiles(files)
}

async function processPhotoFiles(files: FileList) {
  const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
  if (imageFiles.length === 0) { setSaveState('error', '请选择图片文件'); return }

  const urls = await upload.uploadFiles(imageFiles)
  urls.forEach(url => {
    uploadedPhotosQueue.value.push({ src: url, caption: '' })
  })

  if (photoFileInput.value) photoFileInput.value.value = ''
}

function removeUploadedPhoto(index: number) {
  uploadedPhotosQueue.value.splice(index, 1)
}

function confirmPhotoModal() {
  const album = store.albums.find(a => a.id === photoTargetAlbumId.value)
  if (!album) { setSaveState('error', '相册不存在'); return }

  let addedCount = 0

  // 添加已上传的照片
  uploadedPhotosQueue.value.forEach(photo => {
    album.photos.push({ src: photo.src, caption: photo.caption })
    addedCount++
  })

  // 添加 URL 批量输入的照片
  if (showPhotoUrl.value && photoBatchInput.value.trim()) {
    batchPreviewPhotos.value.forEach(photo => {
      album.photos.push({ src: photo.src, caption: photo.caption })
      addedCount++
    })
  }

  if (addedCount > 0) {
    if (!album.cover && album.photos.length > 0) {
      album.cover = album.photos[0]!.src
    }
    autoSave()
    showPhotoModal.value = false
    setSaveState('saved', `成功添加 ${addedCount} 张照片`)
  } else {
    setSaveState('error', '没有要添加的照片，请先上传或输入图片 URL')
  }
}

// ==================== 查看器内照片操作 ====================
const uploadInput = ref<HTMLInputElement>()

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

// ==================== 照片描述编辑 ====================
const showCaptionEditor = ref(false)
const captionEditValue = ref('')

watch(showCaptionEditor, (val) => {
  if (val && currentAlbum.value && currentAlbum.value.photos[currentPhotoIndex.value]) {
    captionEditValue.value = currentAlbum.value.photos[currentPhotoIndex.value]!.caption || ''
  }
})

function saveCaption() {
  if (currentAlbum.value && currentAlbum.value.photos[currentPhotoIndex.value]) {
    currentAlbum.value.photos[currentPhotoIndex.value]!.caption = captionEditValue.value.trim()
    autoSave()
  }
  showCaptionEditor.value = false
}

// ==================== 工具函数 ====================
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

// ==================== 初始化 ====================
onMounted(() => {
  if (store.albums.length === 0) {
    store.loadAlbums()
  }
})
</script>

<style scoped>
/* ==================== 页面头部 ==================== */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.page-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.title-icon {
  width: 26px;
  height: 26px;
  stroke: var(--color-primary);
}

.header-actions {
  display: flex;
  gap: var(--space-sm);
}

.edit-btn, .add-btn, .add-photo-btn, .done-btn {
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

.add-photo-btn {
  background: var(--bg-surface);
  color: var(--color-primary);
  border: 1.5px solid var(--color-primary);
}
.add-photo-btn:hover {
  background: var(--color-primary-soft);
}

.done-btn {
  background: var(--bg-surface);
  color: var(--text-secondary);
  border: 1px solid var(--border-base);
}

/* ==================== 统计信息 ==================== */
.photo-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: var(--space-lg);
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stats-number {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-lg);
}

/* ==================== 标签筛选 ==================== */
.filter-bar {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: var(--space-xl);
  flex-wrap: wrap;
}

.filter-tag {
  padding: 10px 20px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: 50px;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-tag:hover {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
}

.filter-tag.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.filter-icon {
  width: 18px;
  height: 18px;
}

/* ==================== 相册网格 ==================== */
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

.album-tag-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(196, 168, 162, 0.9);
  backdrop-filter: blur(8px);
  color: white;
  padding: 4px 12px;
  border-radius: 50px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
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

/* ==================== 编辑模式按钮 ==================== */
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

/* ==================== 空状态 ==================== */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-tertiary);
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  opacity: 0.5;
}

.empty-text {
  font-size: var(--font-size-base);
  margin-bottom: 8px;
}

.empty-sub {
  font-size: var(--font-size-sm);
  opacity: 0.8;
}

/* ==================== 照片查看器 ==================== */
.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.viewer-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  padding: 8px 16px;
  background: var(--bg-surface);
  border-radius: 50px;
  border: 1px solid var(--border-light);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.viewer-back:hover {
  background: var(--color-primary);
  color: white;
}

.viewer-counter {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  background: var(--bg-surface);
  padding: 8px 16px;
  border-radius: 50px;
}

.photo-viewer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  min-height: 50vh;
  flex: 1;
}

.viewer-image {
  max-width: 90%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: var(--radius-md);
  transition: transform 0.3s ease;
  cursor: zoom-in;
}

.viewer-image.zoomed {
  transform: scale(1.5);
  cursor: zoom-out;
}

.viewer-nav {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.2);
  color: var(--text-primary);
  transition: all var(--transition-fast);
  flex-shrink: 0;
  cursor: pointer;
}

.viewer-nav:hover {
  background: rgba(255,255,255,0.3);
  transform: scale(1.08);
}

.viewer-caption {
  text-align: center;
  padding: var(--space-md);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  opacity: 0;
  transition: opacity 0.3s;
}

.viewer-caption.show {
  opacity: 1;
}

/* 缩略图条 */
.viewer-thumbs {
  display: flex;
  gap: 8px;
  padding: var(--space-md);
  overflow-x: auto;
  scroll-behavior: smooth;
  border-top: 1px solid var(--border-light);
}

.viewer-thumbs::-webkit-scrollbar {
  height: 4px;
}

.viewer-thumbs::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.05);
  border-radius: 2px;
}

.viewer-thumbs::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.2);
  border-radius: 2px;
}

.thumb-item {
  flex-shrink: 0;
  width: 80px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all var(--transition-fast);
  opacity: 0.6;
}

.thumb-item.active {
  border-color: var(--color-primary);
  opacity: 1;
  transform: scale(1.05);
}

.thumb-item:hover {
  opacity: 0.9;
}

.thumb-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ==================== 查看器操作栏 ==================== */
.viewer-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  padding: var(--space-md);
  border-top: 1px solid var(--border-light);
  flex-wrap: wrap;
}

.upload-btn, .delete-photo-btn, .edit-caption-btn {
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

.edit-caption-btn {
  background: var(--bg-surface);
  color: var(--text-secondary);
  border: 1px solid var(--border-base);
}
.edit-caption-btn:hover {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
}

.delete-photo-btn {
  background: rgba(220, 100, 100, 0.1);
  color: #c97070;
}

/* ==================== 保存状态提示 ==================== */
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

/* ==================== 表单通用 ==================== */
.album-form, .photo-form {
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

.label-hint {
  color: var(--text-tertiary);
  font-weight: normal;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 14px;
  border: 1px solid var(--border-base);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: var(--shadow-focus);
}

.form-group-advanced {
  border-top: 1px dashed var(--border-light);
  padding-top: var(--space-md);
  margin-top: var(--space-xs);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary);
}

.url-input {
  margin-top: var(--space-xs);
}

.batch-textarea {
  resize: vertical;
  font-family: monospace;
  font-size: var(--font-size-sm);
  min-height: 80px;
}

.count-badge {
  color: var(--color-primary);
}

/* ==================== 封面上传区域 ==================== */
.cover-upload-area {
  position: relative;
  border: 2px dashed var(--color-primary);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-surface);
  transition: all var(--transition-fast);
  cursor: pointer;
  min-height: 160px;
}

.cover-upload-area:hover {
  background: var(--color-primary-soft);
  border-color: #a08080;
}

.cover-upload-area.dragover {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  border-style: solid;
  transform: scale(1.02);
}

.cover-upload-area.uploading {
  pointer-events: none;
}

.cover-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  text-align: center;
  color: var(--text-tertiary);
  gap: 8px;
}

.cover-preview {
  position: relative;
  width: 100%;
  height: 160px;
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-preview-failed {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 8px;
  color: var(--text-tertiary);
}

.cover-preview-failed svg {
  opacity: 0.5;
}

.cover-retry-btn {
  font-size: 12px;
  color: var(--color-primary);
  background: none;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  padding: 4px 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.cover-retry-btn:hover {
  background: var(--color-primary);
  color: white;
}

.cover-remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255,255,255,0.95);
  border: none;
  color: #e74c3c;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  transition: all var(--transition-fast);
}
.cover-remove-btn:hover {
  transform: scale(1.1);
  background: white;
}

.cover-upload-progress {
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  gap: 12px;
}

.progress-bar {
  width: 80%;
  height: 6px;
  background: rgba(196,168,162,0.2);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

/* ==================== 照片拖拽上传区域 ==================== */
.upload-dropzone {
  border: 2px dashed var(--color-primary);
  border-radius: var(--radius-md);
  padding: 32px 24px;
  text-align: center;
  background: var(--bg-surface);
  transition: all var(--transition-fast);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-tertiary);
}

.upload-dropzone:hover {
  background: var(--color-primary-soft);
  border-color: #a08080;
}

.upload-dropzone.dragover {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  border-style: solid;
  transform: scale(1.02);
}

.upload-dropzone.uploading {
  pointer-events: none;
  opacity: 0.7;
}

.dropzone-text {
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.dropzone-hint {
  font-size: var(--font-size-xs);
}

/* ==================== 上传进度列表 ==================== */
.upload-progress-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-progress-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--bg-surface);
  border-radius: var(--radius-sm);
}

.progress-thumb {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: var(--bg-body);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.progress-info {
  flex: 1;
  min-width: 0;
}

.progress-name {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.progress-status {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-top: 2px;
}

.progress-percent {
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  flex-shrink: 0;
}

/* ==================== 已上传照片列表 ==================== */
.uploaded-photos-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
  padding: 12px;
  background: var(--bg-surface);
  border-radius: var(--radius-sm);
}

.uploaded-photo-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.uploaded-photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.uploaded-photo-item .remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  border: none;
  color: #e74c3c;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.uploaded-photo-item:hover .remove-btn {
  opacity: 1;
}

.uploaded-photo-item .caption-input {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px 6px;
  border: none;
  background: rgba(0,0,0,0.6);
  color: white;
  font-size: 10px;
  width: 100%;
  outline: none;
}

.uploaded-photo-item .caption-input::placeholder {
  color: rgba(255,255,255,0.6);
}

/* ==================== URL 批量预览 ==================== */
.batch-preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 120px;
  overflow-y: auto;
  padding: 10px;
  background: var(--bg-surface);
  border-radius: var(--radius-sm);
}

.batch-preview-item {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--bg-body);
}

.batch-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.batch-index {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.6);
  color: white;
  font-size: 10px;
  padding: 2px 4px;
  text-align: center;
}

/* ==================== 上传进度（查看器内） ==================== */
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

/* ==================== 按钮样式 ==================== */
.btn-text, .btn-primary {
  padding: 8px 20px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
}

.btn-text {
  background: transparent;
  color: var(--text-secondary);
}
.btn-text:hover {
  background: var(--bg-surface);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}
.btn-primary:hover {
  background: #b8979a;
}

/* ==================== 隐藏元素 ==================== */
.hidden { display: none !important; }

/* ==================== 响应式 ==================== */
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

  .photo-viewer {
    min-height: 40vh;
  }

  .viewer-image {
    max-height: 50vh;
  }

  .filter-bar {
    gap: 6px;
  }

  .filter-tag {
    padding: 8px 14px;
    font-size: var(--font-size-xs);
  }

  .viewer-thumbs {
    padding: var(--space-sm);
  }

  .thumb-item {
    width: 60px;
    height: 45px;
  }
}

@media (max-width: 480px) {
  .albums-grid {
    grid-template-columns: 1fr;
  }
}
</style>
