<template>
  <div class="letter-detail page-container">
    <button class="back-btn" @click="$router.back()">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      返回
    </button>

    <article v-if="letter" class="letter-content">
      <header class="letter-header">
        <h1 class="letter-title">{{ letter.title }}</h1>
        <div class="letter-meta">
          <span class="letter-date">{{ letter.date }}</span>
          <span v-if="letter.tag" class="letter-tag">{{ letter.tag }}</span>
        </div>
      </header>

      <div class="letter-body">
        <p v-for="(paragraph, index) in paragraphs" :key="index" class="letter-paragraph">
          {{ paragraph }}
        </p>
      </div>

      <footer class="letter-footer">
        <p class="letter-sign">—— 爱你的 {{ isFromZhihao ? '志浩' : '张祎' }}</p>
      </footer>
    </article>

    <div v-else class="empty-state">
      <p>情书不存在或已被删除</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores'

const route = useRoute()
const store = useAppStore()

const letter = computed(() => {
  return store.letters.find(l => l.id === route.params.id)
})

const paragraphs = computed(() => {
  if (!letter.value) return []
  return letter.value.content.split('\n').filter(p => p.trim())
})

const isFromZhihao = computed(() => {
  if (!letter.value) return false
  return letter.value.content.includes('志浩') || letter.value.title.includes('志浩')
})

onMounted(() => {
  if (store.letters.length === 0) {
    store.loadLetters()
  }
})
</script>

<style scoped>
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-lg);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.back-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.letter-content {
  max-width: 720px;
  margin: 0 auto;
  background: var(--bg-container);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
  box-shadow: var(--shadow-base);
}

.letter-header {
  text-align: center;
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--border-light);
}

.letter-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-md);
}

.letter-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-md);
}

.letter-date {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.letter-tag {
  font-size: var(--font-size-xs);
  padding: 4px 12px;
  background: var(--bg-surface);
  border-radius: var(--radius-full);
  color: var(--color-primary);
}

.letter-body {
  line-height: 2;
  color: var(--text-primary);
}

.letter-paragraph {
  margin-bottom: var(--space-md);
  text-indent: 2em;
}

.letter-footer {
  margin-top: var(--space-xl);
  text-align: right;
  padding-top: var(--space-lg);
  border-top: 1px solid var(--border-light);
}

.letter-sign {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  font-style: italic;
}

@media (max-width: 768px) {
  .letter-content {
    padding: var(--space-lg);
  }
  
  .letter-title {
    font-size: var(--font-size-xl);
  }
}
</style>
