import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DecryptView from '../views/DecryptView.vue'
import OtherView from '../views/OtherView.vue'
import Cb2aView from '@/views/Cb2aView.vue'
import NotificationView from '@/views/NotificationView.vue'

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
    {path: '/cb2a-builder', name: 'cb2a', component: Cb2aView},
    {path: '/success', name: 'success', component: NotificationView, props: { status: 'success' }},
    {path: '/failure', name: 'failure', component: NotificationView, props: { status: 'failure' }},
    {path: '/back', name: 'back', component: NotificationView, props: { status: 'back' }},
    {path: '/notify', name: 'notify', component: NotificationView, props: { status: 'notify' }},
  ],
})

export default router
