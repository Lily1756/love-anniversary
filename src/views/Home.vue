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

      <!-- 快捷入口 -->
      <section class="quick-links">
        <router-link to="/letters" class="quick-link">
          <span class="quick-icon">💌</span>
          <span class="quick-label">情书馆</span>
        </router-link>
        <router-link to="/gallery" class="quick-link">
          <span class="quick-icon">📸</span>
          <span class="quick-label">照片墙</span>
        </router-link>
        <router-link to="/footprints" class="quick-link">
          <span class="quick-icon">🗺️</span>
          <span class="quick-label">足迹地图</span>
        </router-link>
        <router-link to="/wishlist" class="quick-link">
          <span class="quick-icon">⭐</span>
          <span class="quick-label">愿望清单</span>
        </router-link>
        <router-link to="/capsules" class="quick-link">
          <span class="quick-icon">⏳</span>
          <span class="quick-label">时间胶囊</span>
        </router-link>
      </section>

      <!-- 底部 -->
      <footer class="home-footer">
        <span>每天都是更爱你的一天 ❤️</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/stores'

const store = useAppStore()

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

/* 快捷入口 */
.quick-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
  padding: var(--space-lg);
}

.quick-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-lg) var(--space-md);
  background: var(--bg-container);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: inherit;
  transition: all var(--transition-fast);
}

.quick-link:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
  border-color: var(--border-base);
}

.quick-icon {
  font-size: 28px;
}

.quick-label {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

/* 底部 */
.home-footer {
  text-align: center;
  padding: var(--space-2xl) var(--space-lg);
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

@media (min-width: 768px) {
  .quick-links {
    grid-template-columns: repeat(5, 1fr);
    max-width: 800px;
    margin: 0 auto;
  }

  .home-title {
    font-size: var(--font-size-3xl);
  }

  .avatar {
    width: 150px;
    height: 150px;
  }
}
</style>
