<template>
  <div class="min-h-screen bg-gradient-to-tr from-[#071b33] via-[#0B2545] to-[#134074] flex flex-col justify-center items-center p-4 font-sans text-white">
    
    <!-- Login Card Container -->
    <div class="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col justify-between">
      
      <!-- Brand Header -->
      <div class="text-center mb-8">
        <div class="mx-auto w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 mb-4">
          <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11c0-1.28-.277-2.5-.773-3.6M21 21.121a23.947 23.947 0 01-1.897-1.13L18 18m.082-1.25a13.93 13.93 0 01-3.67-5.5m0-5.58a14.284 14.284 0 00-3.3-1.65m0 0A13.92 13.92 0 0112 11c0 .351-.017.699-.05 1.04m-1.62 4.782a15.018 15.018 0 00-3.07-4.945M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707" />
          </svg>
        </div>
        <h1 class="text-2xl font-black tracking-tight">ATTENDANCE SYSTEM</h1>
        <p class="text-xs text-[#8DA9C4] font-medium uppercase tracking-widest mt-1">Sign in to your portal</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-[#8DA9C4] mb-2">Email Address</label>
          <input
            type="email"
            v-model="email"
            placeholder="name@attendance.com"
            required
            class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-[#8DA9C4] mb-2">Password</label>
          <input
            type="password"
            v-model="password"
            placeholder="••••••••"
            required
            class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        <!-- Alert messages -->
        <div v-if="authStore.error" class="bg-red-500/10 border border-red-500/30 text-red-200 text-xs font-semibold p-3.5 rounded-2xl flex items-center space-x-2">
          <svg class="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{{ authStore.error }}</span>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
        >
          <svg v-if="authStore.loading" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span v-else>Sign In</span>
        </button>
      </form>

      <!-- Quick Seeding Access for evaluation -->
      <div class="mt-8 pt-6 border-t border-white/5 flex flex-col items-center">
        <span class="text-[10px] text-[#8DA9C4] font-bold uppercase tracking-widest mb-3">Quick Demo Access</span>
        <div class="flex gap-2">
          <button
            @click="fillCredentials('admin')"
            class="bg-white/5 hover:bg-white/10 text-xs text-[#8DA9C4] hover:text-white px-3 py-2 rounded-xl transition-all border border-white/5 cursor-pointer"
          >
            As Admin
          </button>
          <button
            @click="fillCredentials('employee')"
            class="bg-white/5 hover:bg-white/10 text-xs text-[#8DA9C4] hover:text-white px-3 py-2 rounded-xl transition-all border border-white/5 cursor-pointer"
          >
            As Employee
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const email = ref('');
const password = ref('');

const router = useRouter();
const authStore = useAuthStore();

const handleLogin = async () => {
  const success = await authStore.login(email.value, password.value);
  if (success) {
    router.push('/');
  }
};

// Seeder autofill credentials helper
const fillCredentials = (role: 'admin' | 'employee') => {
  if (role === 'admin') {
    email.value = 'admin@attendance.com';
    password.value = 'admin123';
  } else {
    // Autofills with the first user seeded in Employee list
    email.value = 'sneha.das@attendance.com';
    password.value = 'password123';
  }
};
</script>
