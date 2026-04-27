<template>
  <div class="wishlist-page page-container">
    <h2 class="page-title">
      愿望清单
      <span class="count">({{ store.completedWishes }}/{{ store.totalWishes }})</span>
    </h2>

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
        {{ cat === 'all' ? '全部' : cat }}
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
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredWishes.length === 0" class="empty-state">
      <p>暂无愿望，添加一个吧 ⭐</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores'

const store = useAppStore()

const selectedCategory = ref('all')

const categories = computed(() => {
  const cats = new Set(store.wishes.map(w => w.category))
  return ['all', ...Array.from(cats)]
})

const filteredWishes = computed(() => {
  if (selectedCategory.value === 'all') {
    return store.wishes
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
</style>
