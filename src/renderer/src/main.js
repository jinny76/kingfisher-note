import './assets/main.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Vue3VideoPlayer from '@cloudgeek/vue3-video-player'
import '@cloudgeek/vue3-video-player/dist/vue3-video-player.css'

const app = createApp(App)
  .use(router)
  .use(ElementPlus)
  .use(Vue3VideoPlayer, {
    lang: 'zh-CN'
  })
  .mount('#app');

console.log("打开网址", window.location.href);
if (window.location.href.indexOf("#") !== -1) {
  let hash = window.location.href.split("#")[1];
  if (hash) {
    let route = hash.split("?")[0];
    if (route) {
      router.push(route);
    }
  }
} else {
  router.push("/")
}
