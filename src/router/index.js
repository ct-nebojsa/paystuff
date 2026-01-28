import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DecryptView from '../views/DecryptView.vue'
import OtherView from '../views/OtherView.vue'
import Cb2aView from '@/views/Cb2aView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {path: '/decrypt', name: 'decrypt', component: DecryptView},
    {path: '/other', name: 'other', component: OtherView},
    {path: '/cb2a-builder', name: 'cb2a', component: Cb2aView}
  ],
})

export default router
