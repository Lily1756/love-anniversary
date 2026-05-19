<template>
  <!-- 隐藏的 audio 元素 -->
  <audio
    ref="audioRef"
    :src="store.currentSong?.url"
    :loop="store.loopMode === 'one'"
    preload="auto"
    crossorigin="anonymous"
    @canplay="onCanPlay"
    @canplaythrough="onCanPlayThrough"
    @ended="onEnded"
    @timeupdate="onTimeUpdate"
    @error="onError"
    @waiting="onWaiting"
    @stalled="onStalled"
    @suspend="onSuspend"
    @progress="onProgress"
  />

  <!-- 播放器浮动卡片 -->
  <div class="music-player" :class="{ expanded: isExpanded }">
    <!-- 主按钮（始终可见：播放/暂停） -->
    <button
      class="music-btn play-toggle"
      :class="{ playing: store.isPlaying }"
      :title="store.isPlaying ? '暂停' : '播放'"
      @click="togglePlay"
      aria-label="播放/暂停"
    >
      <!-- 暂停图标 -->
      <svg v-if="store.isPlaying" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <rect x="6" y="4" width="4" height="16" rx="1" />
        <rect x="14" y="4" width="4" height="16" rx="1" />
      </svg>
      <!-- 播放图标 -->
      <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
    </button>

    <!-- 展开后的控件区 -->
    <transition name="expand">
      <div v-if="isExpanded" class="controls">
        <!-- 歌曲信息 -->
        <div class="song-info" @click="toggleExpand">
          <span class="song-name">{{ store.currentSong?.name }}</span>
          <span class="artist-name">{{ store.currentSong?.artist }}</span>
        </div>

        <!-- 进度条 -->
        <div class="progress-wrap">
          <input
            type="range"
            class="progress-bar"
            :value="progress"
            min="0"
            max="100"
            step="0.1"
            @input="seek"
            aria-label="播放进度"
          />
          <div class="time-row">
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ formatTime(duration) }}</span>
          </div>
        </div>

        <!-- 控制按钮行 -->
        <div class="btn-row">
          <!-- 上一首 -->
          <button class="music-btn ctrl-btn" title="上一首" @click="handlePrev" aria-label="上一首">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
            </svg>
          </button>

          <!-- 下一首 -->
          <button class="music-btn ctrl-btn" title="下一首" @click="handleNext" aria-label="下一首">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zm2.5-6 6-4.2v8.4L8.5 12zM16 6h2v12h-2z"/>
            </svg>
          </button>

          <!-- 循环模式 -->
          <button
            class="music-btn ctrl-btn loop-btn"
            :class="`loop-${store.loopMode}`"
            :title="store.loopModeLabel"
            @click="store.toggleLoopMode()"
            aria-label="切换循环模式"
          >
            <!-- 列表循环 🔁 -->
            <svg v-if="store.loopMode === 'all'" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
            </svg>
            <!-- 单曲循环 🔂 -->
            <svg v-else-if="store.loopMode === 'one'" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
              <text x="10" y="14" font-size="6" fill="currentColor">1</text>
            </svg>
            <!-- 不循环 ↪️（单向箭头） -->
            <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="currentColor" opacity="0.4">
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
            </svg>
          </button>
        </div>
      </div>
    </transition>

    <!-- 展开/收起触发器（点击歌名区域外的播放按钮旁边的小箭头） -->
    <button
      class="music-btn expand-btn"
      :title="isExpanded ? '收起' : '展开播放列表'"
      @click="toggleExpand"
      aria-label="展开/收起"
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"
           :style="{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }">
        <path d="M7 10l5 5 5-5z"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useMusicStore } from '@/stores/musicStore'

const store = useMusicStore()

const audioRef = ref<HTMLAudioElement>()
const audioReady = ref(false)
const isExpanded = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const progress = ref(0)

// ─── 歌曲切换时重新加载并播放 ──────────────────────────────
watch(
  () => store.currentSong?.url,
  async (newUrl) => {
    if (!newUrl) return
    audioReady.value = false
    lastBufferCheckTime.value = 0
    await nextTick()
    if (audioRef.value) {
      audioRef.value.load()
      if (store.isPlaying) {
        audioRef.value.play().catch(() => store.setPlaying(false))
      }
    }
  }
)

// ─── 缓冲状态追踪 ────────────────────────────────────────
const lastBufferCheckTime = ref(0)

function logBufferStatus(prefix: string = '') {
  if (!audioRef.value) return
  const audio = audioRef.value
  const buffered = audio.buffered
  if (buffered.length > 0) {
    const bufferedEnd = buffered.end(buffered.length - 1)
    const bufferRemaining = bufferedEnd - audio.currentTime
    console.log(`${prefix} 缓冲: 当前位置 ${audio.currentTime.toFixed(1)}s, 已缓冲至 ${bufferedEnd.toFixed(1)}s, 剩余缓冲 ${bufferRemaining.toFixed(1)}s`)
  }
}

function onCanPlay() {
  audioReady.value = true
  duration.value = audioRef.value?.duration || 0
  logBufferStatus('✅ onCanPlay')
  if (store.isPlaying) {
    audioRef.value?.play().catch(() => store.setPlaying(false))
  }
}

function onCanPlayThrough() {
  console.log('🎵 onCanPlayThrough - 可以流畅播放')
}

function onWaiting() {
  console.warn('🔴 onWaiting - 播放器等待数据，可能即将卡顿')
  logBufferStatus('🔴 waiting')
}

function onStalled() {
  console.warn('🛑 onStalled - 数据传输中断')
  logBufferStatus('🛑 stalled')
}

function onSuspend() {
  console.log('💤 onSuspend - 播放器暂停加载')
}

function onProgress() {
  // 节流：每 3 秒检查一次缓冲状态
  const now = Date.now()
  if (now - lastBufferCheckTime.value > 3000) {
    lastBufferCheckTime.value = now
    logBufferStatus('📊 progress')
  }
}

function onEnded() {
  if (store.loopMode === 'one') return // audio loop 属性已处理
  store.nextSong()
  // 等 src 变化后触发 watch 自动播放
}

function onTimeUpdate() {
  if (!audioRef.value) return
  currentTime.value = audioRef.value.currentTime
  duration.value = audioRef.value.duration || 0
  if (duration.value > 0) {
    progress.value = (currentTime.value / duration.value) * 100
  }

  // 智能缓冲检查：当缓冲不足时发出警告
  const buffered = audioRef.value.buffered
  if (buffered.length > 0) {
    const bufferedEnd = buffered.end(buffered.length - 1)
    const bufferRemaining = bufferedEnd - audioRef.value.currentTime
    // 如果剩余缓冲 < 2 秒，说明可能即将卡顿
    if (bufferRemaining < 2 && bufferRemaining > 0) {
      console.warn(`⚠️ 缓冲不足警告: 剩余缓冲 ${bufferRemaining.toFixed(1)}s，可能即将卡顿`)
    }
  }
}

function onError() {
  audioReady.value = false
  store.setPlaying(false)
}

// ─── 播放控制 ──────────────────────────────────────────────
function togglePlay() {
  if (!audioRef.value) return
  if (!audioReady.value) {
    audioRef.value.load()
    return
  }
  if (store.isPlaying) {
    audioRef.value.pause()
    store.setPlaying(false)
  } else {
    audioRef.value.play()
      .then(() => store.setPlaying(true))
      .catch(() => store.setPlaying(false))
  }
}

function handlePrev() {
  store.prevSong()
}

function handleNext() {
  store.nextSong()
}

function seek(e: Event) {
  const target = e.target as HTMLInputElement
  const pct = parseFloat(target.value)
  if (audioRef.value && duration.value > 0) {
    audioRef.value.currentTime = (pct / 100) * duration.value
  }
}

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

// ─── 工具函数 ──────────────────────────────────────────────
function formatTime(sec: number): string {
  if (!sec || isNaN(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}
</script>

<style scoped>
/* ── 播放器容器 ── */
.music-player {
  position: fixed;
  left: var(--space-lg, 20px);
  bottom: calc(var(--nav-height, 60px) + var(--space-lg, 20px));
  z-index: 900;
  display: flex;
  align-items: flex-end;
  gap: 6px;
  /* 防止移动端点击高亮 */
  -webkit-tap-highlight-color: transparent;
}

/* 展开时增加宽度过渡 */
.music-player.expanded .play-toggle {
  align-self: flex-end;
  margin-bottom: 4px;
}

/* ── 通用按钮基础样式 ── */
.music-btn {
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.25s ease;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}

/* ── 主播放/暂停按钮 ── */
.play-toggle {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #D4B5B5, #E2C5C5);
  color: white;
  box-shadow: 0 4px 20px rgba(212, 181, 181, 0.5);
}
.play-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 25px rgba(212, 181, 181, 0.65);
}
.play-toggle:active {
  transform: scale(0.95);
}
.play-toggle.playing {
  background: linear-gradient(135deg, #E2C5C5, #D4B5B5);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 4px 20px rgba(212, 181, 181, 0.5); }
  50%       { box-shadow: 0 4px 30px rgba(212, 181, 181, 0.82); }
}

/* ── 展开箭头按钮 ── */
.expand-btn {
  width: 22px;
  height: 22px;
  background: rgba(212, 181, 181, 0.25);
  color: #a08080;
  align-self: flex-end;
  margin-bottom: 13px;
}
.expand-btn:hover {
  background: rgba(212, 181, 181, 0.45);
}

/* ── 展开面板 ── */
.controls {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(212, 181, 181, 0.3);
  border-radius: 16px;
  padding: 12px 14px;
  width: 200px;
  box-shadow: 0 8px 32px rgba(180, 140, 140, 0.18);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ── 歌曲信息 ── */
.song-info {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  user-select: none;
}
.song-name {
  font-size: 13px;
  font-weight: 600;
  color: #5a3e3e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.artist-name {
  font-size: 11px;
  color: #a08080;
  margin-top: 2px;
}

/* ── 进度条 ── */
.progress-wrap {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.progress-bar {
  width: 100%;
  height: 4px;
  appearance: none;
  -webkit-appearance: none;
  background: rgba(212, 181, 181, 0.3);
  border-radius: 2px;
  cursor: pointer;
  outline: none;
}
.progress-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #D4B5B5;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(180, 140, 140, 0.4);
}
.progress-bar::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #D4B5B5;
  cursor: pointer;
  border: none;
}
.time-row {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #b09090;
}

/* ── 控制按钮行 ── */
.btn-row {
  display: flex;
  justify-content: center;
  gap: 10px;
}
.ctrl-btn {
  width: 34px;
  height: 34px;
  background: rgba(212, 181, 181, 0.15);
  color: #7a5555;
}
.ctrl-btn:hover {
  background: rgba(212, 181, 181, 0.35);
  transform: scale(1.08);
}
.ctrl-btn:active {
  transform: scale(0.94);
}

/* 循环模式激活状态 */
.loop-btn.loop-all,
.loop-btn.loop-one {
  background: rgba(212, 181, 181, 0.3);
  color: #c27878;
}
.loop-btn.loop-none {
  background: transparent;
  color: #c0a0a0;
}

/* ── 展开动画 ── */
.expand-enter-active,
.expand-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
  transform-origin: bottom left;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: scale(0.92) translateY(6px);
}

/* ── 移动端适配 ── */
@media (max-width: 768px) {
  .music-player {
    left: var(--space-md, 14px);
    bottom: calc(var(--nav-height-mobile, 56px) + var(--space-md, 14px));
  }
  .play-toggle {
    width: 44px;
    height: 44px;
  }
  .controls {
    width: 182px;
    padding: 10px 12px;
  }
}
</style>
