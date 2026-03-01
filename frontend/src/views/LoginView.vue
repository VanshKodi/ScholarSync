<template>
  <div>
    <Navbar />

    <div class="login-page">
      <div class="login-card">
        <h2>Welcome to ScholarSync</h2>
        <p>Sign in to continue</p>

        <button class="google-btn" :disabled="loading" @click="handleGoogleLogin">
          <svg class="google-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          <span>{{ loading ? 'Redirecting…' : 'Continue with Google' }}</span>
        </button>

        <p v-if="error" class="error-msg">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Navbar from '../components/Navbar.vue'
import { supabase } from '../lib/supabase'

const loading = ref(false)
const error = ref('')

async function handleGoogleLogin() {
  loading.value = true
  error.value = ''

  const { error: authError } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  })

  if (authError) {
    error.value = authError.message
    loading.value = false
  }
  // On success Supabase redirects the browser; loading stays true
}
</script>

<style scoped>
.login-page {
  height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f6f8fc;
}

.login-card {
  background: #fff;
  padding: 40px 32px;
  border-radius: 12px;
  width: 360px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.login-card h2 {
  margin-bottom: 8px;
  color: #1f2937;
  font-size: 1.4rem;
}

.login-card > p {
  color: #64748b;
  margin-bottom: 28px;
}

.google-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: white;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.15s ease;
}

.google-btn:hover:not(:disabled) {
  background: #f9fafb;
}

.google-btn:disabled {
  opacity: 0.7;
  cursor: default;
}

.google-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.error-msg {
  margin-top: 16px;
  color: #ef4444;
  font-size: 0.875rem;
}
</style>
