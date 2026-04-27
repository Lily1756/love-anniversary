<template>
  <div class="capsules-page page-container">
    <h2 class="page-title">时间胶囊</h2>

    <div class="capsules-grid">
      <div
        v-for="capsule in store.capsules"
        :key="capsule.id"
        class="capsule-card"
        :class="{ opened: capsule.isOpened, locked: !canOpen(capsule) }"
        @click="openCapsule(capsule)"
      >
        <div class="capsule-icon">
          <svg v-if="capsule.isOpened" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 8v13H3V8" />
            <path d="M1 3h22v5H1z" />
            <path d="M10 12h4" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        
        <h3 class="capsule-title">{{ capsule.title }}</h3>
        <p class="capsule-date">
          {{ capsule.isOpened ? '已开启' : `开启时间: ${capsule.openDate}` }}
        </p>
        
        <div v-if="!capsule.isOpened && !canOpen(capsule)" class="countdown">
          <span>还有 {{ daysUntil(capsule.openDate) }} 天</span>
        </div>
      </div>
    </div>

    <!-- 创建胶囊按钮 -->
    <button class="fab" @click="showCreateModal = true">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>

    <!-- 创建胶囊弹窗 -->
    <Modal v-model="showCreateModal" title="创建时间胶囊">
      <div class="create-form">
        <div class="form-group">
          <label>标题</label>
          <input v-model="newCapsule.title" type="text" placeholder="给未来的我们..." />
        </div>
        <div class="form-group">
          <label>内容</label>
          <textarea v-model="newCapsule.content" rows="4" placeholder="写下想对未来的自己说的话..."></textarea>
        </div>
        <div class="form-group">
          <label>开启日期</label>
          <input v-model="newCapsule.openDate" type="date" />
        </div>
      </div>
      <template #footer>
        <Button type="text" @click="showCreateModal = false">取消</Button>
        <Button type="accent" @click="createCapsule">创建</Button>
      </template>
    </Modal>

    <!-- 查看胶囊弹窗 -->
    <Modal v-model="showViewModal" :title="selectedCapsule?.title">
      <div v-if="selectedCapsule" class="capsule-content">
        <p class="capsule-created">创建于: {{ selectedCapsule.createdAt }}</p>
        <div class="capsule-text">{{ selectedCapsule.content }}</div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores'
import Modal from '@/components/common/Modal.vue'
import Button from '@/components/common/Button.vue'
import type { Capsule } from '@/types'

const store = useAppStore()

const showCreateModal = ref(false)
const showViewModal = ref(false)
const selectedCapsule = ref<Capsule | null>(null)

const newCapsule = ref({
  title: '',
  content: '',
  openDate: ''
})

const canOpen = (capsule: Capsule) => {
  return new Date(capsule.openDate) <= new Date()
}

const daysUntil = (dateStr: string) => {
  const diff = new Date(dateStr).getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const openCapsule = (capsule: Capsule) => {
  if (capsule.isOpened || canOpen(capsule)) {
    selectedCapsule.value = capsule
    showViewModal.value = true
    if (!capsule.isOpened) {
      capsule.isOpened = true
    }
  }
}

const createCapsule = () => {
  if (!newCapsule.value.title || !newCapsule.value.openDate) return
  
  store.capsules.push({
    id: `capsule_${Date.now()}`,
    title: newCapsule.value.title,
    content: newCapsule.value.content || '',
    openDate: newCapsule.value.openDate,
    createdAt: new Date().toISOString().split('T')[0],
    isOpened: false
  } as Capsule)
  
  showCreateModal.value = false
  newCapsule.value = { title: '', content: '', openDate: '' }
}

onMounted(() => {
  if (store.capsules.length === 0) {
    store.capsules = [
      {
        id: 'capsule_1',
        title: '一周年纪念日',
        content: '亲爱的，一周年快乐！希望我们的爱情像葡萄酒一样，越陈越香。',
        openDate: '2026-05-17',
        createdAt: '2025-05-17',
        isOpened: false
      },
      {
        id: 'capsule_2',
        title: '结婚前的约定',
        content: '如果我们决定结婚，记得回看这个胶囊，看看当初的承诺。',
        openDate: '2027-01-01',
        createdAt: '2025-06-01',
        isOpened: false
      }
    ]
  }
})
</script>

<style scoped>
.capsules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-md);
}

.capsule-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-xl);
  background: var(--bg-container);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--transition-base);
}

.capsule-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--border-base);
}

.capsule-card.locked {
  opacity: 0.7;
  cursor: not-allowed;
}

.capsule-card.locked:hover {
  transform: none;
  box-shadow: var(--shadow-sm);
}

.capsule-card.opened {
  background: linear-gradient(135deg, var(--bg-surface), var(--bg-container));
}

.capsule-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: var(--bg-surface);
  color: var(--color-primary);
  margin-bottom: var(--space-md);
}

.capsule-card.opened .capsule-icon {
  background: var(--color-success);
  color: white;
}

.capsule-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--space-xs);
  color: var(--text-primary);
}

.capsule-date {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.countdown {
  margin-top: var(--space-sm);
  padding: 4px 12px;
  background: var(--bg-surface);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  color: var(--color-primary);
}

/* 悬浮按钮 */
.fab {
  position: fixed;
  bottom: calc(var(--nav-height) + var(--space-lg));
  right: var(--space-lg);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
  z-index: 100;
}

.fab:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-lg);
}

/* 表单 */
.create-form {
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

.form-group input,
.form-group textarea {
  padding: 10px 14px;
  border: 1px solid var(--border-base);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  resize: vertical;
  transition: all var(--transition-fast);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: var(--shadow-focus);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--text-tertiary);
}

.capsule-content {
  line-height: 1.8;
}

.capsule-created {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin-bottom: var(--space-md);
}

.capsule-text {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  white-space: pre-wrap;
}
</style>
