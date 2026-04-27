<template>
  <Transition name="lock">
    <div v-if="!unlocked" class="lock-screen">
      <div class="lock-card">
        <div class="lock-icon">💕</div>
        <div class="lock-title">欢迎回来</div>
        <div class="lock-subtitle">输入密码解锁我们的故事</div>
        <input
          ref="inputRef"
          v-model="password"
          type="password"
          class="lock-input"
          placeholder="请输入密码..."
          maxlength="20"
          autocomplete="off"
          @keydown.enter="unlock"
        />
        <button class="lock-btn" @click="unlock">
          解锁 💝
        </button>
        <Transition name="shake">
          <div v-if="error" class="lock-error">密码错误，请再试一次 💔</div>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  correctPassword: string
}>()

const emit = defineEmits<{
  (e: 'unlock'): void
}>()

const unlocked = ref(false)
const password = ref('')
const error = ref(false)
const inputRef = ref<HTMLInputElement>()

function unlock() {
  if (password.value.trim() === props.correctPassword) {
    unlocked.value = true
    localStorage.setItem('love_site_unlocked', 'true')
    localStorage.setItem('love_site_unlock_time', Date.now().toString())
    emit('unlock')
  } else {
    error.value = true
    password.value = ''
    setTimeout(() => {
      error.value = false
      inputRef.value?.focus()
    }, 1500)
  }
}

onMounted(() => {
  // 检查是否已解锁（24小时内）
  const saved = localStorage.getItem('love_site_unlocked')
  const time = localStorage.getItem('love_site_unlock_time')
  if (saved === 'true' && time) {
    const elapsed = Date.now() - parseInt(time)
    if (elapsed < 24 * 60 * 60 * 1000) {
      unlocked.value = true
      emit('unlock')
      return
    }
  }
  inputRef.value?.focus()
})
</script>

<style scoped>
.lock-screen {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #F5F1ED 0%, #EDE8E3 50%, #F0EBE6 100%);
  backdrop-filter: blur(20px);
}

.lock-card {
  text-align: center;
  padding: var(--space-2xl);
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-xl);
  box-shadow: 0 8px 32px rgba(201, 168, 169, 0.15);
  max-width: 360px;
  width: 90%;
  animation: fadeInUp 0.6s ease;
}

.lock-icon {
  font-size: 48px;
  margin-bottom: var(--space-lg);
  animation: pulse 2s ease infinite;
}

.lock-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}

.lock-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-xl);
}

.lock-input {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid var(--border-base);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  text-align: center;
  margin-bottom: var(--space-md);
  transition: all var(--transition-fast);
}

.lock-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(201, 168, 169, 0.2);
}

.lock-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--color-primary), #B8979A);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.lock-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(201, 168, 169, 0.4);
}

.lock-error {
  color: #c97070;
  font-size: var(--font-size-sm);
  margin-top: var(--space-md);
  animation: shake 0.5s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}

/* Transitions */
.lock-enter-active,
.lock-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.lock-enter-from,
.lock-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

.shake-enter-active,
.shake-leave-active {
  transition: all 0.3s ease;
}

.shake-enter-from,
.shake-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
