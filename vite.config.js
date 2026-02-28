import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api/monitor': {
        target: 'https://open.bigmodel.cn',
        changeOrigin: true
      }
    }
  }
})
