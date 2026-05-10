<template>
  <div class="letters-page page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <!-- 第一行：标题 + 编辑按钮 -->
      <div class="header-row header-row--primary">
        <h2 class="page-title">
          情书馆
          <span class="count">({{ filteredLetters.length }})</span>
        </h2>
        <div class="primary-actions">
          <button v-if="!isEditMode" class="edit-btn" @click="openAuthModal">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            编辑
          </button>
          <template v-else>
            <button class="add-btn" @click="openAddModal">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              写情书
            </button>
            <button class="done-btn" @click="exitEditMode">完成</button>
          </template>
        </div>
      </div>

      <!-- 第二行：筛选工具 + 电子书按钮 -->
      <div class="header-row header-row--tools">
        <div class="filter-tools">
          <!-- 年份筛选 -->
          <select v-model="selectedYear" class="filter-select">
            <option value="all">全部年份</option>
            <option v-for="year in store.letterYears" :key="year" :value="year">
              {{ year }}年
            </option>
          </select>

          <!-- 搜索框 -->
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

        <!-- 生成电子书按钮 -->
        <button class="ebook-btn-sm" @click="showEbookPicker = true" :disabled="store.letterYears.length === 0" title="生成年度电子书">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          电子书
        </button>
      </div>
    </div>

    <!-- 年份选择弹窗 -->
    <Teleport to="body">
      <div v-if="showEbookPicker" class="ebook-overlay" @click.self="showEbookPicker = false">
        <div class="ebook-picker">
          <div class="picker-header">
            <span>📖 选择年份</span>
            <button class="picker-close" @click="showEbookPicker = false">×</button>
          </div>
          <div class="picker-years">
            <button v-for="year in store.letterYears" :key="year" class="picker-year-btn" @click="generateEbook(year); showEbookPicker = false">
              {{ year }}年
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 年度星光图组件 -->
    <StarryNightChart
      :letters="store.letters"
      @date-selected="handleDateSelect"
      @month-selected="handleMonthSelect"
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

    <!-- 情书网格 -->
    <div class="letters-grid">
      <div
        v-for="letter in filteredLetters"
        :key="letter.id"
        class="letter-card-wrapper"
        :class="{ 'edit-mode': isEditMode }"
      >
        <!-- 删除按钮（编辑模式） -->
        <button
          v-if="isEditMode"
          class="delete-btn"
          @click="deleteLetter(letter.id)"
          title="删除情书"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>

        <LoveLetterCard
          :letter="letter"
          @click="isEditMode ? editLetter(letter) : viewLetter(letter.id)"
        />
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredLetters.length === 0" class="empty-state">
      <p v-if="selectedDate !== null">这一天还没有情书记录</p>
      <p v-else-if="selectedYear !== 'all' || selectedMonth !== 'all'">
        {{ selectedYear !== 'all' ? selectedYear + '年' : '' }}{{ selectedMonth !== 'all' ? selectedMonth + '月' : '' }}暂无情书记录
      </p>
      <p v-else>暂无情书，写下第一封吧 💌</p>
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
    <Modal v-model="showAddModal" :title="editingLetter ? '编辑情书' : '写情书'">
      <div class="letter-form">
        <div class="form-group">
          <label>标题</label>
          <input v-model="letterForm.title" type="text" placeholder="给这封情书起个名字..." maxlength="50" />
        </div>
        <div class="form-group">
          <label>日期</label>
          <input v-model="letterForm.date" type="date" />
        </div>
        <div class="form-group">
          <label>内容</label>
          <textarea
            v-model="letterForm.content"
            rows="8"
            placeholder="写下你想说的话..."
          ></textarea>
        </div>
        <div class="form-group">
          <label>标签</label>
          <select v-model="letterForm.tag">
            <option value="日常">日常</option>
            <option value="纪念日">纪念日</option>
            <option value="旅行">旅行</option>
            <option value="道歉">道歉</option>
            <option value="感谢">感谢</option>
          </select>
        </div>
      </div>
      <template #footer>
        <button class="btn-text" @click="showAddModal = false">取消</button>
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
// @ts-ignore
import StarryNightChart from '@/components/features/StarryNightChart.vue'
import EditAuthModal from '@/components/common/EditAuthModal.vue'
import Modal from '@/components/common/Modal.vue'
import { useEditAuth } from '@/composables/useEditAuth'
import { useDebouncedSave } from '@/composables/useDebouncedSave'
import type { Letter } from '@/types'

const router = useRouter()
const store = useAppStore()

// 编辑认证
const { isEditMode, showAuth, authPassword, authError, openAuthModal, verifyAuth, exitEditMode } = useEditAuth({
  password: '2025',
})

// 保存状态
const { saveStatus, saveMessage, triggerDebouncedSave } = useDebouncedSave()

// 筛选
const selectedYear = ref('all')
const selectedMonth: any = ref('all')
const searchQuery = ref('')
const selectedDate = ref<string | null>(null)
const showEbookPicker = ref(false)

// 添加/编辑情书
const showAddModal = ref(false)
const editingLetter = ref<Letter | null>(null)
interface LetterForm {
  title: string
  date: string
  content: string
  tag: string
  id?: string
}

const letterForm = ref<LetterForm>({
  title: '',
  date: new Date().toISOString().split('T')[0] || '',
  content: '',
  tag: '日常',
  id: undefined
})

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

const openAddModal = () => {
  editingLetter.value = null
  letterForm.value = {
    title: '',
    date: new Date().toISOString().split('T')[0] || '',
    content: '',
    tag: '日常'
  }
  showAddModal.value = true
}

const editLetter = (letter: Letter) => {
  editingLetter.value = letter
  letterForm.value = {
    title: letter.title,
    date: letter.date,
    content: letter.content,
    tag: letter.tag || '日常'
  }
  showAddModal.value = true
}

const saveLetter = () => {
  if (!letterForm.value.title.trim()) {
    alert('请输入标题')
    return
  }
  if (!letterForm.value.content.trim()) {
    alert('请输入内容')
    return
  }

  const formData = letterForm.value
  if (editingLetter.value) {
    // 编辑现有情书 - 直接修改数组元素，Vue 响应式会跟踪
    const index = store.letters.findIndex(l => l.id === editingLetter.value!.id)
    if (index >= 0) {
      const year = new Date(formData.date || '').getFullYear() || new Date().getFullYear()
      const letters = store.letters as unknown as Letter[]
      const existing = letters[index]
      if (existing) {
        letters[index] = {
          ...existing,
          title: formData.title.trim(),
          content: formData.content.trim(),
          date: formData.date,
          tag: formData.tag,
          year
        }
      }
    }
  } else {
    // 添加新情书
    const year = new Date(formData.date || '').getFullYear() || new Date().getFullYear()
    const letters = store.letters as unknown as Letter[]
    letters.push({
      id: 'letter_' + Date.now(),
      title: formData.title.trim(),
      content: formData.content.trim(),
      date: formData.date,
      tag: formData.tag,
      year,
      isFavorite: false
    })
  }

  showAddModal.value = false
  editingLetter.value = null

  // 保存到 GitHub
  triggerDebouncedSave(() => store.saveLetters('2025'))
}

const deleteLetter = (id: string) => {
  if (!confirm('确定要删除这封情书吗？')) return
  const letters = store.letters as unknown as Letter[]
  const index = letters.findIndex(l => l.id === id)
  if (index >= 0) {
    letters.splice(index, 1)
  }
  triggerDebouncedSave(() => store.saveLetters('2025'))
}

const handleDateSelect = (payload: { date: string } | null) => {
  if (payload === null) {
    selectedDate.value = null
  } else {
    selectedDate.value = payload.date
    selectedYear.value = 'all'
    selectedMonth.value = 'all'
    searchQuery.value = ''
  }
}

const handleMonthSelect = (month: number | string | null | undefined) => {
  if (month === null || month === undefined) {
    selectedMonth.value = 'all'
  } else {
    selectedMonth.value = String(month)
    selectedDate.value = null
    searchQuery.value = ''
  }
}

const clearFilters = () => {
  selectedDate.value = null
  selectedYear.value = 'all'
  selectedMonth.value = 'all'
  searchQuery.value = ''
}

// 电子书生成函数（保持不变）
const generateEbook = (year: number) => {
  const yearLetters = store.letters
    .filter(l => l.year === year)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  if (yearLetters.length === 0) {
    alert(`${year}年暂无情书记录`)
    return
  }

  const formatDate = (d: string) => {
    const parts = d.split('-')
    return `${parts[0]}年${Number(parts[1])}月${Number(parts[2])}日`
  }

  const toRoman = (n: number): string => {
    const vals: number[] = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
    const syms: string[] = ['m', 'cm', 'd', 'cd', 'c', 'xc', 'l', 'xl', 'x', 'ix', 'v', 'iv', 'i']
    let s = ''
    let num = n
    vals.forEach((val, i) => {
      const sym = syms[i]!
      while (num >= val) { s += sym; num -= val }
    })
    return s
  }

  const makeDropCap = (content: string) => {
    const trimmed = content.trim()
    if (trimmed.length === 0) return content
    const salutations = ['亲爱的', '致', 'Hi', '你好', '宝贝']
    let start = 0
    for (const s of salutations) {
      if (trimmed.startsWith(s)) { start = s.length; break }
    }
    const firstChar = trimmed[start]
    const rest = trimmed.slice(start + 1)
    return `<span class="drop-cap">${firstChar}</span>${rest}`
  }

  const lettersHTML = yearLetters.map((letter, index) => `
    <div class="letter-page">
      <div class="letter-date-head">
        <span class="date-line"></span>
        <span class="date-text">${formatDate(letter.date)}</span>
        <span class="date-line"></span>
      </div>
      <h2 class="letter-title">${letter.title}</h2>
      <div class="letter-body">${makeDropCap(letter.content)}</div>
      <div class="page-num-print"></div>
    </div>
    ${index < yearLetters.length - 1 ? '<div class="page-break"></div>' : ''}
  `).join('')

  const tocHTML = yearLetters.map((l, i) => {
    const dateStr = formatDate(l.date)
    const nameLen = l.title.length
    const dateLen = dateStr.length
    const dotCount = Math.max(4, 28 - nameLen - dateLen)
    return `
      <div class="toc-entry">
        <span class="toc-num">${String(i + 1).padStart(2, '0')}</span>
        <span class="toc-name">${l.title}</span>
        <span class="toc-dots">${'·'.repeat(dotCount)}</span>
        <span class="toc-date">${dateStr}</span>
      </div>
    `
  }).join('')

  const ebookHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${year}年 · 年度情书电子书</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&family=Noto+Serif+SC:wght@400;700&family=Ma+Shan+Zheng&display=swap" rel="stylesheet">
<style>
  @page { size: A5 portrait; margin: 0; }
  @page :first { margin: 0; }
  @media print {
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .no-print, .print-toolbar { display: none !important; }
    .letter-page { page-break-inside: avoid; }
    .page-break { page-break-before: always; }
    .cover { page-break-after: always; }
    .toc { page-break-after: always; }
    .colophon { page-break-before: always; }
    .page-num-print { display: block !important; }
  }
  @media screen { .page-num-print { display: none; } }
  .toc { counter-reset: toc-page; }
  .toc .page-num-print {
    position: absolute; bottom: 12mm; left: 0; right: 0; text-align: center;
    counter-increment: toc-page; font-family: "Noto Sans SC", sans-serif; font-size: 8pt; color: #A8A8A8;
  }
  .toc .page-num-print::after { content: counter(toc-page, lower-roman); }
  .content-body { counter-reset: page 1; }
  .letter-page .page-num-print {
    position: absolute; bottom: 12mm; left: 0; right: 0; text-align: center;
    counter-increment: page; font-family: "Noto Sans SC", sans-serif; font-size: 8pt; color: #A8A8A8;
  }
  .letter-page .page-num-print::after { content: counter(page); }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 148mm; margin: 0 auto; background: #FEFBF6; color: #3A3A3A; font-family: "Noto Serif SC", "Ma Shan Zheng", "Source Han Serif SC", serif; font-size: 11pt; line-height: 1.8; -webkit-font-smoothing: antialiased; }
  .print-toolbar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
    background: linear-gradient(135deg, #FDF6EC, #FFF5F5);
    border-bottom: 1px solid #E8D4C8; padding: 10px 20px;
    display: flex; align-items: center; gap: 14px; font-family: "Noto Sans SC", sans-serif;
    box-shadow: 0 2px 12px rgba(184,151,154,0.18);
  }
  .print-tips-bar { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
  .print-toolbar .tips-icon { font-size: 16px; flex-shrink: 0; }
  .print-tips-bar span:last-child { font-size: 12.5px; color: #7A6058; white-space: nowrap; }
  .cover {
    height: 210mm; padding: 20mm; display: flex; flex-direction: column;
    justify-content: center; align-items: center; text-align: center;
    background: #FEFBF6; position: relative; overflow: hidden; box-sizing: border-box;
  }
  .cover::before {
    content: ""; position: absolute; inset: 0;
    background: radial-gradient(circle at 20% 30%, rgba(201,168,169,0.08) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(216,196,182,0.10) 0%, transparent 50%);
    pointer-events: none;
  }
  .cover-ornament { font-size: 48px; margin-bottom: 36px; position: relative; }
  .cover-year { font-family: "Ma Shan Zheng", "Noto Serif SC", serif; font-size: 48pt; font-weight: 400; color: #B8979A; letter-spacing: 4px; line-height: 1.1; margin-bottom: 12px; position: relative; }
  .cover-subtitle { font-family: "Noto Serif SC", serif; font-size: 14pt; color: #9A7A7C; font-style: italic; margin-bottom: 32px; position: relative; }
  .cover-divider { width: 60px; height: 1px; background: linear-gradient(90deg, transparent, #C9A8A9, transparent); margin-bottom: 20px; position: relative; }
  .cover-meta { font-family: "Noto Sans SC", sans-serif; font-size: 10pt; color: #A8A8A8; position: relative; }
  .cover-count { display: inline-block; margin-top: 16px; padding: 6px 20px; border: 1px solid rgba(201,168,169,0.4); border-radius: 20px; font-family: "Noto Sans SC", sans-serif; font-size: 9pt; color: #B8979A; background: rgba(201,168,169,0.06); position: relative; }
  .toc { padding: 20mm 20mm 15mm 20mm; position: relative; min-height: 210mm; box-sizing: border-box; }
  .toc-title { font-family: "Noto Sans SC", sans-serif; font-weight: 700; font-size: 16pt; color: #B8979A; text-align: center; margin-bottom: 8mm; letter-spacing: 4px; }
  .toc-entry { display: flex; align-items: baseline; padding: 7px 0; gap: 6px; }
  .toc-num { font-family: "Noto Sans SC", sans-serif; font-size: 9pt; color: #C9A8A9; min-width: 28px; flex-shrink: 0; }
  .toc-name { font-family: "Noto Serif SC", serif; font-size: 10.5pt; color: #4A4A4A; flex-shrink: 0; }
  .toc-dots { flex: 1; font-size: 8pt; color: #D5CFC8; letter-spacing: 2px; overflow: hidden; white-space: nowrap; }
  .toc-date { font-family: "Noto Sans SC", sans-serif; font-size: 8.5pt; color: #A8A8A8; flex-shrink: 0; }
  .content-body { }
  .letter-page { padding: 20mm 20mm 18mm 20mm; min-height: 210mm; position: relative; box-sizing: border-box; page-break-inside: avoid; }
  .page-break { page-break-before: always; }
  .letter-date-head { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 6mm; }
  .date-line { flex: 0 0 40px; height: 1px; background: linear-gradient(90deg, transparent, #D5CFC8); }
  .date-line:last-child { background: linear-gradient(90deg, #D5CFC8, transparent); }
  .date-text { font-family: "Noto Sans SC", sans-serif; font-size: 9pt; color: #A8A8A8; letter-spacing: 1px; white-space: nowrap; }
  .letter-title { font-family: "Noto Serif SC", serif; font-weight: 700; font-size: 13pt; color: #4A4A4A; text-align: center; margin-bottom: 6mm; line-height: 1.5; }
  .letter-body { font-family: "Noto Serif SC", "Ma Shan Zheng", serif; font-size: 11pt; line-height: 1.9; color: #3A3A3A; text-align: justify; text-indent: 0; }
  .drop-cap { font-family: "Ma Shan Zheng", "Noto Serif SC", serif; font-size: 2.4em; line-height: 1; float: left; margin-right: 6px; margin-top: 2px; color: #B8979A; font-weight: 400; }
  .colophon { height: 210mm; padding: 20mm; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; position: relative; box-sizing: border-box; background: #FEFBF6; }
  .colophon .page-num-print { position: absolute; bottom: 12mm; left: 0; right: 0; text-align: center; counter-increment: page; font-family: "Noto Sans SC", sans-serif; font-size: 8pt; color: #A8A8A8; }
  .colophon .page-num-print::after { content: counter(page); }
  .colophon-flower { font-size: 28px; margin-bottom: 16px; }
  .colophon-text { font-family: "Noto Serif SC", serif; font-size: 11pt; color: #A8A8A8; margin-bottom: 8px; }
  .colophon-italic { font-family: "Noto Serif SC", serif; font-style: italic; font-size: 10pt; color: #C9A8A9; }
  @media screen {
    html, body { box-shadow: 0 0 40px rgba(100,80,75,0.10); }
    .cover, .colophon { min-height: 210mm; height: auto; }
  }
</style>
</head>
<body>
  <div class="cover">
    <div class="cover-ornament">💌</div>
    <div class="cover-year">${year}</div>
    <div class="cover-subtitle">年度情书集</div>
    <div class="cover-divider"></div>
    <div class="cover-meta">我们的故事，一字一句，都是爱</div>
    <div class="cover-count">共 ${yearLetters.length} 封情书</div>
  </div>
  <div class="toc">
    <div class="toc-title">— 目 录 —</div>
    ${tocHTML}
    <div class="page-num-print"></div>
  </div>
  <div class="content-body">
    ${lettersHTML}
  </div>
  <div class="colophon">
    <div class="page-num-print"></div>
    <div class="colophon-flower">🌸</div>
    <div class="colophon-text">这是我们 ${year} 年的故事</div>
    <div class="colophon-italic">每一个字，都满载着爱</div>
  </div>
  <div class="print-toolbar">
    <div class="print-tips-bar">
      <span class="tips-icon">💡</span>
      <span>打印时请关闭「页眉和页脚」→ 选「保存为 PDF」</span>
    </div>
    <button onclick="window.print()" style="padding:8px 18px;background:#B8979A;color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer;font-family:'Noto Sans SC',sans-serif;box-shadow:0 3px 10px rgba(184,151,154,0.35);white-space:nowrap">
      🖨️ 打印 / PDF
    </button>
    <button onclick="document.querySelector('.print-toolbar').style.display='none'" style="padding:8px 12px;background:#F0EBE6;color:#9A7A7C;border:none;border-radius:8px;font-size:13px;cursor:pointer;">
      ✕
    </button>
  </div>
</body>
</html>`

  const blob = new Blob([ebookHTML], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
}

onMounted(() => {
  if (store.letters.length === 0) {
    store.loadLetters()
  }
})
</script>

<style scoped>
/* ========== 页面头部 ========== */
.page-header {
  margin-bottom: var(--space-xl);
}

/* 第一行：标题 + 编辑按钮 */
.header-row--primary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.primary-actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-shrink: 0;
}

/* 第二行：筛选工具 + 电子书按钮 */
.header-row--tools {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-md);
}

.filter-tools {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex: 1;
  min-width: 0;
}

.edit-btn, .done-btn, .add-btn {
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

/* ========== 电子书按钮 ========== */
.ebook-btn-sm {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px 16px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
  flex-shrink: 0;
}
.ebook-btn-sm:hover:not(:disabled) {
  background: #b8979a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(201, 168, 169, 0.4);
}
.ebook-btn-sm:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* ========== 筛选器 ========== */
.filters {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-md);
  flex-wrap: wrap;
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

/* ========== 情书网格 ========== */
.letters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-md);
}

.letter-card-wrapper {
  position: relative;
}

.letter-card-wrapper.edit-mode {
  cursor: pointer;
}

.delete-btn {
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
.delete-btn:hover {
  background: rgba(220, 100, 100, 1);
  transform: scale(1.1);
}

/* ========== 电子书弹窗 ========== */
.ebook-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.ebook-picker {
  background: white;
  border-radius: 16px;
  padding: 24px;
  min-width: 240px;
  box-shadow: 0 20px 60px rgba(100, 80, 75, 0.18);
  animation: picker-in 0.2s ease-out;
}

@keyframes picker-in {
  from { opacity: 0; transform: scale(0.95) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  font-weight: 600;
  font-size: 15px;
  color: var(--text-primary);
}

.picker-close {
  border: none;
  background: none;
  font-size: 22px;
  color: var(--text-tertiary);
  cursor: pointer;
  line-height: 1;
  padding: 0 4px;
}
.picker-close:hover { color: var(--text-primary); }

.picker-years {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.picker-year-btn {
  padding: 10px 16px;
  border: 1px solid #E5DED8;
  border-radius: var(--radius-md);
  background: #FAF8F5;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
}
.picker-year-btn:hover {
  border-color: var(--color-primary);
  background: #FFF8F6;
  color: var(--color-primary);
}

/* ========== 筛选提示 ========== */
.filter-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-md);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.clear-filter {
  padding: 4px 12px;
  background: var(--color-primary-light);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-full);
  color: var(--color-primary-dark);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.clear-filter:hover {
  background: var(--color-primary);
  color: var(--text-inverse);
}

/* ========== 表单 ========== */
.letter-form {
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
.form-group textarea,
.form-group select {
  padding: 10px 14px;
  border: 1px solid var(--border-base);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  resize: vertical;
  transition: all var(--transition-fast);
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: var(--shadow-focus);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--text-tertiary);
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

/* ========== 空状态 ========== */
.empty-state {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--text-tertiary);
  font-size: var(--font-size-lg);
}

@media (max-width: 768px) {
  .letters-grid {
    grid-template-columns: 1fr;
  }

  /* 第一行：移动端堆叠 */
  .header-row--primary {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 14px;
  }

  .primary-actions {
    width: 100%;
    justify-content: flex-end;
  }

  /* 第二行：移动端堆叠 */
  .header-row--tools {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .filter-tools {
    flex-direction: column;
    gap: 8px;
  }

  .filter-select {
    width: 100%;
  }
}
</style>
