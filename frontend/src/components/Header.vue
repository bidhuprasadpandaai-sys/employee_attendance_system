<template>
  <header class="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-slate-200 font-sans">
    <div>
      <h1 class="text-2xl font-bold text-slate-800 tracking-tight">{{ title }}</h1>
      <p class="text-sm text-slate-500 mt-1">
        Welcome back, <span class="font-semibold text-blue-600">{{ authStore.user?.name || 'User' }}</span>
      </p>
    </div>

    <!-- Filters Panel -->
    <div class="flex flex-wrap items-center gap-3 mt-4 md:mt-0 bg-white p-2.5 rounded-2xl shadow-sm border border-slate-100">
      <!-- Date Pickers -->
      <div class="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-xs">
        <span class="text-slate-400 font-medium">From</span>
        <input 
          type="date" 
          v-model="startDate" 
          @change="onFilterChange"
          class="bg-transparent font-semibold text-slate-700 outline-none cursor-pointer"
        />
        <span class="text-slate-400 font-medium">To</span>
        <input 
          type="date" 
          v-model="endDate" 
          @change="onFilterChange"
          class="bg-transparent font-semibold text-slate-700 outline-none cursor-pointer"
        />
      </div>

      <!-- Department Filter -->
      <div class="relative">
        <select
          v-model="selectedDept"
          @change="onFilterChange"
          class="appearance-none bg-slate-50 border border-slate-100 text-slate-700 text-xs font-semibold px-4 py-2 pr-8 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          <option value="">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Marketing">Marketing</option>
          <option value="Sales">Sales</option>
          <option value="HR">HR</option>
          <option value="Finance">Finance</option>
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
          <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>

      <!-- Refresh Button -->
      <button
        @click="onRefresh"
        class="bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-600 p-2 rounded-xl border border-slate-100 transition-colors cursor-pointer"
        title="Refresh data"
      >
        <svg 
          class="w-4 h-4" 
          :class="{ 'animate-spin': loading }"
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.306 7M7 9h8V1" />
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth.js';

const props = defineProps({
  title: {
    type: String,
    default: 'Employee Attendance Dashboard'
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['filter', 'refresh']);

const authStore = useAuthStore();

// Default: last 30 days
const getLocalDateString = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const end = new Date();
const start = new Date();
start.setDate(start.getDate() - 30);

const startDate = ref(getLocalDateString(start));
const endDate = ref(getLocalDateString(end));
const selectedDept = ref('');

const onFilterChange = () => {
  emit('filter', {
    startDate: startDate.value,
    endDate: endDate.value,
    department: selectedDept.value
  });
};

const onRefresh = () => {
  emit('refresh', {
    startDate: startDate.value,
    endDate: endDate.value,
    department: selectedDept.value
  });
};

// Emit default values on mount
onMounted(() => {
  onFilterChange();
});
</script>
