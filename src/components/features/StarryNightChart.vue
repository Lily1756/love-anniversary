<template>
  <div class="starry-container" role="region" aria-label="年度记忆星光图">
    <!-- 第1层：标题区域 - 完全保留，禁止修改 -->
    <div class="title-section">
      <div class="header-area">
        <h3 class="card-title">✨ 时间脉络</h3>
        <p class="card-subtitle">每一个写下情书的日子，都是星空里闪亮的一颗星</p>
      </div>
    </div>
    
    <!-- 第2层：星空画布区域 - S型分层布局 -->
    <div class="visualization-wrapper" ref="canvasRef">
      <!-- 星云光晕背景（垂直椭圆形） -->
      <div class="nebula-background"></div>
      
      <!-- 星系间连线（虚线） -->
      <div class="galaxy-canvas">
        <div 
          v-for="(connection, index) in connections" 
          :key="`conn-${index}`"
          class="galaxy-connection"
          :style="connection.style"
        />
        
        <!-- 卫星（小星星）- 每颗都是独立热区 -->
        <div
          v-for="galaxy in galaxies"
          :key="`satellites-${galaxy.month}`"
        >
          <div
            v-for="(satellite, sIndex) in galaxy.satellites"
            :key="`sat-${galaxy.month}-${sIndex}`"
            class="satellite-star"
            :class="{ 'is-hovered': hoveredSatellite && hoveredSatellite.id === satellite.id }"
            :style="{
              left: `${satellite.x}px`,
              top: `${satellite.y}px`,
              width: `${satellite.size}px`,
              height: `${satellite.size}px`,
              opacity: getSatelliteOpacity(galaxy.month, satellite.id),
              zIndex: hoveredSatellite && hoveredSatellite.id === satellite.id ? 100 : 10
            }"
            :data-satellite-id="satellite.id"
            @mouseenter="handleSatelliteHover(galaxy.month, satellite)"
            @mouseleave="handleSatelliteLeave"
            @click="handleSatelliteClick(satellite)"
          />
        </div>
        
        <!-- 星系核心（主星）- SVG五角星 -->
        <div
          v-for="galaxy in galaxies"
          :key="`core-${galaxy.month}`"
          class="galaxy-core"
          :class="{ 'active': activeMonth === galaxy.month }"
          :style="{
            left: `${galaxy.corePosition.x}px`,
            top: `${galaxy.corePosition.y}px`
          }"
          :data-count="getCountCategory(galaxy.count)"
          @mouseenter="onGalaxyHover(galaxy)"
          @mouseleave="onGalaxyLeave"
          @click="onGalaxyClick(galaxy)"
        >
          <svg viewBox="0 0 24 24" class="star-svg">
            <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" />
          </svg>
        </div>
        
        <!-- 悬浮提示（单颗星星） -->
        <div 
          v-if="hoveredSatellite" 
          class="satellite-tooltip"
          :style="tooltipStyle"
        >
          <div class="tooltip-header">
            <span class="tooltip-icon">✍️</span>
            <span class="tooltip-title">{{ hoveredSatellite.title }}</span>
          </div>
          <div class="tooltip-meta">{{ hoveredSatellite.date }} · {{ hoveredSatellite.weather }}</div>
          <div class="tooltip-excerpt">{{ hoveredSatellite.excerpt }}</div>
        </div>
        
        <!-- 悬浮提示（星系核心） -->
        <div 
          v-if="hoveredGalaxy && !hoveredSatellite" 
          class="galaxy-tooltip"
          :style="tooltipStyle"
        >
          <div class="tooltip-month">{{ hoveredGalaxy.month }}月</div>
          <div class="tooltip-count">{{ hoveredGalaxy.count }} 封情书</div>
          <div v-if="hoveredGalaxy.count > 0" class="tooltip-hint">点击查看详情</div>
          <div v-else class="tooltip-hint">这个月还没有情书哦</div>
        </div>
      </div>
    </div>

    <!-- 第3层：进度条区域 - 完全保留，禁止修改 -->
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  letters: { type: Array, default: () => [] }
})

const emit = defineEmits(['month-selected', 'date-selected'])

// ── 容器尺寸（响应式）───
const canvasRef = ref(null)
const containerSize = ref({ width: 800, height: 320 })

// ── 交互状态 ────────────────────────────────
const activeMonth = ref(null)
const hoveredGalaxy = ref(null)
const hoveredSatellite = ref(null)
const tooltipStyle = ref({})

// ── 月份数据聚合（包含具体情书信息）──────────────────
const monthsData = computed(() => {
  const data = {}
  for (let m = 1; m <= 12; m++) data[m] = { count: 0, letters: [] }
  
  for (const letter of props.letters) {
    if (letter.date) {
      const month = parseInt(letter.date.split('-')[1])
      if (month >= 1 && month <= 12) {
        data[month].count++
        data[month].letters.push({
          id: letter.id || `${letter.date}-${letter.title}`,
          title: letter.title || 'Untitled',
          date: letter.date,
          weather: letter.weather || '晴',
          excerpt: letter.excerpt || letter.content?.substring(0, 50) || '暂无摘要...'
        })
      }
    }
  }
  return data
})

// ── 星系数据计算（S型分层布局）─────────────────────
const galaxies = computed(() => {
  const containerWidth = containerSize.value.width
  const containerHeight = containerSize.value.height
  
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const monthData = monthsData.value[month] || { count: 0, letters: [] }
    const count = monthData.count
    const letters = monthData.letters
    
    // 计算核心位置（S型分层）
    const corePosition = calculateCorePositionS(month, containerWidth, containerHeight)
    
    // 生成卫星（传入具体情书信息）
    const satellites = generateSatellites(letters, corePosition, containerWidth, containerHeight)
    
    // 计算核心大小和亮度
    const coreSize = getCoreSize(count)
    const coreBrightness = getCoreBrightness(count)
    
    return {
      month,
      count,
      letters,
      corePosition,
      satellites,
      coreSize,
      coreBrightness
    }
  })
})

// ── 星系间连线计算（虚线）─────────────────────
const connections = computed(() => {
  const cons = []
  for (let i = 0; i < galaxies.value.length - 1; i++) {
    const current = galaxies.value[i]
    const next = galaxies.value[i + 1]
    
    // 只连接有情书的相邻月份
    if (current.count > 0 && next.count > 0) {
      const dx = next.corePosition.x - current.corePosition.x
      const dy = next.corePosition.y - current.corePosition.y
      const length = Math.sqrt(dx * dx + dy * dy)
      const angle = Math.atan2(dy, dx) * (180 / Math.PI)
      
      cons.push({
        style: {
          left: `${current.corePosition.x}px`,
          top: `${current.corePosition.y}px`,
          width: `${length}px`,
          transform: `rotate(${angle}deg)`,
          opacity: 0.3
        }
      })
    }
  }
  return cons
})

// ── S型分层布局算法 ─────────────────────────────
/**
 * 计算主星位置（S型分层）
 * @param {number} month - 月份（1-12）
 * @param {number} containerWidth - 容器宽度
 * @param {number} containerHeight - 容器高度
 * @returns {{x: number, y: number}} 核心位置
 */
function calculateCorePositionS(month, containerWidth, containerHeight) {
  // X轴：严格按时间流向，1月在最左，12月在最右
  const padding = 60 // 左右边距
  const availableWidth = containerWidth - padding * 2
  const x = padding + (month / 13) * availableWidth
  
  // Y轴：S型分层（奇数月上，偶数月下）
  if (month % 2 === 1) {
    // 奇数月（1,3,5,7,9,11）：上半区（20%-40%）
    const upperRange = containerHeight * 0.2 // 20%
    const upperMid = containerHeight * 0.3 // 30%
    const jitter = (Math.random() - 0.5) * upperRange
    return { x, y: upperMid + jitter }
  } else {
    // 偶数月（2,4,6,8,10,12）：下半区（60%-80%）
    const lowerRange = containerHeight * 0.2 // 20%
    const lowerMid = containerHeight * 0.7 // 70%
    const jitter = (Math.random() - 0.5) * lowerRange
    return { x, y: lowerMid + jitter }
  }
}

// ── 卫星生成算法（椭圆轨道 + 碰撞检测）────────────────────
/**
 * 生成卫星星位置（椭圆轨道分布）
 * @param {Array} letters - 情书数组
 * @param {{x: number, y: number}} corePosition - 主星坐标
 * @param {number} containerWidth - 容器宽度
 * @param {number} containerHeight - 容器高度
 * @returns {Array} 卫星数组
 */
function generateSatellites(letters, corePosition, containerWidth, containerHeight) {
  if (!letters || letters.length === 0) return []
  
  const satellites = []
  const minDistance = 20 // 卫星间最小距离（规范要求的20px）
  
  for (let i = 0; i < letters.length; i++) {
    const letter = letters[i]
    
    // 椭圆轨道参数（随机，避免正圆堆积）
    const ellipseA = 30 + Math.random() * 30 // 长半轴：30-60px
    const ellipseB = 20 + Math.random() * 20 // 短半轴：20-40px
    
    // 均匀分布角度 + 随机扰动
    const baseAngle = (i * 2 * Math.PI / letters.length)
    const angle = baseAngle + (Math.random() * 0.5 - 0.25)
    
    // 计算初始位置（椭圆轨道）
    let x = corePosition.x + Math.cos(angle) * ellipseA
    let y = corePosition.y + Math.sin(angle) * ellipseB
    
    // 碰撞检测：如果与其他卫星太近，向外推散
    let attempts = 0
    const maxAttempts = 30
    
    while (attempts < maxAttempts) {
      let tooClose = false
      
      for (const existing of satellites) {
        const dx = existing.x - x
        const dy = existing.y - y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < minDistance) {
          // 太近了！向外推散
          const pushAngle = Math.atan2(dy, dx)
          const pushDistance = minDistance - distance + 5
          x += Math.cos(pushAngle + Math.PI) * pushDistance
          y += Math.sin(pushAngle + Math.PI) * pushDistance
          tooClose = true
        }
      }
      
      if (!tooClose) break
      attempts++
    }
    
    // 边界检查
    x = Math.max(10, Math.min(containerWidth - 10, x))
    y = Math.max(10, Math.min(containerHeight - 10, y))
    
    // 卫星大小 - 8-12px（规范要求）
    const size = 8 + Math.random() * 4
    
    satellites.push({
      id: letter.id,
      x,
      y,
      size,
      title: letter.title,
      date: letter.date,
      weather: letter.weather,
      excerpt: letter.excerpt
    })
  }
  
  return satellites
}

// ── 卫星透明度计算（联动效果）─────────────────────
function getSatelliteOpacity(month, satId) {
  if (!hoveredSatellite.value) return 0.8 // 默认透明度0.8（规范要求）
  
  // 如果悬停的卫星属于同一个月，其他卫星微微变亮
  if (hoveredSatellite.value.month === month && hoveredSatellite.value.id !== satId) {
    return 0.9 // 同月其他卫星变亮
  }
  
  // 如果悬停的卫星不属于这一个月，这一个月的卫星保持半透明
  if (hoveredSatellite.value.month !== month) {
    return 0.6
  }
  
  return 0.8
}

// ── 核心大小计算 ──────────────────────────
function getCoreSize(count) {
  if (count === 0) return 20
  if (count <= 3) return 24
  if (count <= 6) return 28
  return 32
}

// ── 核心亮度计算 ──────────────────────────
function getCoreBrightness(count) {
  if (count === 0) return 0.3
  if (count <= 3) return 0.7
  if (count <= 6) return 0.85
  return 1
}

// ── 数量分类 ──────────────────────────
function getCountCategory(count) {
  if (count === 0) return "0"
  if (count <= 3) return "1-3"
  if (count <= 6) return "4-6"
  return "7+"
}

// ── 进度按不同日期数/365计算（固定分母，全局统计）──────────────
const progressData = computed(() => {
  if (!props.letters || props.letters.length === 0) {
    return { percentage: 0, count: 0, total: 365 }
  }

  // 提取所有不同的日期（YYYY-MM-DD格式）- 使用 Set 自动去重
  const dateSet = new Set()
  for (const letter of props.letters) {
    if (letter.date) {
      const dateObj = new Date(letter.date)
      if (!isNaN(dateObj.getTime())) {
        const dateStr = dateObj.toISOString().split('T')[0]
        dateSet.add(dateStr)
      }
    }
  }

  const uniqueDatesCount = dateSet.size
  const totalTargetDays = 365 // 固定分母：一年365天
  const percentage = Math.min(Math.round((uniqueDatesCount / totalTargetDays) * 100), 100)

  return {
    percentage,
    count: uniqueDatesCount,
    total: totalTargetDays
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

// ─── 交互处理（星系核心）────────────────────────────
function onGalaxyHover(galaxy) {
  if (hoveredSatellite.value) return // 如果正在悬停小星星，不显示星系提示
  hoveredGalaxy.value = galaxy
  
  // 计算提示框位置
  const tooltipX = galaxy.corePosition.x + 20
  const tooltipY = galaxy.corePosition.y - 40
  
  tooltipStyle.value = {
    left: `${tooltipX}px`,
    top: `${tooltipY}px`
  }
  
  activeMonth.value = galaxy.month
}

function onGalaxyLeave() {
  if (!hoveredSatellite.value) {
    hoveredGalaxy.value = null
  }
}

function onGalaxyClick(galaxy) {
  if (activeMonth.value === galaxy.month) {
    clearMonthFilter()
  } else {
    activeMonth.value = galaxy.month
    emit('month-selected', galaxy.month)
  }
}

// ─── 交互处理（小星星）────────────────────────────
function handleSatelliteHover(month, satellite) {
  hoveredSatellite.value = { ...satellite, month }
  hoveredGalaxy.value = null // 隐藏星系提示
  
  // 计算提示框位置（跟随鼠标或固定在小星星旁边）
  const tooltipX = satellite.x + 15
  const tooltipY = satellite.y - 10
  
  tooltipStyle.value = {
    left: `${tooltipX}px`,
    top: `${tooltipY}px`
  }
}

function handleSatelliteLeave() {
  hoveredSatellite.value = null
  // 不立即清除，保持显示一会儿
}

// ── 小星星点击跳转（弹性动画）───────────────────────
/**
 * 处理小星星点击
 * 1. 弹性动画反馈（scale(0.8) → scale(1)，200ms）
 * 2. 路由跳转到情书详情页
 */
function handleSatelliteClick(satellite) {
  if (!satellite || !satellite.id) return
  
  // 提供点击反馈（弹性动画）
  const element = document.querySelector(`[data-satellite-id="${satellite.id}"]`)
  if (element) {
    element.classList.add('is-clicked')
    setTimeout(() => {
      element.classList.remove('is-clicked')
    }, 200) // 200ms弹性动画（规范要求）
  }
  
  // 使用 Vue Router 跳转（和情书卡片一样）
  router.push({ name: 'LetterDetail', params: { id: satellite.id } })
}

// ─── 清除筛选 ────────────────────────────
function clearMonthFilter() {
  activeMonth.value = null
  emit('month-selected', null)
}

// ─── 响应式监听容器尺寸 ──────────────────────
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
  /* 三层flex布局 */
  display: flex;
  flex-direction: column;
  /* 确保容器有足够高度 */
  min-height: 500px;
}

/* 第1层：标题区域 - 完全保留，禁止修改 */
.title-section {
  flex-shrink: 0;
  z-index: 10;
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

/* 第2层：星空画布区域 - S型分层布局 */
.visualization-wrapper {
  /* 尺寸约束 */
  flex: 1 1 auto;        /* 可伸缩，占据可用空间 */
  min-height: 300px;     /* 最小高度，确保可视化区域可见 */
  max-height: 400px;     /* 最大高度，防止过度扩张 */
  
  /* 定位约束 */
  position: relative;    /* 为绝对定位的子元素提供参考 */
  overflow: hidden;      /* 防止内容溢出到其他层 */
  
  /* 视觉分隔 */
  background: var(--bg-surface, #FAF8F5); /* 使用主题背景色 */
  border-radius: 12px;   /* 圆角，与设计协调 */
  margin: 16px 0;        /* 与上下层间距 */
}

/* 星空画布 - 确保只在父容器内绘制 */
.galaxy-canvas {
  /* 确保只在父容器内绘制 */
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* 不要设置 z-index，避免覆盖其他层 */
}

/* 星云光晕背景（垂直椭圆形） */
.nebula-background {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;   /* 占容器宽度的80% */
  height: 90%;  /* 占容器高度的90% */
  
  /* 三层径向渐变 - 莫兰迪色系 */
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

/* 呼吸动画定义 */
@keyframes nebula-breathe {
  0%, 100% { 
    opacity: 0.03; /* 最淡状态 */
  }
  50% { 
    opacity: 0.07; /* 最明显状态（仍非常淡） */
  }
}

/* 星系核心 - SVG五角星 */
.galaxy-core {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 24px;  /* 基础大小 */
  height: 24px;
  cursor: pointer;
  z-index: 20;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.star-svg {
  width: 100%;
  height: 100%;
  fill: #D4A5A5;  /* 莫兰迪粉 */
  filter: drop-shadow(0 0 8px rgba(212, 165, 165, 0.6)); /* 微弱粉色外发光 */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 根据情书数量动态调整 */
.galaxy-core[data-count="0"] {
  opacity: 0.3;
  filter: grayscale(0.8);
  transform: translate(-50%, -50%) scale(0.8);
}

.galaxy-core[data-count="0"] .star-svg {
  fill: #999;
}

.galaxy-core[data-count="1-3"] .star-svg {
  filter: drop-shadow(0 0 10px rgba(212, 165, 165, 0.7));
}

.galaxy-core[data-count="4-6"] .star-svg {
  filter: drop-shadow(0 0 15px rgba(212, 165, 165, 0.8));
}

.galaxy-core[data-count="7+"] .star-svg {
  filter: drop-shadow(0 0 20px rgba(212, 165, 165, 0.9));
}

/* 悬停效果 */
.galaxy-core:hover {
  transform: translate(-50%, -50%) scale(1.4);
  z-index: 30;
}

.galaxy-core:hover .star-svg {
  fill: #E8D6D7;
  filter: drop-shadow(0 0 25px rgba(212, 165, 165, 0.9));
}

/* 激活状态（月份筛选） */
.galaxy-core.active {
  transform: translate(-50%, -50%) scale(1.6);
  z-index: 40;
  animation: pulse-active 2s infinite;
}

.galaxy-core.active .star-svg {
  fill: #F0B8B8;
  filter: drop-shadow(0 0 30px rgba(212, 165, 165, 1));
}

@keyframes pulse-active {
  0%, 100% {
    filter: drop-shadow(0 0 10px rgba(212, 165, 165, 0.6));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(212, 165, 165, 0.9));
  }
}

/* 卫星（小星星）- 四角星芒 */
.satellite-star {
  position: absolute;
  transform: translate(-50%, -50%);
  
  /* 四角星芒形状（clip-path实现） */
  background: radial-gradient(circle, rgba(212, 165, 165, 0.9) 0%, rgba(212, 165, 165, 0.6) 50%, transparent 70%);
  border-radius: 50%; /* 基础是圆，通过 clip-path 切角 */
  
  /* 发光效果 */
  box-shadow: 
    0 0 4px rgba(212, 165, 165, 0.4),
    0 0 8px rgba(212, 165, 165, 0.2);
  
  /* 呼吸动画 */
  animation: satellite-breathe 3s ease-in-out infinite;
  animation-delay: calc(var(--index, 0) * 0.2s);
  
  /* 过渡效果 */
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  /* 确保可以点击 */
  pointer-events: auto;
  cursor: pointer;
  z-index: 10;
}

/* 四角星芒效果（部分卫星） */
.satellite-star:nth-child(3n) {
  background: none;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  background: rgba(212, 165, 165, 0.7);
  border-radius: 0;
}

/* 悬停效果（魔法光晕） */
.satellite-star.is-hovered {
  transform: translate(-50%, -50%) scale(1.5); /* 悬停放大1.5倍（规范要求） */
  opacity: 1 !important;
  box-shadow: 
    0 0 15px rgba(212, 165, 165, 0.8),
    0 0 30px rgba(212, 165, 165, 0.4);
  z-index: 100;
}

/* 点击效果（弹性动画） */
.satellite-star.is-clicked {
  animation: click-elastic 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* 弹性动画定义（规范要求的200ms） */
@keyframes click-elastic {
  0% { 
    transform: translate(-50%, -50%) scale(1); 
  }
  50% { 
    transform: translate(-50%, -50%) scale(0.8); /* 按下效果 */
  }
  100% { 
    transform: translate(-50%, -50%) scale(1); /* 弹起效果 */
  }
}

/* 呼吸动画 */
@keyframes satellite-breathe {
  0%, 100% { 
    opacity: 0.8; /* 默认透明度0.8（规范要求） */
    transform: translate(-50%, -50%) scale(1); 
  }
  50% { 
    opacity: 1; /* 悬停时亮度提升20% */
    transform: translate(-50%, -50%) scale(1.05); 
  }
}

/* 星系间连线（虚线） */
.galaxy-connection {
  position: absolute;
  height: 1px;
  background: repeating-linear-gradient(
    90deg,
    rgba(212, 165, 165, 0.3) 0px,
    rgba(212, 165, 165, 0.3) 5px,
    transparent 5px,
    transparent 10px
  ); /* 虚线效果 */
  transform-origin: 0 0;
  z-index: 5;
  pointer-events: none;
}

/* 悬浮提示（单颗星星）- 毛玻璃卡片（规范要求的样式） */
.satellite-tooltip {
  position: absolute;
  background: rgba(255, 255, 255, 0.95); /* 白色半透明背景 */
  backdrop-filter: blur(10px); /* 毛玻璃效果 */
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(212, 165, 165, 0.2); /* 极细边框 */
  border-radius: 8px; /* 圆角8px（规范要求） */
  padding: 10px 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); /* 投影规范 */
  font-family: 'Noto Sans SC', sans-serif;
  animation: tooltip-in 0.2s ease;
  pointer-events: none;
  z-index: 1000;
  max-width: 200px;
  white-space: normal;
}

.tooltip-icon {
  font-size: 14px;
  margin-bottom: 4px;
}

.tooltip-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.tooltip-title {
  font-size: 13px;
  font-weight: 600;
  color: #595959;
  margin-bottom: 3px;
  line-height: 1.3;
}

.tooltip-meta {
  font-size: 11px;
  color: #999;
  margin-bottom: 5px;
}

.tooltip-excerpt {
  font-size: 11px;
  color: #C9A8A9;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 悬浮提示（星系核心） */
.galaxy-tooltip {
  position: absolute;
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
  z-index: 100;
  white-space: nowrap;
}

.tooltip-month {
  font-size: 12px;
  font-weight: 600;
  color: #595959;
  margin-bottom: 3px;
}

.tooltip-count {
  font-size: 11px;
  color: #C9A8A9;
  line-height: 1.4;
}

.tooltip-hint {
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
  
  .satellite-tooltip {
    max-width: 150px;
  }
}
</style>
