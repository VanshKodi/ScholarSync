<template>
  <div>
    <Navbar />
    <div class="dashboard-placeholder">
      <h2>Dashboard</h2>
      <p>Dashboard functionality coming soon.</p>
    </div>
  </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue'
</script>

<style scoped>
.dashboard-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 64px);
  gap: 12px;
  background: #f6f8fc;
  color: #1f2937;
}

.dashboard-placeholder h2 {
  font-size: 1.8rem;
}

.dashboard-placeholder p {
  color: #64748b;
}
</style>
