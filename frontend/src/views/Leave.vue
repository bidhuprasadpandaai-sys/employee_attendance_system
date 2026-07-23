<template>
  <div class="font-sans">
    <div class="flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 tracking-tight">Leave Management</h1>
        <p class="text-sm text-slate-500 mt-1">Apply for leave or approve employee leave requests</p>
      </div>
    </div>

    <!-- Main Workspace Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Left: Apply Leave Form (Visible to Employees only, hidden for Admins or shown as a sidebar toggle) -->
      <div 
        v-if="!authStore.isAdmin" 
        class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between"
      >
        <div>
          <h2 class="text-lg font-bold text-slate-800 mb-1">Apply for Leave</h2>
          <p class="text-xs text-slate-400 font-medium mb-5">Submit request to your supervisor</p>
        </div>

        <form @submit.prevent="handleApplyLeave" class="space-y-4">
          <!-- Leave Type -->
          <div>
            <label class="block text-xs font-bold uppercase text-slate-400 mb-1.5">Leave Type</label>
            <select
              v-model="leaveForm.type"
              required
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
            >
              <option value="casual">Casual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="annual">Annual Leave</option>
              <option value="unpaid">Unpaid Leave</option>
            </select>
          </div>

          <!-- Dates -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-400 mb-1.5">Start Date</label>
              <input
                v-model="leaveForm.startDate"
                type="date"
                required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase text-slate-400 mb-1.5">End Date</label>
              <input
                v-model="leaveForm.endDate"
                type="date"
                required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
              />
            </div>
          </div>

          <!-- Reason -->
          <div>
            <label class="block text-xs font-bold uppercase text-slate-400 mb-1.5">Reason for Absence</label>
            <textarea
              v-model="leaveForm.reason"
              rows="3"
              required
              placeholder="Provide a detailed reason..."
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          <!-- Error Alert -->
          <div v-if="leaveStore.error" class="bg-red-50 border border-red-100 text-red-700 text-xs font-semibold p-3.5 rounded-xl">
            {{ leaveStore.error }}
          </div>

          <!-- Success Info -->
          <div v-if="successMsg" class="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold p-3.5 rounded-xl">
            {{ successMsg }}
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="leaveStore.loading"
            class="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-500/10 transition-all text-xs flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <svg v-if="leaveStore.loading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-else>Submit Application</span>
          </button>
        </form>
      </div>

      <!-- Quick Info / Guideline Card for Admin when form is hidden -->
      <div 
        v-else 
        class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between"
      >
        <div>
          <h2 class="text-lg font-bold text-slate-800 mb-1">Leave Rules</h2>
          <p class="text-xs text-slate-400 font-medium mb-5">System parameters for leave audits</p>
        </div>

        <div class="space-y-4 text-xs font-semibold text-slate-600">
          <div class="p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-800">
            <span class="block font-bold">Auto-Log Action:</span>
            <span>Approving an employee's leave request automatically populates attendance logs as "On Leave" for those dates.</span>
          </div>
          <div class="divide-y divide-slate-100">
            <div class="py-2.5 flex justify-between"><span>Casual leave limit</span> <span class="text-slate-900 font-bold">12 Days / Year</span></div>
            <div class="py-2.5 flex justify-between"><span>Sick leave limit</span> <span class="text-slate-900 font-bold">10 Days / Year</span></div>
            <div class="py-2.5 flex justify-between"><span>Annual leave limit</span> <span class="text-slate-900 font-bold">18 Days / Year</span></div>
            <div class="py-2.5 flex justify-between"><span>Approval requirement</span> <span class="text-slate-900 font-bold">Admin review only</span></div>
          </div>
        </div>
        
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mt-6">HR Attendance Module</span>
      </div>

      <!-- Right: Leaves Listing & Approvals (Takes 2/3 width) -->
      <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
        <div>
          <h2 class="text-lg font-bold text-slate-800 mb-1">
            {{ authStore.isAdmin ? 'Leave Applications Queue' : 'My Application History' }}
          </h2>
          <p class="text-xs text-slate-400 font-medium mb-5">Track request lifecycles</p>
        </div>

        <!-- Queue Listing -->
        <div class="overflow-y-auto max-h-[500px] pr-2 space-y-4">
          
          <div v-if="leaveStore.loading" class="flex flex-col items-center justify-center py-10">
            <svg class="animate-spin h-6 w-6 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Loading queue...</span>
          </div>

          <div 
            v-for="leave in leaveStore.leaves" 
            :key="leave._id"
            class="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors bg-slate-50/50"
          >
            <!-- Card Header -->
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-2.5">
                <img 
                  v-if="authStore.isAdmin" 
                  :src="leave.employee?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg'" 
                  alt="Avatar" 
                  class="w-8 h-8 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 class="text-xs font-bold text-slate-800">{{ leave.employee?.name }}</h4>
                  <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{{ leave.employee?.department }}</span>
                </div>
              </div>

              <!-- Status Tag -->
              <span 
                class="px-2 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase"
                :class="statusClasses(leave.status)"
              >
                {{ leave.status }}
              </span>
            </div>

            <!-- Details -->
            <div class="mt-3.5 space-y-1 text-xs">
              <div class="flex justify-between font-semibold">
                <span class="text-slate-400">Leave Period:</span>
                <span class="text-slate-700">{{ formatDate(leave.startDate) }} — {{ formatDate(leave.endDate) }}</span>
              </div>
              <div class="flex justify-between font-semibold">
                <span class="text-slate-400">Total Duration:</span>
                <span class="text-slate-700 font-bold text-blue-600">{{ leave.days }} Days ({{ leave.type }} leave)</span>
              </div>
              <div class="flex flex-col text-left mt-2">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Reason</span>
                <p class="text-slate-600 leading-normal bg-white p-2.5 rounded-xl border border-slate-100 font-medium">
                  {{ leave.reason }}
                </p>
              </div>
            </div>

            <!-- Admin Action Buttons (Approve/Reject) -->
            <div 
              v-if="authStore.isAdmin && leave.status === 'pending'" 
              class="mt-4 pt-3.5 border-t border-slate-100 flex justify-end space-x-2.5"
            >
              <button
                @click="handleAction(leave._id!, 'rejected')"
                class="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Reject Request
              </button>
              <button
                @click="handleAction(leave._id!, 'approved')"
                class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-md shadow-emerald-600/10"
              >
                Approve Request
              </button>
            </div>
          </div>

          <div v-if="leaveStore.leaves.length === 0 && !leaveStore.loading" class="text-center py-10 text-slate-400 font-semibold text-xs">
            No leave requests logged
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useLeaveStore } from '../stores/leave.js';
import { useAuthStore } from '../stores/auth.js';

const leaveStore = useLeaveStore();
const authStore = useAuthStore();

const successMsg = ref('');

const leaveForm = ref({
  type: 'casual',
  startDate: '',
  endDate: '',
  reason: ''
});

onMounted(() => {
  leaveStore.fetchLeaves();
});

const handleApplyLeave = async () => {
  successMsg.value = '';
  const success = await leaveStore.applyLeave(leaveForm.value);
  if (success) {
    successMsg.value = 'Leave request submitted successfully!';
    // Clear form
    leaveForm.value = {
      type: 'casual',
      startDate: '',
      endDate: '',
      reason: ''
    };
  }
};

const handleAction = async (id: string, status: 'approved' | 'rejected') => {
  if (confirm(`Are you sure you want to ${status} this leave request?`)) {
    await leaveStore.updateLeaveStatus(id, status);
  }
};

// Formatting helpers
const formatDate = (dateStr: string) => {
  if (!dateStr) return '—';
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const statusClasses = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    case 'rejected':
      return 'bg-red-50 text-red-600 border border-red-100';
    default:
      return 'bg-amber-50 text-amber-600 border border-amber-100';
  }
};
</script>
