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
        <!-- 生成电子书按钮（非编辑模式可见） -->
        <button v-if="!isEditMode" class="yearbook-btn" @click="openYearbookModal">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          电子书
        </button>
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

    <!-- 时间脉络星光图 -->
    <StarryNightChart
      :letters="store.letters"
      @month-selected="handleMonthSelect"
      @date-selected="handleDateSelect"
    />

    <!-- 情书关键词云 -->
    <WordCloud
      v-if="wordCloudData.length > 0"
      :words="wordCloudData"
      @word-click="handleWordCloudClick"
    />

    <!-- 筛选状态提示 -->
    <div v-if="selectedDate !== null || selectedYear !== 'all' || selectedMonth !== 'all'" class="filter-hint">
      <span v-if="selectedDate !== null">📅 正在查看 {{ selectedDate }} 的情书</span>
      <span v-else>
        正在查看
        <template v-if="selectedYear !== 'all'">{{ selectedYear }}年</template>
        <template v-if="selectedMonth !== 'all'">{{ selectedMonth }}月</template>
        的情书
      </span>
      <button class="clear-filter" @click="clearFilters">清除筛选</button>
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

    <!-- 电子书生成弹窗 -->
    <Modal v-model="showYearbookModal" title="生成年度电子书">
      <div class="yearbook-form">
        <p class="yearbook-desc">将该年所有情书生成精美的电子书，可在浏览器中直接保存为 PDF 💌</p>
        <div class="form-group">
          <label>选择年份</label>
          <select v-model="yearbookYear" class="filter-select" style="width:100%">
            <option v-for="y in store.letterYears" :key="y" :value="y">{{ y }}年（{{ getYearLetterCount(y) }}封）</option>
          </select>
        </div>
        <div class="form-group">
          <label>署名</label>
          <input v-model="yearbookAuthor" type="text" placeholder="例如：你和我 / 志浩和小丽" />
        </div>
      </div>
      <template #footer>
        <button class="btn-text" @click="showYearbookModal = false">取消</button>
        <button class="btn-primary" @click="generateYearbook">生成并预览</button>
      </template>
    </Modal>

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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores'
import LoveLetterCard from '@/components/features/LoveLetterCard.vue'
import Modal from '@/components/common/Modal.vue'
import EditAuthModal from '@/components/common/EditAuthModal.vue'
// @ts-ignore: StarryNightChart.vue 无类型声明文件
import StarryNightChart from '@/components/features/StarryNightChart.vue'
import WordCloud from '@/components/features/WordCloud.vue'
import { useEditAuth } from '@/composables/useEditAuth'
import { useDebouncedSave } from '@/composables/useDebouncedSave'
import { useYearbookGenerator } from '@/composables/useYearbookGenerator'
import type { Letter } from '@/types'

const router = useRouter()
const store = useAppStore()

const selectedYear = ref('all')
const selectedMonth = ref('all')
const selectedDate = ref<string | null>(null)
const searchQuery = ref('')

const { isEditMode, showAuth, authPassword, authError, openAuthModal, verifyAuth, exitEditMode } = useEditAuth({
  password: '202505174everZHZY',
})

const { saveStatus, saveMessage, triggerDebouncedSave } = useDebouncedSave()
const { openYearbook } = useYearbookGenerator()

/* ---------- 星光图筛选 ---------- */
function handleMonthSelect(month: number | null) {
  if (month === null) {
    selectedMonth.value = 'all'
  } else {
    selectedMonth.value = String(month)
    selectedDate.value = null
    searchQuery.value = ''
  }
}

function handleDateSelect(date: string | null) {
  if (date === null) {
    selectedDate.value = null
  } else {
    selectedDate.value = date
    selectedMonth.value = 'all'
    searchQuery.value = ''
  }
}

function clearFilters() {
  selectedYear.value = 'all'
  selectedMonth.value = 'all'
  selectedDate.value = null
  searchQuery.value = ''
}

/* ---------- 年度电子书 ---------- */
const showYearbookModal = ref(false)
const yearbookYear = ref<number>(new Date().getFullYear())
const yearbookAuthor = ref('你和我')

function openYearbookModal() {
  // 默认选最近一年
  const firstYear = store.letterYears[0]
  if (firstYear !== undefined) {
    yearbookYear.value = firstYear
  }
  showYearbookModal.value = true
}

function getYearLetterCount(year: number) {
  return store.letters.filter(l => l.year === year).length
}

function generateYearbook() {
  const letters = store.letters.filter(l => l.year === yearbookYear.value)
  if (letters.length === 0) {
    alert('该年暂无情书')
    return
  }
  showYearbookModal.value = false
  openYearbook(yearbookYear.value, letters, yearbookAuthor.value || '你和我')
}

/* ---------- 添加/编辑情书 ---------- */
const showLetterModal = ref(false)
const editingLetter = ref<Letter | null>(null)
const letterForm = ref<{ title: string; date: string; tag: string; content: string }>({ title: '', date: '', tag: '', content: '' })

const getToday = (): string => new Date().toISOString().split('T')[0] ?? new Date().toISOString().slice(0, 10)

function openLetterModal(letter?: Letter) {
  if (letter) {
    editingLetter.value = letter
    letterForm.value = {
      title: letter.title,
      date: letter.date,
      tag: letter.tag ?? '',
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
  triggerDebouncedSave(() => store.saveLetters('202505174everZHZY'))
}

/* ---------- 词云数据（响应式筛选） ---------- */
const STOP_WORDS = ['我们', '一起', '这个', '那个', '然后', '因为', '所以', '可以', '已经', '还是',
  '没有', '不是', '只是', '但是', '如果', '知道', '觉得', '现在', '今天', '昨天',
  '明天', '想要', '不会', '不能', '她的', '什么', '怎么', '这么', '真的', '非常']

const wordCloudData = ref<{ text: string; weight: number; id?: string }[]>([])

// 防抖定时器
let wordCloudDebounceTimer: ReturnType<typeof setTimeout> | null = null

/**
 * 从情书内容提取词云数据
 * 使用 filteredLetters（筛选后）而非 store.letters（全部）
 */
function extractWordCloudData() {
  // 清除之前的防抖定时器
  if (wordCloudDebounceTimer) {
    clearTimeout(wordCloudDebounceTimer)
  }

  // 防抖：100ms 后执行
  wordCloudDebounceTimer = setTimeout(() => {
    const letters = filteredLetters.value

    if (letters.length === 0) {
      wordCloudData.value = []
      return
    }

    // 合并标题和内容
    const allContent = letters
      .map(l => `${l.title} ${l.content}`)
      .join(' ')

    // 匹配 2 个及以上中文字符
    const words = allContent.match(/[\u4e00-\u9fa5]{2,}/g) || []

    const freq: Record<string, number> = {}
    words.forEach(w => {
      freq[w] = (freq[w] || 0) + 1
    })

    // 过滤停用词
    STOP_WORDS.forEach(w => { delete freq[w] })

    // 转换为词云数据格式
    const entries = Object.entries(freq)
      .filter(([text]) => text.length >= 2)
      .map(([text, weight]) => ({
        text,
        weight,
        id: letters.find(l => l.title.includes(text) || l.content.includes(text))?.id
      }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 80)

    wordCloudData.value = entries
  }, 100)
}

function handleWordCloudClick(letterId: string) {
  const target = document.getElementById(`letter-${letterId}`)
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    target.classList.add('highlight')
    setTimeout(() => target.classList.remove('highlight'), 2000)
  }
}

/* ---------- 情书列表 ---------- */
const filteredLetters = computed(() => {
  let result = store.letters

  // 日期筛选优先（星光图点击触发）
  if (selectedDate.value !== null) {
    result = result.filter(letter => letter.date === selectedDate.value)
    return result
  }

  if (selectedYear.value !== 'all') {
    result = result.filter(l => l.year === Number(selectedYear.value))
  }

  // 月份筛选（可按所有年份筛选某个月）
  if (selectedMonth.value !== 'all') {
    result = result.filter(l => {
      const parts = l.date.split('-')
      const month = parts[1] ? parseInt(parts[1]) : 0
      return month === Number(selectedMonth.value)
    })
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
  extractWordCloudData()
})

// 监听 store.letters 变化（数据加载）
watch(() => store.letters, () => {
  extractWordCloudData()
}, { deep: true })

// 监听筛选条件变化 → 重新生成词云
watch(
  [selectedYear, selectedMonth, selectedDate, searchQuery],
  () => {
    extractWordCloudData()
  },
  { flush: 'post' }
)
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

/* 词云点击高亮效果 */
.letter-card-wrapper.highlight {
  animation: pulse-highlight 2s ease;
  box-shadow: 0 0 0 3px rgba(224, 99, 119, 0.3);
}

@keyframes pulse-highlight {
  0%, 100% { box-shadow: 0 0 0 3px rgba(224, 99, 119, 0); }
  50% { box-shadow: 0 0 0 3px rgba(224, 99, 119, 0.6); }
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
.edit-btn, .add-btn, .done-btn, .yearbook-btn {
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

.yearbook-btn {
  background: var(--bg-surface);
  color: var(--text-secondary);
  border: 1px solid var(--border-base);
}
.yearbook-btn:hover {
  background: var(--morandi-deep, #9B7B76);
  color: white;
  border-color: transparent;
}

/* 电子书弹窗 */
.yearbook-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-md) 0;
}
.yearbook-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.6;
  padding: 12px 16px;
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--color-primary);
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
