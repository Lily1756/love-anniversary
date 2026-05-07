<template>
  <Card
    class="letter-card"
    size="medium"
    :title="letter.title"
    @click="$emit('click', letter.id)"
  >
    <div class="letter-meta">
      <span class="letter-date">{{ formatDate(letter.date) }}</span>
      <span v-if="letter.tag" class="letter-tag">{{ letter.tag }}</span>
    </div>
    <p class="letter-preview">{{ previewContent }}</p>
    <div class="letter-footer">
      <span class="letter-year">{{ letter.year }}年</span>
      <svg v-if="letter.isFavorite" class="favorite-icon" viewBox="0 0 24 24" width="16" height="16" fill="var(--color-primary)" stroke="none">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Card from '../common/Card.vue'
import type { Letter } from '@/types'

interface Props {
  letter: Letter
}

const props = defineProps<Props>()

defineEmits<{
  click: [id: string]
}>()

const previewContent = computed(() => {
  const text = props.letter.content.replace(/\n/g, ' ')
  return text.length > 80 ? text.slice(0, 80) + '...' : text
})

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}
</script>

<style scoped>
.letter-card {
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.letter-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background-color: var(--color-primary);
  opacity: 0;
  transition: opacity var(--transition-base);
}

.letter-card:hover::before {
  opacity: 1;
}

.letter-card :deep(.card-title) {
  font-size: var(--font-size-base);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.letter-meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.letter-date {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.letter-tag {
  font-size: var(--font-size-xs);
  padding: 2px 8px;
  background: var(--bg-surface);
  border-radius: var(--radius-full);
  color: var(--color-primary);
}

.letter-preview {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.letter-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-sm);
  padding-top: var(--space-sm);
  border-top: 1px solid var(--border-light);
}

.letter-year {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.favorite-icon {
  flex-shrink: 0;
}
</style>
