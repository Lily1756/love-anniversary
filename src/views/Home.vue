<template>
  <div class="home">
    <!-- 顶部区域 -->
    <header class="home-header">
      <div class="couple-avatars">
        <div class="avatar">
          <img src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&q=80" alt="我们的合照" />
        </div>
      </div>
      <h1 class="home-title">Love Story with You</h1>
      <p class="home-subtitle">张祎 & 方志浩</p>
    </header>

    <!-- 核心倒计时 -->
    <section class="countdown-section">
      <Countdown
        target-date="2025-05-17T00:00:00"
        label="我们已经在一起了"
      />
      <p class="love-quote">"遇见你，是我这辈子做过最正确的事"</p>
    </section>

    <!-- 快捷入口 -->
    <section class="quick-access">
      <h2 class="section-title">我们的故事</h2>
      <div class="access-grid">
        <router-link
          v-for="item in accessItems"
          :key="item.name"
          :to="item.path"
          class="access-card"
        >
          <div class="access-icon" :style="{ background: item.gradient }">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="white" stroke-width="1.5">
              <path v-if="item.icon === 'letters'" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <path v-if="item.icon === 'letters'" d="M22 6l-10 7L2 6" />
              <rect v-if="item.icon === 'gallery'" x="3" y="3" width="18" height="18" rx="2" />
              <circle v-if="item.icon === 'gallery'" cx="8.5" cy="8.5" r="1.5" />
              <path v-if="item.icon === 'gallery'" d="M21 15l-5-5L5 21" />
              <polygon v-if="item.icon === 'footprints'" points="1 6 1 22 8 18 16 22 21 18 21 2 16 6 8 2 1 6" />
              <path v-if="item.icon === 'footprints'" d="M8 2v16M16 6v16" />
              <polygon v-if="item.icon === 'wishlist'" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              <path v-if="item.icon === 'capsules'" d="M21 8v13H3V8" />
              <path v-if="item.icon === 'capsules'" d="M1 3h22v5H1z" />
              <path v-if="item.icon === 'capsules'" d="M10 12h4" />
            </svg>
          </div>
          <span class="access-label">{{ item.label }}</span>
          <span v-if="item.count !== undefined" class="access-count">{{ item.count }}</span>
        </router-link>
      </div>
    </section>

    <!-- 统计数据 -->
    <section class="stats-section">
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-number">{{ store.letters.length }}</span>
          <span class="stat-label">封情书</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ totalPhotos }}</span>
          <span class="stat-label">张照片</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ store.footprints.length }}</span>
          <span class="stat-label">个城市</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ store.completedWishes }}/{{ store.totalWishes }}</span>
          <span class="stat-label">个愿望</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import Countdown from '@/components/features/Countdown.vue'
import { useAppStore } from '@/stores'

const store = useAppStore()

const totalPhotos = computed(() => {
  return store.albums.reduce((sum, a) => sum + a.photos.length, 0)
})

const accessItems = computed(() => [
  {
    name: 'letters',
    path: '/letters',
    label: '情书馆',
    icon: 'letters',
    gradient: 'linear-gradient(135deg, #C9A8A9, #B8979A)',
    count: store.letters.length || undefined
  },
  {
    name: 'gallery',
    path: '/gallery',
    label: '照片墙',
    icon: 'gallery',
    gradient: 'linear-gradient(135deg, #D8C4B6, #C9A8A9)',
    count: totalPhotos.value || undefined
  },
  {
    name: 'footprints',
    path: '/footprints',
    label: '足迹地图',
    icon: 'footprints',
    gradient: 'linear-gradient(135deg, #B5C2B7, #A8C6C1)',
    count: store.footprints.length || undefined
  },
  {
    name: 'wishlist',
    path: '/wishlist',
    label: '愿望清单',
    icon: 'wishlist',
    gradient: 'linear-gradient(135deg, #E6D3B8, #D8C4B6)',
    count: store.totalWishes || undefined
  },
  {
    name: 'capsules',
    path: '/capsules',
    label: '时间胶囊',
    icon: 'capsules',
    gradient: 'linear-gradient(135deg, #D4A5A5, #C9A8A9)',
    count: store.totalCapsules || undefined
  }
])

onMounted(() => {
  store.loadAll()
})
</script>

<style scoped>
.home {
  padding-bottom: calc(var(--nav-height) + var(--space-xl));
}

/* 顶部区域 */
.home-header {
  text-align: center;
  padding: var(--space-2xl) var(--space-lg);
  background: linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-body) 100%);
}

.couple-avatars {
  margin-bottom: var(--space-lg);
}

.avatar {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  border-radius: var(--radius-full);
  overflow: hidden;
  border: 4px solid var(--bg-container);
  box-shadow: var(--shadow-base);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.home-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}

.home-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* 倒计时 */
.countdown-section {
  padding: var(--space-xl) var(--space-lg);
}

.love-quote {
  text-align: center;
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  font-style: italic;
  margin-top: var(--space-lg);
}

/* 快捷入口 */
.quick-access {
  padding: var(--space-lg);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-lg);
  color: var(--text-primary);
}

.access-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.access-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  background: var(--bg-container);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  text-decoration: none;
  color: var(--text-primary);
  position: relative;
}

.access-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--border-base);
}

.access-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  margin-bottom: var(--space-sm);
}

.access-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.access-count {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  font-size: var(--font-size-xs);
  padding: 2px 8px;
  background: var(--bg-surface);
  border-radius: var(--radius-full);
  color: var(--text-tertiary);
}

/* 统计数据 */
.stats-section {
  padding: var(--space-lg);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
  background: var(--bg-container);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

@media (min-width: 768px) {
  .access-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .home-title {
    font-size: var(--font-size-3xl);
  }
  
  .avatar {
    width: 150px;
    height: 150px;
  }
}

@media (min-width: 1024px) {
  .access-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>
