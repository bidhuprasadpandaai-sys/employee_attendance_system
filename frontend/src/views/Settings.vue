<template>
  <div class="font-sans text-slate-700">
    <div class="flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 tracking-tight">Portal Settings</h1>
        <p class="text-sm text-slate-500 mt-1">Manage portal timing policies and user account settings</p>
      </div>
    </div>

    <!-- Settings Options Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- User Profile Card -->
      <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
        <div>
          <h2 class="text-lg font-bold text-slate-800 mb-1">My Profile</h2>
          <p class="text-xs text-slate-400 font-medium mb-5">Your active credentials</p>
        </div>

        <div class="flex flex-col items-center py-4 text-center border-t border-b border-slate-50 my-4">
          <img
            :src="authStore.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80'"
            alt="Avatar"
            class="w-20 h-20 rounded-full border-2 border-blue-500/20 object-cover"
          />
          <h3 class="text-sm font-bold text-slate-800 mt-3">{{ authStore.user?.name }}</h3>
          <p class="text-xs font-semibold text-slate-400 mt-0.5">{{ authStore.user?.designation }}</p>
          <span class="inline-block mt-2 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-blue-600 rounded-full">
            {{ authStore.user?.department }}
          </span>
        </div>

        <div class="space-y-2.5 text-xs">
          <div class="flex justify-between font-semibold">
            <span class="text-slate-400">Employee ID:</span>
            <span class="text-slate-700">{{ authStore.user?.employeeId }}</span>
          </div>
          <div class="flex justify-between font-semibold">
            <span class="text-slate-400">Email:</span>
            <span class="text-slate-700">{{ authStore.user?.email }}</span>
          </div>
          <div class="flex justify-between font-semibold">
            <span class="text-slate-400">Join Date:</span>
            <span class="text-slate-700">{{ formatDate(authStore.user?.joinDate) }}</span>
          </div>
          <div class="flex justify-between font-semibold">
            <span class="text-slate-400">Access Level:</span>
            <span class="text-slate-700 capitalize font-bold text-blue-600">{{ authStore.user?.role }}</span>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button 
            @click="authStore.logout" 
            class="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer text-center"
          >
            Log Out Account
          </button>
        </div>
      </div>

      <!-- Policy timing thresholds (Takes 2/3 width) -->
      <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
        <div>
          <h2 class="text-lg font-bold text-slate-800 mb-1">Company Work Policies</h2>
          <p class="text-xs text-slate-400 font-medium mb-5">Admin configurable system timing guidelines</p>
        </div>

        <form @submit.prevent="saveSettings" class="space-y-4 text-xs font-semibold">
          <!-- Timings rules -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-400 uppercase text-[10px] font-bold mb-1.5">Late Threshold Hour</label>
              <input 
                type="time" 
                v-model="timingLimit" 
                :disabled="!authStore.isAdmin"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label class="block text-slate-400 uppercase text-[10px] font-bold mb-1.5">Standard Daily Work Hours</label>
              <select 
                v-model="workHours" 
                :disabled="!authStore.isAdmin"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              >
                <option value="7">7 Hours</option>
                <option value="8">8 Hours (Standard)</option>
                <option value="9">9 Hours</option>
              </select>
            </div>
          </div>

          <!-- Notification Toggles -->
          <div class="pt-4 border-t border-slate-50 space-y-3">
            <span class="block text-slate-400 uppercase text-[10px] font-bold mb-2">My Notification Settings</span>
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-slate-800 font-bold text-xs">Email Daily Reminders</h4>
                <p class="text-[10px] text-slate-400 font-medium">Send check-in alerts daily</p>
              </div>
              <input type="checkbox" v-model="notifyReminders" class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-slate-800 font-bold text-xs">Leave Application Updates</h4>
                <p class="text-[10px] text-slate-400 font-medium">Notify when leave status changes</p>
              </div>
              <input type="checkbox" v-model="notifyLeaves" class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
            </div>
          </div>

          <!-- Security Policy -->
          <div class="pt-4 border-t border-slate-50 space-y-3">
            <span class="block text-slate-400 uppercase text-[10px] font-bold mb-2">System Security</span>
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-slate-800 font-bold text-xs">Enable Geofencing Checks</h4>
                <p class="text-[10px] text-slate-400 font-medium">Restrict check-ins to corporate network IPs</p>
              </div>
              <input 
                type="checkbox" 
                v-model="enableGeofence" 
                :disabled="!authStore.isAdmin"
                class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50" 
              />
            </div>
          </div>

          <!-- Save Button -->
          <div class="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              class="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-blue-500/15 cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth.js';

const authStore = useAuthStore();

// Local preference variables
const timingLimit = ref('09:00');
const workHours = ref('8');
const notifyReminders = ref(true);
const notifyLeaves = ref(true);
const enableGeofence = ref(false);

const saveSettings = () => {
  alert('Preferences saved successfully!');
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>
