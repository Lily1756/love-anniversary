<template>
  <button
    class="music-player-btn"
    :class="{ playing: isPlaying }"
    :title="isPlaying ? '点击暂停音乐' : '点击播放音乐'"
    @click="togglePlay"
  >
    <svg v-if="isPlaying" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
    <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  </button>

  <audio
    ref="audioRef"
    preload="auto"
    @canplay="onCanPlay"
    @ended="onEnded"
    @timeupdate="onTimeUpdate"
  >
    <source src="/music/once.mp3" type="audio/mpeg" />
  </audio>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const audioRef = ref<HTMLAudioElement>()
const isPlaying = ref(false)
const audioReady = ref(false)

const LS_PLAYING = 'musicPlaying'
const LS_TIME = 'musicCurrentTime'

onMounted(() => {
  const savedPlaying = localStorage.getItem(LS_PLAYING) === 'true'
  const savedTime = parseFloat(localStorage.getItem(LS_TIME) || '0')

  if (audioRef.value) {
    if (savedTime > 0) {
      audioRef.value.currentTime = savedTime
    }
    if (savedPlaying) {
      // 尝试自动播放（可能被浏览器阻止）
      audioRef.value.play().catch(() => {
        isPlaying.value = false
      })
    }
  }
})

function onCanPlay() {
  audioReady.value = true
}

function togglePlay() {
  if (!audioRef.value || !audioReady.value) {
    audioRef.value?.load()
    return
  }

  if (isPlaying.value) {
    audioRef.value.pause()
    isPlaying.value = false
    localStorage.setItem(LS_PLAYING, 'false')
    localStorage.setItem(LS_TIME, String(audioRef.value.currentTime || 0))
  } else {
    audioRef.value.play().then(() => {
      isPlaying.value = true
      localStorage.setItem(LS_PLAYING, 'true')
    }).catch(() => {
      // 播放失败
    })
  }
}

function onEnded() {
  isPlaying.value = false
  localStorage.setItem(LS_PLAYING, 'false')
  localStorage.setItem(LS_TIME, '0')
  if (audioRef.value) {
    audioRef.value.currentTime = 0
  }
}

function onTimeUpdate() {
  if (audioRef.value && audioRef.value.duration) {
    localStorage.setItem(LS_TIME, String(audioRef.value.currentTime))
  }
}
</script>

<style scoped>
.music-player-btn {
  position: fixed;
  left: var(--space-lg);
  bottom: calc(var(--nav-height) + var(--space-lg));
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #D4B5B5, #E2C5C5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(212, 181, 181, 0.5);
  transition: all 0.3s ease;
  z-index: 900;
  -webkit-tap-highlight-color: transparent;
}

.music-player-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 25px rgba(212, 181, 181, 0.6);
}

.music-player-btn:active {
  transform: scale(0.95);
}

.music-player-btn.playing {
  background: linear-gradient(135deg, #E2C5C5, #D4B5B5);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 4px 20px rgba(212, 181, 181, 0.5);
  }
  50% {
    box-shadow: 0 4px 30px rgba(212, 181, 181, 0.8);
  }
}

@media (max-width: 768px) {
  .music-player-btn {
    left: var(--space-md);
    bottom: calc(var(--nav-height-mobile) + var(--space-md));
    width: 44px;
    height: 44px;
  }
}
</style>
