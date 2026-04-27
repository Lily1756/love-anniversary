<template>
  <Modal :model-value="modelValue" title="编辑认证" @update:model-value="emit('update:modelValue', $event)">
    <div class="auth-form">
      <p>请输入密码进入编辑模式</p>
      <input
        :value="password"
        type="password"
        class="auth-input"
        placeholder="请输入密码..."
        maxlength="20"
        @input="onPasswordInput"
        @keydown.enter="emit('confirm')"
      />
      <p v-if="error" class="auth-error">密码错误 💔</p>
    </div>
    <template #footer>
      <button class="btn-text" @click="emit('update:modelValue', false)">取消</button>
      <button class="btn-primary" @click="emit('confirm')">确认</button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/common/Modal.vue'

interface Props {
  modelValue: boolean
  password: string
  error: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:password': [value: string]
  confirm: []
}>()

function onPasswordInput(event: Event) {
  emit('update:password', (event.target as HTMLInputElement).value)
}
</script>

<style scoped>
.auth-form {
  text-align: center;
  padding: var(--space-lg);
}
.auth-form p {
  color: var(--text-secondary);
  margin-bottom: var(--space-md);
}
.auth-input {
  width: 100%;
  max-width: 280px;
  padding: 12px 16px;
  border: 2px solid var(--border-base);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  text-align: center;
}
.auth-input:focus {
  outline: none;
  border-color: var(--color-primary);
}
.auth-error {
  color: #c97070;
  font-size: var(--font-size-sm);
  margin-top: var(--space-sm);
}

.btn-text,
.btn-primary {
  padding: 8px 20px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
}
.btn-text {
  background: transparent;
  color: var(--text-secondary);
}
.btn-text:hover {
  background: var(--bg-surface);
}
.btn-primary {
  background: var(--color-primary);
  color: white;
}
.btn-primary:hover {
  background: #b8979a;
}
</style>
