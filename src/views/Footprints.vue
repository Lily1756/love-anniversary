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

const initMap = async () => {
  if (!mapRef.value) return
  
  const L = await import('leaflet')
  
  map = L.map(mapRef.value).setView([31.2304, 121.4737], 5)
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)
  
  markers = store.footprints.map(fp => {
    const marker = L.marker([fp.location[1], fp.location[0]]).addTo(map)
    marker.bindPopup(`<b>${fp.name}</b><br>${fp.date}`)
    marker.on('click', () => {
      selectedId.value = fp.id
    })
    return marker
  })
}

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
