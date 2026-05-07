<template>
  <div
    class="m-card"
    :class="[
      `size-${size}`,
      { 'has-shadow': shadow, 'is-hoverable': hoverable }
    ]"
    :style="cardStyle"
  >
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 class="card-title">{{ title }}</h3>
      </slot>
    </div>

    <div class="card-body">
      <slot></slot>
    </div>

    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'small' | 'medium' | 'large'
  shadow?: boolean
  hoverable?: boolean
  title?: string
  backgroundColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  shadow: true,
  hoverable: true,
  backgroundColor: 'var(--bg-container)'
})

const cardStyle = {
  backgroundColor: props.backgroundColor
}
</script>

<style scoped>
.m-card {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
}

.m-card.has-shadow {
  box-shadow: var(--shadow-base);
}

.m-card.is-hoverable:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--border-base);
  transform: translateY(-2px);
}

.card-header {
  padding: var(--space-md) var(--space-md) 0;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: var(--space-md);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.card-body {
  padding: var(--space-md);
}

.card-footer {
  padding: 0 var(--space-md) var(--space-md);
  border-top: 1px solid var(--border-light);
  margin-top: var(--space-sm);
  padding-top: var(--space-sm);
}

.size-small {
  max-width: 280px;
}

.size-medium {
  max-width: 400px;
}

.size-large {
  max-width: 600px;
}
</style>
