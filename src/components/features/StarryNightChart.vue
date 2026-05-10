<template>
  <div class="starry-container" role="region" aria-label="年度记忆星光图">
    <!-- 星云光晕背景（垂直椭圆形）- 放在最底层 -->
    <div class="nebula-background"></div>
    
    <!-- 标题区 -->
    <div class="header-area">
      <h3 class="card-title">✨ 时间脉络</h3>
      <p class="card-subtitle">每一个写下情书的日子，都是星空里闪亮的一颗星</p>
    </div>

    <!-- 星空画布：只有月份节点，没有SVG画布 -->
    <div class="starry-canvas" ref="canvasRef">
      <!-- 只有星空节点，没有底部圆点 -->
      <div
        v-for="node in starPositions"
        :key="'month-' + node.month"
        class="star-node"
        :class="{ 'has-letters': node.hasLetter }"
        :style="getNodeStyle(node)"
        @mouseenter="handleNodeHover(node)"
        @mouseleave="handleNodeLeave"
        @click="handleNodeClick(node)"
      >
        <!-- 节点内容 -->
        <div class="star-core"></div>
        <div class="star-glow"></div>
        <div class="node-label">{{ node.month }}月</div>
        <div v-if="node.hasLetter" class="node-count">+{{ node.letterCount }}</div>
      </div>
    </div>

    <!-- 分割线 -->
    <div class="divider"></div>

    <!-- 进度显示区域 -->
    <div class="progress-section">
      <div class="progress-header">
        <span class="progress-title">记忆星辰点亮度</span>
        <span class="progress-percent">{{ progressData.percentage }}%</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: progressData.percentage + '%' }"></div>
      </div>
      <div class="progress-text">
        已点亮 {{ progressData.count }} / {{ progressData.total }} 个日夜
      </div>
    </div>

    <!-- 统计面板 -->
    <div class="stats-panel">
      <div class="stat-item">
        <span class="stat-label">记录月份</span>
        <span class="stat-value">{{ activeMonthCount }}<span class="stat-unit">/12</span></span>
      </div>
      <div class="stat-item">
        <span class="stat-label">星光总数</span>
        <span class="stat-value">{{ totalLetters }}</span>
      </div>
      <div class="stat-item" v-if="extraStats">
        <span class="stat-label">最长连续</span>
        <span class="stat-value">{{ extraStats.maxStreak }}<span class="stat-unit">天</span></span>
      </div>
    </div>

    <!-- 月份筛选提示 -->
    <div v-if="activeMonth !== null" class="month-filter-hint">
      <span>📅 正在查看 {{ activeMonth }} 月的情书</span>
      <button class="clear-month-btn" @click="clearMonthFilter">清除筛选</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  letters: { type: Array, default: () => [] }
})

const emit = defineEmits(['month-selected', 'date-selected'])

// ── 容器尺寸（响应式）───
const canvasRef = ref(null)
const containerSize = ref({ width: 800, height: 320 })

// ── 月份数据聚合 ──────────────────────────
const monthsData = computed(() => {
  const data = {}
  for (let m = 1; m <= 12; m++) data[m] = { count: 0 }
  for (const letter of props.letters) {
    if (letter.date) {
      const month = parseInt(letter.date.split('-')[1])
      if (month >= 1 && month <= 12) data[month].count++
    }
  }
  return data
})

// ── 优化后的星空节点位置计算（避免重叠）─────────────────────
const starPositions = computed(() => {
  const containerWidth = containerSize.value.width
  const containerHeight = containerSize.value.height
  const positions = []
  const horizontalSpacing = containerWidth / 13 // 左右留边距
  const verticalRange = containerHeight * 0.6   // 垂直分布范围
  const horizontalJitter = horizontalSpacing * 0.4 // 水平扰动
  
  // 避免节点重叠的冲突检测
  const placedPositions = []
  const minDistance = 60 // 节点间最小距离
  
  for (let i = 0; i < 12; i++) {
    const month = i + 1
    const hasLetter = monthsData.value[month]?.count > 0
    const letterCount = monthsData.value[month]?.count || 0
    
    // 基础水平位置（保持时间顺序）
    const baseX = horizontalSpacing + (i * (containerWidth - horizontalSpacing * 2) / 11)
    
    // 尝试多次寻找不重叠的位置
    let x, y
    let attempts = 0
    const maxAttempts = 50
    
    do {
      // 水平随机扰动
      const hJitter = (Math.random() * 2 - 1) * horizontalJitter
      
      // 垂直位置 - 使用正弦波产生有节奏的分布
      const verticalPhase = (i / 12) * Math.PI * 2
      const verticalBase = Math.sin(verticalPhase) * (verticalRange / 3)
      const verticalRandom = (Math.random() * 2 - 1) * (verticalRange / 3)
      
      x = baseX + hJitter
      y = (containerHeight / 2) + verticalBase + verticalRandom
      
      // 边界检查
      x = Math.max(30, Math.min(containerWidth - 30, x))
      y = Math.max(50, Math.min(containerHeight - 50, y))
      
      attempts++
      
      // 如果尝试次数过多，放宽距离限制
      const currentMinDistance = attempts > 20 ? minDistance * 0.7 : minDistance
      
      // 检查是否与已放置节点太近
      const tooClose = placedPositions.some(pos => {
        const dx = pos.x - x
        const dy = pos.y - y
        return Math.sqrt(dx * dx + dy * dy) < currentMinDistance
      })
      
      if (!tooClose || attempts >= maxAttempts) {
        break
      }
    } while (attempts < maxAttempts)
    
    // 记录已放置位置
    placedPositions.push({ x, y })
    
    // 计算节点大小（根据情书数量）
    const size = hasLetter ? 24 + Math.min(letterCount, 5) * 2 : 16
    
    positions.push({
      x,
      y,
      month,
      hasLetter,
      letterCount,
      size
    })
  }
  
  return positions
})

// ─── 交互状态 ─────────────────────────────────────────
const activeMonth = ref(null)

// ─── 核心修复：进度按不同日期数/365计算 ──────────────
const progressData = computed(() => {
  if (!props.letters || props.letters.length === 0) {
    return { percentage: 0, count: 0, total: 365 }
  }

  // 提取所有不同的日期（YYYY-MM-DD格式）
  const dateSet = new Set()
  for (const letter of props.letters) {
    if (letter.date) {
      // 确保日期格式一致
      const dateObj = new Date(letter.date)
      if (!isNaN(dateObj.getTime())) {
        const dateStr = dateObj.toISOString().split('T')[0]
        dateSet.add(dateStr)
      }
    }
  }

  const uniqueDatesCount = dateSet.size
  const percentage = Math.min(Math.round((uniqueDatesCount / 365) * 100), 100)

  return {
    percentage,
    count: uniqueDatesCount,
    total: 365
  }
})

// ─── 统计计算 ────────────────────────────────────────
const totalLetters = computed(() => props.letters.length)

const activeMonthCount = computed(() => {
  const monthsWithLetters = Object.entries(monthsData.value)
    .filter(([_, data]) => data.count > 0)
    .length
  return monthsWithLetters
})

const extraStats = computed(() => {
  if (!props.letters || props.letters.length === 0) return null

  // 提取所有日期并排序
  const dates = [...new Set(props.letters.map(l => l.date).filter(Boolean))]
    .map(d => new Date(d))
    .sort((a, b) => a - b)
  
  if (dates.length === 0) return null
  
  // 计算最长连续天数
  let maxStreak = 1
  let currentStreak = 1
  
  for (let i = 1; i < dates.length; i++) {
    const diff = (dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24)
    if (diff === 1) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }
  
  return { maxStreak }
})

// ─── 交互处理 ────────────────────────────────────────
function handleNodeHover(month) {
  activeMonth.value = month
}

function handleNodeLeave() {
  // 不立即清除，保持选中状态
}

function handleNodeClick(node) {
  if (activeMonth.value === node.month) {
    clearMonthFilter()
  } else {
    activeMonth.value = node.month
    emit('month-selected', node.month)
  }
}

function clearMonthFilter() {
  activeMonth.value = null
  emit('month-selected', null)
}

// ── 星空节点样式 ──────────────────────
function getNodeStyle(node) {
  return {
    left: node.x + 'px',
    top: node.y + 'px',
    '--size': node.size + 'px',
    '--brightness': node.hasLetter ? 1 : 0.3,
    zIndex: node.hasLetter ? 3 : 2
  }
}

// ── 响应式监听容器尺寸 ──────────────────────
function updateContainerSize() {
  if (canvasRef.value) {
    containerSize.value = {
      width: canvasRef.value.offsetWidth,
      height: canvasRef.value.offsetHeight || 320
    }
  }
}

onMounted(() => {
  updateContainerSize()
  window.addEventListener('resize', updateContainerSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateContainerSize)
})
</script>

<style scoped>
.starry-container {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 20px 0 0 0;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
  min-height: 300px;
}

/* 标题区 */
.header-area {
  text-align: center;
  margin-bottom: 12px;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #595959;
  margin: 0 0 4px 0;
  font-family: 'Playfair Display', serif;
}

.card-subtitle {
  font-size: 12px;
  font-weight: 400;
  color: #999;
  margin: 0;
  font-family: 'Noto Sans SC', sans-serif;
}

/* 图表区域 */
.chart-area {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 320px;
  overflow: visible;
  position: relative;
}

/* 星云光晕背景（垂直椭圆形）- 方案一 */
.nebula-background {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;   /* 占容器宽度的80% */
  height: 90%;  /* 占容器高度的90% */

  /* 三层径向渐变 - 莫兰迪色系（方案一规范） */
  background: radial-gradient(
    ellipse at center,
    rgba(255, 245, 245, 0.1) 0%,   /* 最内层：极淡的粉白色光心 */
    rgba(201, 168, 169, 0.05) 40%,  /* 中间层：主莫兰迪粉色，极低透明度 */
    rgba(232, 214, 215, 0) 70%       /* 最外层：过渡到完全透明 */
  );

  /* 柔化边缘 */
  filter: blur(30px);
  border-radius: 50%; /* 椭圆形态 */

  /* 呼吸动画 */
  animation: nebula-breathe 8s ease-in-out infinite;

  /* 层级控制 */
  z-index: 1;
  pointer-events: none; /* 不拦截鼠标事件，确保星星可点击 */
}

/* 呼吸动画定义（方案一规范） */
@keyframes nebula-breathe {
  0%, 100% { 
    opacity: 0.03; /* 最淡状态 */
  }
  50% { 
    opacity: 0.07; /* 最明显状态（仍非常淡） */
  }
}

/* 确保其他内容在光晕之上 */
.header-area,
.chart-area {
  position: relative;
  z-index: 2; /* 高于光晕背景 */
}

/* 星星在光晕之上 */
.star-group {
  z-index: 3;
}

/* 桌面端优化 */
@media (min-width: 1024px) {
  .nebula-background {
    width: 70%; /* 桌面端可以稍小 */
    filter: blur(40px); /* 更大的模糊，更柔和 */
  }
}

/* 平板端适配 */
@media (max-width: 1024px) and (min-width: 768px) {
  .nebula-background {
    width: 85%;
    filter: blur(25px);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .starry-container {
    min-height: 280px;
    padding: 15px 0;
  }

  .nebula-background {
    width: 90%;
    height: 85%;
    filter: blur(20px);
  }
}

/* 确保SVG内容在星云之上 */
.chart-area .stars-canvas {
  position: relative;
  z-index: 2;
}

.stars-canvas {
  width: 100%;
  max-width: 760px;
  height: auto;
  overflow: visible;
}

/* 背景微星动画 */
.bg-star {
  animation: bg-twinkle 4s infinite ease-in-out alternate;
}

@keyframes bg-twinkle {
  0% { opacity: 0.1; }
  100% { opacity: 0.25; }
}

/* 星星动画 */
.star-wrapper {
  animation: star-twinkle 3s infinite ease-in-out;
  animation-delay: var(--delay);
}

@keyframes star-twinkle {
  0%, 100% {
    opacity: 0.85;
  }
  50% {
    opacity: 1;
  }
}

/* 外层光晕动画 */
.star-outer-glow {
  animation: glow-pulse 3s infinite ease-in-out;
  animation-delay: var(--delay);
  transition: opacity 0.3s ease;
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.2; }
}

/* 涟漪效果 */
.ripple-ring {
  animation: ripple 1s ease-out infinite;
}

@keyframes ripple {
  0% {
    r: 4;
    opacity: 0.7;
    stroke-width: 1;
  }
  100% {
    r: 18;
    opacity: 0;
    stroke-width: 0.2;
  }
}

/* 月份标签 */
.month-label-text {
  font-size: 11px;
  font-family: 'Noto Sans SC', sans-serif;
  transition: fill 0.3s ease, font-weight 0.3s ease;
  user-select: none;
}

/* 分割线 */
.divider {
  height: 1px;
  background: rgba(201, 168, 169, 0.15);
  margin: 12px auto;
  max-width: 90%;
}

/* Tooltip */
.svg-tooltip {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(201, 168, 169, 0.2);
  border-radius: 10px;
  padding: 8px 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  font-family: 'Noto Sans SC', sans-serif;
  animation: tooltip-in 0.2s ease;
  pointer-events: none;
}

.tooltip-date {
  font-size: 12px;
  font-weight: 600;
  color: #595959;
  margin-bottom: 3px;
}

.tooltip-preview {
  font-size: 11px;
  color: #C9A8A9;
  line-height: 1.4;
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tooltip-count {
  font-size: 10px;
  color: #999;
  margin-top: 3px;
}

@keyframes tooltip-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 进度区域 */
.progress-section {
  padding: 0 8px;
  margin-bottom: 16px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-title {
  font-size: 12px;
  color: #999;
  font-family: 'Noto Sans SC', sans-serif;
}

.progress-percent {
  font-size: 13px;
  font-weight: 600;
  color: #C9A8A9;
  font-family: 'Playfair Display', serif;
}

.progress-track {
  width: 100%;
  height: 6px;
  background: rgba(201, 168, 169, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #D8C4B6, #C9A8A9, #B8958A);
  border-radius: 4px;
  transition: width 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.progress-text {
  font-size: 11px;
  color: #999;
  margin-top: 6px;
  font-family: 'Noto Sans SC', sans-serif;
  text-align: center;
}

/* 统计面板 */
.stats-panel {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 16px;
  padding: 12px 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 11px;
  color: #999;
  font-family: 'Noto Sans SC', sans-serif;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #C9A8A9;
  font-family: 'Playfair Display', serif;
}

.stat-unit {
  font-size: 12px;
  font-weight: 400;
  color: #999;
}

/* 月份筛选提示 */
.month-filter-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(201, 168, 169, 0.06);
  border-radius: 8px;
  margin-top: 12px;
  font-size: 12px;
  color: #C9A8A9;
  font-family: 'Noto Sans SC', sans-serif;
}

.clear-month-btn {
  padding: 3px 10px;
  background: transparent;
  border: 1px solid rgba(201, 168, 169, 0.3);
  border-radius: 20px;
  color: #C9A8A9;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
  font-family: 'Noto Sans SC', sans-serif;
}

.clear-month-btn:hover {
  background: rgba(201, 168, 169, 0.1);
  border-color: rgba(201, 168, 169, 0.5);
}

/* 响应式 */
@media (max-width: 600px) {
  .starry-container {
    padding: 15px 0 0 0;
    margin-bottom: 30px;
  }

  .starry-canvas {
    height: 280px;
  }

  .stats-panel {
    flex-direction: column;
    gap: 8px;
  }

  .stat-item {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
  }

  .card-title {
    font-size: 18px;
  }
}

/* 星空节点样式 */
.star-node {
  position: absolute;
  width: 60px;
  height: 60px;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 2;
}

/* 无记录的节点 - 低调显示 */
.star-node:not(.has-letters) {
  opacity: 0.3;
  transform: translate(-50%, -50%) scale(0.8);
}

.star-node:not(.has-letters) .star-core {
  width: 16px;
  height: 16px;
  background-color: var(--text-tertiary, #999);
  border-radius: 50%;
}

/* 有记录的节点 - 突出显示 */
.star-node.has-letters {
  opacity: 1;
}

.star-node.has-letters .star-core {
  width: 24px;
  height: 24px;
  background: radial-gradient(
    circle at 30% 30%,
    var(--color-accent, #C9A8A9) 0%,
    rgba(201, 168, 169, 0.7) 70%,
    rgba(201, 168, 169, 0.3) 100%
  );
  border-radius: 50%;
  box-shadow: 0 0 12px rgba(201, 168, 169, 0.6);
}

.month-node.has-letter {
  background: radial-gradient(
    circle at 30% 30%,
    var(--color-accent) 0%,
    rgba(201, 168, 169, 0.7) 70%,
    rgba(201, 168, 169, 0.3) 100%
  );
  box-shadow: 
    0 0 12px rgba(201, 168, 169, 0.5),
    inset 0 0 8px rgba(255, 255, 255, 0.3);
}

/* 光晕效果 */
.star-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 30px 15px rgba(201, 168, 169, 0.3);
  pointer-events: none;
  z-index: 1;
}

/* 悬停效果 */
.star-node:hover {
  z-index: 10;
  transform: translate(-50%, -50%) scale(1.3);
}

.star-node:hover .star-glow {
  box-shadow: 0 0 50px 25px rgba(201, 168, 169, 0.5);
}

/* 节点标签 */
.node-label {
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: var(--text-secondary, #595959);
  white-space: nowrap;
  font-family: 'Noto Sans SC', sans-serif;
}

.node-count {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  color: var(--color-accent, #C9A8A9);
  background: rgba(201, 168, 169, 0.1);
  padding: 2px 6px;
  border-radius: 10px;
  font-family: 'Noto Sans SC', sans-serif;
}

</style>
