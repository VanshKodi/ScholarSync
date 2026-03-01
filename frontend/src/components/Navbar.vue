<template>
  <header class="navbar">
    <div class="nav-left">
      <RouterLink to="/">
        <img
          src="/resources/favicons/graduation-cap.svg"
          class="navbar-logo"
          alt="ScholarSync"
        />
      </RouterLink>
      <span class="navbar-title">ScholarSync</span>
    </div>

    <div class="nav-right">
      <template v-if="isAuthenticated">
        <button class="nav-btn" @click="$router.push('/dashboard')">Dashboard</button>
        <button class="nav-btn outline" @click="handleLogout">Logout</button>
      </template>
      <template v-else>
        <button class="nav-btn primary" @click="$router.push('/login')">Get Started</button>
      </template>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()
const isAuthenticated = ref(false)

async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession()
  isAuthenticated.value = !!session
}

async function handleLogout() {
  await supabase.auth.signOut()
  isAuthenticated.value = false
  router.push('/')
}

let authListener = null

onMounted(async () => {
  await checkAuth()
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    isAuthenticated.value = !!session
  })
  authListener = data
})

onUnmounted(() => {
  authListener?.subscription?.unsubscribe()
})
</script>

<style scoped>
.navbar {
  height: 64px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.navbar-logo {
  width: 45px;
  height: auto;
  margin-right: 8px;
}

.navbar-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1f2937;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.nav-right {
  display: flex;
  gap: 12px;
}

.nav-btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.nav-btn.primary {
  background: #5b6cff;
  color: #fff;
}

.nav-btn.outline {
  background: transparent;
  border: 1px solid #c7d2fe;
  color: #4338ca;
}
</style>
