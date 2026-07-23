<template>
  <div v-if="authStore.isAuthenticated" class="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-700">
    <!-- Sidebar component -->
    <Sidebar />

    <!-- Core Main Viewport -->
    <main class="flex-1 pl-64 p-8 min-h-screen overflow-x-hidden">
      <router-view />
    </main>
  </div>

  <!-- Guest Layout (Login Page) -->
  <div v-else>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import Sidebar from './components/Sidebar.vue';
import { useAuthStore } from './stores/auth.js';

const authStore = useAuthStore();

onMounted(() => {
  authStore.fetchProfile();
});
</script>

<style>
/* Global scrollbars styling */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #f1f5f9;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
