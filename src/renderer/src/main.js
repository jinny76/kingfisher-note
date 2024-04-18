import './assets/main.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App).use(router).use(ElementPlus).mount('#app');
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
