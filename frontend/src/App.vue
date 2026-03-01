<template>
  <RouterView />
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from './lib/supabase'

const router = useRouter()
let authListener = null

onMounted(() => {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      router.push('/dashboard')
    } else if (router.currentRoute.value.meta.requiresAuth) {
      router.push('/')
    }
  })
  authListener = data
})

onUnmounted(() => {
  authListener?.subscription?.unsubscribe()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: system-ui, Arial, sans-serif;
}

#app {
  min-height: 100vh;
}
</style>
