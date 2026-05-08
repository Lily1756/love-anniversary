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
      </div>
    </div>

    <!-- 年度电子书生成 -->
    <div class="ebook-section">
      <div class="ebook-card">
        <div class="ebook-icon">📖</div>
        <div class="ebook-info">
          <h3 class="ebook-title">生成年度情书电子书</h3>
          <p class="ebook-desc">将某一年的情书汇编成精美电子书，可打印或保存为 PDF</p>
        </div>
        <div class="ebook-actions">
          <select v-model="ebookYear" class="filter-select ebook-year-select">
            <option v-for="year in store.letterYears" :key="year" :value="year">{{ year }}年</option>
          </select>
          <button class="ebook-btn" @click="generateEbook" :disabled="store.letterYears.length === 0">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            生成电子书
          </button>
        </div>
      </div>
    </div>

    <!-- 时间脉络 DNA 组件 -->
    <TimeDNA
      :letters="store.letters"
      @month-selected="handleMonthSelect"
    />

    <!-- 筛选状态提示 -->
    <div v-if="selectedMonth !== null && selectedMonth >= 0" class="filter-hint">
      <span>正在查看 {{ selectedMonth + 1 }} 月的情书</span>
      <button class="clear-filter" @click="handleMonthSelect(-1)">清除筛选</button>
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
      <p>{{ selectedMonth !== null ? '该月份暂无情书记录' : '暂无情书，写下第一封吧 💌' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores'
import LoveLetterCard from '@/components/features/LoveLetterCard.vue'
// @ts-ignore
import TimeDNA from '@/components/features/TimeDNA.vue'
import type { Letter } from '@/types'

const router = useRouter()
const store = useAppStore()

const selectedYear = ref('all')
const searchQuery = ref('')
const selectedMonth = ref<number | null>(null)
const ebookYear = ref<number>(new Date().getFullYear())

const filteredLetters = computed(() => {
  let result = store.letters

  // 月份筛选优先
  if (selectedMonth.value !== null && selectedMonth.value >= 0) {
    result = result.filter(letter => {
      const letterDate = new Date(letter.date)
      return letterDate.getMonth() === selectedMonth.value
    })
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

const handleMonthSelect = (month: number) => {
  if (month < 0) {
    selectedMonth.value = null
  } else {
    selectedMonth.value = month
    selectedYear.value = 'all'
    searchQuery.value = ''
  }
}

const generateEbook = () => {
  const year = ebookYear.value
  const yearLetters = store.letters
    .filter(l => l.year === year)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  if (yearLetters.length === 0) {
    alert(`${year}年暂无情书记录`)
    return
  }

  const lettersHTML = yearLetters.map((letter, index) => `
    <div class="letter-entry" style="page-break-inside:avoid;margin-bottom:60px">
      <div class="letter-number" style="font-size:13px;color:#C9A8A9;letter-spacing:0.1em;margin-bottom:8px;font-family:'Playfair Display',serif">
        No.${String(index + 1).padStart(2, '0')}
      </div>
      <h2 class="letter-title" style="font-size:22px;font-weight:600;color:#4A4A4A;margin-bottom:8px;line-height:1.4">
        ${letter.title}
      </h2>
      <div class="letter-date" style="font-size:13px;color:#A8A8A8;margin-bottom:20px;display:flex;align-items:center;gap:8px">
        <span>📅</span><span>${letter.date}</span>
        ${letter.tag ? `<span style="background:#F5F1EC;color:#B8979A;padding:2px 10px;border-radius:20px;font-size:12px">${letter.tag}</span>` : ''}
      </div>
      <div class="letter-body" style="font-size:15px;line-height:1.9;color:#5A5A5A;white-space:pre-wrap;padding:24px;background:#FFFCF9;border-radius:12px;border:1px solid #F0EBE6">
        ${letter.content}
      </div>
    </div>
    ${index < yearLetters.length - 1 ? '<hr style="border:none;border-top:1px dashed #E5DED8;margin:0 0 60px">' : ''}
  `).join('')

  const ebookHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${year}年 · 年度情书电子书</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', 'Noto Serif SC', sans-serif;
    background: #FAF8F5;
    color: #4A4A4A;
    line-height: 1.6;
  }
  .ebook-wrap {
    max-width: 760px;
    margin: 0 auto;
    padding: 40px 32px;
  }
  /* 封面 */
  .cover {
    text-align: center;
    padding: 80px 40px 60px;
    page-break-after: always;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .cover-ornament {
    font-size: 56px;
    margin-bottom: 32px;
  }
  .cover-year {
    font-size: 72px;
    font-family: 'Playfair Display', 'Georgia', serif;
    font-weight: 600;
    color: #C9A8A9;
    letter-spacing: -2px;
    line-height: 1;
    margin-bottom: 16px;
  }
  .cover-subtitle {
    font-size: 22px;
    color: #7A7A7A;
    font-family: 'Playfair Display', serif;
    font-style: italic;
    margin-bottom: 40px;
  }
  .cover-divider {
    width: 80px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #C9A8A9, transparent);
    margin: 0 auto 24px;
  }
  .cover-meta {
    font-size: 15px;
    color: #A8A8A8;
  }
  .cover-count {
    display: inline-block;
    padding: 8px 24px;
    background: rgba(201,168,169,0.12);
    border: 1px solid rgba(201,168,169,0.35);
    border-radius: 30px;
    color: #B8979A;
    font-size: 14px;
    margin-top: 16px;
  }
  /* 目录 */
  .toc {
    page-break-after: always;
    padding: 60px 0;
  }
  .toc-title {
    font-size: 28px;
    font-family: 'Playfair Display', serif;
    color: #C9A8A9;
    margin-bottom: 32px;
    text-align: center;
  }
  .toc-item {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 10px 0;
    border-bottom: 1px dotted #E5DED8;
    font-size: 14px;
  }
  .toc-num { color: #C9A8A9; min-width: 32px; font-family: 'Playfair Display', serif; }
  .toc-name { flex: 1; color: #4A4A4A; }
  .toc-date { color: #A8A8A8; font-size: 12px; }
  /* 内容区 */
  .content { padding: 40px 0; }
  @media print {
    body { background: white; }
    .no-print { display: none; }
    @page { margin: 20mm 15mm; }
  }
</style>
</head>
<body>
<div class="ebook-wrap">
  <!-- 封面 -->
  <div class="cover">
    <div class="cover-ornament">💌</div>
    <div class="cover-year">${year}</div>
    <div class="cover-subtitle">年度情书集</div>
    <div class="cover-divider"></div>
    <div class="cover-meta">我们的故事，一字一句，都是爱</div>
    <div class="cover-count">共 ${yearLetters.length} 封情书</div>
  </div>

  <!-- 目录 -->
  <div class="toc">
    <div class="toc-title">目录</div>
    ${yearLetters.map((l, i) => `
      <div class="toc-item">
        <span class="toc-num">No.${String(i + 1).padStart(2, '0')}</span>
        <span class="toc-name">${l.title}</span>
        <span class="toc-date">${l.date}</span>
      </div>
    `).join('')}
  </div>

  <!-- 正文 -->
  <div class="content">
    ${lettersHTML}
  </div>
  
  <!-- 尾页 -->
  <div style="text-align:center;padding:60px 0 40px;border-top:1px solid #F0EBE6;color:#A8A8A8;font-size:13px">
    <div style="font-size:28px;margin-bottom:16px">🌸</div>
    <div>这是我们 ${year} 年的故事</div>
    <div style="margin-top:8px;font-style:italic;color:#C9A8A9">每一个字，都满载着爱</div>
  </div>
</div>
<script>
  // 自动打印提示
  window.onload = function() {
    const tip = document.createElement('div');
    tip.className = 'no-print';
    tip.style.cssText = 'position:fixed;top:16px;right:16px;background:#C9A8A9;color:white;padding:10px 20px;border-radius:8px;font-size:14px;cursor:pointer;z-index:999;box-shadow:0 4px 12px rgba(201,168,169,0.4)';
    tip.textContent = '🖨️ 点击打印 / 保存 PDF';
    tip.onclick = () => window.print();
    document.body.appendChild(tip);
  }
<\/script>
</body>
</html>`

  const blob = new Blob([ebookHTML], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
}

onMounted(() => {
  if (store.letters.length === 0) {
    store.loadLetters().then(() => {
      if (store.letterYears.length > 0) {
        ebookYear.value = store.letterYears[0]
      }
    })
  } else if (store.letterYears.length > 0) {
    ebookYear.value = store.letterYears[0]
  }
})
</script>

<style scoped>
/* ========== 电子书区域 ========== */
.ebook-section {
  margin-bottom: var(--space-lg);
}

.ebook-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background: linear-gradient(135deg, #FFF8F8 0%, #FFF4F0 100%);
  border: 1px solid #EDDFDF;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.ebook-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.ebook-info {
  flex: 1;
  min-width: 0;
}

.ebook-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: 4px;
}

.ebook-desc {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.ebook-actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-shrink: 0;
}

.ebook-year-select {
  min-width: 90px;
}

.ebook-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.ebook-btn:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(201, 168, 169, 0.4);
}

.ebook-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
