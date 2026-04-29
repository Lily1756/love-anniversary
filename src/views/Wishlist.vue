<template>
  <div class="wishlist-page page-container">
    <div class="page-header">
      <h2 class="page-title">
        愿望清单
        <span class="count">({{ store.completedWishes }}/{{ store.totalWishes }})</span>
      </h2>
      <div class="header-actions">
        <button v-if="!isEditMode" class="edit-btn" @click="openAuthModal">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          编辑
        </button>
        <template v-else>
          <button class="add-btn" @click="showWishModal = true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            愿望
          </button>
          <button class="done-btn" @click="exitEditMode">完成</button>
        </template>
      </div>
    </div>

    <!-- 进度概览 -->
    <div class="progress-overview">
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>
      <span class="progress-text">已完成 {{ progressPercent }}%</span>
    </div>

    <!-- 分类筛选 -->
    <div class="category-filters">
      <button
        v-for="cat in categories"
        :key="cat"
        class="filter-btn"
        :class="{ active: selectedCategory === cat }"
        @click="selectedCategory = cat"
      >
        {{ catLabel(cat) }}
      </button>
    </div>

    <!-- 愿望列表 -->
    <div class="wishes-list">
      <div
        v-for="wish in filteredWishes"
        :key="wish.id"
        class="wish-item"
        :class="{ completed: wish.completed }"
      >
        <button
          class="wish-checkbox"
          :class="{ checked: wish.completed }"
          @click="toggleWish(wish.id)"
        >
          <svg v-if="wish.completed" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </button>
        
        <div class="wish-content">
          <span class="wish-title">{{ wish.title }}</span>
          <span class="wish-category">{{ wish.category }}</span>
        </div>
        
        <span class="wish-date">{{ formatDate(wish.createdAt) }}</span>

        <button v-if="isEditMode" class="delete-wish-btn" @click.stop="deleteWish(wish.id)">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredWishes.length === 0" class="empty-state">
      <p>暂无愿望，添加一个吧 ⭐</p>
    </div>

    <!-- 编辑认证弹窗 -->
    <EditAuthModal
      v-model="showAuth"
      :password="authPassword"
      :error="authError"
      @update:password="authPassword = $event"
      @confirm="verifyAuth"
    />

    <!-- 添加愿望弹窗 -->
    <Modal v-model="showWishModal" title="添加愿望">
      <div class="wish-form">
        <div class="form-group">
          <label>愿望内容</label>
          <input v-model="newWish.title" type="text" placeholder="例如：一起去冰岛看极光..." />
        </div>
        <div class="form-group">
          <label>分类</label>
          <select v-model="newWish.category">
            <option value="旅行">旅行</option>
            <option value="美食">美食</option>
            <option value="生活">生活</option>
            <option value="其他">其他</option>
          </select>
        </div>
      </div>
      <template #footer>
        <button class="btn-text" @click="showWishModal = false">取消</button>
        <button class="btn-primary" @click="addWish">添加</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores'
import Modal from '@/components/common/Modal.vue'
import EditAuthModal from '@/components/common/EditAuthModal.vue'
import { useEditAuth } from '@/composables/useEditAuth'

const store = useAppStore()

const selectedCategory = ref('all')

const { isEditMode, showAuth, authPassword, authError, openAuthModal, verifyAuth, exitEditMode } = useEditAuth({
  password: '2025',
})

/* ---------- 添加愿望 ---------- */
const showWishModal = ref(false)
const newWish = ref({ title: '', category: '旅行' })

function addWish() {
  if (!newWish.value.title.trim()) return
  store.wishes.push({
    id: 'wish-' + Date.now(),
    title: newWish.value.title.trim(),
    category: newWish.value.category,
    completed: false,
    createdAt: new Date().toISOString()
  })
  newWish.value = { title: '', category: '旅行' }
  showWishModal.value = false
  store.saveWishes()
}

function deleteWish(id: string) {
  if (!confirm('确定要删除这个愿望吗？')) return
  store.wishes = store.wishes.filter(w => w.id !== id)
  store.saveWishes()
}

const catLabel = (cat: string) => {
  if (cat === 'all') return '全部'
  if (cat === 'completed') return '已完成'
  return cat
}

const categories = computed(() => {
  const cats = new Set(store.wishes.map(w => w.category))
  return ['all', ...Array.from(cats), 'completed']
})

const filteredWishes = computed(() => {
  if (selectedCategory.value === 'all') {
    return store.wishes
  }
  if (selectedCategory.value === 'completed') {
    return store.wishes.filter(w => w.completed)
  }
  return store.wishes.filter(w => w.category === selectedCategory.value)
})

const progressPercent = computed(() => {
  if (store.totalWishes === 0) return 0
  return Math.round((store.completedWishes / store.totalWishes) * 100)
})

const toggleWish = (id: string) => {
  const wish = store.wishes.find(w => w.id === id)
  if (wish) {
    wish.completed = !wish.completed
    store.saveWishes()
  }
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`
}

onMounted(() => {
  if (store.wishes.length === 0) {
    store.loadWishes()
  }
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
}

.header-actions {
  display: flex;
  gap: var(--space-sm);
}

.edit-btn, .add-btn, .done-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
}

.edit-btn {
  background: var(--bg-surface);
  color: var(--text-secondary);
  border: 1px solid var(--border-base);
}
.edit-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.add-btn {
  background: var(--color-primary);
  color: white;
}
.add-btn:hover {
  background: #b8979a;
}

.done-btn {
  background: var(--bg-surface);
  color: var(--text-secondary);
  border: 1px solid var(--border-base);
}

.progress-overview {
  background: var(--bg-container);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.progress-bar {
  height: 8px;
  background: var(--bg-surface);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--space-sm);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
}

.progress-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.category-filters {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  background: var(--bg-container);
  border: 1px solid var(--border-base);
  transition: all var(--transition-fast);
}

.filter-btn.active,
.filter-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.wishes-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.wish-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--bg-container);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
  position: relative;
}

.wish-item:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--border-base);
}

.wish-item.completed .wish-title {
  text-decoration: line-through;
  color: var(--text-tertiary);
}

.wish-checkbox {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--border-base);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--transition-fast);
  cursor: pointer;
  background: transparent;
}

.wish-checkbox:hover {
  border-color: var(--color-primary);
}

.wish-checkbox.checked {
  background: var(--color-success);
  border-color: var(--color-success);
  color: white;
}

.wish-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.wish-title {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.wish-category {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.wish-date {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.delete-wish-btn {
  width: 28px;
  height: 28px;
  background: rgba(220, 100, 100, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--transition-fast);
}
.delete-wish-btn:hover {
  background: rgba(220, 100, 100, 1);
  transform: scale(1.1);
}

/* 表单 */
.wish-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-md) 0;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}
.form-group label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}
.form-group input,
.form-group select {
  padding: 10px 14px;
  border: 1px solid var(--border-base);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  transition: all var(--transition-fast);
}
.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: var(--shadow-focus);
}

.btn-text, .btn-primary {
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

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
  }
}
</style>
