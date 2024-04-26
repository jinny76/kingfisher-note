import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin,bytecodePlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), bytecodePlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin(), bytecodePlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [vue({
      template:{
        compilerOptions:{
          isCustomElement: tag => tag.startsWith('webview')
        }
      }
    })],
    define: {
      '__APP_VERSION__': JSON.stringify(process.env.npm_package_version)
    }
  }
})
