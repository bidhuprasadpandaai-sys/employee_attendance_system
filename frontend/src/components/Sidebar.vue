<template>
  <aside class="w-64 bg-[#0B2545] text-white flex flex-col justify-between h-screen fixed left-0 top-0 z-20 border-r border-[#134074]/30 font-sans shadow-xl">
    <!-- Top Branding -->
    <div>
      <div class="p-6 flex items-center space-x-3 border-b border-[#134074]/20">
        <div class="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <h1 class="text-md font-extrabold tracking-wider uppercase leading-none">Attendance</h1>
          <span class="text-xs text-[#8DA9C4] font-medium tracking-widest uppercase">System</span>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="mt-8 px-4 space-y-1">
        <router-link
          v-for="item in navItems"
          :key="item.name"
          :to="item.to"
          class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group text-[#8DA9C4] hover:text-white hover:bg-[#134074]/40"
          active-class="bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-semibold !hover:bg-blue-600"
        >
          <component :is="item.icon" class="w-5 h-5 transition-transform duration-200 group-hover:scale-105" />
          <span class="text-[14px]">{{ item.name }}</span>
        </router-link>
      </nav>
    </div>

    <!-- Bottom User Profile -->
    <div class="p-4 border-t border-[#134074]/20 bg-[#071b33]">
      <div v-if="authStore.user" class="flex items-center justify-between p-2 rounded-xl hover:bg-[#134074]/30 transition-colors duration-150 cursor-pointer relative group">
        <div class="flex items-center space-x-3">
          <img
            :src="authStore.user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'"
            alt="User Avatar"
            class="w-10 h-10 rounded-full border-2 border-blue-500/30 object-cover"
          />
          <div class="text-left">
            <h2 class="text-sm font-semibold text-white leading-tight truncate max-w-[110px]">{{ authStore.user.name }}</h2>
            <span class="text-xs text-[#8DA9C4] capitalize">{{ authStore.user.role }}</span>
          </div>
        </div>
        
        <!-- Logout action dropdown indicator -->
        <button @click="authStore.logout" class="text-[#8DA9C4] hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" title="Log Out">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth.js';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileClock,
  Calendar,
  Settings
} from 'lucide-vue-next';

const authStore = useAuthStore();

const navItems = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Employees', to: '/employees', icon: Users },
  { name: 'Attendance', to: '/attendance', icon: CalendarDays },
  { name: 'Leave', to: '/leave', icon: FileClock },
  { name: 'Holidays', to: '/holidays', icon: Calendar },
  { name: 'Settings', to: '/settings', icon: Settings }
];
</script>

<style scoped>
/* Scoped nav highlights */
.router-link-active {
  color: white !important;
}
</style>
