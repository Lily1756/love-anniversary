<template>
  <div class="footprints-page page-container">
    <h2 class="page-title">
      足迹地图
      <span class="count">({{ store.footprints.length }})</span>
    </h2>

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
        </div>
      </div>

      <!-- 地图区域 -->
      <div class="map-container">
        <div id="map" ref="mapRef" class="map"></div>
        
        <!-- 选中地点详情 -->
        <div v-if="selectedFootprint" class="footprint-detail">
          <img :src="selectedFootprint.photo" :alt="selectedFootprint.name" class="detail-photo" />
          <div class="detail-content">
            <h3>{{ selectedFootprint.name }}</h3>
            <p class="detail-date">{{ selectedFootprint.date }}</p>
            <p class="detail-memory">{{ selectedFootprint.memory }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useAppStore } from '@/stores'
import type { Footprint } from '@/types'
import 'leaflet/dist/leaflet.css'

const store = useAppStore()
const mapRef = ref<HTMLElement>()
const selectedId = ref('')
let map: any = null
let markers: any[] = []

const sortedFootprints = computed(() => {
  return [...store.footprints].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
})

const selectedFootprint = computed(() => {
  return store.footprints.find(fp => fp.id === selectedId.value)
})

const selectFootprint = (fp: Footprint) => {
  selectedId.value = fp.id
  if (map) {
    map.setView([fp.location[1], fp.location[0]], 12)
  }
}

// 生成莫兰迪粉色系自定义 marker SVG（含城市名称标签）
const createCustomIcon = (L: any, name: string, isActive = false) => {
  const primaryColor = isActive ? '#B8979A' : '#C9A8A9'
  const shadowColor = 'rgba(201,168,169,0.35)'
  const labelBg = 'rgba(255,255,255,0.92)'
  
  // 截取城市名前两个字，防止太长
  const shortName = name.length > 4 ? name.slice(0, 4) : name
  const labelWidth = Math.max(shortName.length * 14 + 16, 52)
  
  const svgStr = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${labelWidth + 10}" height="58" viewBox="0 0 ${labelWidth + 10} 58">
      <!-- 阴影 -->
      <ellipse cx="${(labelWidth + 10) / 2}" cy="54" rx="8" ry="3" fill="${shadowColor}"/>
      <!-- 圆形标记 -->
      <circle cx="${(labelWidth + 10) / 2}" cy="20" r="${isActive ? 13 : 10}" fill="${primaryColor}" opacity="0.25"/>
      <circle cx="${(labelWidth + 10) / 2}" cy="20" r="${isActive ? 9 : 7}" fill="${primaryColor}"/>
      <circle cx="${(labelWidth + 10) / 2}" cy="20" r="${isActive ? 4 : 3}" fill="white" opacity="0.9"/>
      <!-- 连接线 -->
      <line x1="${(labelWidth + 10) / 2}" y1="${isActive ? 29 : 27}" x2="${(labelWidth + 10) / 2}" y2="51" 
            stroke="${primaryColor}" stroke-width="1.5" stroke-dasharray="3,2" opacity="0.6"/>
      <!-- 城市名标签 -->
      <rect x="${(labelWidth + 10) / 2 - labelWidth / 2}" y="34" 
            width="${labelWidth}" height="20" rx="10" 
            fill="${labelBg}" stroke="${primaryColor}" stroke-width="1"/>
      <text x="${(labelWidth + 10) / 2}" y="48.5" 
            font-family="-apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif" 
            font-size="11" fill="${isActive ? '#8A7070' : '#9A7A7C'}" 
            text-anchor="middle" font-weight="${isActive ? '600' : '400'}">${shortName}</text>
    </svg>
  `
  
  return L.divIcon({
    html: svgStr,
    className: 'custom-marker',
    iconSize: [labelWidth + 10, 58],
    iconAnchor: [(labelWidth + 10) / 2, 51],
    popupAnchor: [0, -50]
  })
}

const updateMarkers = (L: any) => {
  // 清除旧 markers
  markers.forEach(m => m.remove())
  markers = []
  
  markers = store.footprints.map(fp => {
    const isActive = fp.id === selectedId.value
    const icon = createCustomIcon(L, fp.name, isActive)
    const marker = L.marker([fp.location[1], fp.location[0]], { icon }).addTo(map)
    
    // 弹窗显示完整城市名 + 日期 + 记忆片段
    const popupContent = `
      <div style="font-family:-apple-system,'PingFang SC',sans-serif;min-width:160px;padding:4px 0">
        <div style="font-size:15px;font-weight:600;color:#4A4A4A;margin-bottom:4px">${fp.name}</div>
        <div style="font-size:12px;color:#A8A8A8;margin-bottom:6px">📅 ${fp.date}</div>
        ${fp.memory ? `<div style="font-size:12px;color:#7A7A7A;line-height:1.5;border-top:1px solid #F0EBE6;padding-top:6px">${fp.memory.slice(0, 60)}${fp.memory.length > 60 ? '…' : ''}</div>` : ''}
      </div>
    `
    marker.bindPopup(popupContent, { 
      maxWidth: 220,
      className: 'morandi-popup'
    })
    
    marker.on('click', () => {
      selectedId.value = fp.id
      // 更新所有 marker 高亮状态
      updateMarkers(L)
    })
    return marker
  })
}

let leafletInstance: any = null

const initMap = async () => {
  if (!mapRef.value) return
  
  const L = await import('leaflet')
  leafletInstance = L
  
  map = L.map(mapRef.value, {
    zoomControl: true,
  }).setView([31.2304, 121.4737], 5)
  
  // 使用 CartoDB Voyager 风格（更简洁精致，与莫兰迪风格更搭）
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map)
  
  // 确保地图容器尺寸正确
  setTimeout(() => {
    map.invalidateSize()
    updateMarkers(L)
  }, 100)
}

// 监听 selectedId 变化，更新 marker 高亮
watch(selectedId, () => {
  if (leafletInstance && map) {
    updateMarkers(leafletInstance)
  }
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
}
</style>

<!-- 非 scoped 样式：覆盖 Leaflet 弹窗和自定义 marker 全局样式 -->
<style>
/* 自定义 marker 不要默认背景 */
.custom-marker {
  background: transparent !important;
  border: none !important;
}

/* 莫兰迪风格弹窗 */
.morandi-popup .leaflet-popup-content-wrapper {
  background: rgba(255, 252, 249, 0.97);
  border: 1px solid #E5DED8;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(140, 120, 115, 0.15);
  padding: 12px 16px;
}

.morandi-popup .leaflet-popup-tip {
  background: rgba(255, 252, 249, 0.97);
}

.morandi-popup .leaflet-popup-content {
  margin: 0;
  line-height: 1.5;
}

.morandi-popup .leaflet-popup-close-button {
  color: #A8A8A8;
  font-size: 18px;
  top: 6px;
  right: 8px;
}
</style>
