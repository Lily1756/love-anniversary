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

    <!-- 时间脉络组件 -->
    <TimeCalendar
      :letters="store.letters"
      @date-selected="handleDateSelect"
    />

    <!-- 筛选状态提示 -->
    <div v-if="selectedDate" class="filter-hint">
      <span>正在查看 {{ formatMonthDay(selectedDate) }} 的情书</span>
      <button class="clear-filter" @click="clearDateFilter">清除筛选</button>
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
      <p>{{ selectedDate ? '该日期暂无情书记录' : '暂无情书，写下第一封吧 💌' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores'
import LoveLetterCard from '@/components/features/LoveLetterCard.vue'
import TimeCalendar from '@/components/features/TimeCalendar.vue'
import type { Letter } from '@/types'

const router = useRouter()
const store = useAppStore()

const selectedYear = ref('all')
const searchQuery = ref('')
const selectedDate = ref<string | null>(null)

const filteredLetters = computed(() => {
  let result = store.letters

  // 日期筛选优先
  if (selectedDate.value) {
    result = result.filter(letter => {
      const letterDate = new Date(letter.date)
      const monthDay = `${String(letterDate.getMonth() + 1).padStart(2, '0')}-${String(letterDate.getDate()).padStart(2, '0')}`
      return monthDay === selectedDate.value
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

const handleDateSelect = (monthDay: string) => {
  selectedDate.value = monthDay
  selectedYear.value = 'all'
  searchQuery.value = ''
}

const clearDateFilter = () => {
  selectedDate.value = null
}

const formatMonthDay = (monthDay: string) => {
  const [month, day] = monthDay.split('-')
  return `${Number(month)}月${Number(day)}日`
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
