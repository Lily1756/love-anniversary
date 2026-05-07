<template>
  <div class="time-calendar">
    <!-- 标题区域 -->
    <div class="calendar-header">
      <h3 class="calendar-title">时间脉络</h3>
      <p class="calendar-subtitle">历史上的今天</p>
    </div>

    <!-- 日历热力图 -->
    <div class="heatmap-container">
      <div
        v-for="month in months"
        :key="month"
        class="month-column"
      >
        <div class="month-label">{{ monthLabels[month - 1] }}</div>
        <div class="days-grid">
          <div
            v-for="day in getDaysInMonth(month)"
            :key="`${month}-${day}`"
            class="day-cell"
            :class="{
              'is-lit': isDayLit(month, day),
              'is-today': isToday(month, day),
              'is-future': isFutureDate(month, day)
            }"
            :style="getDayStyle(month, day)"
            @mouseenter="showTooltip($event, month, day)"
            @mouseleave="hideTooltip"
            @click="handleDayClick(month, day)"
          ></div>
        </div>
      </div>
    </div>

    <!-- 图例 -->
    <div class="legend">
      <span class="legend-label">少</span>
      <div class="legend-gradient"></div>
      <span class="legend-label">多</span>
    </div>

    <!-- 进度条区域 -->
    <div class="progress-section">
      <div class="progress-header">
        <span class="progress-title">每年今日故事完成度</span>
        <span class="progress-percentage">{{ progressPercentage }}%</span>
      </div>
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
      <div class="progress-stats">{{ litDaysCount }} / 366 天</div>
    </div>

    <!-- Tooltip -->
    <Teleport to="body">
      <div
        v-if="tooltip.visible"
        class="calendar-tooltip"
        :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }"
      >
        <div class="tooltip-date">{{ tooltip.month }}月{{ tooltip.day }}日</div>
        <div v-if="tooltip.count > 0" class="tooltip-content">
          <p class="tooltip-count">写过 {{ tooltip.count }} 封情书</p>
          <p class="tooltip-years">{{ tooltip.years.join('、') }}年</p>
        </div>
        <div v-else class="tooltip-content">
          <p class="tooltip-empty">暂无情书记录</p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Letter } from '@/types'

const props = defineProps<{
  letters: Letter[]
}>()

const emit = defineEmits<{
  'date-selected': [monthDay: string]
}>()

// 月份标签
const monthLabels = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月'
]

const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

// Tooltip 状态
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  month: 0,
  day: 0,
  count: 0,
  years: [] as number[]
})

// 获取某月的天数
const getDaysInMonth = (month: number) => {
  // 使用闰年天数（366天标准）
  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return daysInMonth[month - 1]
}

// 从情书数据中提取所有不同的"月-日"组合及其对应年份
const lettersByMonthDay = computed(() => {
  const map = new Map<string, number[]>()

  props.letters.forEach(letter => {
    const dateObj = new Date(letter.date)
    const month = dateObj.getMonth() + 1
    const day = dateObj.getDate()
    const year = dateObj.getFullYear()
    const key = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`

    if (!map.has(key)) {
      map.set(key, [])
    }
    if (!map.get(key)!.includes(year)) {
      map.get(key)!.push(year)
    }
  })

  return map
})

// 获取所有不同的"月-日"组合
const uniqueMonthDayPairs = computed(() => {
  return Array.from(lettersByMonthDay.value.keys())
})

// 检查某天是否被点亮
const isDayLit = (month: number, day: number) => {
  const key = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  return lettersByMonthDay.value.has(key)
}

// 检查是否是今天
const isToday = (month: number, day: number) => {
  const today = new Date()
  return today.getMonth() + 1 === month && today.getDate() === day
}

// 检查是否是未来日期（当前年份之外的不过滤，只过滤当年未来日期）
const isFutureDate = (month: number, day: number) => {
  const today = new Date()
  const currentYear = today.getFullYear()
  // 只标记当前年份中未来的日期
  const checkDate = new Date(currentYear, month - 1, day)
  return checkDate > today
}

// 获取日期单元格样式
const getDayStyle = (month: number, day: number) => {
  const key = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  const isLit = lettersByMonthDay.value.has(key)

  if (isLit) {
    return {
      backgroundColor: 'var(--color-primary)',
      borderColor: 'var(--color-primary-dark)'
    }
  }

  return {
    backgroundColor: 'var(--bg-surface)',
    borderColor: 'var(--border-light)'
  }
}

// 计算点亮天数
const litDaysCount = computed(() => {
  return uniqueMonthDayPairs.value.length
})

// 计算进度百分比
const progressPercentage = computed(() => {
  return Math.round((litDaysCount.value / 366) * 100)
})

// 显示 Tooltip
const showTooltip = (event: MouseEvent, month: number, day: number) => {
  const key = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  const years = lettersByMonthDay.value.get(key) || []

  const rect = (event.target as HTMLElement).getBoundingClientRect()

  // 使用 fixed 定位，直接相对于 viewport
  const tooltipWidth = 180
  let x = rect.left + rect.width / 2 - tooltipWidth / 2
  let y = rect.top - 60

  // 确保 tooltip 不超出视口
  if (x < 10) x = 10
  if (x + tooltipWidth > window.innerWidth - 10) {
    x = window.innerWidth - tooltipWidth - 10
  }
  if (y < 10) {
    y = rect.bottom + 10
  }

  tooltip.value = {
    visible: true,
    x,
    y,
    month,
    day,
    count: years.length,
    years
  }
}

// 隐藏 Tooltip
const hideTooltip = () => {
  tooltip.value.visible = false
}

// 处理日期点击
const handleDayClick = (month: number, day: number) => {
  const key = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`

  // 只处理点亮的日期
  if (lettersByMonthDay.value.has(key)) {
    emit('date-selected', key)
  }
}

// 监听滚动，隐藏 Tooltip
const handleScroll = () => {
  hideTooltip()
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.time-calendar {
  background: var(--bg-container);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  margin-bottom: var(--space-xl);
  box-shadow: var(--shadow-base);
  border: 1px solid var(--border-light);
}

.calendar-header {
  margin-bottom: var(--space-lg);
  text-align: center;
}

.calendar-title {
  font-size: var(--font-size-2xl);
  color: var(--text-primary);
  margin: 0 0 var(--space-xs) 0;
  font-weight: var(--font-weight-semibold);
}

.calendar-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

/* 热力图容器 */
.heatmap-container {
  display: flex;
  gap: var(--space-sm);
  overflow-x: auto;
  padding: var(--space-sm) 0;
  margin-bottom: var(--space-md);
}

.month-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 60px;
}

.month-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-bottom: var(--space-xs);
  font-weight: var(--font-weight-medium);
}

.days-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.day-cell {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
}

.day-cell:hover {
  transform: scale(1.2);
  z-index: 1;
  box-shadow: var(--shadow-md);
}

.day-cell.is-lit {
  border-color: var(--color-primary-dark);
}

.day-cell.is-lit:hover {
  background-color: var(--color-primary-light) !important;
}

.day-cell.is-today {
  box-shadow: 0 0 0 2px var(--color-primary);
}

.day-cell.is-future {
  opacity: 0.3;
  cursor: default;
}

.day-cell.is-future:hover {
  transform: none;
  box-shadow: none;
}

/* 图例 */
.legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.legend-label {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.legend-gradient {
  width: 120px;
  height: 8px;
  border-radius: var(--radius-full);
  background: linear-gradient(
    to right,
    var(--bg-surface),
    var(--color-primary-light),
    var(--color-primary),
    var(--color-primary-dark)
  );
}

/* 进度条区域 */
.progress-section {
  text-align: center;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.progress-title {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

.progress-percentage {
  font-size: var(--font-size-xl);
  color: var(--color-primary);
  font-weight: var(--font-weight-bold);
}

.progress-bar {
  width: 100%;
  height: 16px;
  background: var(--bg-surface);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--space-sm);
  box-shadow: var(--shadow-inner);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--color-primary-light),
    var(--color-primary),
    var(--color-primary-dark)
  );
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
  box-shadow: 0 0 10px rgba(201, 168, 169, 0.5);
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  border-radius: var(--radius-full);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-stats {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* Tooltip */
.calendar-tooltip {
  position: fixed;
  background: var(--bg-container);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  pointer-events: none;
  min-width: 150px;
  text-align: center;
}

.tooltip-date {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-xs);
}

.tooltip-content {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.tooltip-count {
  margin: 0 0 var(--space-xs) 0;
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}

.tooltip-years {
  margin: 0;
  font-size: var(--font-size-xs);
}

.tooltip-empty {
  margin: 0;
  color: var(--text-tertiary);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .heatmap-container {
    gap: var(--space-xs);
  }

  .month-column {
    min-width: 44px;
  }

  .day-cell {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 768px) {
  .time-calendar {
    padding: var(--space-md);
  }

  .heatmap-container {
    gap: 6px;
    padding-bottom: var(--space-md);
  }

  .month-column {
    min-width: 36px;
  }

  .month-label {
    font-size: 10px;
  }

  .day-cell {
    width: 18px;
    height: 18px;
    border-radius: 3px;
  }

  .days-grid {
    gap: 1.5px;
  }

  .calendar-title {
    font-size: var(--font-size-xl);
  }

  .progress-header {
    flex-direction: column;
    gap: var(--space-xs);
  }
}

@media (max-width: 480px) {
  .heatmap-container {
    flex-wrap: wrap;
    justify-content: center;
    gap: 4px;
  }

  .month-column {
    min-width: 30px;
  }

  .month-label {
    font-size: 9px;
  }

  .day-cell {
    width: 14px;
    height: 14px;
    border-radius: 2px;
  }

  .days-grid {
    gap: 1px;
  }

  .legend-gradient {
    width: 80px;
    height: 6px;
  }
}
</style>
