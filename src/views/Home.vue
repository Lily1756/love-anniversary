<template>
  <div class="home">
    <!-- 顶部区域 -->
    <header class="home-header">
      <!-- 专业级头像容器 - 支持三种边框样式 -->
      <div 
        class="avatar-container"
        :class="avatarStyleClass"
        @click="toggleComparison"
        title="点击更换边框样式"
      >
        <img src="/assets/photos/hero.jpg" alt="我们的故事" class="avatar-image" />
      </div>
      <h1 class="home-title">Love Story with You</h1>
      <p class="home-subtitle">张祎 & 方志浩</p>
    </header>

    <!-- 边框样式对比测试区域 -->
    <section v-if="showBorderComparison" class="border-comparison-section">
      <div class="comparison-header">
        <h3 class="comparison-title">🎨 头像边框样式对比</h3>
        <p class="comparison-subtitle">点击选择你喜欢的样式</p>
      </div>
      
      <div class="border-options">
        <!-- 方案A：精致立体感 -->
        <div 
          class="border-option"
          :class="{ 'selected': selectedBorderStyle === '3d' }"
          @click="selectBorderStyle('3d')"
        >
          <div class="option-preview">
            <div class="avatar-container avatar-3d">
              <img src="/assets/photos/hero.jpg" alt="精致立体感" class="avatar-image">
            </div>
          </div>
          <div class="option-info">
            <h4>✨ 精致立体感</h4>
            <p>增强光影层次，专业现代感</p>
          </div>
        </div>
        
        <!-- 方案B：情感温度 -->
        <div 
          class="border-option"
          :class="{ 'selected': selectedBorderStyle === 'soft' }"
          @click="selectBorderStyle('soft')"
        >
          <div class="option-preview">
            <div class="avatar-container avatar-soft">
              <img src="/assets/photos/hero.jpg" alt="情感温度" class="avatar-image">
            </div>
          </div>
          <div class="option-info">
            <h4>💕 情感温度</h4>
            <p>柔和温馨，浪漫氛围</p>
          </div>
        </div>
        
        <!-- 方案C：极简统一 -->
        <div 
          class="border-option"
          :class="{ 'selected': selectedBorderStyle === 'minimal' }"
          @click="selectBorderStyle('minimal')"
        >
          <div class="option-preview">
            <div class="avatar-container avatar-minimal">
              <img src="/assets/photos/hero.jpg" alt="极简统一" class="avatar-image">
            </div>
          </div>
          <div class="option-info">
            <h4>⬜ 极简统一</h4>
            <p>简约现代，与页面统一</p>
          </div>
        </div>
      </div>
      
      <div class="comparison-actions">
        <button @click="applySelectedStyle" class="apply-btn">
          应用选中样式
        </button>
        <button @click="toggleComparison" class="cancel-btn">
          保持当前样式
        </button>
      </div>
    </section>

    <!-- 核心倒计时 -->
    <section class="countdown-section">
      <Countdown
        target-date="2025-05-17T00:00:00"
        label="我们已经在一起了"
      />
      <p class="love-quote">"相遇，是我们共同的幸运"</p>
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

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Countdown from '@/components/features/Countdown.vue'
import { useAppStore } from '@/stores'

const store = useAppStore()

// 头像边框样式状态
const showBorderComparison = ref(false)
const selectedBorderStyle = ref<'3d' | 'soft' | 'minimal'>('3d')
const currentAvatarStyle = ref<'3d' | 'soft' | 'minimal'>('3d')

// 计算当前头像样式类名
const avatarStyleClass = computed(() => {
  return `avatar-${currentAvatarStyle.value}`
})

// 选择边框样式
const selectBorderStyle = (style: '3d' | 'soft' | 'minimal') => {
  selectedBorderStyle.value = style
}

// 应用选中样式
const applySelectedStyle = () => {
  currentAvatarStyle.value = selectedBorderStyle.value
  // 保存到 localStorage
  localStorage.setItem('avatarBorderStyle', selectedBorderStyle.value)
  // 隐藏对比界面
  showBorderComparison.value = false
}

// 切换对比界面显示
const toggleComparison = () => {
  showBorderComparison.value = !showBorderComparison.value
}

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
  // 从 localStorage 读取保存的样式
  const savedStyle = localStorage.getItem('avatarBorderStyle') as '3d' | 'soft' | 'minimal' | null
  if (savedStyle && ['3d', 'soft', 'minimal'].includes(savedStyle)) {
    currentAvatarStyle.value = savedStyle
    selectedBorderStyle.value = savedStyle
  }
})
</script>

<style scoped>
.home {
  padding-bottom: calc(var(--nav-height) + var(--space-xl));
}

/* ============================================
   三种头像边框样式
   ============================================ */

/* 当前默认样式（基准）- 方案A：精致立体感 */
.avatar-container {
  width: 180px;
  height: 135px;
  border-radius: 20px;
  overflow: hidden;
  margin: 0 auto 24px auto;
  border: 3px solid #FFFFFF;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.avatar-container:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.12),
    0 2px 5px rgba(0, 0, 0, 0.08);
}

/* 方案A：精致立体感边框 - avatar-3d */
.avatar-3d {
  border-radius: 18px;
  border: 4px solid #fff;
  box-shadow: 
    0 0 0 1px rgba(255, 255, 255, 0.8),
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 8px 24px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    inset 0 -1px 0 rgba(0, 0, 0, 0.05);
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 250, 250, 0.9) 100%);
}

.avatar-3d:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 
    0 0 0 1px rgba(255, 255, 255, 0.9),
    0 8px 20px rgba(0, 0, 0, 0.12),
    0 12px 32px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.avatar-3d::before,
.avatar-3d::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 107, 139, 0.3);
  z-index: 2;
  pointer-events: none;
}

.avatar-3d::before {
  top: 8px;
  left: 8px;
  border-right: none;
  border-bottom: none;
}

.avatar-3d::after {
  top: 8px;
  right: 8px;
  border-left: none;
  border-bottom: none;
}

/* 方案B：情感温度柔和边框 - avatar-soft */
.avatar-soft {
  width: 180px;
  height: 135px;
  border-radius: 24px;
  border: 3px solid rgba(255, 255, 255, 0.9);
  box-shadow: 
    0 0 0 8px rgba(255, 235, 235, 0.4),
    0 0 0 4px rgba(255, 245, 245, 0.6),
    0 4px 16px rgba(255, 182, 193, 0.2),
    0 8px 24px rgba(255, 182, 193, 0.15);
  background: linear-gradient(135deg, 
    rgba(255, 250, 250, 0.95) 0%,
    rgba(255, 240, 240, 0.9) 50%,
    rgba(255, 235, 235, 0.85) 100%);
}

.avatar-soft:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 
    0 0 0 10px rgba(255, 220, 220, 0.5),
    0 0 0 6px rgba(255, 230, 230, 0.7),
    0 8px 24px rgba(255, 182, 193, 0.3),
    0 12px 32px rgba(255, 182, 193, 0.2);
  border-color: rgba(255, 255, 255, 1);
}

.avatar-soft::before {
  content: '❤️';
  position: absolute;
  top: -6px;
  right: -6px;
  font-size: 16px;
  z-index: 3;
  opacity: 0.7;
  transform: rotate(15deg);
  transition: transform 0.3s ease;
}

.avatar-soft:hover::before {
  transform: rotate(0deg) scale(1.2);
  opacity: 1;
}

/* 方案C：极简统一边框 - avatar-minimal */
.avatar-minimal {
  width: 180px;
  height: 135px;
  border-radius: 12px;
  border: 1.5px solid rgba(255, 255, 255, 0.8);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.06),
    0 4px 12px rgba(0, 0, 0, 0.04);
  background: transparent;
}

.avatar-minimal:hover {
  transform: translateY(-1px);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 6px 16px rgba(0, 0, 0, 0.05);
  border-color: rgba(255, 255, 255, 0.95);
}

.avatar-minimal::before,
.avatar-minimal::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border: 1px solid rgba(255, 107, 139, 0.2);
  pointer-events: none;
}

.avatar-minimal::before {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
}

.avatar-minimal::after {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
}

/* ============================================
   头像图片通用样式
   ============================================ */
.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  transition: transform 0.3s ease;
}

.avatar-3d .avatar-image:hover {
  transform: scale(1.05);
}

.avatar-soft .avatar-image:hover {
  transform: scale(1.03);
}

.avatar-minimal .avatar-image:hover {
  transform: scale(1.02);
}

/* ============================================
   边框样式对比测试区域
   ============================================ */
.border-comparison-section {
  max-width: 800px;
  margin: 0 auto var(--space-xl) auto;
  padding: var(--space-xl);
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.comparison-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.comparison-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}

.comparison-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.border-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.border-option {
  background: var(--bg-container);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  text-align: center;
}

.border-option:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.border-option.selected {
  border-color: #ff6b8b;
  background: rgba(255, 107, 139, 0.05);
}

.option-preview {
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-md);
  padding: var(--space-md);
  background: var(--bg-body);
  border-radius: var(--radius-md);
}

.option-info h4 {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}

.option-info p {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  line-height: 1.4;
}

.comparison-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
}

.apply-btn,
.cancel-btn {
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.apply-btn {
  background: linear-gradient(135deg, #ff6b8b, #ff5080);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 107, 139, 0.3);
}

.apply-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 107, 139, 0.4);
}

.cancel-btn {
  background: var(--bg-surface);
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
}

.cancel-btn:hover {
  background: var(--bg-container);
  border-color: var(--border-base);
}

/* 顶部区域 */
.home-header {
  text-align: center;
  padding: var(--space-2xl) var(--space-lg);
  background: linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-body) 100%);
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

@media (min-width: 768px) {
  .access-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .home-title {
    font-size: var(--font-size-3xl);
  }

  .avatar-container {
    width: 200px;
    height: 150px;
  }

  .avatar-3d {
    width: 200px;
    height: 150px;
  }

  .avatar-soft {
    width: 200px;
    height: 150px;
  }

  .avatar-minimal {
    width: 200px;
    height: 150px;
  }
}

@media (max-width: 768px) {
  .avatar-container,
  .avatar-3d,
  .avatar-soft,
  .avatar-minimal {
    width: 140px;
    height: 105px;
    margin-bottom: 20px;
  }

  .avatar-soft {
    border-radius: 20px;
  }

  .avatar-minimal {
    border-radius: 10px;
  }
}

@media (min-width: 1024px) {
  .access-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>
