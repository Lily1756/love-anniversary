import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/Home.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
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
      path: '/wedding',
      name: 'Wedding',
      component: () => import('@/views/Wedding.vue'),
      meta: { title: '婚礼手册' }
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

// 页面标题
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - Love Story` : 'Love Story'
  next()
})

export default router
