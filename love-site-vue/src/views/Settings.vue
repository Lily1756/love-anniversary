<template>
  <div class="settings-page page-container">
    <h2 class="page-title">设置</h2>

    <div class="settings-sections">
      <!-- 恋爱信息 -->
      <section class="settings-section">
        <h3 class="section-subtitle">恋爱信息</h3>
        <div class="setting-item">
          <label>纪念日</label>
          <input type="date" v-model="settings.anniversary" />
        </div>
        <div class="setting-item">
          <label>对方昵称</label>
          <input type="text" v-model="settings.partnerName" placeholder="志浩" />
        </div>
        <div class="setting-item">
          <label>我的昵称</label>
          <input type="text" v-model="settings.myName" placeholder="张祎" />
        </div>
      </section>

      <!-- 外观设置 -->
      <section class="settings-section">
        <h3 class="section-subtitle">外观</h3>
        <div class="setting-item">
          <label>主题模式</label>
          <div class="theme-options">
            <button
              v-for="theme in themes"
              :key="theme.value"
              class="theme-btn"
              :class="{ active: settings.theme === theme.value }"
              @click="settings.theme = theme.value"
            >
              {{ theme.label }}
            </button>
          </div>
        </div>
      </section>

      <!-- 数据管理 -->
      <section class="settings-section">
        <h3 class="section-subtitle">数据管理</h3>
        <div class="setting-actions">
          <Button type="primary" @click="exportData">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            导出数据
          </Button>
          <Button type="text" @click="showClearConfirm = true">
            清除缓存
          </Button>
        </div>
      </section>

      <!-- 关于 -->
      <section class="settings-section">
        <h3 class="section-subtitle">关于</h3>
        <div class="about-info">
          <p>Love Story v1.0</p>
          <p class="about-desc">记录我们的爱情故事</p>
        </div>
      </section>
    </div>

    <!-- 清除确认弹窗 -->
    <Modal v-model="showClearConfirm" title="确认清除">
      <p>确定要清除所有本地缓存数据吗？此操作不可恢复。</p>
      <template #footer>
        <Button type="text" @click="showClearConfirm = false">取消</Button>
        <Button type="accent" @click="clearData">确认清除</Button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import Button from '@/components/common/Button.vue'
import Modal from '@/components/common/Modal.vue'

const settings = reactive({
  anniversary: '2025-05-17',
  partnerName: '志浩',
  myName: '张祎',
  theme: 'light'
})

const themes = [
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' },
  { value: 'system', label: '跟随系统' }
]

const showClearConfirm = ref(false)

const exportData = () => {
  const data = JSON.stringify(settings, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'love-story-settings.json'
  a.click()
  URL.revokeObjectURL(url)
}

const clearData = () => {
  localStorage.clear()
  showClearConfirm.value = false
  alert('缓存已清除')
}
</script>

<style scoped>
.settings-sections {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.settings-section {
  background: var(--bg-container);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.section-subtitle {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-lg);
  color: var(--text-primary);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--border-light);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item label {
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

.setting-item input {
  padding: 8px 12px;
  border: 1px solid var(--border-base);
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  min-width: 150px;
  transition: all var(--transition-fast);
}

.setting-item input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: var(--shadow-focus);
}

.theme-options {
  display: flex;
  gap: var(--space-sm);
}

.theme-btn {
  padding: 6px 16px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  background: var(--bg-surface);
  border: 1px solid var(--border-base);
  transition: all var(--transition-fast);
}

.theme-btn.active,
.theme-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.setting-actions {
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.about-info {
  text-align: center;
  padding: var(--space-md);
}

.about-info p {
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

.about-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: var(--space-xs);
}

@media (max-width: 768px) {
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }
  
  .setting-item input {
    width: 100%;
  }
}
</style>
