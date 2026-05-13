import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

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
    // 代理 GitHub API 请求，解决本地开发的 TLS 证书问题
    proxy: {
      '/api/github': {
        target: 'https://api.github.com',
        changeOrigin: true,
        secure: false, // 禁用 SSL 证书验证（本地开发环境）
        rewrite: (path) => path.replace(/^\/api\/github/, '')
      },
      // 代理 Cloudinary 上传请求，解决本地开发的 CORS 问题
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
