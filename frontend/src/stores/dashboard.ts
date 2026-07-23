import { defineStore } from 'pinia';
import api from '../utils/api.js';

export interface DashboardStatItem {
  value: number;
  trend: {
    text: string;
    type: 'up' | 'down' | 'neutral';
  };
}

export interface DashboardStats {
  totalEmployees: DashboardStatItem;
  present: DashboardStatItem;
  absent: DashboardStatItem;
  late: DashboardStatItem;
  onLeave: DashboardStatItem;
}

export interface ChartDataItem {
  dateStr: string;
  label: string;
  present: number;
  late: number;
  absent: number;
  onLeave: number;
}

export interface SummaryData {
  present: number;
  late: number;
  onLeave: number;
  absent: number;
  counts: {
    present: number;
    late: number;
    onLeave: number;
    absent: number;
    total: number;
  };
}

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    stats: null as DashboardStats | null,
    chartData: [] as ChartDataItem[],
    summary: null as SummaryData | null,
    recentAttendance: [] as any[],
    todayStatus: null as any,
    loading: false,
    error: ''
  }),
  actions: {
    async fetchStats(params?: { department?: string; startDate?: string; endDate?: string }): Promise<void> {
      this.loading = true;
      this.error = '';
      try {
        const res = await api.get('/dashboard/stats', { params });
        this.stats = res.data.stats;
        this.chartData = res.data.chartData;
        this.summary = res.data.summary;
        this.recentAttendance = res.data.recentAttendance;
        this.todayStatus = res.data.todayStatus;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to fetch dashboard statistics';
      } finally {
        this.loading = false;
      }
    }
  }
});
