<template>
  <div class="font-sans">
    <div class="flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 tracking-tight">Attendance Logs</h1>
        <p class="text-sm text-slate-500 mt-1">Review employee timing sheets and check-ins</p>
      </div>
      <!-- Add Manual Record (Admin only) -->
      <button
        v-if="authStore.isAdmin"
        @click="openManualModal"
        class="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 transition-all text-xs flex items-center space-x-1.5 cursor-pointer"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
        </svg>
        <span>Manual Log Override</span>
      </button>
    </div>

    <!-- Filters Sheet -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-3.5 mb-6 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
      <!-- Emp ID filter -->
      <div>
        <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Search Employee ID</label>
        <input
          v-model="filters.employeeId"
          @input="applyFilters"
          type="text"
          placeholder="e.g. EMP001"
          class="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
        />
      </div>
      <!-- Department filter -->
      <div>
        <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Department</label>
        <select
          v-model="filters.department"
          @change="applyFilters"
          class="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
        >
          <option value="">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Marketing">Marketing</option>
          <option value="Sales">Sales</option>
          <option value="HR">HR</option>
          <option value="Finance">Finance</option>
        </select>
      </div>
      <!-- Status filter -->
      <div>
        <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Attendance Status</label>
        <select
          v-model="filters.status"
          @change="applyFilters"
          class="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="present">Present</option>
          <option value="late">Late</option>
          <option value="on_leave">On Leave</option>
          <option value="absent">Absent</option>
        </select>
      </div>
      <!-- Start Date filter -->
      <div>
        <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Start Date</label>
        <input
          v-model="filters.startDate"
          @change="applyFilters"
          type="date"
          class="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
        />
      </div>
      <!-- End Date filter -->
      <div>
        <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">End Date</label>
        <input
          v-model="filters.endDate"
          @change="applyFilters"
          type="date"
          class="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="attendanceStore.loading" class="flex flex-col items-center justify-center py-20">
      <svg class="animate-spin h-8 w-8 text-blue-600 mb-3" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="text-xs text-slate-400 font-bold uppercase tracking-widest">Searching logs...</span>
    </div>

    <!-- Logs Table -->
    <div v-else class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600">
          <thead>
            <tr class="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <th class="pb-3">Date</th>
              <th class="pb-3">Employee ID</th>
              <th class="pb-3">Employee Name</th>
              <th class="pb-3">Department</th>
              <th class="pb-3">Status</th>
              <th class="pb-3">Check In</th>
              <th class="pb-3">Check Out</th>
              <th class="pb-3">Notes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="log in attendanceStore.logs" :key="log._id" class="hover:bg-slate-50/50 transition-colors">
              <td class="py-3.5 font-bold text-slate-800">{{ formatDate(log.date) }}</td>
              <td class="py-3.5 font-semibold text-slate-500">{{ log.employee?.employeeId }}</td>
              <td class="py-3.5">
                <div class="flex items-center space-x-2.5">
                  <img 
                    :src="log.employee?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg'" 
                    alt="Avatar" 
                    class="w-7 h-7 rounded-full object-cover border border-slate-200"
                  />
                  <span class="font-bold text-slate-800">{{ log.employee?.name }}</span>
                </div>
              </td>
              <td class="py-3.5 font-semibold text-slate-500">{{ log.employee?.department }}</td>
              <td class="py-3.5">
                <span 
                  class="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase"
                  :class="statusClasses(log.status)"
                >
                  {{ log.status === 'on_leave' ? 'On Leave' : log.status }}
                </span>
              </td>
              <td class="py-3.5 font-semibold text-slate-700">{{ formatTime(log.checkIn) }}</td>
              <td class="py-3.5 font-semibold text-slate-700">{{ log.checkOut ? formatTime(log.checkOut) : '—' }}</td>
              <td class="py-3.5 text-xs text-slate-400 italic max-w-[150px] truncate" :title="log.notes">{{ log.notes || '—' }}</td>
            </tr>
            <tr v-if="attendanceStore.logs.length === 0">
              <td colspan="8" class="text-center py-10 text-slate-400 font-semibold">No attendance logs found matching these filters</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Manual Log Modal (Admin only) -->
    <div
      v-if="showManualModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 font-sans text-slate-700"
    >
      <div class="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 class="text-md font-bold text-slate-800">Manual Attendance Override</h2>
          <button @click="closeManualModal" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="saveManualRecord" class="p-6 space-y-4">
          <!-- Select Employee -->
          <div>
            <label class="block text-xs font-bold uppercase text-slate-400 mb-1.5">Employee</label>
            <select
              v-model="manualForm.employeeDbId"
              required
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
            >
              <option value="" disabled>Select Employee</option>
              <option 
                v-for="emp in employeeStore.employees" 
                :key="emp._id" 
                :value="emp._id"
              >
                {{ emp.employeeId }} - {{ emp.name }}
              </option>
            </select>
          </div>

          <!-- Date -->
          <div>
            <label class="block text-xs font-bold uppercase text-slate-400 mb-1.5">Date</label>
            <input
              v-model="manualForm.date"
              type="date"
              required
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>

          <!-- Timings -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-400 mb-1.5">Clock In Time</label>
              <input
                v-model="manualForm.checkInTime"
                type="time"
                placeholder="09:00"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase text-slate-400 mb-1.5">Clock Out Time (Optional)</label>
              <input
                v-model="manualForm.checkOutTime"
                type="time"
                placeholder="17:00"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-xs font-bold uppercase text-slate-400 mb-1.5">Status</label>
            <select
              v-model="manualForm.status"
              required
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
            >
              <option value="present">Present</option>
              <option value="late">Late Arrival</option>
              <option value="on_leave">On Leave</option>
              <option value="absent">Absent</option>
            </select>
          </div>

          <!-- Remarks -->
          <div>
            <label class="block text-xs font-bold uppercase text-slate-400 mb-1.5">Reason / Remarks</label>
            <textarea
              v-model="manualForm.notes"
              rows="2"
              placeholder="e.g. Corrected log, forgot to check in"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          <!-- Error Feedback -->
          <div v-if="attendanceStore.error" class="bg-red-50 border border-red-100 text-red-700 text-xs font-semibold p-3.5 rounded-xl">
            {{ attendanceStore.error }}
          </div>

          <!-- Submit Buttons -->
          <div class="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              @click="closeManualModal"
              class="bg-slate-50 border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="attendanceStore.loading"
              class="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-blue-500/15 transition-all flex items-center space-x-1 cursor-pointer disabled:opacity-50"
            >
              <svg v-if="attendanceStore.loading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span v-else>Apply Override</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAttendanceStore } from '../stores/attendance.js';
import { useEmployeeStore } from '../stores/employee.js';
import { useAuthStore } from '../stores/auth.js';

const attendanceStore = useAttendanceStore();
const employeeStore = useEmployeeStore();
const authStore = useAuthStore();

// Default Filter States
const filters = ref({
  employeeId: '',
  department: '',
  status: '',
  startDate: '',
  endDate: ''
});

const showManualModal = ref(false);

const manualForm = ref({
  employeeDbId: '',
  date: new Date().toISOString().split('T')[0],
  checkInTime: '09:00',
  checkOutTime: '',
  status: 'present',
  notes: ''
});

onMounted(() => {
  attendanceStore.fetchLogs();
  if (authStore.isAdmin) {
    employeeStore.fetchEmployees();
  }
});

const applyFilters = () => {
  attendanceStore.fetchLogs(filters.value);
};

const openManualModal = () => {
  attendanceStore.error = '';
  manualForm.value = {
    employeeDbId: '',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '09:00',
    checkOutTime: '',
    status: 'present',
    notes: ''
  };
  showManualModal.value = true;
};

const closeManualModal = () => {
  showManualModal.value = false;
};

const saveManualRecord = async () => {
  const payload = {
    employeeDbId: manualForm.value.employeeDbId,
    date: manualForm.value.date,
    checkInTime: manualForm.value.checkInTime,
    checkOutTime: manualForm.value.checkOutTime || undefined,
    status: manualForm.value.status,
    notes: manualForm.value.notes
  };

  const success = await attendanceStore.saveManualRecord(payload);
  if (success) {
    closeManualModal();
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

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—';
  // Parse as local time string to prevent timezone offset shift
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
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
</script>
