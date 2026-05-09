<template>
  <Transition name="lock">
    <div v-if="!isUnlocked" class="password-lock">
      <div class="lock-card">
        <div class="lock-icon">💕</div>
        <h2 class="lock-title">欢迎回来</h2>
        <p class="lock-subtitle">输入密码解锁我们的故事</p>
        <div class="lock-input-wrap">
          <input
            ref="inputRef"
            v-model="password"
            type="password"
            class="lock-input"
            placeholder="请输入密码..."
            maxlength="20"
            autocomplete="off"
            @keydown.enter="handleUnlock"
          />
        </div>
        <button class="lock-btn" @click="handleUnlock">
          解锁 💝
        </button>
        <Transition name="shake">
          <p v-if="showError" class="lock-error">密码错误，请再试一次 💔</p>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const CORRECT_PASSWORD = '2025'
const STORAGE_KEY = 'love_site_unlocked'

const password = ref('')
const showError = ref(false)
const isUnlocked = ref(false)
const inputRef = ref<HTMLInputElement>()

function checkUnlockState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') {
      isUnlocked.value = true
    }
  } catch {
    // localStorage 不可用
  }
}

function handleUnlock() {
  if (password.value.trim() === CORRECT_PASSWORD) {
    isUnlocked.value = true
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // localStorage 不可用
    }
  } else {
    showError.value = true
    password.value = ''
    inputRef.value?.focus()
    setTimeout(() => {
      showError.value = false
    }, 2000)
  }
}

onMounted(() => {
  checkUnlockState()
  if (!isUnlocked.value) {
    setTimeout(() => inputRef.value?.focus(), 100)
  }
})
</script>

<style scoped>
.password-lock {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #faf8f5 0%, #f5f0eb 50%, #faf8f5 100%);
  padding: var(--space-lg);
}

.lock-card {
  width: 100%;
  max-width: 380px;
  text-align: center;
  padding: var(--space-2xl);
  background: var(--bg-container);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

.lock-icon {
  font-size: 48px;
  margin-bottom: var(--space-lg);
  animation: heartbeat 2s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  14% { transform: scale(1.1); }
  28% { transform: scale(1); }
  42% { transform: scale(1.1); }
  70% { transform: scale(1); }
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

.lock-input-wrap {
  margin-bottom: var(--space-md);
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
  letter-spacing: 4px;
  transition: all var(--transition-fast);
}

.lock-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.lock-input::placeholder {
  letter-spacing: 0;
  color: var(--text-tertiary);
}

.lock-btn {
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, var(--color-primary), #b8979a);
  color: white;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: 0 4px 16px rgba(201, 168, 169, 0.3);
}

.lock-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(201, 168, 169, 0.4);
}

.lock-btn:active {
  transform: translateY(0);
}

.lock-error {
  margin-top: var(--space-md);
  font-size: var(--font-size-sm);
  color: #c97070;
}

/* Transitions */
.lock-enter-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.lock-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
  pointer-events: none;
}

.lock-enter-from {
  opacity: 0;
  transform: scale(1.05);
}

.lock-leave-to {
  opacity: 0;
  transform: scale(1.05);
  pointer-events: none;
}

.shake-enter-active {
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}
</style>
