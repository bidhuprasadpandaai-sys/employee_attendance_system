import { defineStore } from 'pinia';
import api from '../utils/api.js';

interface User {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  department: string;
  designation: string;
  avatar?: string;
  joinDate: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem('token') || '',
    loading: false,
    error: '' as string
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin'
  },
  actions: {
    async login(email: string, password: string): Promise<boolean> {
      this.loading = true;
      this.error = '';
      try {
        const res = await api.post('/auth/login', { email, password });
        this.token = res.data.token;
        this.user = res.data.user;
        localStorage.setItem('token', this.token);
        return true;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Login failed. Please try again.';
        return false;
      } finally {
        this.loading = false;
      }
    },
    async fetchProfile(): Promise<void> {
      if (!this.token) return;
      this.loading = true;
      try {
        const res = await api.get('/auth/profile');
        this.user = res.data.user;
      } catch (err: any) {
        this.logout();
      } finally {
        this.loading = false;
      }
    },
    logout(): void {
      this.user = null;
      this.token = '';
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }
});
