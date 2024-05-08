import {createRouter, createWebHistory} from 'vue-router';
import Home from '../components/Home.vue';
import Video from '../components/Video.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/video/:path',
    name: 'Video',
    component: Video,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
