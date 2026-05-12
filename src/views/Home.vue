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

    <!-- 功能卡片区 -->
    <section class="feature-section">
      <div class="feature-grid">
        <router-link
          v-for="card in featureCards"
          :key="card.name"
          :to="card.path"
          class="feature-card"
        >
          <!-- 数字角标 -->
          <span class="feature-badge">{{ card.count.value }}</span>

          <!-- 图标：彩色填充块 + 白色线条 -->
          <div class="feature-icon-wrapper" :style="{ backgroundColor: card.color + '22', color: card.color }">
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

const store = useAppStore()

// 功能卡片配置
// 颜色规范：填充底色（透明度 0.13）+ SVG 主色（全不透明）
const featureCards = [
  {
    name: 'letters',
    label: '情书馆',
    path: '/letters',
    color: '#E8B4B8', // 浅豆沙粉
    count: computed(() => store.letters.length),
    svg: `<svg viewBox="0 0 24 24" width="36" height="36" fill="none">
            <!-- 信封主体 - 填充色块 -->
            <rect x="3" y="5" width="18" height="14" rx="2.5" fill="currentColor" opacity="0.9"/>
            <!-- 信封翻盖 - 白色线条 -->
            <path d="M3 7L12 13L21 7" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="4" y="6" width="16" height="12" rx="2" stroke="white" stroke-width="1.2" fill="none"/>
            <!-- 小心形装饰 -->
            <path d="M12 10.5C12 10.5 13 9 15 9C16.66 9 18 10.34 18 12C18 13.66 16.66 15 15 15C13 15 12 13.5 12 13.5C12 13.5 11 15 9 15C7.34 15 6 13.66 6 12C6 10.34 7.34 9 9 9C11 9 12 10.5 12 10.5Z" fill="white" opacity="0.75"/>
          </svg>`,
  },
  {
    name: 'gallery',
    label: '照片墙',
    path: '/gallery',
    color: '#D4B5B0', // 浅奶茶棕
    count: computed(() => store.albums.reduce((s: number, a: any) => s + (a.photos?.length || 0), 0)),
    svg: `<svg viewBox="0 0 24 24" width="36" height="36" fill="none">
            <!-- 相机机身 - 填充色块 -->
            <rect x="2" y="6" width="20" height="14" rx="3" fill="currentColor" opacity="0.9"/>
            <!-- 镜头圈 - 白色 -->
            <circle cx="12" cy="13" r="4.5" stroke="white" stroke-width="1.8" fill="none"/>
            <circle cx="12" cy="13" r="2.2" fill="white" opacity="0.7"/>
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
    color: '#A8DADC', // 浅薄荷绿
    count: computed(() => store.footprints.length),
    svg: `<svg viewBox="0 0 24 24" width="36" height="36" fill="none">
            <!-- 地图折纸 - 填充色块 -->
            <polygon points="12 2 22 8.5 22 18 12 23 2 18 2 8.5" fill="currentColor" opacity="0.85" stroke="currentColor" stroke-width="0.5" stroke-opacity="0.5"/>
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
    color: '#FFD166', // 浅奶油黄
    count: computed(() => store.wishes.length),
    svg: `<svg viewBox="0 0 24 24" width="36" height="36" fill="none">
            <!-- 星星主体 - 填充色块 -->
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" opacity="0.9"/>
            <!-- 星星高光 - 白色线条 -->
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77" stroke="white" stroke-width="1.2" stroke-linejoin="round" fill="none"/>
            <!-- 中心亮点 -->
            <circle cx="12" cy="12" r="2" fill="white" opacity="0.5"/>
          </svg>`,
  },
  {
    name: 'capsules',
    label: '时间胶囊',
    path: '/capsules',
    color: '#9D4EDD', // 香芋紫
    count: computed(() => store.capsules.length),
    svg: `<svg viewBox="0 0 24 24" width="36" height="36" fill="none">
            <!-- 胶囊主体 - 填充色块 -->
            <rect x="3" y="7" width="18" height="10" rx="5" fill="currentColor" opacity="0.9"/>
            <!-- 胶囊分隔线 - 白色 -->
            <line x1="12" y1="7" x2="12" y2="17" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            <!-- 顶部盖子 -->
            <rect x="3" y="6" width="18" height="4" rx="2" fill="currentColor" opacity="0.6"/>
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

/* ===== 功能卡片区 ===== */
.feature-section {
  padding: var(--space-lg) var(--space-md);
}

.feature-grid {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  max-width: 600px;
  margin: 0 auto;
}

/* 胶囊形状卡片 */
.feature-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100px;
  height: 120px;
  border-radius: 24px;
  background: #FFFFFF;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
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
  color: #333333;
  background: rgba(0, 0, 0, 0.07);
  border-radius: 50%;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  z-index: 1;
}

/* 图标容器：彩色浅底圆角方块 */
.feature-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.feature-card:hover .feature-icon-wrapper {
  transform: scale(1.05);
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
  color: #333333;
  text-align: center;
  line-height: 1.2;
  margin-top: 2px;
}

/* ===== 底部 ===== */
.home-footer {
  text-align: center;
  padding: var(--space-2xl) var(--space-lg);
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

/* ===== 响应式 ===== */
@media (max-width: 480px) {
  .feature-grid {
    gap: 8px;
    padding: 0 4px;
  }

  .feature-card {
    width: calc(33.333% - 8px);
    min-width: 80px;
    height: 110px;
    border-radius: 20px;
    gap: 6px;
  }

  .feature-icon-wrapper {
    width: 44px;
    height: 44px;
    border-radius: 12px;
  }

  .feature-icon :deep(svg) {
    width: 28px !important;
    height: 28px !important;
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
}

@media (min-width: 481px) and (max-width: 768px) {
  .feature-card {
    width: 100px;
    height: 120px;
  }
}

@media (min-width: 769px) {
  .feature-section {
    padding: var(--space-xl);
  }

  .home-title {
    font-size: var(--font-size-3xl);
  }
}
</style>
