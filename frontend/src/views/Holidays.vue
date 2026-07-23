<template>
  <div class="font-sans text-slate-700">
    <div class="flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 tracking-tight">Holiday Calendar</h1>
        <p class="text-sm text-slate-500 mt-1">Review upcoming public and corporate holidays</p>
      </div>
      <!-- Add Holiday (Admin only) -->
      <button
        v-if="authStore.isAdmin"
        @click="openAddModal"
        class="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 transition-all text-xs flex items-center space-x-1.5 cursor-pointer"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
        </svg>
        <span>Add Holiday</span>
      </button>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Holiday Directory Listing (Takes 2/3 width) -->
      <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
        <div>
          <h2 class="text-lg font-bold text-slate-800 mb-1">Corporate Holiday Schedule</h2>
          <p class="text-xs text-slate-400 font-medium mb-5">Scheduled corporate breaks</p>
        </div>

        <div v-if="loading" class="flex flex-col items-center justify-center py-20">
          <svg class="animate-spin h-6 w-6 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Loading calendar...</span>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-600">
            <thead>
              <tr class="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th class="pb-3">Date</th>
                <th class="pb-3">Holiday Name</th>
                <th class="pb-3">Category</th>
                <th class="pb-3 text-right" v-if="authStore.isAdmin">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr 
                v-for="holiday in holidays" 
                :key="holiday._id" 
                class="hover:bg-slate-50/50 transition-colors"
                :class="{ 'opacity-60': isPast(holiday.date) }"
              >
                <td class="py-3.5 font-bold text-slate-800">{{ formatDate(holiday.date) }}</td>
                <td class="py-3.5 font-bold text-slate-700">
                  {{ holiday.name }}
                  <span v-if="isPast(holiday.date)" class="ml-2 text-[9px] font-bold uppercase text-slate-400 bg-slate-100 border border-slate-200 px-1 py-0.5 rounded">Past</span>
                </td>
                <td class="py-3.5">
                  <span 
                    class="px-2.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase"
                    :class="holiday.type === 'national' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'"
                  >
                    {{ holiday.type }}
                  </span>
                </td>
                <td class="py-3.5 text-right" v-if="authStore.isAdmin">
                  <button
                    @click="deleteHoliday(holiday._id)"
                    class="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="Remove Holiday"
                  >
                    <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
              <tr v-if="holidays.length === 0">
                <td colspan="4" class="text-center py-8 text-slate-400 font-semibold">No holidays listed in schedule</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quick Calendar Info Widget (1/3 width) -->
      <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
        <div>
          <h2 class="text-lg font-bold text-slate-800 mb-1">Corporate Mandates</h2>
          <p class="text-xs text-slate-400 font-medium mb-5">General guidelines for holidays</p>
        </div>

        <div class="space-y-4 text-xs font-semibold text-slate-600">
          <div class="p-3.5 bg-amber-50 border border-amber-100 rounded-xl text-amber-800">
            <span class="block font-bold">Holiday Status Check:</span>
            <span>Corporate holidays represent paid time-off days. Any attendance logged on these days counts as overtime pay under company rules.</span>
          </div>
          <div class="space-y-2.5">
            <div class="flex items-center space-x-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span><strong>National Holidays:</strong> Mandated full days off.</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span><strong>Restricted Holidays:</strong> Optional days off, requires manager approval.</span>
            </div>
          </div>
        </div>
        
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mt-6">System Clock Module</span>
      </div>

    </div>

    <!-- Add Holiday Modal (Admin only) -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 text-slate-700"
    >
      <div class="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 class="text-md font-bold text-slate-800">Add New Holiday</h2>
          <button @click="closeModal" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveHoliday" class="p-6 space-y-4">
          <!-- Holiday Name -->
          <div>
            <label class="block text-xs font-bold uppercase text-slate-400 mb-1.5">Holiday Name</label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="e.g. Independence Day"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>

          <!-- Date -->
          <div>
            <label class="block text-xs font-bold uppercase text-slate-400 mb-1.5">Date</label>
            <input
              v-model="form.date"
              type="date"
              required
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
            />
          </div>

          <!-- Holiday Type -->
          <div>
            <label class="block text-xs font-bold uppercase text-slate-400 mb-1.5">Category</label>
            <select
              v-model="form.type"
              required
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none"
            >
              <option value="national">National Holiday</option>
              <option value="restricted">Restricted Holiday</option>
            </select>
          </div>

          <!-- Error Feedback -->
          <div v-if="error" class="bg-red-50 border border-red-100 text-red-700 text-xs font-semibold p-3.5 rounded-xl">
            {{ error }}
          </div>

          <!-- Submit Buttons -->
          <div class="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              @click="closeModal"
              class="bg-slate-50 border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-blue-500/15 transition-all cursor-pointer"
            >
              Save Holiday
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../utils/api.js';
import { useAuthStore } from '../stores/auth.js';

const authStore = useAuthStore();

const holidays = ref<any[]>([]);
const loading = ref(false);
const error = ref('');

const showModal = ref(false);

const form = ref({
  name: '',
  date: '',
  type: 'national'
});

const fetchHolidays = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await api.get('/holidays');
    holidays.value = res.data;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to fetch holidays';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchHolidays();
});

const openAddModal = () => {
  error.value = '';
  form.value = {
    name: '',
    date: '',
    type: 'national'
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveHoliday = async () => {
  error.value = '';
  try {
    await api.post('/holidays', form.value);
    await fetchHolidays();
    closeModal();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to create holiday';
  }
};

const deleteHoliday = async (id: string) => {
  if (confirm('Are you sure you want to remove this holiday from schedule?')) {
    try {
      await api.delete(`/holidays/${id}`);
      await fetchHolidays();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete holiday');
    }
  }
};

const isPast = (dateStr: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(`${dateStr}T00:00:00`);
  return d < today;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—';
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};
</script>
