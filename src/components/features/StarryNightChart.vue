<template>
  <div class="starry-night-card" role="region" aria-label="年度记忆星光图">
    <!-- 主标题 -->
    <h3 class="card-title">年度记忆星光图</h3>
    <p class="card-subtitle">记录每一个写下情书的日子</p>

    <!-- 图表区 -->
    <div class="chart-area">
      <svg
        class="starry-svg"
        viewBox="0 0 600 600"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- 外圈装饰轨道 -->
        <circle cx="300" cy="300" r="250" fill="none" stroke="#F0E6E6" stroke-width="1" stroke-dasharray="4 6" opacity="0.6" />
        <!-- 主轨道 -->
        <circle cx="300" cy="300" r="220" fill="none" stroke="#F0E6E6" stroke-width="1.5" />
        <!-- 内圈装饰轨道 -->
        <circle cx="300" cy="300" r="190" fill="none" stroke="#F0E6E6" stroke-width="0.5" stroke-dasharray="2 8" opacity="0.4" />

        <!-- 月份标签（12个月均匀分布） -->
        <g class="month-labels" v-for="m in 12" :key="'month-' + m">
          <text
            :x="300 + 175 * Math.cos(((m - 1) / 12) * 2 * Math.PI - Math.PI / 2)"
            :y="300 + 175 * Math.sin(((m - 1) / 12) * 2 * Math.PI - Math.PI / 2)"
            class="month-label"
            text-anchor="middle"
            dominant-baseline="central"
            :fill="activeMonth === m ? '#D18A8A' : '#CCC'"
            :font-weight="activeMonth === m ? '600' : '400'"
          >{{ m }}月</text>
        </g>

        <!-- 月初短线标记 -->
        <g v-for="m in 12" :key="'tick-' + m">
          <line
            :x1="300 + 220 * Math.cos(((m - 1) / 12) * 2 * Math.PI - Math.PI / 2)"
            :y1="300 + 220 * Math.sin(((m - 1) / 12) * 2 * Math.PI - Math.PI / 2)"
            :x2="300 + 230 * Math.cos(((m - 1) / 12) * 2 * Math.PI - Math.PI / 2)"
            :y2="300 + 230 * Math.sin(((m - 1) / 12) * 2 * Math.PI - Math.PI / 2)"
            stroke="#E8B4B8"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </g>

        <!-- 星光点 -->
        <StarPoint
          v-for="star in visibleStars"
          :key="star.dateKey"
          :x="star.x"
          :y="star.y"
          :size="star.size"
          :count="star.count"
          :month="star.month"
          :day="star.day"
          @hover="handleHover"
          @click="handleClick"
        />

        <!-- 中心装饰 -->
        <circle cx="300" cy="300" r="60" fill="#FFF9F5" />
        <circle cx="300" cy="300" r="50" fill="none" stroke="#F0E6E6" stroke-width="1" />
        <circle cx="300" cy="300" r="3" fill="#E8B4B8" />
        <!-- 中心文字 -->
        <text x="300" y="285" class="center-count" text-anchor="middle">{{ totalLetters }}</text>
        <text x="300" y="305" class="center-label" text-anchor="middle">封情书</text>
        <text x="300" y="322" class="center-year" text-anchor="middle">{{ currentYear }}年</text>

        <!-- Tooltip（悬停提示） -->
        <g v-if="tooltip" class="tooltip-group" style="pointer-events: none">
          <rect
            :x="tooltipX - 42"
            :y="tooltipY - 38"
            width="84"
            height="32"
            rx="8"
            fill="#FFFFFF"
            stroke="#F0E6E6"
            stroke-width="1"
            filter="url(#tooltip-shadow)"
          />
          <text :x="tooltipX" :y="tooltipY - 22" class="tooltip-date" text-anchor="middle">{{ tooltip.month }}月{{ tooltip.day }}日</text>
          <text :x="tooltipX" :y="tooltipY - 7" class="tooltip-count" text-anchor="middle">{{ tooltip.count }} 封情书</text>
          <!-- SVG 滤镜 -->
          <defs>
            <filter id="tooltip-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(0,0,0,0.08)" />
            </filter>
          </defs>
        </g>
      </svg>
    </div>

    <!-- 分割线 -->
    <div class="divider"></div>

    <!-- 统计区 -->
    <div class="stats-area">
      <div class="stat-item stat-left">
        <span class="stat-title">记录月份</span>
        <span class="stat-value">{{ activeMonthCount }} / 12</span>
      </div>
      <div class="stat-item stat-center">
        <div class="progress-container">
          <div class="progress-labels">
            <span class="progress-title">爱情书写进度</span>
            <span class="progress-percent">{{ progressPercent }}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
        </div>
      </div>
      <div class="stat-item stat-right">
        <span class="stat-title">星光总数</span>
        <span class="stat-value">{{ totalLetters }}</span>
      </div>
    </div>

    <!-- 悬停时的日期标签（DOM Tooltip，SVG tooltip 之外） -->
    <div
      v-if="domTooltip"
      class="dom-tooltip"
      :style="{ left: domTooltip.x + 'px', top: domTooltip.y + 'px' }"
    >
      <div class="dom-tooltip-date">{{ domTooltip.month }}月{{ domTooltip.day }}日</div>
      <div class="dom-tooltip-count">{{ domTooltip.count }} 封情书</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import StarPoint from './StarPoint.vue'

const props = defineProps({
  letters: { type: Array, default: () => [] }
})

const emit = defineEmits(['date-selected'])

const currentYear = new Date().getFullYear()

// ─── 数据预处理 ───────────────────────────────────────
// 1. 按 "MM-DD" 分组统计每日情书数量
const dateCountMap = computed(() => {
  return props.letters.reduce((acc, letter) => {
    const key = letter.date.slice(5) // 提取 "MM-DD"
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
})

// 2. 当前日期判断（未来日期不点亮）
const today = new Date()
const currentMonth = today.getMonth() + 1
const currentDay = today.getDate()

// ─── 365天星光点计算 ─────────────────────────────────
// 核心算法：一年365天映射为环形轨道上的点位
const allStars = computed(() => {
  const stars = []
  for (let dayOfYear = 1; dayOfYear <= 365; dayOfYear++) {
    // 计算该天在一年中的月和日
    const date = new Date(currentYear, 0, dayOfYear)
    const month = date.getMonth() + 1
    const day = date.getDate()

    // 判断是否已到该日期（未来日期不显示）
    const monthPassed = month < currentMonth || (month === currentMonth && day <= currentDay)
    if (!monthPassed) continue

    // 计算圆环上的坐标（半径220，中心300,300）
    // 角度：1月1日（dayOfYear=1）在顶部 (-π/2)，顺时针排列
    const angle = ((dayOfYear - 1) / 365) * 2 * Math.PI - Math.PI / 2
    const radius = 220
    const x = 300 + radius * Math.cos(angle)
    const y = 300 + radius * Math.sin(angle)

    // 该日期的情书数量
    const dateKey = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const count = dateCountMap.value[dateKey] || 0

    stars.push({
      dateKey,
      x,
      y,
      month,
      day,
      count,
      size: count >= 2 ? 'large' : 'small'
    })
  }
  return stars
})

// 仅显示有情书的点（更聚焦）或全部可见点
const visibleStars = computed(() => {
  return allStars.value
})

// ─── 统计数据 ─────────────────────────────────────────
const totalLetters = computed(() => props.letters.length)

const activeMonthCount = computed(() => {
  const months = new Set(allStars.value.filter(s => s.count > 0).map(s => s.month))
  return months.size
})

const progressPercent = computed(() => {
  // 进度按当前已过月份计算
  const totalMonths = currentMonth
  return Math.round((activeMonthCount.value / totalMonths) * 100)
})

// ─── 交互状态 ─────────────────────────────────────────
const activeMonth = ref(null)
const tooltip = ref(null)
const tooltipX = ref(0)
const tooltipY = ref(0)
const domTooltip = ref(null)

function handleHover(data) {
  if (!data) {
    tooltip.value = null
    domTooltip.value = null
    return
  }
  tooltip.value = data

  // 计算 tooltip 位置（基于悬停点坐标）
  const angle = ((new Date(currentYear, data.month - 1, data.day).getTime() -
    new Date(currentYear, 0, 1).getTime()) / (365 * 24 * 60 * 60 * 1000)) * 2 * Math.PI - Math.PI / 2
  const radius = 280
  tooltipX.value = 300 + radius * Math.cos(angle)
  tooltipY.value = 300 + radius * Math.sin(angle)

  // 同时更新 DOM tooltip（更灵活的定位）
  activeMonth.value = data.month
}

function handleClick(data) {
  // 构建 YYYY-MM-DD 格式日期
  const dateStr = `${currentYear}-${String(data.month).padStart(2, '0')}-${String(data.day).padStart(2, '0')}`
  emit('date-selected', { date: dateStr })
  activeMonth.value = data.month
}
</script>

<style scoped>
.starry-night-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 32px;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #595959;
  text-align: center;
  margin: 0 0 4px 0;
}

.card-subtitle {
  font-size: 12px;
  font-weight: 400;
  color: #999;
  text-align: center;
  margin: 0 0 0 0;
}

.chart-area {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 360px;
  overflow: visible;
}

.starry-svg {
  width: 100%;
  max-width: 480px;
  height: auto;
}

/* 月份标签 */
.month-label {
  font-size: 11px;
  font-family: 'Noto Sans SC', sans-serif;
  transition: fill 0.2s ease, font-weight 0.2s ease;
}

/* 中心文字 */
.center-count {
  font-size: 20px;
  font-weight: 700;
  fill: #E8B4B8;
  font-family: 'Playfair Display', serif;
}

.center-label {
  font-size: 11px;
  font-weight: 400;
  fill: #999;
  font-family: 'Noto Sans SC', sans-serif;
}

.center-year {
  font-size: 10px;
  font-weight: 400;
  fill: #CCC;
  font-family: 'Noto Sans SC', sans-serif;
}

/* Tooltip */
.tooltip-group {
  animation: tooltip-fade-in 0.15s ease;
}

@keyframes tooltip-fade-in {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.tooltip-date {
  font-size: 12px;
  font-weight: 500;
  fill: #595959;
  font-family: 'Noto Sans SC', sans-serif;
}

.tooltip-count {
  font-size: 12px;
  font-weight: 400;
  fill: #D18A8A;
  font-family: 'Noto Sans SC', sans-serif;
}

/* 分割线 */
.divider {
  height: 1px;
  background: #F0E6E6;
  margin: 16px auto;
  max-width: 90%;
}

/* 统计区 */
.stats-area {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  height: 80px;
  padding: 0 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-left {
  align-items: flex-start;
  min-width: 100px;
}

.stat-right {
  align-items: flex-end;
  min-width: 100px;
}

.stat-center {
  flex: 1;
}

.stat-title {
  font-size: 12px;
  font-weight: 400;
  color: #999;
  font-family: 'Noto Sans SC', sans-serif;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #E8B4B8;
  font-family: 'Playfair Display', serif;
}

/* 进度条 */
.progress-container {
  width: 100%;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-title {
  font-size: 12px;
  font-weight: 400;
  color: #999;
  font-family: 'Noto Sans SC', sans-serif;
}

.progress-percent {
  font-size: 12px;
  font-weight: 600;
  color: #E8B4B8;
  font-family: 'Noto Sans SC', sans-serif;
}

.progress-track {
  width: 100%;
  height: 6px;
  background: #F5F5F5;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #E8B4B8, #D18A8A);
  border-radius: 4px;
  transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

/* DOM Tooltip（备选，更灵活的定位） */
.dom-tooltip {
  position: absolute;
  background: #FFFFFF;
  border: 1px solid #F0E6E6;
  border-radius: 8px;
  padding: 8px 12px;
  pointer-events: none;
  transform: translate(-50%, -120%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  white-space: nowrap;
  z-index: 100;
  animation: tooltip-fade-in 0.15s ease;
}

.dom-tooltip-date {
  font-size: 12px;
  font-weight: 500;
  color: #595959;
  text-align: center;
}

.dom-tooltip-count {
  font-size: 12px;
  font-weight: 400;
  color: #D18A8A;
  text-align: center;
}

/* 响应式 */
@media (max-width: 600px) {
  .starry-night-card {
    padding: 20px 16px;
  }

  .chart-area {
    height: 280px;
  }

  .stats-area {
    flex-direction: column;
    height: auto;
    gap: 12px;
  }

  .stat-left,
  .stat-right {
    align-items: center;
    min-width: unset;
  }
}
</style>
