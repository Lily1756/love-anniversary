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

    <!-- 倒计时 -->
    <section class="countdown-section">
      <Countdown
        target-date="2025-05-17T00:00:00"
        label="我们已经在一起了"
      />
      <p class="love-quote">"遇见你，是我这辈子做过最正确的事"</p>
    </section>

    <!-- 功能卡片区 -->
    <section class="feature-section">
      <h2 class="section-title">我们的故事</h2>
      <div class="feature-grid">
        <router-link
          v-for="card in featureCards"
          :key="card.name"
          :to="card.path"
          class="feature-card"
        >
          <!-- 数字角标（毛玻璃） -->
          <span class="feature-badge">{{ card.count.value }}</span>

          <!-- 图标容器：渐变底块 -->
          <div class="feature-icon-wrapper" :style="{ background: card.gradient }">
            <span class="feature-icon" v-html="card.svg"></span>
          </div>

          <!-- 功能名称 -->
          <span class="feature-name">{{ card.label }}</span>
        </router-link>
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
import Countdown from '@/components/features/Countdown.vue'

const store = useAppStore()

// 功能卡片配置（融合两版优势）
const featureCards = [
  {
    name: 'letters',
    label: '情书馆',
    path: '/letters',
    // 旧版渐变配色
    gradient: 'linear-gradient(135deg, #C9A8A9 0%, #B8979A 100%)',
    count: computed(() => store.letters.length),
    // 图标：彩色填充块 + 白色线条（当前版风格）
    svg: `<svg viewBox="0 0 24 24" width="30" height="30" fill="none">
            <!-- 信封主体 - 白色半透明填充 -->
            <rect x="3" y="5" width="18" height="14" rx="2.5" fill="white" opacity="0.9"/>
            <!-- 信封翻盖 - 白色线条 -->
            <path d="M3 7L12 13L21 7" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="4" y="6" width="16" height="12" rx="2" stroke="rgba(255,255,255,0.7)" stroke-width="1.2" fill="none"/>
            <!-- 小心形装饰 -->
            <path d="M12 10.5C12 10.5 13 9 15 9C16.66 9 18 10.34 18 12C18 13.66 16.66 15 15 15C13 15 12 13.5 12 13.5C12 13.5 11 15 9 15C7.34 15 6 13.66 6 12C6 10.34 7.34 9 9 9C11 9 12 10.5 12 10.5Z" fill="white" opacity="0.75"/>
          </svg>`,
  },
  {
    name: 'gallery',
    label: '照片墙',
    path: '/gallery',
    gradient: 'linear-gradient(135deg, #D8C4B6 0%, #C9A8A9 100%)',
    count: computed(() => store.albums.reduce((s: number, a: any) => s + (a.photos?.length || 0), 0)),
    svg: `<svg viewBox="0 0 24 24" width="30" height="30" fill="none">
            <!-- 相机机身 - 白色填充 -->
            <rect x="2" y="6" width="20" height="14" rx="3" fill="white" opacity="0.9"/>
            <!-- 镜头圈 - 白色线条 -->
            <circle cx="12" cy="13" r="4.5" stroke="white" stroke-width="1.8" fill="none"/>
            <circle cx="12" cy="13" r="2" fill="white" opacity="0.7"/>
            <!-- 闪光灯 -->
            <rect x="6" y="8.5" width="3" height="2" rx="1" fill="white" opacity="0.6"/>
            <!-- 快门按钮 -->
            <circle cx="18" cy="10" r="1.2" fill="white" opacity="0.5"/>
          </svg>`,
  },
  {
    name: 'footprints',
    label: '足迹地图',
    path: '/footprints',
    gradient: 'linear-gradient(135deg, #B5C2B7 0%, #A8C6C1 100%)',
    count: computed(() => store.footprints.length),
    svg: `<svg viewBox="0 0 24 24" width="30" height="30" fill="none">
            <!-- 地图折纸 - 白色填充 -->
            <polygon points="12 2 22 8.5 22 18 12 23 2 18 2 8.5" fill="white" opacity="0.85" stroke="rgba(255,255,255,0.5)" stroke-width="0.8"/>
            <!-- 地图线条 - 白色 -->
            <line x1="2" y1="8.5" x2="12" y2="14" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
            <line x1="22" y1="8.5" x2="12" y2="14" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
            <circle cx="12" cy="14" r="2" fill="white" opacity="0.8"/>
            <!-- 定位针 -->
            <path d="M12 10C12 10 12 6 12 6C12 6 16 8 16 11C16 13 12 10 12 10Z" fill="white" opacity="0.6"/>
          </svg>`,
  },
  {
    name: 'wishlist',
    label: '愿望清单',
    path: '/wishlist',
    gradient: 'linear-gradient(135deg, #E6D3B8 0%, #D8C4B6 100%)',
    count: computed(() => store.wishes.length),
    svg: `<svg viewBox="0 0 24 24" width="30" height="30" fill="none">
            <!-- 星星主体 - 白色填充 -->
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="white" opacity="0.9"/>
            <!-- 星星高光 - 白色线条 -->
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77" stroke="rgba(255,255,255,0.8)" stroke-width="1.2" stroke-linejoin="round" fill="none"/>
            <!-- 中心亮点 -->
            <circle cx="12" cy="12" r="2" fill="white" opacity="0.5"/>
          </svg>`,
  },
  {
    name: 'capsules',
    label: '时间胶囊',
    path: '/capsules',
    gradient: 'linear-gradient(135deg, #D4A5A5 0%, #C9A8A9 100%)',
    count: computed(() => store.capsules.length),
    svg: `<svg viewBox="0 0 24 24" width="30" height="30" fill="none">
            <!-- 胶囊主体 - 白色填充 -->
            <rect x="3" y="7" width="18" height="10" rx="5" fill="white" opacity="0.9"/>
            <!-- 胶囊分隔线 - 白色 -->
            <line x1="12" y1="7" x2="12" y2="17" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            <!-- 顶部盖子 -->
            <rect x="3" y="6" width="18" height="4" rx="2" fill="white" opacity="0.6"/>
            <!-- 沙漏装饰 -->
            <path d="M10.5 10.5C10.5 10.5 11 9.5 12 9.5C13 9.5 13.5 10.5 13.5 10.5" stroke="white" stroke-width="1.2" stroke-linecap="round" fill="none"/>
            <circle cx="12" cy="12" r="0.8" fill="white" opacity="0.7"/>
            <path d="M10.5 13.5C10.5 13.5 11 14.5 12 14.5C13 14.5 13.5 13.5 13.5 13.5" stroke="white" stroke-width="1.2" stroke-linecap="round" fill="none"/>
          </svg>`,
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

.avatar {
  width: 140px;
  height: 140px;
  margin: 0 auto;
  border-radius: 50%;
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

/* ===== 倒计时区域 ===== */
.countdown-section {
  padding: var(--space-lg) var(--space-lg);
}

.love-quote {
  text-align: center;
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  font-style: italic;
  margin-top: var(--space-lg);
}

/* ===== 功能卡片区 ===== */
.feature-section {
  padding: var(--space-lg) var(--space-md);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-lg);
  padding-left: var(--space-sm);
}

/* 响应式 Grid：2列 → 3列 → 5列（移植旧版布局） */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

/* 毛玻璃卡片 */
.feature-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: var(--space-lg) var(--space-sm);
  /* 毛玻璃效果 */
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06),
              inset 0 1px 0 rgba(255, 255, 255, 0.5);
  text-decoration: none;
  color: inherit;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;
}

.feature-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border-color: rgba(255, 255, 255, 0.6);
}

/* 数字角标（毛玻璃圆形） */
.feature-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 22px;
  height: 22px;
  padding: 0 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: #5a4a4a;
  /* 毛玻璃角标 */
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.5);
  z-index: 1;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

/* 图标容器：渐变底块 + 圆角 */
.feature-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 轻微阴影让图标浮起 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.feature-card:hover .feature-icon-wrapper {
  transform: scale(1.08);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.feature-icon :deep(svg) {
  display: block;
}

/* 功能名称 */
.feature-name {
  font-size: 12px;
  font-weight: 500;
  color: #5a4a4a;
  text-align: center;
  line-height: 1.2;
}

/* ===== 底部 ===== */
.home-footer {
  text-align: center;
  padding: var(--space-2xl) var(--space-lg);
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

/* ===== 响应式 ===== */

/* ≤480px：2列（保持） */
@media (max-width: 480px) {
  .feature-grid {
    gap: var(--space-sm);
    padding: 0 2px;
  }

  .feature-card {
    padding: var(--space-md) 4px;
    gap: 6px;
    border-radius: 16px;
  }

  .feature-icon-wrapper {
    width: 42px;
    height: 42px;
    border-radius: 12px;
  }

  .feature-icon :deep(svg) {
    width: 24px !important;
    height: 24px !important;
  }

  .feature-name {
    font-size: 11px;
  }

  .feature-badge {
    top: 4px;
    right: 4px;
    min-width: 20px;
    height: 20px;
    font-size: 10px;
  }

  .avatar {
    width: 110px;
    height: 110px;
  }
}

/* ≥768px：3列 */
@media (min-width: 481px) and (max-width: 1023px) {
  .feature-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* ≥1024px：5列（旧版逻辑） */
@media (min-width: 1024px) {
  .feature-grid {
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
