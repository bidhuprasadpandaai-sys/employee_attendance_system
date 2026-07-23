<template>
  <div class="font-sans">
    <div class="flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 tracking-tight">Employees Directory</h1>
        <p class="text-sm text-slate-500 mt-1">Manage and view corporate members</p>
      </div>
      <!-- Add Employee (Admins only) -->
      <button
        v-if="authStore.isAdmin"
        @click="openAddModal"
        class="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 transition-all text-xs flex items-center space-x-1.5 cursor-pointer"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
        </svg>
        <span>Add Employee</span>
      </button>
    </div>

    <!-- Search & Filters -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
      <div class="relative flex-1">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
          <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name, email or employee ID..."
          class="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 pl-10 pr-4 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div class="flex gap-3">
        <!-- Department Filter -->
        <select
          v-model="filterDept"
          class="bg-slate-50 border border-slate-100 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Marketing">Marketing</option>
          <option value="Sales">Sales</option>
          <option value="HR">HR</option>
          <option value="Finance">Finance</option>
        </select>
        <!-- Status Filter -->
        <select
          v-model="filterStatus"
          class="bg-slate-50 border border-slate-100 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="employeeStore.loading" class="flex flex-col items-center justify-center py-20">
      <svg class="animate-spin h-8 w-8 text-blue-600 mb-3" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="text-xs text-slate-400 font-bold uppercase tracking-widest">Fetching profiles...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="employeeStore.error" class="bg-red-50 p-4 rounded-xl border border-red-200 text-red-700 text-xs font-semibold">
      {{ employeeStore.error }}
    </div>

    <!-- Grid Layout -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="emp in filteredEmployees"
        :key="emp._id"
        class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
      >
        <!-- Deactivated indicator -->
        <span 
          v-if="emp.status === 'inactive'"
          class="absolute top-2 right-2 px-2 py-0.5 bg-slate-100 border border-slate-200 text-[9px] font-bold text-slate-400 uppercase rounded"
        >
          Inactive
        </span>

        <!-- Upper Info -->
        <div class="text-center">
          <img
            :src="emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80'"
            alt="Avatar"
            class="w-16 h-16 rounded-full border-2 border-blue-500/20 mx-auto object-cover group-hover:scale-105 transition-transform"
          />
          <h3 class="text-sm font-bold text-slate-800 mt-3">{{ emp.name }}</h3>
          <p class="text-xs font-semibold text-slate-400 mt-0.5">{{ emp.designation }}</p>
          <span class="inline-block mt-2 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-blue-600 rounded-full">
            {{ emp.department }}
          </span>
        </div>

        <!-- Meta Details -->
        <div class="mt-4 pt-4 border-t border-slate-50 space-y-1.5 text-xs text-left">
          <div class="flex justify-between font-semibold">
            <span class="text-slate-400">ID:</span>
            <span class="text-slate-700">{{ emp.employeeId }}</span>
          </div>
          <div class="flex justify-between font-semibold">
            <span class="text-slate-400">Email:</span>
            <span class="text-slate-700 truncate max-w-[140px]" :title="emp.email">{{ emp.email }}</span>
          </div>
          <div class="flex justify-between font-semibold">
            <span class="text-slate-400">Role:</span>
            <span class="text-slate-700 capitalize">{{ emp.role }}</span>
          </div>
          <div class="flex justify-between font-semibold">
            <span class="text-slate-400">Join Date:</span>
            <span class="text-slate-700">{{ formatDate(emp.joinDate) }}</span>
          </div>
        </div>

        <!-- Action Buttons (Admin Only) -->
        <div v-if="authStore.isAdmin" class="mt-5 pt-3 border-t border-slate-50 flex justify-end space-x-2">
          <button
            @click="openEditModal(emp)"
            class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="Edit"
          >
            <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            @click="handleDelete(emp)"
            class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Delete"
          >
            <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Form (Add / Edit) -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 font-sans text-slate-700"
    >
      <div class="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 class="text-md font-bold text-slate-800">{{ isEdit ? 'Edit Employee Profile' : 'Add New Employee' }}</h2>
          <button @click="closeModal" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <form @submit.prevent="saveEmployee" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-400 mb-1.5">Employee ID</label>
              <input
                v-model="form.employeeId"
                type="text"
                required
                :disabled="isEdit"
                placeholder="EMP001"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase text-slate-400 mb-1.5">Full Name</label>
              <input
                v-model="form.name"
                type="text"
                required
                placeholder="Rohit Sharma"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-400 mb-1.5">Email Address</label>
              <input
                v-model="form.email"
                type="email"
                required
                placeholder="name@attendance.com"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase text-slate-400 mb-1.5">Password</label>
              <input
                v-model="form.password"
                type="password"
                :required="!isEdit"
                placeholder="••••••••"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
              <span v-if="isEdit" class="text-[9px] text-slate-400 font-bold">Leave empty to keep existing password</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-400 mb-1.5">Department</label>
              <select
                v-model="form.department"
                required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="Engineering">Engineering</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold uppercase text-slate-400 mb-1.5">Designation</label>
              <input
                v-model="form.designation"
                type="text"
                required
                placeholder="Software Engineer"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-400 mb-1.5">Access Role</label>
              <select
                v-model="form.role"
                required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold uppercase text-slate-400 mb-1.5">Active Status</label>
              <select
                v-model="form.status"
                required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-slate-400 mb-1.5">Avatar URL (Optional)</label>
            <input
              v-model="form.avatar"
              type="url"
              placeholder="https://images.unsplash.com/..."
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>

          <!-- Error Feedback -->
          <div v-if="employeeStore.error" class="bg-red-50 border border-red-100 text-red-700 text-xs font-semibold p-3.5 rounded-xl">
            {{ employeeStore.error }}
          </div>

          <!-- Buttons -->
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
              :disabled="employeeStore.loading"
              class="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-blue-500/15 transition-all flex items-center space-x-1 cursor-pointer disabled:opacity-50"
            >
              <svg v-if="employeeStore.loading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span v-else>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useEmployeeStore } from '../stores/employee.js';
import type { EmployeeData } from '../stores/employee.js';
import { useAuthStore } from '../stores/auth.js';

const employeeStore = useEmployeeStore();
const authStore = useAuthStore();

// Form States
const searchQuery = ref('');
const filterDept = ref('');
const filterStatus = ref('');
const showModal = ref(false);
const isEdit = ref(false);
const editId = ref('');

const form = ref<EmployeeData>({
  employeeId: '',
  name: '',
  email: '',
  password: '',
  role: 'employee',
  department: 'Engineering',
  designation: '',
  avatar: '',
  status: 'active'
});

// Load employees
onMounted(() => {
  employeeStore.fetchEmployees();
});

// Search & filter computations
const filteredEmployees = computed(() => {
  return employeeStore.employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    const matchesDept = filterDept.value === '' || emp.department === filterDept.value;
    const matchesStatus = filterStatus.value === '' || emp.status === filterStatus.value;
    
    return matchesSearch && matchesDept && matchesStatus;
  });
});

// Modal Logic
const openAddModal = () => {
  isEdit.value = false;
  employeeStore.error = '';
  form.value = {
    employeeId: '',
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: 'Engineering',
    designation: '',
    avatar: '',
    status: 'active'
  };
  showModal.value = true;
};

const openEditModal = (emp: EmployeeData) => {
  isEdit.value = true;
  employeeStore.error = '';
  editId.value = emp._id || '';
  form.value = {
    employeeId: emp.employeeId,
    name: emp.name,
    email: emp.email,
    password: '', // Leave blank by default
    role: emp.role,
    department: emp.department,
    designation: emp.designation,
    avatar: emp.avatar || '',
    status: emp.status
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveEmployee = async () => {
  let success = false;
  if (isEdit.value) {
    // Exclude password if empty in editing
    const payload: Partial<EmployeeData> = { ...form.value };
    if (!payload.password) delete payload.password;
    success = await employeeStore.updateEmployee(editId.value, payload);
  } else {
    success = await employeeStore.createEmployee(form.value);
  }

  if (success) {
    closeModal();
  }
};

const handleDelete = async (emp: EmployeeData) => {
  if (confirm(`Are you sure you want to delete ${emp.name}? This will permanently remove their records.`)) {
    await employeeStore.deleteEmployee(emp._id || '');
  }
};

const formatDate = (isoString?: string) => {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
</script>
