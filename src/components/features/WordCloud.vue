<template>
  <section class="wordcloud-section" :class="{ 'is-loading': isLoading }">
    <div class="wordcloud-header">
      <h3 class="section-title">情书关键词云</h3>
      <p class="section-subtitle">点击关键词，快速定位相关情书</p>
    </div>

    <div ref="wordcloudContainer" class="wordcloud-container"></div>

    <div v-if="isLoading" class="wordcloud-skeleton">
      <div
        v-for="i in 20"
        :key="i"
        class="skeleton-item"
        :style="{
          width: Math.random() * 60 + 20 + 'px',
          height: '20px',
          borderRadius: '10px'
        }"
      ></div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps<{
  words: { text: string; weight: number; id?: string }[]
  width?: number
  height?: number
}>()

const emit = defineEmits<{
  (e: 'wordClick', id: string): void
}>()

const wordcloudContainer = ref<HTMLElement | null>(null)
const wordcloudInstance = ref<unknown>(null)
const isLoading = ref(false)

const WORD_COLORS = ['#f9d5e5', '#eeac99', '#e06377', '#d4a5a5', '#e8b4b8']

function handleResize() {
  initWordCloud()
}

async function initWordCloud() {
  if (!wordcloudContainer.value || props.words.length === 0) return

  isLoading.value = true

  // @ts-ignore - wordcloud 无类型声明
  const WordCloud = (await import('wordcloud')).default

  if (wordcloudInstance.value) {
    wordcloudContainer.value.innerHTML = ''
  }

  const wordList: [string, number][] = props.words.map(w => [w.text, w.weight])

  const options = {
    list: wordList,
    gridSize: Math.round(16 * 800 / 1024),
    weightFactor: (size: number) => {
      const baseSize = window.innerWidth < 768 ? 8 : 12
      return Math.pow(size, 0.8) * baseSize
    },
    fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    color: (word: string, weight: number) => {
      const index = Math.min(Math.floor(weight / 5), WORD_COLORS.length - 1)
      return WORD_COLORS[index] ?? WORD_COLORS[0]
    },
    backgroundColor: 'transparent',
    rotateRatio: 0.5,
    rotationSteps: 2,
    shape: 'circle',
    ellipticity: 0.9,
    drawOutOfBound: false,
    shrinkToFit: true,
    click: (item: [string, number]) => {
      console.log('🎯 词云点击事件触发:', item)
      const clickedText = item[0]
      const word = props.words.find(w => w.text === clickedText)
      console.log('   匹配的词语:', word)
      if (word?.id) {
        console.log('   发出 wordClick 事件, id:', word.id)
        emit('wordClick', word.id)
        // 同时在组件内也尝试滚动
        const target = document.getElementById(`letter-${word.id}`)
        if (target) {
          console.log('   找到情书卡片，开始滚动...')
          target.scrollIntoView({ behavior: 'smooth', block: 'center' })
          target.classList.add('highlight')
          setTimeout(() => target.classList.remove('highlight'), 2000)
        } else {
          console.log('   ⚠️ 未找到情书卡片 letter-' + word.id)
        }
      } else {
        console.log('   ⚠️ 词语没有关联的 id')
      }
    }
  }

  WordCloud(wordcloudContainer.value, options)
  wordcloudInstance.value = true // mark as initialized
  isLoading.value = false
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  nextTick(() => initWordCloud())
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (wordcloudContainer.value) {
    wordcloudContainer.value.innerHTML = ''
  }
})

watch(
  () => props.words,
  () => nextTick(() => initWordCloud()),
  { deep: true }
)
</script>

<style scoped>
.wordcloud-section {
  margin: 40px 0;
  padding: 24px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(255, 250, 250, 0.7) 100%
  );
  border-radius: 20px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.wordcloud-section:hover {
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
}

.wordcloud-header {
  text-align: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #e06377, #d4a5a5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  font-size: 14px;
  color: #666;
  opacity: 0.8;
}

.wordcloud-container {
  width: 100%;
  height: 300px;
  min-height: 300px;
  position: relative;
  transition: height 0.3s ease;
  cursor: pointer; /* 提示用户可以点击 */
}

/* 确保 canvas 可点击 */
.wordcloud-container :deep(canvas) {
  cursor: pointer;
}

.wordcloud-skeleton {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  align-items: center;
  height: 300px;
  padding: 20px;
}

.skeleton-item {
  background: linear-gradient(
    90deg,
    rgba(224, 99, 119, 0.1) 25%,
    rgba(212, 165, 165, 0.2) 50%,
    rgba(224, 99, 119, 0.1) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (max-width: 1024px) {
  .wordcloud-section {
    margin: 30px 0;
    padding: 20px;
  }
  .wordcloud-container {
    height: 250px;
  }
}

@media (max-width: 768px) {
  .wordcloud-section {
    margin: 20px 0;
    padding: 16px;
    border-radius: 16px;
  }
  .wordcloud-container {
    height: 200px;
  }
  .section-title {
    font-size: 20px;
  }
}
</style>
