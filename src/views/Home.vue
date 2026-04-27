<template>
  <div>
    <!-- 密码锁 -->
    <LockScreen correct-password="2025" @unlock="onUnlock" />

    <!-- 主内容 -->
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
        <Countdown target-date="2025-05-17T00:00:00" label="我们已经在一起了" />
        <p class="love-quote">"遇见你，是我这辈子做过最正确的事"</p>
      </section>

      <!-- 爱情数字统计 -->
      <section class="stats-section">
        <div class="stats-grid">
          <router-link to="/letters" class="stat-card">
            <span class="stat-number">{{ store.letters.length }}</span>
            <span class="stat-label">封情书</span>
            <div class="stat-bar"><div class="stat-bar-fill" :style="{ width: Math.min(store.letters.length * 2, 100) + '%' }"></div></div>
          </router-link>
          <router-link to="/gallery" class="stat-card">
            <span class="stat-number">{{ totalPhotos }}</span>
            <span class="stat-label">张照片</span>
            <div class="stat-bar"><div class="stat-bar-fill" :style="{ width: Math.min(totalPhotos * 5, 100) + '%' }"></div></div>
          </router-link>
          <router-link to="/footprints" class="stat-card">
            <span class="stat-number">{{ store.footprints.length }}</span>
            <span class="stat-label">个城市</span>
            <div class="stat-bar"><div class="stat-bar-fill" :style="{ width: Math.min(store.footprints.length * 10, 100) + '%' }"></div></div>
          </router-link>
          <router-link to="/wishlist" class="stat-card">
            <span class="stat-number">{{ store.completedWishes }}/{{ store.totalWishes }}</span>
            <span class="stat-label">个愿望</span>
            <div class="stat-bar"><div class="stat-bar-fill" :style="{ width: store.totalWishes ? (store.completedWishes / store.totalWishes * 100) + '%' : '0%' }"></div></div>
          </router-link>
        </div>
      </section>

      <!-- 主视觉合照 -->
      <section class="hero-photo-section">
        <div class="hero-photo-wrapper">
          <img src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800&q=80" alt="我们的合照" class="hero-photo" />
        </div>
        <p class="photo-caption">拍摄于 · 2025年</p>
      </section>

      <!-- 表白文案 -->
      <section class="love-letter-section">
        <p class="love-letter">"{{ loveQuote }}"</p>
      </section>

      <!-- 精选情书预览 -->
      <section v-if="recentLetters.length > 0" class="preview-section">
        <div class="preview-card">
          <div class="preview-header">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <path d="M22 6l-10 7L2 6" />
            </svg>
            <h2>我们的情书时刻</h2>
          </div>
          <div class="preview-list">
            <div v-for="letter in recentLetters" :key="letter.id" class="preview-item" @click="$router.push('/letters')">
              <span class="preview-date">{{ letter.date }}</span>
              <span class="preview-title">{{ letter.title }}</span>
            </div>
          </div>
          <router-link to="/letters" class="preview-btn">
            翻阅我们的 {{ store.letters.length }} 封情书
          </router-link>
        </div>
      </section>

      <!-- 照片墙预览 -->
      <section v-if="recentPhotos.length > 0" class="preview-section">
        <div class="preview-card">
          <div class="preview-header">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <h2>我们的瞬间</h2>
          </div>
          <div class="photo-grid">
            <div v-for="(photo, idx) in recentPhotos.slice(0, 6)" :key="idx" class="photo-thumb">
              <img :src="photo.src" :alt="photo.caption" loading="lazy" />
            </div>
          </div>
          <router-link to="/gallery" class="preview-btn">查看更多照片</router-link>
        </div>
      </section>

      <!-- 足迹预览 -->
      <section v-if="recentFootprints.length > 0" class="preview-section">
        <div class="preview-card">
          <div class="preview-header">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="1 6 1 22 8 18 16 22 21 18 21 2 16 6 8 2 1 6" />
              <path d="M8 2v16M16 6v16" />
            </svg>
            <h2>我们的足迹</h2>
          </div>
          <div class="footprint-list">
            <div v-for="fp in recentFootprints" :key="fp.id" class="footprint-item" @click="$router.push('/footprints')">
              <img v-if="fp.photo" :src="fp.photo" :alt="fp.name" class="footprint-thumb" />
              <div class="footprint-info">
                <span class="footprint-name">{{ fp.name }}</span>
                <span class="footprint-date">{{ fp.date }}</span>
              </div>
            </div>
          </div>
          <router-link to="/footprints" class="preview-btn">探索足迹地图</router-link>
        </div>
      </section>

      <!-- 愿望清单预览 -->
      <section v-if="recentWishes.length > 0" class="preview-section">
        <div class="preview-card">
          <div class="preview-header">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <h2>一起完成的小事</h2>
          </div>
          <div class="wish-list">
            <div v-for="wish in recentWishes" :key="wish.id" class="wish-item">
              <span class="wish-check" :class="{ checked: wish.completed }">✓</span>
              <span class="wish-title" :class="{ completed: wish.completed }">{{ wish.title }}</span>
            </div>
          </div>
          <router-link to="/wishlist" class="preview-btn">查看愿望清单</router-link>
        </div>
      </section>

      <!-- 时间胶囊预览 -->
      <section v-if="recentCapsules.length > 0" class="preview-section">
        <div class="preview-card">
          <div class="preview-header">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 8v13H3V8" />
              <path d="M1 3h22v5H1z" />
              <path d="M10 12h4" />
            </svg>
            <h2>时间胶囊</h2>
          </div>
          <div class="capsule-list">
            <div v-for="capsule in recentCapsules" :key="capsule.id" class="capsule-item">
              <span class="capsule-status" :class="{ opened: capsule.isOpened }">
                {{ capsule.isOpened ? '已开启' : '封存中' }}
              </span>
              <span class="capsule-title">{{ capsule.title }}</span>
              <span class="capsule-date">开启日：{{ capsule.openDate }}</span>
            </div>
          </div>
          <router-link to="/capsules" class="preview-btn">开启胶囊</router-link>
        </div>
      </section>

      <!-- 底部 -->
      <footer class="home-footer">
        <span>每天都是更爱你的一天 ❤️</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Countdown from '@/components/features/Countdown.vue'
import LockScreen from '@/components/features/LockScreen.vue'
import { useAppStore } from '@/stores'

const store = useAppStore()
const isUnlocked = ref(false)

const loveQuotes = [
  '遇见你，是我这辈子做过最正确的事',
  '你是我所有美好里的刚刚好',
  '春风十里，不如你',
  '山河远阔，人间烟火，无一是你，无一不是你',
  '我想和你虚度时光，比如低头看鱼',
]

const loveQuote = computed(() => {
  const idx = Math.floor(Date.now() / (24 * 60 * 60 * 1000)) % loveQuotes.length
  return loveQuotes[idx]
})

const totalPhotos = computed(() => {
  return store.albums.reduce((sum, a) => sum + a.photos.length, 0)
})

const recentLetters = computed(() => {
  return [...store.letters].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3)
})

const recentPhotos = computed(() => {
  const allPhotos = store.albums.flatMap(a => a.photos)
  return allPhotos.slice(0, 6)
})

const recentFootprints = computed(() => {
  return [...store.footprints].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3)
})

const recentWishes = computed(() => {
  return [...store.wishes].slice(0, 3)
})

const recentCapsules = computed(() => {
  return [...store.capsules].slice(0, 2)
})

function onUnlock() {
  isUnlocked.value = true
}

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

/* 爱情数字统计 */
.stats-section {
  padding: var(--space-lg);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.stat-card {
  background: var(--bg-container);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  text-align: center;
  text-decoration: none;
  color: inherit;
  transition: all var(--transition-fast);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
  border-color: var(--border-base);
}

.stat-number {
  display: block;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin-bottom: 2px;
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  display: block;
  margin-bottom: var(--space-sm);
}

.stat-bar {
  height: 3px;
  background: var(--border-light);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), #B8979A);
  border-radius: var(--radius-full);
  transition: width 1s ease;
}

/* 主视觉合照 */
.hero-photo-section {
  padding: var(--space-lg);
  text-align: center;
}

.hero-photo-wrapper {
  max-width: 400px;
  margin: 0 auto;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.hero-photo {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
}

.photo-caption {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin-top: var(--space-sm);
}

/* 表白文案 */
.love-letter-section {
  padding: var(--space-xl) var(--space-lg);
  text-align: center;
}

.love-letter {
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  font-style: italic;
  line-height: 1.8;
  position: relative;
}

.love-letter::before {
  content: '"';
  margin-right: 4px;
  color: var(--color-primary);
}

.love-letter::after {
  content: '"';
  margin-left: 4px;
  color: var(--color-primary);
}

/* 预览模块 */
.preview-section {
  padding: var(--space-md) var(--space-lg);
}

.preview-card {
  background: var(--bg-container);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.preview-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
  color: var(--text-primary);
}

.preview-header h2 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.preview-header svg {
  color: var(--color-primary);
  flex-shrink: 0;
}

/* 情书预览 */
.preview-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.preview-item {
  display: flex;
  flex-direction: column;
  padding: var(--space-sm);
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.preview-item:hover {
  background: var(--bg-body);
}

.preview-date {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.preview-title {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

/* 照片预览 */
.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-xs);
  margin-bottom: var(--space-md);
}

.photo-thumb {
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.photo-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.photo-thumb:hover img {
  transform: scale(1.05);
}

/* 足迹预览 */
.footprint-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.footprint-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.footprint-item:hover {
  background: var(--bg-body);
}

.footprint-thumb {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
}

.footprint-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.footprint-name {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

.footprint-date {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

/* 愿望预览 */
.wish-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.wish-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  background: var(--bg-surface);
  border-radius: var(--radius-md);
}

.wish-check {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--border-base);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: transparent;
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.wish-check.checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.wish-title {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.wish-title.completed {
  text-decoration: line-through;
  color: var(--text-tertiary);
}

/* 胶囊预览 */
.capsule-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.capsule-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-sm);
  background: var(--bg-surface);
  border-radius: var(--radius-md);
}

.capsule-status {
  font-size: var(--font-size-xs);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: var(--border-light);
  color: var(--text-tertiary);
  align-self: flex-start;
}

.capsule-status.opened {
  background: rgba(90, 112, 80, 0.15);
  color: #5a7050;
}

.capsule-title {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

.capsule-date {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

/* 预览按钮 */
.preview-btn {
  display: block;
  text-align: center;
  padding: 12px;
  background: linear-gradient(135deg, var(--color-primary), #B8979A);
  color: white;
  border-radius: var(--radius-md);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
}

.preview-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(201, 168, 169, 0.4);
}

/* 底部 */
.home-footer {
  text-align: center;
  padding: var(--space-2xl) var(--space-lg);
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .home-title {
    font-size: var(--font-size-3xl);
  }

  .avatar {
    width: 150px;
    height: 150px;
  }

  .photo-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}
</style>
