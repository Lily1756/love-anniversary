import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: { title: '恋爱纪念日' }
    },
    {
      path: '/letters',
      name: 'Letters',
      component: () => import('@/views/Letters.vue'),
      meta: { title: '情书馆' }
    },
    {
      path: '/letters/:id',
      name: 'LetterDetail',
      component: () => import('@/views/LetterDetail.vue'),
      meta: { title: '情书详情' }
    },
    {
      path: '/gallery',
      name: 'Gallery',
      component: () => import('@/views/Gallery.vue'),
      meta: { title: '照片墙' }
    },
    {
      path: '/footprints',
      name: 'Footprints',
      component: () => import('@/views/Footprints.vue'),
      meta: { title: '足迹地图' }
    },
    {
      path: '/wishlist',
      name: 'Wishlist',
      component: () => import('@/views/Wishlist.vue'),
      meta: { title: '愿望清单' }
    },
    {
      path: '/capsules',
      name: 'Capsules',
      component: () => import('@/views/Capsules.vue'),
      meta: { title: '时间胶囊' }
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('@/views/Settings.vue'),
      meta: { title: '设置' }
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

// 页面标题（Vue Router 4 写法：直接 return，不用 next()）
router.beforeEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} - Love Story` : 'Love Story'
})

// 开发调试：记录每次导航
router.afterEach((to, from) => {
  console.log(`[Router] ${from.path} → ${to.path}`)
})

export default router
