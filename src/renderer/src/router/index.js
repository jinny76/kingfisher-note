import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Video from '../components/Video.vue'

const routes = [
  {
    //路由初始指向
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/video/:path',
    name: 'Video',
    component: Video,
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
