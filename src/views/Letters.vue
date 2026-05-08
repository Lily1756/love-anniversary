<template>
  <div class="letters-page page-container">
    <!-- 页面标题和过滤 -->
    <div class="page-header">
      <h2 class="page-title">
        情书馆
        <span class="count">({{ filteredLetters.length }})</span>
      </h2>
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
        <!-- 生成电子书按钮 -->
        <button class="ebook-btn-sm" @click="showEbookPicker = true" :disabled="store.letterYears.length === 0" title="生成年度电子书">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          电子书
        </button>
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
    </div>

    <!-- 年度星光图组件 -->
    <StarryNightChart
      :letters="store.letters"
      @date-selected="handleDateSelect"
    />

    <!-- 筛选状态提示 -->
    <div v-if="selectedDate !== null" class="filter-hint">
      <span>📅 正在查看 {{ selectedDate }} 的情书</span>
      <button class="clear-filter" @click="handleDateSelect(null)">清除筛选</button>
    </div>

    <!-- 情书网格 -->
    <div class="letters-grid">
      <LoveLetterCard
        v-for="letter in filteredLetters"
        :key="letter.id"
        :letter="letter"
        @click="viewLetter(letter.id)"
      />
    </div>

    <!-- 空状态 -->
    <div v-if="filteredLetters.length === 0" class="empty-state">
      <p>{{ selectedDate !== null ? '这一天还没有情书记录' : '暂无情书，写下第一封吧 💌' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores'
import LoveLetterCard from '@/components/features/LoveLetterCard.vue'
// @ts-ignore
import StarryNightChart from '@/components/features/StarryNightChart.vue'
import type { Letter } from '@/types'

const router = useRouter()
const store = useAppStore()

const selectedYear = ref('all')
const searchQuery = ref('')
const selectedDate = ref<string | null>(null)
const showEbookPicker = ref(false)

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

const handleDateSelect = (payload: { date: string } | null) => {
  if (payload === null) {
    selectedDate.value = null
  } else {
    selectedDate.value = payload.date
    selectedYear.value = 'all'
    searchQuery.value = ''
  }
}

const generateEbook = (year: number) => {
  const yearLetters = store.letters
    .filter(l => l.year === year)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  if (yearLetters.length === 0) {
    alert(`${year}年暂无情书记录`)
    return
  }

  // 格式化日期：2026-05-09 → 2026年5月9日
  const formatDate = (d: string) => {
    const parts = d.split('-')
    return `${parts[0]}年${Number(parts[1])}月${Number(parts[2])}日`
  }

  // 首字下沉处理：取正文第一个非空白字符，剩余部分包裹在 <span> 内
  const makeDropCap = (content: string) => {
    const trimmed = content.trim()
    if (trimmed.length === 0) return content
    // 如果内容以常见称呼开头（亲爱的/致/Hi等），从称呼后开始
    const salutations = ['亲爱的', '致', 'Hi', '你好', '宝贝']
    let start = 0
    for (const s of salutations) {
      if (trimmed.startsWith(s)) {
        start = s.length
        break
      }
    }
    const firstChar = trimmed[start]
    const rest = trimmed.slice(start + 1)
    return `<span class="drop-cap">${firstChar}</span>${rest}`
  }

  const lettersHTML = yearLetters.map((letter, index) => `
    <div class="letter-page">
      <div class="page-number"></div>
      <!-- 日期抬头 -->
      <div class="letter-date-head">
        <span class="date-line"></span>
        <span class="date-text">${formatDate(letter.date)}</span>
        <span class="date-line"></span>
      </div>
      <!-- 标题 -->
      <h2 class="letter-title">${letter.title}</h2>
      <!-- 正文 -->
      <div class="letter-body">${makeDropCap(letter.content)}</div>
      ${index < yearLetters.length - 1 ? '<div class="page-break"></div>' : ''}
    </div>
  `).join('')

  const tocHTML = yearLetters.map((l, i) => {
    const dateStr = formatDate(l.date)
    // 虚线填充：计算需要多长的虚线
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
  /* ============================================
     A5 出版物级电子书样式
     ============================================ */

  /* ---------- 打印设置：A5 + 边距 ---------- */
  @page {
    size: A5;
    margin: 20mm;
  }

  /* 覆盖：去掉浏览器自带页眉页脚（URL/日期等） */
  @media print {
    @page {
      /* Chromium 隐藏浏览器默认页眉页脚的关键 */
      margin: 20mm;
    }
    body {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .no-print { display: none !important; }
    .print-tips { display: none !important; }
    .letter-page { page-break-inside: avoid; }
    .page-break { page-break-before: always; }
  }


  /* ---------- 页码 ---------- */
  .page-number {
    position: absolute;
    bottom: -15mm;
    left: 0;
    right: 0;
    text-align: center;
    font-family: "Noto Sans SC", sans-serif;
    font-size: 8pt;
    color: #A8A8A8;
  }
  /* ---------- 全局重置 ---------- */
  * { box-sizing: border-box; margin: 0; padding: 0; }

  html, body {
    width: 148mm;
    min-height: 210mm;
    margin: 0 auto;
    background: #FEFBF6;
    color: #3A3A3A;
    font-family: "Noto Serif SC", "Ma Shan Zheng", "Source Han Serif SC", serif;
    font-size: 11pt;
    line-height: 1.8;
    -webkit-font-smoothing: antialiased;
  }

  /* ---------- 封面 ---------- */
  .cover {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 210mm;          /* A5 高度 */
    text-align: center;
    page-break-after: always;
    background: #FEFBF6;
    position: relative;
    overflow: hidden;
  }
  /* 装饰纹理背景 */
  .cover::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 20% 30%, rgba(201,168,169,0.08) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(216,196,182,0.10) 0%, transparent 50%);
    pointer-events: none;
  }
  .cover-ornament {
    font-size: 48px;
    margin-bottom: 36px;
    position: relative;
  }
  .cover-year {
    font-family: "Ma Shan Zheng", "Noto Serif SC", serif;
    font-size: 48pt;
    font-weight: 400;
    color: #B8979A;
    letter-spacing: 4px;
    line-height: 1.1;
    margin-bottom: 12px;
    position: relative;
  }
  .cover-subtitle {
    font-family: "Noto Serif SC", serif;
    font-size: 14pt;
    color: #9A7A7C;
    font-style: italic;
    margin-bottom: 32px;
    position: relative;
  }
  .cover-divider {
    width: 60px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #C9A8A9, transparent);
    margin-bottom: 20px;
    position: relative;
  }
  .cover-meta {
    font-family: "Noto Sans SC", sans-serif;
    font-size: 10pt;
    color: #A8A8A8;
    position: relative;
  }
  .cover-count {
    display: inline-block;
    margin-top: 16px;
    padding: 6px 20px;
    border: 1px solid rgba(201,168,169,0.4);
    border-radius: 20px;
    font-family: "Noto Sans SC", sans-serif;
    font-size: 9pt;
    color: #B8979A;
    background: rgba(201,168,169,0.06);
    position: relative;
  }

  /* ---------- 目录 ---------- */
  .toc {
    page-break-after: always;
    padding-top: 10mm;
  }
  .toc-title {
    font-family: "Noto Sans SC", sans-serif;
    font-weight: 700;
    font-size: 16pt;
    color: #B8979A;
    text-align: center;
    margin-bottom: 8mm;
    letter-spacing: 4px;
  }
  .toc-entry {
    display: flex;
    align-items: baseline;
    padding: 7px 0;
    gap: 6px;
  }
  .toc-num {
    font-family: "Noto Sans SC", sans-serif;
    font-size: 9pt;
    color: #C9A8A9;
    min-width: 28px;
    flex-shrink: 0;
  }
  .toc-name {
    font-family: "Noto Serif SC", serif;
    font-size: 10.5pt;
    color: #4A4A4A;
    flex-shrink: 0;
  }
  .toc-dots {
    flex: 1;
    font-size: 8pt;
    color: #D5CFC8;
    letter-spacing: 2px;
    overflow: hidden;
    white-space: nowrap;
  }
  .toc-date {
    font-family: "Noto Sans SC", sans-serif;
    font-size: 8.5pt;
    color: #A8A8A8;
    flex-shrink: 0;
  }

  /* ---------- 正文页 ---------- */
  .letter-page {
    page-break-inside: avoid;
    padding-top: 5mm;
    padding-bottom: 5mm;
  }
  .page-break {
    page-break-before: always;
  }

  /* 日期抬头 */
  .letter-date-head {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 6mm;
  }
  .date-line {
    flex: 0 0 40px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #D5CFC8);
  }
  .date-line:last-child {
    background: linear-gradient(90deg, #D5CFC8, transparent);
  }
  .date-text {
    font-family: "Noto Sans SC", sans-serif;
    font-size: 9pt;
    color: #A8A8A8;
    letter-spacing: 1px;
    white-space: nowrap;
  }

  /* 信件标题 */
  .letter-title {
    font-family: "Noto Serif SC", serif;
    font-weight: 700;
    font-size: 13pt;
    color: #4A4A4A;
    text-align: center;
    margin-bottom: 6mm;
    line-height: 1.5;
  }

  /* 信件正文 + 首字下沉 */
  .letter-body {
    font-family: "Noto Serif SC", "Ma Shan Zheng", serif;
    font-size: 11pt;
    line-height: 1.9;
    color: #3A3A3A;
    text-align: justify;
    
    /* 首字下沉 */
    text-indent: 0;
  }
  .drop-cap {
    font-family: "Ma Shan Zheng", "Noto Serif SC", serif;
    font-size: 2.4em;
    line-height: 1;
    float: left;
    margin-right: 6px;
    margin-top: 2px;
    color: #B8979A;
    font-weight: 400;
  }

  /* ---------- 尾页 ---------- */
  .colophon {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 210mm;
    text-align: center;
    page-break-before: always;
  }
  .colophon-flower {
    font-size: 28px;
    margin-bottom: 16px;
  }
  .colophon-text {
    font-family: "Noto Serif SC", serif;
    font-size: 11pt;
    color: #A8A8A8;
    margin-bottom: 8px;
  }
  .colophon-italic {
    font-family: "Noto Serif SC", serif;
    font-style: italic;
    font-size: 10pt;
    color: #C9A8A9;
  }

  /* ---------- 屏幕预览优化 ---------- */
  @media screen {
    html, body {
      width: 148mm;
      min-height: 210mm;
      margin: 0 auto;
      box-shadow: 0 0 40px rgba(100,80,75,0.10);
      padding: 0;
    }
    .cover { height: auto; min-height: 210mm; }
    .colophon { min-height: 210mm; height: auto; }
    /* 屏幕上也显示页码位置（模拟） */
    .page-num {
      position: absolute;
      bottom: 20mm;
      left: 0;
      right: 0;
      text-align: center;
      font-family: "Noto Sans SC", sans-serif;
      font-size: 8pt;
      color: #A8A8A8;
    }
  }
</style>
</head>
<body>
  <!-- 封面 -->
  <div class="cover">
    <div class="page-number"></div>
    <div class="cover-ornament">💌</div>
    <div class="cover-year">${year}</div>
    <div class="cover-subtitle">年度情书集</div>
    <div class="cover-divider"></div>
    <div class="cover-meta">我们的故事，一字一句，都是爱</div>
    <div class="cover-count">共 ${yearLetters.length} 封情书</div>
  </div>

  <!-- 目录 -->
  <div class="toc">
    <div class="page-number"></div>
    <div class="toc-title">— 目录 —</div>
    ${tocHTML}
  </div>

  <!-- 正文：每封信独立一页 -->
  ${lettersHTML}

  <!-- 尾页 -->
  <div class="colophon">
    <div class="page-number"></div>
    <div class="colophon-flower">🌸</div>
    <div class="colophon-text">这是我们 ${year} 年的故事</div>
    <div class="colophon-italic">每一个字，都满载着爱</div>
  </div>

    <script>
    // 动态生成页码：第 X / Y 页
    (function() {
      const pages = document.querySelectorAll('.cover, .toc, .letter-page, .colophon');
      const total = pages.length;
      pages.forEach((p, i) => {
        const num = p.querySelector('.page-number');
        if (num) num.textContent = (i+1) + ' / ' + total;
      });
    })();
  <\/script>
<!-- 打印按钮（仅屏幕显示） -->
  <div class="no-print" style="position:fixed;top:16px;right:16px;z-index:999;display:flex;gap:8px;">
    <button onclick="window.print()" style="padding:10px 20px;background:#B8979A;color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer;font-family:'Noto Sans SC',sans-serif;box-shadow:0 4px 12px rgba(184,151,154,0.4)">
      🖨️ 打印 / 保存 PDF
    </button>
    <button onclick="document.querySelector('.no-print').style.display='none'" style="padding:10px 14px;background:#F0EBE6;color:#9A7A7C;border:none;border-radius:8px;font-size:13px;cursor:pointer;">
      ✕ 关闭提示
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
/* ========== 电子书小按钮 ========== */
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
  background: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(201, 168, 169, 0.4);
}

.ebook-btn-sm:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* 年份选择弹窗 */
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

/* ========== 页面头部 ========== */
.page-header {
  margin-bottom: var(--space-xl);
}

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

.letters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-md);
}

@media (max-width: 768px) {
  .letters-grid {
    grid-template-columns: 1fr;
  }

  .filters {
    flex-direction: column;
  }

  .filter-select {
    width: 100%;
  }
}

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
</style>
