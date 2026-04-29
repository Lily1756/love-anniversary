<template>
  <div class="letters-page page-container">
    <!-- 页面标题和过滤 -->
    <div class="page-header">
      <h2 class="page-title">
        情书馆
        <span class="count">({{ filteredLetters.length }})</span>
      </h2>
      <div class="header-actions">
        <div class="filters">
          <select v-model="selectedYear" class="filter-select">
            <option value="all">全部年份</option>
            <option v-for="year in store.letterYears" :key="year" :value="year">
              {{ year }}年
            </option>
          </select>
          <div class="search-box">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索情书..."
              class="search-input"
            />
            <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
        </div>
        <!-- 编辑按钮 -->
        <button v-if="!isEditMode" class="edit-btn" @click="openAuthModal">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          编辑
        </button>
        <template v-else>
          <button class="add-btn" @click="openLetterModal()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            情书
          </button>
          <button class="done-btn" @click="exitEditMode">完成</button>
        </template>
      </div>
    </div>

    <!-- 保存状态提示 -->
    <div v-if="saveStatus !== 'idle'" class="save-toast" :class="saveStatus">
      <span>{{ saveMessage }}</span>
    </div>

    <!-- 情书网格 -->
    <div class="letters-grid">
      <div
        v-for="letter in filteredLetters"
        :key="letter.id"
        class="letter-card-wrapper"
        :class="{ 'edit-mode': isEditMode }"
      >
        <LoveLetterCard
          :letter="letter"
          @click="!isEditMode && viewLetter(letter.id)"
        />
        <button v-if="isEditMode" class="delete-letter-btn" @click.stop="deleteLetter(letter.id)">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredLetters.length === 0" class="empty-state">
      <p>暂无情书，写下第一封吧 💌</p>
    </div>

    <!-- 编辑认证弹窗 -->
    <EditAuthModal
      v-model="showAuth"
      :password="authPassword"
      :error="authError"
      @update:password="authPassword = $event"
      @confirm="verifyAuth"
    />

    <!-- 添加/编辑情书弹窗 -->
    <Modal v-model="showLetterModal" :title="editingLetter ? '编辑情书' : '写一封情书'">
      <div class="letter-form">
        <div class="form-group">
          <label>标题</label>
          <input v-model="letterForm.title" type="text" placeholder="给亲爱的你..." />
        </div>
        <div class="form-group">
          <label>日期</label>
          <input v-model="letterForm.date" type="date" />
        </div>
        <div class="form-group">
          <label>标签</label>
          <input v-model="letterForm.tag" type="text" placeholder="例如：纪念日、日常..." />
        </div>
        <div class="form-group">
          <label>内容</label>
          <textarea v-model="letterForm.content" rows="8" placeholder="写下想说的话..."></textarea>
        </div>
      </div>
      <template #footer>
        <button class="btn-text" @click="showLetterModal = false">取消</button>
        <button class="btn-primary" @click="saveLetter">保存</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores'
import LoveLetterCard from '@/components/features/LoveLetterCard.vue'
import Modal from '@/components/common/Modal.vue'
import EditAuthModal from '@/components/common/EditAuthModal.vue'
import { useEditAuth } from '@/composables/useEditAuth'
import { useDebouncedSave } from '@/composables/useDebouncedSave'
import type { Letter } from '@/types'

const router = useRouter()
const store = useAppStore()

const selectedYear = ref('all')
const searchQuery = ref('')

const { isEditMode, showAuth, authPassword, authError, openAuthModal, verifyAuth, exitEditMode } = useEditAuth({
  password: '2025',
})

const { saveStatus, saveMessage, triggerDebouncedSave } = useDebouncedSave()

/* ---------- 添加/编辑情书 ---------- */
const showLetterModal = ref(false)
const editingLetter = ref<Letter | null>(null)
const letterForm = ref({ title: '', date: '', tag: '', content: '' })

const getToday = () => new Date().toISOString().split('T')[0]

function openLetterModal(letter?: Letter) {
  if (letter) {
    editingLetter.value = letter
    letterForm.value = {
      title: letter.title,
      date: letter.date,
      tag: letter.tag || '',
      content: letter.content
    }
  } else {
    editingLetter.value = null
    letterForm.value = { title: '', date: getToday(), tag: '', content: '' }
  }
  showLetterModal.value = true
}

function saveLetter() {
  if (!letterForm.value.title.trim() || !letterForm.value.content.trim()) {
    alert('请填写标题和内容')
    return
  }

  const letterData: Letter = {
    id: editingLetter.value ? editingLetter.value.id : 'letter-' + Date.now(),
    title: letterForm.value.title.trim(),
    content: letterForm.value.content.trim(),
    date: letterForm.value.date || getToday(),
    year: new Date(letterForm.value.date || getToday()).getFullYear(),
    tag: letterForm.value.tag.trim() || undefined
  }

  if (editingLetter.value) {
    const idx = store.letters.findIndex(l => l.id === letterData.id)
    if (idx >= 0) store.letters[idx] = letterData
  } else {
    store.letters.unshift(letterData)
  }

  showLetterModal.value = false
  editingLetter.value = null
  autoSave()
}

function deleteLetter(id: string) {
  if (!confirm('确定要删除这封情书吗？')) return
  store.letters = store.letters.filter(l => l.id !== id)
  autoSave()
}

async function autoSave() {
  triggerDebouncedSave(() => store.saveLetters('2025'))
}

const filteredLetters = computed(() => {
  let result = store.letters

  if (selectedYear.value !== 'all') {
    result = result.filter(l => l.year === Number(selectedYear.value))
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(l =>
      l.title.toLowerCase().includes(query) ||
      l.content.toLowerCase().includes(query)
    )
  }

  return result
})

const viewLetter = (id: string) => {
  router.push(`/letters/${id}`)
}

onMounted(() => {
  if (store.letters.length === 0) {
    store.loadLetters()
  }
})
</script>

<style scoped>
.page-header {
  margin-bottom: var(--space-xl);
}

.header-actions {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-md);
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
}

.filters {
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
  flex: 1;
}

.filter-select {
  padding: 10px 16px;
  border: 1px solid var(--border-base);
  border-radius: var(--radius-md);
  background: var(--bg-container);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  cursor: pointer;
  min-width: 120px;
  transition: all var(--transition-fast);
}

.filter-select:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: var(--shadow-focus);
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: 1px solid var(--border-base);
  border-radius: var(--radius-md);
  background: var(--bg-container);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  transition: all var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: var(--shadow-focus);
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
}

.letters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-md);
}

.letter-card-wrapper {
  position: relative;
}

.letter-card-wrapper.edit-mode :deep(.letter-card) {
  cursor: default;
}

.delete-letter-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: rgba(220, 100, 100, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  transition: all var(--transition-fast);
}
.delete-letter-btn:hover {
  background: rgba(220, 100, 100, 1);
  transform: scale(1.1);
}

/* 编辑按钮 */
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
  flex-shrink: 0;
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

/* 保存状态提示 */
.save-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 24px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  z-index: 1000;
  animation: fadeInDown 0.3s ease;
}
.save-toast.saving {
  background: var(--color-primary);
  color: white;
}
.save-toast.saved {
  background: #5a7050;
  color: white;
}
.save-toast.error {
  background: #c97070;
  color: white;
}
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* 表单 */
.letter-form {
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
.form-group textarea {
  padding: 10px 14px;
  border: 1px solid var(--border-base);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  font-family: inherit;
  resize: vertical;
  transition: all var(--transition-fast);
}
.form-group input:focus,
.form-group textarea:focus {
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
  .letters-grid {
    grid-template-columns: 1fr;
  }
  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .filters {
    flex-direction: column;
  }
  .filter-select {
    width: 100%;
  }
}
</style>
