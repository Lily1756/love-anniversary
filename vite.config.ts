import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import history from 'connect-history-api-fallback'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    // ❌ 移除无效的 appType: 'spa'（与 proxy 共存时行为不符合预期）
    // appType: 'spa',  // ← 删除此行

    // ✅ 方案：使用 configureServer 显式挂载 history 回退中间件
    configureServer(server) {
      // 必须在 Vite 内置中间件之前挂载，才能正确回退到 index.html
      server.middlewares.use(
        history({
          // 可选：排除 API 代理路径，防止干扰
          rewrites: [
            // 代理路径直接放行，不走 SPA 回退
            { from: /^\/api\/github/, to: context => context.parsedUrl.pathname },
            { from: /^\/api\/cloudinary/, to: context => context.parsedUrl.pathname },
          ],
          verbose: false, // 设为 true 可查看回退日志，方便调试
        })
      )
    },

    // 代理配置保持不变
    proxy: {
      '/api/github': {
        target: 'https://api.github.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/github/, '')
      },
      '/api/cloudinary': {
        target: 'https://api.cloudinary.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/cloudinary/, '')
      }
    }
  },
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
})
