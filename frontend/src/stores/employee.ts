import { defineStore } from 'pinia';
import api from '../utils/api.js';

export interface EmployeeData {
  _id?: string;
  employeeId: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'employee';
  department: 'Engineering' | 'Marketing' | 'Sales' | 'HR' | 'Finance';
  designation: string;
  avatar?: string;
  joinDate?: string;
  status: 'active' | 'inactive';
}

export const useEmployeeStore = defineStore('employee', {
  state: () => ({
    employees: [] as EmployeeData[],
    loading: false,
    error: ''
  }),
  actions: {
    async fetchEmployees(): Promise<void> {
      this.loading = true;
      this.error = '';
      try {
        const res = await api.get('/employees');
        this.employees = res.data;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to fetch employees';
      } finally {
        this.loading = false;
      }
    },
    async createEmployee(data: EmployeeData): Promise<boolean> {
      this.loading = true;
      try {
        await api.post('/employees', data);
        await this.fetchEmployees();
        return true;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to create employee';
        return false;
      } finally {
        this.loading = false;
      }
    },
    async updateEmployee(id: string, data: Partial<EmployeeData>): Promise<boolean> {
      this.loading = true;
      try {
        await api.put(`/employees/${id}`, data);
        await this.fetchEmployees();
        return true;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to update employee';
        return false;
      } finally {
        this.loading = false;
      }
    },
    async deleteEmployee(id: string): Promise<boolean> {
      this.loading = true;
      try {
        await api.delete(`/employees/${id}`);
        await this.fetchEmployees();
        return true;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to delete employee';
        return false;
      } finally {
        this.loading = false;
      }
    }
  }
});
