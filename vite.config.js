import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  assetsInclude: ['**/*.glb'],
  base: "/TrainGame/",
  build: {
    outDir: "docs"
  },
})
