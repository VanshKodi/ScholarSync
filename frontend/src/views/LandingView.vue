<template>
  <div>
    <Navbar />

    <main class="landing">
      <!-- Hero Section -->
      <section class="landing-hero">
        <h1>Welcome to ScholarSync</h1>
        <p>Your ultimate academic management platform for seamless learning experiences.</p>
        <button class="landing-hero-btn" @click="$router.push('/login')">
          Get Started
        </button>
      </section>

      <!-- Features Section -->
      <section class="landing-features">
        <div class="landing-card">
          <div class="landing-card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <h3>Schedules</h3>
          <p>Manage your academic timetable effortlessly.</p>
        </div>

        <div class="landing-card">
          <div class="landing-card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h3>Attendance</h3>
          <p>Track attendance efficiently.</p>
        </div>

        <div class="landing-card">
          <div class="landing-card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
            </svg>
          </div>
          <h3>AI Tools</h3>
          <p>Enhance learning with intelligent tools.</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue'
</script>

<style scoped>
.landing {
  background: #f6f8fc;
  min-height: calc(100vh - 64px);
}

.landing-hero {
  padding: 96px 32px;
  text-align: center;
  background: #ffffff;
}

.landing-hero h1 {
  font-size: 2.4rem;
  margin-bottom: 12px;
  color: #1f2937;
}

.landing-hero p {
  color: #475569;
  margin-bottom: 24px;
}

.landing-hero-btn {
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  background: #5b6cff;
  color: white;
  cursor: pointer;
  font-size: 1rem;
}

.landing-hero-btn:hover {
  background: #4a5ce0;
}

.landing-features {
  padding: 64px 32px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1100px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .landing-features {
    grid-template-columns: 1fr;
  }
}

.landing-card {
  background: white;
  padding: 32px 24px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.landing-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: #eef2ff;
  border-radius: 12px;
  margin: 0 auto 16px;
  color: #5b6cff;
}

.landing-card-icon svg {
  width: 28px;
  height: 28px;
}

.landing-card h3 {
  margin-bottom: 8px;
  color: #1f2937;
  font-size: 1.1rem;
}

.landing-card p {
  color: #64748b;
  font-size: 0.95rem;
}
</style>
