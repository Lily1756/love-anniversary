<template>
  <g
    class="star-point"
    :transform="`translate(${x}, ${y})`"
    @mouseenter="handleHover(true)"
    @mouseleave="handleHover(false)"
    @click="handleClick"
    role="button"
    tabindex="0"
    :aria-label="`${month}月${day}日，${count}封情书`"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <!-- 星光主体 -->
    <circle
      class="star-core"
      :r="hovered ? (size === 'small' ? 4.5 : 7.5) : (size === 'small' ? 3 : 5)"
      :fill="fillColor"
      :class="{ 'is-hovered': hovered }"
    />
    <!-- 悬停光晕 -->
    <circle
      v-if="hovered"
      class="star-halo"
      r="10"
      fill="none"
      stroke="rgba(232, 180, 184, 0.6)"
      stroke-width="3"
    />
    <!-- 点击涟漪动画 -->
    <circle
      v-if="clicked"
      class="star-ripple"
      r="3"
      fill="none"
      stroke="#E8B4B8"
      stroke-width="2"
    />
  </g>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  size: { type: String, default: 'small' }, // 'small' | 'large'
  count: { type: Number, default: 0 },
  month: { type: Number, required: true },
  day: { type: Number, required: true }
})

const emit = defineEmits(['hover', 'click'])

const hovered = ref(false)
const clicked = ref(false)

const fillColor = computed(() => {
  return props.count >= 2 ? '#D18A8A' : '#E8B4B8'
})

function handleHover(isHovered) {
  hovered.value = isHovered
  emit('hover', isHovered ? { month: props.month, day: props.day, count: props.count } : null)
}

function handleClick() {
  clicked.value = true
  emit('click', { month: props.month, day: props.day, count: props.count })
  setTimeout(() => {
    clicked.value = false
  }, 400)
}
</script>

<style scoped>
.star-core {
  cursor: pointer;
  transition: r 0.2s ease, fill 0.2s ease;
  filter: drop-shadow(0 0 3px rgba(232, 180, 184, 0.4));
}

.star-core.is-hovered {
  filter: drop-shadow(0 0 8px rgba(232, 180, 184, 0.8));
}

.star-halo {
  animation: halo-pulse 1.2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes halo-pulse {
  0%, 100% { opacity: 0.8; r: 10; }
  50% { opacity: 0.3; r: 14; }
}

.star-ripple {
  animation: ripple-out 0.4s ease-out forwards;
  pointer-events: none;
}

@keyframes ripple-out {
  from { r: 3; opacity: 1; }
  to { r: 16; opacity: 0; }
}
</style>
