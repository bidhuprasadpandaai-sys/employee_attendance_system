<template>
  <div class="font-sans">
    <!-- Header component with query filters -->
    <Header 
      title="Employee Attendance Dashboard" 
      :loading="dashboardStore.loading" 
      @filter="handleFilter" 
      @refresh="handleRefresh"
    />

    <!-- Main Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-6" v-if="dashboardStore.stats">
      <!-- Total Employees Card -->
      <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
        <div class="flex items-center space-x-4">
          <div class="bg-blue-500/10 p-3 rounded-xl text-blue-600 group-hover:scale-105 transition-transform">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Employees</span>
            <h3 class="text-2xl font-black text-slate-800 mt-0.5">{{ dashboardStore.stats.totalEmployees.value }}</h3>
            <span class="text-[10px] font-bold text-slate-400">{{ dashboardStore.stats.totalEmployees.trend.text }}</span>
          </div>
        </div>
      </div>

      <!-- Present Employees Card -->
      <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
        <div class="flex items-center space-x-4">
          <div class="bg-emerald-500/10 p-3 rounded-xl text-emerald-600 group-hover:scale-105 transition-transform">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wide">Present</span>
            <h3 class="text-2xl font-black text-slate-800 mt-0.5">{{ dashboardStore.stats.present.value }}</h3>
            <span 
              class="text-[10px] font-bold" 
              :class="dashboardStore.stats.present.trend.type === 'up' ? 'text-emerald-500' : 'text-red-500'"
            >
              {{ dashboardStore.stats.present.trend.text }}
            </span>
          </div>
        </div>
      </div>

      <!-- Absent Employees Card -->
      <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
        <div class="flex items-center space-x-4">
          <div class="bg-red-500/10 p-3 rounded-xl text-red-600 group-hover:scale-105 transition-transform">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wide">Absent</span>
            <h3 class="text-2xl font-black text-slate-800 mt-0.5">{{ dashboardStore.stats.absent.value }}</h3>
            <span 
              class="text-[10px] font-bold"
              :class="dashboardStore.stats.absent.trend.type === 'down' ? 'text-emerald-500' : 'text-red-500'"
            >
              {{ dashboardStore.stats.absent.trend.text }}
            </span>
          </div>
        </div>
      </div>

      <!-- Late Employees Card -->
      <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
        <div class="flex items-center space-x-4">
          <div class="bg-purple-500/10 p-3 rounded-xl text-purple-600 group-hover:scale-105 transition-transform">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wide">Late</span>
            <h3 class="text-2xl font-black text-slate-800 mt-0.5">{{ dashboardStore.stats.late.value }}</h3>
            <span 
              class="text-[10px] font-bold"
              :class="dashboardStore.stats.late.trend.type === 'down' ? 'text-emerald-500' : 'text-red-500'"
            >
              {{ dashboardStore.stats.late.trend.text }}
            </span>
          </div>
        </div>
      </div>

      <!-- On Leave Employees Card -->
      <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
        <div class="flex items-center space-x-4">
          <div class="bg-blue-500/10 p-3 rounded-xl text-blue-600 group-hover:scale-105 transition-transform">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </div>
          <div>
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wide">On Leave</span>
            <h3 class="text-2xl font-black text-slate-800 mt-0.5">{{ dashboardStore.stats.onLeave.value }}</h3>
            <span class="text-[10px] font-bold text-slate-400">{{ dashboardStore.stats.onLeave.trend.text }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Container -->
    <DashboardCharts 
      v-if="dashboardStore.chartData.length > 0" 
      :chart-data="dashboardStore.chartData" 
      :summary="dashboardStore.summary" 
      class="mb-6"
    />

    <!-- Bottom Tables Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Recent Attendance Logs Table (2/3 width) -->
      <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-lg font-bold text-slate-800">Recent Attendance</h2>
            <p class="text-xs text-slate-400 font-medium">Latest clock-in reports</p>
          </div>
          <router-link to="/attendance" class="text-xs font-bold text-blue-600 hover:text-blue-500 hover:underline">
            View All
          </router-link>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-600">
            <thead>
              <tr class="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th class="pb-3">Employee ID</th>
                <th class="pb-3">Employee Name</th>
                <th class="pb-3">Department</th>
                <th class="pb-3">Status</th>
                <th class="pb-3">Check In</th>
                <th class="pb-3">Check Out</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="log in dashboardStore.recentAttendance" :key="log._id" class="hover:bg-slate-50/50 transition-colors">
                <td class="py-3 font-semibold text-slate-500">{{ log.employee?.employeeId }}</td>
                <td class="py-3">
                  <div class="flex items-center space-x-2.5">
                    <img 
                      :src="log.employee?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg'" 
                      alt="Avatar" 
                      class="w-7 h-7 rounded-full object-cover border border-slate-200"
                    />
                    <span class="font-bold text-slate-800">{{ log.employee?.name }}</span>
                  </div>
                </td>
                <td class="py-3 font-medium text-slate-500">{{ log.employee?.department }}</td>
                <td class="py-3">
                  <span 
                    class="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase"
                    :class="statusClasses(log.status)"
                  >
                    {{ log.status === 'on_leave' ? 'On Leave' : log.status }}
                  </span>
                </td>
                <td class="py-3 font-semibold text-slate-700">{{ formatTime(log.checkIn) }}</td>
                <td class="py-3 font-semibold text-slate-700">{{ log.checkOut ? formatTime(log.checkOut) : '—' }}</td>
              </tr>
              <tr v-if="dashboardStore.recentAttendance.length === 0">
                <td colspan="6" class="text-center py-6 text-slate-400 font-semibold">No attendance logged today</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quick Attendance Check-in Portal (1/3 width) -->
      <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
        <div>
          <h2 class="text-lg font-bold text-slate-800">Today's Status</h2>
          <p class="text-xs text-slate-400 font-medium">{{ formattedTodayDate }}</p>
        </div>

        <!-- Employee Panel: Check In/Out Actions -->
        <div class="my-6 p-5 rounded-2xl border border-blue-500/10 bg-slate-50 flex flex-col items-center justify-center text-center">
          <span class="text-xs text-[#8DA9C4] uppercase font-bold tracking-widest mb-1.5">Action Center</span>
          
          <div v-if="!attendanceStore.todayStatus.checkedIn">
            <p class="text-sm font-semibold text-slate-600 mb-4">You have not checked in yet today.</p>
            <button
              @click="handleCheckIn"
              :disabled="attendanceStore.loading"
              class="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/35 transition-all text-sm flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <svg class="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Clock In Now</span>
            </button>
          </div>

          <div v-else-if="attendanceStore.todayStatus.checkedIn && !attendanceStore.todayStatus.checkedOut">
            <p class="text-sm font-semibold text-slate-600 mb-1">Checked In at {{ formatTime(attendanceStore.todayStatus.record?.checkIn) }}</p>
            <p class="text-xs text-slate-400 mb-4">Duration: {{ checkInDuration }}</p>
            <button
              @click="handleCheckOut"
              :disabled="attendanceStore.loading"
              class="bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-red-600/20 hover:shadow-red-600/35 transition-all text-sm flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <svg class="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Clock Out Now</span>
            </button>
          </div>

          <div v-else class="flex flex-col items-center">
            <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p class="text-sm font-bold text-slate-800">Checked Out Successfully</p>
            <p class="text-xs text-slate-500 mt-1">Clock In: {{ formatTime(attendanceStore.todayStatus.record?.checkIn) }}</p>
            <p class="text-xs text-slate-500">Clock Out: {{ formatTime(attendanceStore.todayStatus.record?.checkOut) }}</p>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Work completed today!</span>
          </div>
        </div>

        <!-- Quick aggregates breakdown listing -->
        <div class="space-y-3.5" v-if="dashboardStore.todayStatus">
          <div class="flex items-center justify-between text-xs font-bold border-b border-slate-50 pb-2">
            <span class="text-slate-400 uppercase tracking-wide">Status Aggregates</span>
            <span class="text-blue-600">Active Daily Metrics</span>
          </div>
          <div class="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span class="flex items-center"><span class="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>Present</span>
            <span class="font-bold text-slate-800">{{ dashboardStore.todayStatus.present }}</span>
          </div>
          <div class="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span class="flex items-center"><span class="w-2 h-2 rounded-full bg-red-500 mr-2"></span>Absent</span>
            <span class="font-bold text-slate-800">{{ dashboardStore.todayStatus.absent }}</span>
          </div>
          <div class="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span class="flex items-center"><span class="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>Late Arrival</span>
            <span class="font-bold text-slate-800">{{ dashboardStore.todayStatus.late }}</span>
          </div>
          <div class="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span class="flex items-center"><span class="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>On Leave</span>
            <span class="font-bold text-slate-800">{{ dashboardStore.todayStatus.leave }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import Header from '../components/Header.vue';
import DashboardCharts from '../components/DashboardCharts.vue';
import { useDashboardStore } from '../stores/dashboard.js';
import { useAttendanceStore } from '../stores/attendance.js';

const dashboardStore = useDashboardStore();
const attendanceStore = useAttendanceStore();

const activeFilters = ref({
  startDate: '',
  endDate: '',
  department: ''
});

// Format today's header date
const formattedTodayDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Calculate clock-in elapsed duration
const checkInDuration = computed(() => {
  const checkInTime = attendanceStore.todayStatus.record?.checkIn;
  if (!checkInTime) return '—';
  
  const diffMs = new Date().getTime() - new Date(checkInTime).getTime();
  const hrs = Math.floor(diffMs / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  
  if (hrs > 0) {
    return `${hrs} hr ${mins} min`;
  }
  return `${mins} min`;
});

// Load stats with applied filters
const handleFilter = (filters: any) => {
  activeFilters.value = filters;
  dashboardStore.fetchStats(filters);
};

const handleRefresh = (filters: any) => {
  dashboardStore.fetchStats(filters);
  attendanceStore.fetchTodayStatus();
};

const handleCheckIn = async () => {
  const success = await attendanceStore.checkIn();
  if (success) {
    // Refresh stats
    dashboardStore.fetchStats(activeFilters.value);
  }
};

const handleCheckOut = async () => {
  const success = await attendanceStore.checkOut();
  if (success) {
    // Refresh stats
    dashboardStore.fetchStats(activeFilters.value);
  }
};

// Formatting helpers
const formatTime = (isoString: string) => {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const statusClasses = (status: string) => {
  switch (status) {
    case 'present':
      return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    case 'late':
      return 'bg-purple-50 text-purple-600 border border-purple-100';
    case 'on_leave':
      return 'bg-blue-50 text-blue-600 border border-blue-100';
    case 'absent':
      return 'bg-red-50 text-red-600 border border-red-100';
    default:
      return 'bg-slate-50 text-slate-600 border border-slate-100';
  }
};

onMounted(() => {
  attendanceStore.fetchTodayStatus();
});
</script>
