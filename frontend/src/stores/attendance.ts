import { defineStore } from 'pinia';
import api from '../utils/api.js';

export interface AttendanceRecord {
  _id?: string;
  employee: {
    _id: string;
    employeeId: string;
    name: string;
    department: string;
    designation: string;
    avatar?: string;
  };
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'on_leave';
  notes?: string;
}

export const useAttendanceStore = defineStore('attendance', {
  state: () => ({
    logs: [] as AttendanceRecord[],
    todayStatus: {
      checkedIn: false,
      checkedOut: false,
      record: null as any
    },
    loading: false,
    error: ''
  }),
  actions: {
    async fetchLogs(params?: {
      employeeId?: string;
      department?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    }): Promise<void> {
      this.loading = true;
      this.error = '';
      try {
        const res = await api.get('/attendance/logs', { params });
        this.logs = res.data;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to fetch attendance logs';
      } finally {
        this.loading = false;
      }
    },
    async fetchTodayStatus(): Promise<void> {
      this.loading = true;
      try {
        const res = await api.get('/attendance/today-status');
        this.todayStatus = res.data;
      } catch (err: any) {
        // Silently fail if not logged in or during initial loading
      } finally {
        this.loading = false;
      }
    },
    async checkIn(): Promise<boolean> {
      this.loading = true;
      this.error = '';
      try {
        await api.post('/attendance/checkin');
        await this.fetchTodayStatus();
        return true;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to check in';
        return false;
      } finally {
        this.loading = false;
      }
    },
    async checkOut(): Promise<boolean> {
      this.loading = true;
      this.error = '';
      try {
        await api.post('/attendance/checkout');
        await this.fetchTodayStatus();
        return true;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to check out';
        return false;
      } finally {
        this.loading = false;
      }
    },
    async saveManualRecord(data: {
      employeeDbId: string;
      date: string;
      checkInTime: string;
      checkOutTime?: string;
      status: string;
      notes?: string;
    }): Promise<boolean> {
      this.loading = true;
      this.error = '';
      try {
        await api.post('/attendance/manual', data);
        await this.fetchLogs();
        return true;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to save attendance record';
        return false;
      } finally {
        this.loading = false;
      }
    }
  }
});
