<template>
  <nav class="footer-nav">
    <router-link
      v-for="item in navItems"
      :key="item.name"
      :to="item.path"
      class="nav-item"
      :class="{ active: isActive(item.path) }"
    >
      <span class="nav-icon">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path v-if="item.icon === 'home'" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline v-if="item.icon === 'home'" points="9 22 9 12 15 12 15 22"/>
          <path v-if="item.icon === 'letters'" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline v-if="item.icon === 'letters'" points="22,6 12,13 2,6"/>
          <rect v-if="item.icon === 'gallery'" x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle v-if="item.icon === 'gallery'" cx="8.5" cy="8.5" r="1.5"/><polyline v-if="item.icon === 'gallery'" points="21 15 16 10 5 21"/>
          <polygon v-if="item.icon === 'footprints'" points="1 6 1 22 8 18 16 22 21 18 21 2 16 6 8 2 1 6"/><line v-if="item.icon === 'footprints'" x1="8" y1="2" x2="8" y2="18"/><line v-if="item.icon === 'footprints'" x1="16" y1="6" x2="16" y2="22"/>
          <polygon v-if="item.icon === 'wishlist'" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          <path v-if="item.icon === 'capsules'" d="M21 8v13H3V8"/><path v-if="item.icon === 'capsules'" d="M1 3h22v5H1z"/><path v-if="item.icon === 'capsules'" d="M10 12h4"/>
          <circle v-if="item.icon === 'settings'" cx="12" cy="12" r="3"/><path v-if="item.icon === 'settings'" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </span>
      <span class="nav-label">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { name: 'home', path: '/', label: '首页', icon: 'home' },
  { name: 'letters', path: '/letters', label: '情书', icon: 'letters' },
  { name: 'gallery', path: '/gallery', label: '照片', icon: 'gallery' },
  { name: 'footprints', path: '/footprints', label: '足迹', icon: 'footprints' },
  { name: 'wishlist', path: '/wishlist', label: '愿望', icon: 'wishlist' },
  { name: 'settings', path: '/settings', label: '设置', icon: 'settings' }
]

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<style scoped>
.footer-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: var(--bg-container);
  border-top: 1px solid var(--border-light);
  padding: 6px 0 calc(6px + env(safe-area-inset-bottom));
  z-index: 1000;
  height: var(--nav-height);
  box-shadow: 0 -2px 20px rgba(140, 120, 115, 0.05);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: var(--text-tertiary);
  padding: 4px 8px;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  min-width: 48px;
}

.nav-item:hover {
  color: var(--color-primary);
  background-color: rgba(201, 168, 169, 0.05);
}

.nav-item.active {
  color: var(--color-primary);
  background-color: rgba(201, 168, 169, 0.1);
  font-weight: var(--font-weight-medium);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
}

.nav-label {
  font-size: 10px;
  font-weight: var(--font-weight-medium);
}

@media (min-width: 769px) {
  .footer-nav {
    justify-content: center;
    gap: var(--space-xl);
  }
  
  .nav-item {
    flex-direction: row;
    gap: var(--space-xs);
    padding: 8px 16px;
  }
  
  .nav-icon {
    margin-bottom: 0;
  }
  
  .nav-label {
    font-size: var(--font-size-sm);
  }
}
</style>
