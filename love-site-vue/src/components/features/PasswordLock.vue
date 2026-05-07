<template>
  <Transition name="lock">
    <div v-if="!unlocked" class="password-lock">
      <div class="lock-content">
        <div class="lock-icon">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 class="lock-title">Love Story with You</h2>
        <p class="lock-subtitle">输入暗号，开启我们的故事</p>

        <div class="lock-input-wrap">
          <input
            ref="inputRef"
            v-model="password"
            type="password"
            class="lock-input"
            :class="{ shake: isShaking, error: showError }"
            placeholder="请输入暗号..."
            maxlength="20"
            autocomplete="off"
            @keydown.enter="tryUnlock"
          />
          <p v-if="hint" class="lock-hint">{{ hint }}</p>
        </div>

        <button class="lock-btn" @click="tryUnlock">解锁</button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const CORRECT_PASSWORD = '2025'
const LS_UNLOCKED = 'love_site_unlocked'

const password = ref('')
const unlocked = ref(false)
const isShaking = ref(false)
const showError = ref(false)
const hint = ref('')
const inputRef = ref<HTMLInputElement>()

const emit = defineEmits<{
  unlock: []
}>()

onMounted(() => {
  // 检查是否已解锁（当前 session）
  if (sessionStorage.getItem(LS_UNLOCKED) === 'true') {
    unlocked.value = true
    emit('unlock')
    return
  }
  setTimeout(() => inputRef.value?.focus(), 300)
})

function tryUnlock() {
  const val = password.value.trim()

  if (!val) {
    hint.value = '暗号不能为空哦'
    shake()
    return
  }

  if (val === CORRECT_PASSWORD) {
    unlocked.value = true
    sessionStorage.setItem(LS_UNLOCKED, 'true')
    emit('unlock')
  } else {
    hint.value = '暗号好像不对，再想想'
    shake()
    password.value = ''
    setTimeout(() => { hint.value = '' }, 3000)
  }
}

function shake() {
  showError.value = true
  isShaking.value = true
  setTimeout(() => {
    isShaking.value = false
    showError.value = false
  }, 1500)
}
</script>

<style scoped>
.password-lock {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FAF8F5 0%, #F5F1EC 100%);
}

.lock-content {
  text-align: center;
  padding: var(--space-xl);
  max-width: 360px;
  width: 90%;
}

.lock-icon {
  color: var(--color-primary);
  margin-bottom: var(--space-lg);
  opacity: 0.8;
}

.lock-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
  font-family: 'Playfair Display', serif;
}

.lock-subtitle {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin-bottom: var(--space-xl);
}

.lock-input-wrap {
  margin-bottom: var(--space-lg);
}

.lock-input {
  width: 100%;
  padding: 14px 20px;
  font-size: var(--font-size-lg);
  text-align: center;
  letter-spacing: 4px;
  border: 2px solid var(--border-base);
  border-radius: var(--radius-md);
  background: var(--bg-container);
  color: var(--text-primary);
  transition: all 0.3s ease;
  outline: none;
}

.lock-input:focus {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.lock-input.error {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 3px rgba(232, 180, 184, 0.2);
}

.lock-input.shake {
  animation: shake 0.5s ease;
}

.lock-hint {
  margin-top: var(--space-sm);
  font-size: var(--font-size-sm);
  color: var(--color-danger);
  min-height: 20px;
}

.lock-btn {
  width: 100%;
  padding: 14px 24px;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: white;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-base);
}

.lock-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.lock-btn:active {
  transform: translateY(0);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-10px); }
  40% { transform: translateX(10px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
}

/* 过渡动画 */
.lock-enter-active {
  transition: opacity 0.6s ease;
}

.lock-leave-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.lock-enter-from {
  opacity: 0;
}

.lock-leave-to {
  opacity: 0;
  transform: scale(1.05);
}
</style>
