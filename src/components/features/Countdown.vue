<template>
  <div class="countdown">
    <p class="countdown-label">{{ label }}</p>
    <div class="countdown-numbers">
      <div class="time-unit">
        <span class="number">{{ days }}</span>
        <span class="unit">天</span>
      </div>
      <div class="time-unit">
        <span class="number">{{ hours }}</span>
        <span class="unit">时</span>
      </div>
      <div class="time-unit">
        <span class="number">{{ minutes }}</span>
        <span class="unit">分</span>
      </div>
      <div class="time-unit">
        <span class="number">{{ seconds }}</span>
        <span class="unit">秒</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

interface Props {
  targetDate: string
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '我们已经在一起了'
})

const now = ref(new Date())
let timer: ReturnType<typeof setInterval>

const target = computed(() => new Date(props.targetDate))

const diff = computed(() => {
  return now.value.getTime() - target.value.getTime()
})

const days = computed(() => Math.floor(diff.value / (1000 * 60 * 60 * 24)))
const hours = computed(() => Math.floor((diff.value % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)))
const minutes = computed(() => Math.floor((diff.value % (1000 * 60 * 60)) / (1000 * 60)))
const seconds = computed(() => Math.floor((diff.value % (1000 * 60)) / 1000))

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.countdown {
  text-align: center;
  padding: var(--space-xl);
  background: linear-gradient(135deg, 
    rgba(201, 168, 169, 0.1) 0%, 
    rgba(216, 196, 182, 0.1) 100%);
  border: 1px solid rgba(201, 168, 169, 0.2);
  border-radius: var(--radius-lg);
}

.countdown-label {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin-bottom: var(--space-md);
  letter-spacing: 2px;
}

.countdown-numbers {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
}

.time-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.number {
  font-size: 36px;
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.unit {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-top: 4px;
}

@media (min-width: 768px) {
  .number {
    font-size: 48px;
  }
  
  .time-unit {
    min-width: 80px;
  }
}
</style>
