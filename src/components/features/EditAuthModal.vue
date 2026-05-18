<template>
  <Modal v-model="visible" title="内容管理" :show-close="true">
    <div class="edit-auth-form">
      <div class="form-group">
        <label>编辑密码</label>
        <input
          ref="pwdRef"
          v-model="password"
          type="password"
          placeholder="请输入密码..."
          maxlength="20"
          autocomplete="off"
          @keydown.enter="confirm"
        />
      </div>

      <div class="form-group">
        <label>
          GitHub PAT
          <span class="label-optional">（可选）</span>
        </label>
        <input
          v-model="pat"
          type="password"
          placeholder="不填则使用云端代理保存"
        />
        <p class="form-tip">留空时数据通过 Cloudflare Function 保存，无需配置 Token</p>
      </div>
    </div>

    <template #footer>
      <Button type="text" @click="close">取消</Button>
      <Button type="accent" @click="confirm">确认</Button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import Modal from '@/components/common/Modal.vue'
import Button from '@/components/common/Button.vue'

const EDIT_PASSWORD = '202505174everZHZY'

const visible = defineModel<boolean>('visible', { default: false })

const emit = defineEmits<{
  confirm: [password: string, pat: string]
}>()

const password = ref('')
const pat = ref('')
const pwdRef = ref<HTMLInputElement>()

watch(visible, (val) => {
  if (val) {
    password.value = ''
    pat.value = localStorage.getItem('github_pat') || ''
    nextTick(() => pwdRef.value?.focus())
  }
})

function close() {
  visible.value = false
}

async function confirm() {
  const pwd = password.value.trim()
  if (pwd !== EDIT_PASSWORD) {
    alert('密码错误')
    password.value = ''
    nextTick(() => pwdRef.value?.focus())
    return
  }

  // 如果提供了 PAT，验证有效性
  const token = pat.value.trim()
  if (token.length >= 10) {
    try {
      const resp = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github+json'
        }
      })
      if (!resp.ok) {
        alert('GitHub PAT 无效，请检查后重新输入')
        return
      }
      localStorage.setItem('github_pat', token)
    } catch {
      // 网络问题，放行
    }
  }

  emit('confirm', pwd, token)
  visible.value = false
}
</script>

<style scoped>
.edit-auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.form-group label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.label-optional {
  font-weight: var(--font-weight-normal);
  color: var(--text-tertiary);
}

.form-group input {
  padding: 10px 14px;
  border: 1px solid var(--border-base);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  transition: all var(--transition-fast);
}

.form-group input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: var(--shadow-focus);
}

.form-tip {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-top: 2px;
}
</style>
