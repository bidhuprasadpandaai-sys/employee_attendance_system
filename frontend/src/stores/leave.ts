import { defineStore } from 'pinia';
import api from '../utils/api.js';

export interface LeaveRequest {
  _id?: string;
  employee: {
    _id: string;
    employeeId: string;
    name: string;
    department: string;
    designation: string;
    avatar?: string;
  };
  type: 'casual' | 'sick' | 'annual' | 'unpaid';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
}

export const useLeaveStore = defineStore('leave', {
  state: () => ({
    leaves: [] as LeaveRequest[],
    loading: false,
    error: ''
  }),
  actions: {
    async fetchLeaves(): Promise<void> {
      this.loading = true;
      this.error = '';
      try {
        const res = await api.get('/leaves');
        this.leaves = res.data;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to fetch leave requests';
      } finally {
        this.loading = false;
      }
    },
    async applyLeave(data: {
      type: string;
      startDate: string;
      endDate: string;
      reason: string;
    }): Promise<boolean> {
      this.loading = true;
      this.error = '';
      try {
        await api.post('/leaves', data);
        await this.fetchLeaves();
        return true;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to apply for leave';
        return false;
      } finally {
        this.loading = false;
      }
    },
    async updateLeaveStatus(id: string, status: 'approved' | 'rejected'): Promise<boolean> {
      this.loading = true;
      this.error = '';
      try {
        await api.put(`/leaves/${id}/status`, { status });
        await this.fetchLeaves();
        return true;
      } catch (err: any) {
        this.error = err.response?.data?.message || `Failed to ${status} leave request`;
        return false;
      } finally {
        this.loading = false;
      }
    }
  }
});
