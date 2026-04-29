<template>
  <div class="app">
    <PasswordLock />
    <main class="main-content">
      <router-view />
    </main>
    <FooterNav />
  </div>
</template>

<script setup lang="ts">
import FooterNav from '@/components/layout/FooterNav.vue'
import PasswordLock from '@/components/features/PasswordLock.vue'
</script>

<style>
@import './assets/styles/global.css';

.app {
  min-height: 100vh;
  background: var(--bg-body);
}

.main-content {
  padding-bottom: var(--nav-height);
}

/* 页面过渡动画 */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
