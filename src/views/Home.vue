<template>
  <div class="home">
    <!-- 顶部区域 -->
    <header class="home-header">
      <div class="couple-avatars">
        <div class="avatar">
          <img src="/assets/photos/hero.jpg" alt="我们的合照" />
        </div>
      </div>
      <h1 class="home-title">Love Story with You</h1>
      <p class="home-subtitle">张祎 & 方志浩</p>
    </header>

    <!-- 我们的故事 — 功能卡片 -->
    <section class="story-section">
      <h2 class="section-title">我们的故事</h2>
      <div class="story-cards">
        <router-link
          v-for="card in storyCards"
          :key="card.name"
          :to="card.path"
          class="story-card"
        >
          <span v-if="card.count !== undefined" class="card-badge">{{ card.count.value }}</span>
          <span class="card-icon" v-html="card.svg"></span>
          <span class="card-label">{{ card.label }}</span>
        </router-link>
      </div>
    </section>

    <!-- 数据统计条 -->
    <section class="stats-bar">
      <div class="stat-item">
        <span class="stat-number">{{ stats.letters }}</span>
        <span class="stat-label">封情书</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ stats.photos }}</span>
        <span class="stat-label">张照片</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ stats.cities }}</span>
        <span class="stat-label">个城市</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ stats.wishesDone }}/{{ stats.wishesTotal }}</span>
        <span class="stat-label">个愿望</span>
      </div>
    </section>

    <!-- 底部 -->
    <footer class="home-footer">
      <span>每天都是更爱你的一天 ❤️</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useAppStore } from '@/stores'

const store = useAppStore()

// 从 store 实时计算统计数据
const stats = computed(() => ({
  letters: store.letters.length,
  photos: store.albums.reduce((sum: number, a: any) => sum + (a.photos?.length || 0), 0),
  cities: store.footprints.length,
  wishesDone: store.wishes.filter((w: any) => w.completed).length,
  wishesTotal: store.wishes.length,
}))

// 功能卡片配置（SVG 图标 + 角标）
const storyCards = [
  {
    name: 'letters',
    label: '情书馆',
    path: '/letters',
    count: computed(() => store.letters.length),
    svg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  },
  {
    name: 'gallery',
    label: '照片墙',
    path: '/gallery',
    count: computed(() => store.albums.reduce((sum: number, a: any) => sum + (a.photos?.length || 0), 0)),
    svg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  },
  {
    name: 'footprints',
    label: '足迹地图',
    path: '/footprints',
    count: computed(() => store.footprints.length),
    svg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 21 18 21 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`,
  },
  {
    name: 'wishlist',
    label: '愿望清单',
    path: '/wishlist',
    count: computed(() => store.wishes.length),
    svg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  },
  {
    name: 'capsules',
    label: '时间胶囊',
    path: '/capsules',
    count: computed(() => store.capsules.length),
    svg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/></svg>`,
  },
]

onMounted(() => {
  store.loadAll()
})
</script>

<style scoped>
.home {
  padding-bottom: calc(var(--nav-height) + var(--space-xl));
}

/* ===== 顶部区域 ===== */
.home-header {
  text-align: center;
  padding: var(--space-2xl) var(--space-lg) var(--space-xl);
  background: linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-body) 100%);
}

.couple-avatars {
  margin-bottom: var(--space-lg);
}

/* 胶囊形状头像（参考图2风格） */
.avatar {
  width: 160px;
  height: 120px;
  margin: 0 auto;
  border-radius: 40px;
  overflow: hidden;
  border: 4px solid var(--bg-container);
  box-shadow: var(--shadow-base);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
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

/* ===== 我们的故事 — 功能卡片 ===== */
.story-section {
  padding: var(--space-lg);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-md);
}

.story-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-sm);
}

.story-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-lg) var(--space-xs);
  background: var(--bg-container);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  text-decoration: none;
  color: inherit;
  transition: all var(--transition-fast);
  min-height: 100px;
}

.story-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
  border-color: var(--border-base);
}

/* 右上角角标 */
.card-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  background: var(--bg-surface);
  border-radius: 999px;
  border: 1px solid var(--border-light);
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.card-label {
  font-size: 12px;
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
  text-align: center;
  white-space: nowrap;
}

/* ===== 数据统计条 ===== */
.stats-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 0 var(--space-lg) var(--space-xl);
  padding: var(--space-xl) var(--space-lg);
  background: var(--bg-container);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
}

.stat-number {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: 1;
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

/* ===== 底部 ===== */
.home-footer {
  text-align: center;
  padding: var(--space-xl) var(--space-lg);
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

/* ===== 响应式 ===== */
@media (max-width: 480px) {
  .story-cards {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-xs);
  }

  .story-card {
    padding: var(--space-md) var(--space-xs);
    min-height: 90px;
  }

  .card-label {
    font-size: 11px;
  }

  .avatar {
    width: 140px;
    height: 105px;
    border-radius: 35px;
  }

  .stats-bar {
    flex-wrap: wrap;
    gap: var(--space-md);
  }

  .stat-item {
    min-width: 60px;
  }
}

@media (min-width: 769px) {
  .story-cards {
    max-width: 800px;
    margin: 0 auto;
  }

  .stats-bar {
    max-width: 800px;
    margin: 0 auto var(--space-xl);
  }

  .home-title {
    font-size: var(--font-size-3xl);
  }
}
</style>
