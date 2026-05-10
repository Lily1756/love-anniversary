<template>
  <div class="starry-container" role="region" aria-label="年度记忆星光图">
    <!-- 星云光晕背景（垂直椭圆形）- 放在最底层 -->
    <div class="nebula-background"></div>
    <!-- 标题区 -->
    <div class="header-area">
      <h3 class="card-title">✨ 时间脉络</h3>
      <p class="card-subtitle">每一个写下情书的日子，都是星空里闪亮的一颗星</p>
    </div>

    <!-- 图表主区域 -->
    <div class="chart-area" ref="chartAreaRef">

      <svg
        class="stars-canvas"
        :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
        xmlns="http://www.w3.org/2000/svg"
        @mouseleave="handleMouseLeave"
      >
        <defs>
          <!-- 星星光晕渐变（莫兰迪色系） -->
          <radialGradient id="star-glow-soft" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#C9A8A9" stop-opacity="0.8" />
            <stop offset="50%" stop-color="#C9A8A9" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#C9A8A9" stop-opacity="0" />
          </radialGradient>

          <!-- 亮星特殊光晕 -->
          <radialGradient id="star-glow-bright" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#A89080" stop-opacity="1" />
            <stop offset="30%" stop-color="#C9A8A9" stop-opacity="0.5" />
            <stop offset="100%" stop-color="#D8C4B6" stop-opacity="0" />
          </radialGradient>

          <!-- 星星发光滤镜 -->
          <filter id="star-glow-filter" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <!-- 强发光滤镜（悬停） -->
          <filter id="star-glow-strong" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- 极淡背景色调（与页面融合） -->
        <rect
          :width="svgWidth"
          :height="svgHeight"
          fill="rgba(201, 168, 169, 0.03)"
          rx="16"
        />

        <!-- 装饰性背景微星 -->
        <circle
          v-for="bg in backgroundStars"
          :key="'bg-' + bg.id"
          :cx="bg.x"
          :cy="bg.y"
          :r="bg.r"
          :opacity="bg.opacity"
          fill="#C9A8A9"
          class="bg-star"
          :style="{ animationDelay: bg.delay + 's' }"
        />

        <!-- 星座连线（月份间连接） -->
        <g class="constellation-lines">
          <line
            v-for="(line, i) in constellationLines"
            :key="'const-' + i"
            :x1="line.x1"
            :y1="line.y1"
            :x2="line.x2"
            :y2="line.y2"
            stroke="#D8C4B6"
            stroke-width="0.5"
            stroke-dasharray="2 4"
            opacity="0.3"
          />
        </g>

        <!-- 星轨路径（连接有情书记录的月份节点） -->
        <path
          v-if="starTrailPath"
          :d="starTrailPath"
          fill="none"
          stroke="var(--color-accent, #C9A8A9)"
          stroke-width="1.5"
          stroke-opacity="0.3"
          stroke-dasharray="5,5"
          class="star-trail-path"
        />

        <!-- 星光点（核心） -->
        <g class="stars-group">
          <g
            v-for="(star, i) in positionedStars"
            :key="star.key"
            class="star-wrapper"
            :style="{ '--i': i, '--delay': star.animationDelay + 's' }"
            @mouseenter="handleStarHover(star, $event)"
            @mouseleave="handleStarLeave"
            @click="handleStarClick(star)"
            style="cursor: pointer"
          >
            <!-- 外层光晕 -->
            <circle
              :cx="star.x"
              :cy="star.y"
              :r="star.outerR"
              :fill="star.glowFill"
              :opacity="star.hovered ? 0.4 : 0.15"
              class="star-outer-glow"
            />

            <!-- 中层光晕 -->
            <circle
              :cx="star.x"
              :cy="star.y"
              :r="star.middleR"
              :fill="star.glowFill"
              :opacity="star.hovered ? 0.6 : 0.25"
              class="star-middle-glow"
            />

            <!-- 核心星点 -->
            <circle
              :cx="star.x"
              :cy="star.y"
              :r="star.coreR"
              :fill="star.coreColor"
              :opacity="star.hovered ? 1 : star.opacity"
              :filter="star.hovered ? 'url(#star-glow-strong)' : (star.count >= 4 ? 'url(#star-glow-filter)' : 'none')"
              class="star-core"
            />

            <!-- 涟漪效果（悬停时显示） -->
            <circle
              v-if="star.hovered"
              :cx="star.x"
              :cy="star.y"
              r="4"
              fill="none"
              :stroke="star.coreColor"
              stroke-width="0.8"
              class="ripple-ring"
            />
          </g>
        </g>

        <!-- 月份标签（底部水平排列） -->
        <g class="month-labels">
          <g
            v-for="m in 12"
            :key="'ml-' + m"
            @click="handleMonthClick(m)"
            style="cursor: pointer"
          >
            <rect
              :x="monthLabelPos(m).x - 16"
              :y="monthLabelPos(m).y - 10"
              width="32"
              height="20"
              fill="transparent"
              rx="4"
            />
            <text
              :x="monthLabelPos(m).x"
              :y="monthLabelPos(m).y"
              class="month-label-text"
              text-anchor="middle"
              dominant-baseline="central"
              :fill="activeMonth === m ? '#A89080' : 'rgba(90, 90, 90, 0.5)'"
              :font-weight="activeMonth === m ? '600' : '400'"
            >{{ m }}月</text>
          </g>
        </g>

        <!-- Tooltip -->
        <foreignObject
          v-if="hoveredStar"
          :x="tooltipPos.x - 90"
          :y="tooltipPos.y - 80"
          width="180"
          height="80"
          style="overflow: visible; pointer-events: none"
        >
          <div class="svg-tooltip">
            <div class="tooltip-date">{{ hoveredStar.year }}年{{ hoveredStar.month }}月{{ hoveredStar.day }}日</div>
            <div class="tooltip-preview">{{ hoveredStar.preview }}</div>
            <div class="tooltip-count">{{ hoveredStar.count }}封情书</div>
          </div>
        </foreignObject>
      </svg>
    </div>

    <!-- 星空分散布局：月份节点 -->
    <div
      v-for="node in starPositions"
      :key="'month-' + node.month"
      class="month-node"
      :class="{ 'has-letter': node.hasLetter, 'active': activeMonth === node.month }"
      :style="getNodeStyle(node)"
      @mouseenter="handleMonthHover(node.month)"
      @mouseleave="handleMonthLeave"
      @click="handleMonthClick(node.month)"
    >
      <span class="month-label">{{ node.month }}月</span>
      <span v-if="node.hasLetter" class="letter-count">+{{ node.letterCount }}</span>
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
import { calculateStarPositions, generateStarTrailPath } from '@/utils/starPositionCalculator'

const props = defineProps({
  letters: { type: Array, default: () => [] }
})

const emit = defineEmits(['month-selected', 'date-selected'])

// ── 容器尺寸（响应式）───
const containerRef = ref<HTMLElement | null>(null)
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

// ── 星空分散布局：月份节点位置 ─────────────────────
const starPositions = computed(() => {
  return calculateStarPositions(monthsData.value, containerSize.value.width, containerSize.value.height)
})

// ── 星轨路径：连接有情书记录的月份 ───────────────────
const starTrailPath = computed(() => {
  return generateStarTrailPath(starPositions.value)
})

// ─── SVG 画布常量 ─────────────────────────────────────
const svgWidth = 800
const svgHeight = 380
const margin = { left: 80, right: 80, top: 40, bottom: 50 }
const chartWidth = svgWidth - margin.left - margin.right
const chartHeight = svgHeight - margin.top - margin.bottom
const baseY = svgHeight / 2 - 20  // 星星基准Y坐标

// ─── 交互状态 ─────────────────────────────────────────
const activeMonth = ref(null)
const hoveredStar = ref(null)
const tooltipPos = ref({ x: 0, y: 0 })
const chartAreaRef = ref(null)

// ─── 伪随机种子函数（确保同日期位置稳定） ─────────────
function seededRandom(seed) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  s = (s * 16807) % 2147483647
  return (s - 1) / 2147483646
}

// ─── 坐标映射：1月左 → 12月右 ────────────────────────
function monthToX(month) {
  const progress = (month - 1) / 11
  return margin.left + progress * chartWidth
}

function dayToY(day, month, year) {
  const seed = month * 31 + day + year * 1000
  const random = seededRandom(seed)
  const maxOffset = chartHeight / 2 - 20
  return baseY + (random * 2 - 1) * maxOffset
}

// ─── 星星大小映射 ─────────────────────────────────────
function getStarSize(count, contentLength) {
  const base = 3
  const max = 9
  const countFactor = Math.min(count / 5, 1) * 0.5
  const lengthFactor = Math.min(contentLength / 500, 1) * 0.5
  return base + (countFactor + lengthFactor) * (max - base)
}

// ─── 星星颜色系统（莫兰迪色系） ──────────────────────
function getStarColors(count) {
  if (count === 1) {
    return {
      core: '#C9A8A9',
      glowFill: 'rgba(201, 168, 169, 0.3)'
    }
  } else if (count <= 3) {
    return {
      core: '#B8958A',
      glowFill: 'rgba(184, 149, 138, 0.3)'
    }
  } else {
    return {
      core: '#A89080',
      glowFill: 'rgba(169, 144, 128, 0.25)'
    }
  }
}

// ─── 数据处理：按日期分组 ─────────────────────────────
const letterGrouped = computed(() => {
  const map = {}
  for (const letter of props.letters) {
    if (!letter.date) continue
    if (!map[letter.date]) {
      map[letter.date] = []
    }
    map[letter.date].push(letter)
  }
  return map
})

// ─── 所有星光点（核心算法） ──────────────────────────
const positionedStars = computed(() => {
  const today = new Date()
  const stars = []

  for (const [date, lettersOfDay] of Object.entries(letterGrouped.value)) {
    const [yearStr, monthStr, dayStr] = date.split('-')
    const yearN = parseInt(yearStr)
    const month = parseInt(monthStr)
    const day = parseInt(dayStr)

    // 过滤未来日期
    if (yearN > today.getFullYear()) continue
    if (yearN === today.getFullYear() && month > today.getMonth() + 1) continue
    if (yearN === today.getFullYear() && month === today.getMonth() + 1 && day > today.getDate()) continue

    const x = monthToX(month)
    const y = dayToY(day, month, yearN)

    const maxContent = Math.max(...lettersOfDay.map(l => (l.content || '').length))
    const size = getStarSize(lettersOfDay.length, maxContent)
    const colors = getStarColors(lettersOfDay.length)

    const preview = lettersOfDay[0].title
      ? lettersOfDay[0].title.slice(0, 16) + (lettersOfDay[0].title.length > 16 ? '…' : '')
      : (lettersOfDay[0].content || '').slice(0, 16) + '…'

    const opacity = yearN === 2025 ? 0.65 : 0.9

    stars.push({
      key: date,
      x,
      y,
      size,
      r: size,
      outerR: size * 2,
      middleR: size * 1.2,
      coreR: size * 0.4,
      coreColor: colors.core,
      glowFill: colors.glowFill,
      opacity,
      year: yearN,
      month,
      day,
      count: lettersOfDay.length,
      preview,
      hovered: false,
      animationDelay: seededRandom(yearN * 1000 + month * 31 + day)
    })
  }

  return stars
})

// ─── 背景装饰微星 ────────────────────────────────────
const backgroundStars = computed(() => {
  const stars = []
  for (let i = 0; i < 35; i++) {
    const seed = i * 137
    stars.push({
      id: i,
      x: seededRandom(seed) * svgWidth,
      y: seededRandom(seed + 1) * svgHeight,
      r: 0.3 + seededRandom(seed + 2) * 0.6,
      opacity: 0.1 + seededRandom(seed + 3) * 0.2,
      delay: seededRandom(seed + 4) * 5
    })
  }
  return stars
})

// ─── 星座连线（相邻月份） ─────────────────────────────
const constellationLines = computed(() => {
  const lines = []
  const sorted = [...positionedStars.value].sort((a, b) => {
    return (a.year - b.year) || (a.month - b.month) || (a.day - b.day)
  })

  const byMonth = {}
  for (const star of sorted) {
    if (!byMonth[star.month]) byMonth[star.month] = []
    byMonth[star.month].push(star)
  }

  for (let m = 1; m < 12; m++) {
    const curr = byMonth[m]
    const next = byMonth[m + 1]
    if (curr && next) {
      const currLast = curr[curr.length - 1]
      const nextFirst = next[0]
      lines.push({
        x1: currLast.x,
        y1: currLast.y,
        x2: nextFirst.x,
        y2: nextFirst.y
      })
    }
  }

  return lines
})

// ─── 月份标签位置 ────────────────────────────────────
function monthLabelPos(month) {
  return {
    x: monthToX(month),
    y: svgHeight - margin.bottom / 2 + 5
  }
}

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
  const months = new Set(positionedStars.value.map(s => s.month))
  return months.size
})

const extraStats = computed(() => {
  if (positionedStars.value.length === 0) return null

  // 最长连续天数
  const sorted = [...positionedStars.value].sort((a, b) => {
    return (a.year - b.year) || (a.month - b.month) || (a.day - b.day)
  })

  let maxStreak = 1
  let currentStreak = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].year, sorted[i - 1].month - 1, sorted[i - 1].day)
    const curr = new Date(sorted[i].year, sorted[i].month - 1, sorted[i].day)
    const diff = (curr - prev) / (1000 * 60 * 60 * 24)
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
function handleStarHover(star, event) {
  hoveredStar.value = { ...star, hovered: true }
  tooltipPos.value = { x: star.x, y: star.y }
  activeMonth.value = star.month
}

function handleStarLeave() {
  hoveredStar.value = null
}

function handleStarClick(star) {
  emit('date-selected', star.key)
  emit('month-selected', star.month)
}

function handleMonthClick(month) {
  if (activeMonth.value === month) {
    clearMonthFilter()
  } else {
    activeMonth.value = month
    emit('month-selected', month)
  }
}

function clearMonthFilter() {
  activeMonth.value = null
  emit('month-selected', null)
}
// ── 星空分散布局：节点样式 ──────────────────────
function getNodeStyle(node) {
  return {
    left: node.x + 'px',
    top: node.y + 'px',
    '--size': node.hasLetter ? node.size : 24,
    '--brightness': node.hasLetter ? 1 : 0.3,
    zIndex: node.hasLetter ? 3 : 2
  }
}

function handleMouseLeave() {
  hoveredStar.value = null
}
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

  .chart-area {
    min-height: 280px;
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

/* 星空分散布局：月份节点 */
.month-node {
  position: absolute;
  width: calc(var(--size, 24) * 1px);
  height: calc(var(--size, 24) * 1px);
  border-radius: 50%;
  background: var(--color-accent, #C9A8A9);
  opacity: var(--brightness, 0.3);
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 8px rgba(201, 168, 169, 0.3);
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

.month-node:hover {
  transform: translate(-50%, -50%) scale(1.3);
  box-shadow: 0 0 20px rgba(201, 168, 169, 0.8);
  z-index: 4 !important;
}

.month-node.active {
  animation: star-twinkle 1.5s ease-in-out infinite;
}

.month-label {
  font-size: 10px;
  color: white;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  user-select: none;
}

.letter-count {
  font-size: 8px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 2px;
}

.star-trail-path {
  pointer-events: none;
}

</style>
