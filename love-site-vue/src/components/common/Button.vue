<template>
  <button
    class="m-button"
    :class="[
      `type-${type}`,
      `size-${size}`,
      { 'is-round': round, 'is-block': block, 'is-loading': loading }
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="loading-spinner"></span>
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
interface Props {
  type?: 'primary' | 'accent' | 'text' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  round?: boolean
  block?: boolean
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'medium',
  round: false,
  block: false,
  loading: false,
  disabled: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (e: MouseEvent) => {
  if (!props.loading && !props.disabled) {
    emit('click', e)
  }
}
</script>

<style scoped>
.m-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  border: 1px solid transparent;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  line-height: 1.5;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
  user-select: none;
}

.m-button:focus {
  outline: none;
  box-shadow: var(--shadow-focus);
}

/* 主按钮 */
.type-primary {
  background-color: var(--color-primary);
  color: var(--text-inverse);
  border-color: var(--color-primary);
}

.type-primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
  transform: translateY(-1px);
}

/* 强调按钮 */
.type-accent {
  background-color: var(--color-accent);
  color: var(--text-inverse);
  border-color: var(--color-accent);
}

.type-accent:hover:not(:disabled) {
  background-color: var(--color-accent);
  opacity: 0.9;
  transform: translateY(-1px);
}

/* 文字按钮 */
.type-text {
  background-color: transparent;
  color: var(--text-primary);
  border-color: transparent;
}

.type-text:hover:not(:disabled) {
  background-color: var(--bg-hover);
  color: var(--color-primary);
}

/* 幽灵按钮 */
.type-ghost {
  background-color: transparent;
  color: var(--text-primary);
  border-color: var(--border-base);
}

.type-ghost:hover:not(:disabled) {
  background-color: var(--bg-hover);
  border-color: var(--border-dark);
}

/* 尺寸 */
.size-small {
  padding: 8px 16px;
  font-size: var(--font-size-sm);
  border-radius: var(--radius-sm);
}

.size-medium {
  padding: 10px 20px;
  font-size: var(--font-size-base);
  border-radius: var(--radius-md);
}

.size-large {
  padding: 16px 32px;
  font-size: var(--font-size-lg);
  border-radius: var(--radius-md);
}

/* 圆角 */
.is-round {
  border-radius: var(--radius-full);
}

/* 块级 */
.is-block {
  width: 100%;
}

/* 禁用 */
.m-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* 加载 */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
