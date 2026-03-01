import { createRouter, createWebHashHistory } from 'vue-router'
import { supabase } from '../lib/supabase'
import LandingView from '../views/LandingView.vue'
import LoginView from '../views/LoginView.vue'

const routes = [
  { path: '/', component: LandingView },
  { path: '/login', component: LoginView },
  {
    path: '/dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// Navigation guard: redirect unauthenticated users away from protected routes
router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { path: '/login' }
  return true
})

export default router
