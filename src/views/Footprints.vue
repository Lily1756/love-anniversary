<template>
  <div class="footprints-page page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">
        足迹地图
        <span class="count">({{ store.footprints.length }})</span>
      </h2>
      <div class="header-actions">
        <button v-if="!isEditMode" class="edit-btn" @click="openAuthModal">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          编辑
        </button>
        <template v-else>
          <span v-if="mapClickHint" class="click-hint">🗺️ 点击地图选点</span>
          <button class="add-btn" @click="openAddModal">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            足迹
          </button>
          <button class="done-btn" @click="exitEditMode">完成</button>
        </template>
      </div>
    </div>

    <!-- 保存状态提示 -->
    <div v-if="saveStatus !== 'idle'" class="save-toast" :class="saveStatus">
      <span>{{ saveMessage }}</span>
    </div>

    <div class="footprints-layout">
      <!-- 时间轴 -->
      <div class="timeline">
        <div
          v-for="fp in sortedFootprints"
          :key="fp.id"
          class="timeline-item"
          :class="{ active: selectedId === fp.id }"
          @click="selectFootprint(fp)"
        >
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <span class="timeline-date">{{ fp.date }}</span>
            <h3 class="timeline-title">{{ fp.name }}</h3>
            <p class="timeline-preview">{{ fp.memory.slice(0, 50) }}...</p>
          </div>
          <button v-if="isEditMode" class="delete-timeline-btn" @click.stop="deleteFootprint(fp.id)">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 地图区域 -->
      <div class="map-container">
        <div id="map" ref="mapRef" class="map"></div>

        <!-- 选中地点详情 -->
        <div v-if="selectedFootprint && !isEditMode" class="footprint-detail">
          <img :src="selectedFootprint.photo" :alt="selectedFootprint.name" class="detail-photo" />
          <div class="detail-content">
            <h3>{{ selectedFootprint.name }}</h3>
            <p class="detail-date">{{ selectedFootprint.date }}</p>
            <p class="detail-memory">{{ selectedFootprint.memory }}</p>
          </div>
        </div>
      </div>
    </div>

    <EditAuthModal
      v-model="showAuth"
      :password="authPassword"
      :error="authError"
      @update:password="authPassword = $event"
      @confirm="verifyAuth"
    />

    <!-- 添加/编辑足迹弹窗 -->
    <Modal v-model="showAddModal" :title="editingFootprint ? '编辑足迹' : '添加足迹'">
      <div class="footprint-form">
        <div class="form-group">
          <label>地点名称</label>
          <input v-model="form.name" type="text" placeholder="例如：外滩" />
        </div>
        <div class="form-group">
          <label>日期</label>
          <input v-model="form.date" type="date" />
        </div>
        <div class="form-group">
          <label>回忆文字</label>
          <textarea v-model="form.memory" rows="3" placeholder="记录我们的美好回忆..."></textarea>
        </div>

        <!-- 坐标 -->
        <div class="form-row">
          <div class="form-group">
            <label>经度</label>
            <input v-model.number="form.lng" type="number" step="0.0001" placeholder="121.4737" />
          </div>
          <div class="form-group">
            <label>纬度</label>
            <input v-model.number="form.lat" type="number" step="0.0001" placeholder="31.2304" />
          </div>
        </div>

        <!-- 快速选点 -->
        <div class="quick-locations">
          <label>快速选点</label>
          <div class="location-chips">
            <button
              v-for="loc in quickLocations"
              :key="loc.name"
              class="location-chip"
              @click="selectQuickLocation(loc)"
            >
              {{ loc.name }}
            </button>
          </div>
        </div>

        <!-- 照片 -->
        <div class="form-group">
          <label>照片</label>
          <input ref="photoInput" type="file" accept="image/*" class="hidden" @change="handlePhotoUpload" />
          <div v-if="form.photo" class="photo-preview">
            <img :src="form.photo" alt="preview" />
            <button class="remove-photo" @click="form.photo = ''">×</button>
          </div>
          <button v-else class="upload-photo-btn" @click="photoInput?.click()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            上传照片
          </button>
        </div>
      </div>
      <template #footer>
        <button class="btn-text" @click="showAddModal = false">取消</button>
        <button class="btn-primary" @click="saveFootprint">保存</button>
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
import type { Footprint } from '@/types'

const store = useAppStore()
const upload = useUpload()

const mapRef = ref<HTMLElement>()
const selectedId = ref('')
let map: any = null
let markers: any[] = []
let L: any = null
let clickMarker: any = null

const mapClickHint = ref(false)
const { isEditMode, showAuth, authPassword, authError, openAuthModal, verifyAuth, exitEditMode } = useEditAuth({
  password: '2025',
  onEnterEditMode: () => {
    mapClickHint.value = true
  },
  onExitEditMode: () => {
    mapClickHint.value = false
    if (clickMarker && map) {
      map.removeLayer(clickMarker)
      clickMarker = null
    }
  },
})

/* ---------- 添加/编辑 ---------- */
const showAddModal = ref(false)
const editingFootprint = ref<Footprint | null>(null)
const photoInput = ref<HTMLInputElement>()
const getToday = () => new Date().toISOString().split('T')[0] as string

const form = ref({
  name: '',
  date: getToday(),
  memory: '',
  lng: 121.4737,
  lat: 31.2304,
  photo: ''
})

/* ---------- 快速选点 ---------- */
const quickLocations = [
  { name: '北京', lng: 116.4074, lat: 39.9042 },
  { name: '上海', lng: 121.4737, lat: 31.2304 },
  { name: '杭州', lng: 120.1551, lat: 30.2741 },
  { name: '南京', lng: 118.7969, lat: 32.0603 },
  { name: '苏州', lng: 120.5853, lat: 31.2989 },
  { name: '西安', lng: 108.9398, lat: 34.3416 },
  { name: '成都', lng: 104.0668, lat: 30.5728 },
  { name: '重庆', lng: 106.5516, lat: 29.5630 },
  { name: '青岛', lng: 120.3826, lat: 36.0671 },
  { name: '厦门', lng: 118.0894, lat: 24.4798 },
  { name: '大理', lng: 100.2676, lat: 25.6065 },
  { name: '三亚', lng: 109.5082, lat: 18.2479 },
]

/* ---------- 保存状态 ---------- */
const { saveStatus, saveMessage, triggerDebouncedSave } = useDebouncedSave()

const sortedFootprints = computed(() => {
  return [...store.footprints].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
})

const selectedFootprint = computed(() => {
  return store.footprints.find(fp => fp.id === selectedId.value)
})

/* ---------- 地图 ---------- */
const selectFootprint = (fp: Footprint) => {
  selectedId.value = fp.id
  if (map) {
    map.setView([fp.location[1], fp.location[0]], 12)
  }
}

const initMap = async () => {
  if (!mapRef.value) return

  L = await import('leaflet')

  map = L.map(mapRef.value).setView([31.2304, 121.4737], 5)

  // 高德地图瓦片（国内可直接访问，无需 Key）
  L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
    subdomains: ['1', '2', '3', '4'],
    attribution: '© 高德地图',
    maxZoom: 18
  }).addTo(map)

  renderMarkers()

  // 编辑模式下监听地图点击
  map.on('click', (e: any) => {
    if (!isEditMode.value) return
    form.value.lng = Number(e.latlng.lng.toFixed(4))
    form.value.lat = Number(e.latlng.lat.toFixed(4))
    mapClickHint.value = false

    // 显示临时标记
    if (clickMarker) map.removeLayer(clickMarker)
    clickMarker = L.marker([e.latlng.lat, e.latlng.lng], {
      icon: L.divIcon({
        className: 'click-marker',
        html: '<div style="width:16px;height:16px;background:#C9A8A9;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })
    }).addTo(map)

    // 如果没有打开弹窗，自动打开
    if (!showAddModal.value) {
      openAddModal()
    }
  })
}

const renderMarkers = () => {
  if (!map || !L) return
  // 清除旧标记
  markers.forEach(m => map.removeLayer(m))
  markers = []

  markers = store.footprints.map(fp => {
    const marker = L.marker([fp.location[1], fp.location[0]]).addTo(map)
    marker.bindPopup(`<b>${fp.name}</b><br>${fp.date}`)
    marker.on('click', () => {
      selectedId.value = fp.id
    })
    return marker
  })
}

/* ---------- 添加/编辑足迹 ---------- */
function openAddModal() {
  editingFootprint.value = null
  form.value = {
    name: '',
    date: getToday(),
    memory: '',
    lng: 121.4737,
    lat: 31.2304,
    photo: ''
  }
  showAddModal.value = true
}

function selectQuickLocation(loc: { name: string; lng: number; lat: number }) {
  form.value.lng = loc.lng
  form.value.lat = loc.lat
  if (map) {
    map.setView([loc.lat, loc.lng], 10)
    if (clickMarker) map.removeLayer(clickMarker)
    clickMarker = L.marker([loc.lat, loc.lng], {
      icon: L.divIcon({
        className: 'click-marker',
        html: '<div style="width:16px;height:16px;background:#C9A8A9;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })
    }).addTo(map)
  }
}

async function handlePhotoUpload(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0) return
  try {
    const urls = await upload.uploadFiles(files)
    if (urls.length > 0) {
      form.value.photo = urls[0]!
    }
  } catch (err) {
    console.error('上传失败:', err)
  } finally {
    if (photoInput.value) photoInput.value.value = ''
  }
}

function saveFootprint() {
  if (!form.value.name.trim()) {
    alert('请输入地点名称')
    return
  }

  const footprint: Footprint = {
    id: editingFootprint.value ? editingFootprint.value.id : 'fp-' + Date.now(),
    name: form.value.name.trim(),
    location: [form.value.lng, form.value.lat],
    date: form.value.date,
    photo: form.value.photo || '',
    memory: form.value.memory.trim()
  }

  if (editingFootprint.value) {
    const idx = store.footprints.findIndex(fp => fp.id === footprint.id)
    if (idx >= 0) store.footprints[idx] = footprint
  } else {
    store.footprints.push(footprint)
  }

  showAddModal.value = false
  editingFootprint.value = null

  // 更新地图标记
  nextTick(() => renderMarkers())

  autoSave()
}

function deleteFootprint(id: string) {
  if (!confirm('确定要删除这个足迹吗？')) return
  store.footprints = store.footprints.filter(fp => fp.id !== id)
  if (selectedId.value === id) selectedId.value = ''
  nextTick(() => renderMarkers())
  autoSave()
}

async function autoSave() {
  triggerDebouncedSave(() => store.saveFootprints('2025'))
}

/* ---------- 监听足迹变化 ---------- */
watch(() => store.footprints.length, () => {
  nextTick(() => renderMarkers())
})

onMounted(() => {
  if (store.footprints.length === 0) {
    store.loadFootprints().then(() => {
      nextTick(() => initMap())
    })
  } else {
    nextTick(() => initMap())
  }
})
</script>

<style scoped>
.footprints-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: var(--space-lg);
  height: calc(100vh - 200px);
  min-height: 500px;
}

.timeline {
  overflow-y: auto;
  padding-right: var(--space-sm);
}

.timeline-item {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  position: relative;
}

.timeline-item:hover,
.timeline-item.active {
  background: var(--bg-container);
}

.timeline-item.active .timeline-dot {
  background: var(--color-primary);
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--border-base);
  border: 2px solid var(--bg-container);
  box-shadow: 0 0 0 2px var(--border-base);
  flex-shrink: 0;
  margin-top: 4px;
}

.timeline-content {
  flex: 1;
  min-width: 0;
}

.timeline-date {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.timeline-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin: 2px 0;
}

.timeline-preview {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.delete-timeline-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: rgba(220, 100, 100, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.timeline-item:hover .delete-timeline-btn {
  opacity: 1;
}

.map-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.map {
  flex: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  min-height: 300px;
  border: 1px solid var(--border-light);
}

.footprint-detail {
  background: var(--bg-container);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  display: flex;
  gap: var(--space-md);
  box-shadow: var(--shadow-sm);
}

.detail-photo {
  width: 120px;
  height: 90px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.detail-content h3 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  margin-bottom: 4px;
  color: var(--text-primary);
}

.detail-date {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin-bottom: var(--space-sm);
}

.detail-memory {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.6;
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
  align-items: center;
}

.click-hint {
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  background: var(--bg-container);
  padding: 6px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
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

/* 表单 */
.footprint-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-md) 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
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
.form-group select,
.form-group textarea {
  padding: 10px 14px;
  border: 1px solid var(--border-base);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  font-family: inherit;
  resize: vertical;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: var(--shadow-focus);
}

/* 快速选点 */
.quick-locations label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  display: block;
  margin-bottom: var(--space-xs);
}

.location-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.location-chip {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  background: var(--bg-container);
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.location-chip:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* 照片预览 */
.photo-preview {
  position: relative;
  display: inline-block;
}

.photo-preview img {
  width: 120px;
  height: 90px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.remove-photo {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: rgba(220, 100, 100, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.upload-photo-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  background: var(--bg-container);
  border: 1px dashed var(--border-base);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.upload-photo-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
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

.hidden { display: none; }

@media (max-width: 768px) {
  .footprints-layout {
    grid-template-columns: 1fr;
    grid-template-rows: 200px 1fr;
  }

  .timeline {
    display: flex;
    gap: var(--space-sm);
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: var(--space-sm);
  }

  .timeline-item {
    min-width: 200px;
    flex-shrink: 0;
  }

  .footprint-detail {
    flex-direction: column;
  }

  .detail-photo {
    width: 100%;
    height: 160px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
  }
}
</style>
