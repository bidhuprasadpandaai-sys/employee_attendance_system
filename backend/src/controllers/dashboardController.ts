import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';

const getLocalDateString = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get dates range array
const getDatesRange = (startStr: string, endStr: string): string[] => {
  const dates: string[] = [];
  const start = new Date(`${startStr}T00:00:00`);
  const end = new Date(`${endStr}T00:00:00`);
  const current = new Date(start);
  while (current <= end) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { department, startDate, endDate } = req.query;

    const today = new Date();
    const todayStr = getLocalDateString(today);
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    // Build employee filters
    const empFilter: any = { status: 'active' };
    if (department) {
      empFilter.department = department as string;
    }

    const activeEmployees = await Employee.find(empFilter).select('_id');
    const totalEmployeesCount = activeEmployees.length;
    const activeEmpIds = activeEmployees.map(e => e._id);

    // Fetch Attendance records for today & yesterday
    const todayLogs = await Attendance.find({
      date: todayStr,
      employee: { $in: activeEmpIds }
    });

    const yesterdayLogs = await Attendance.find({
      date: yesterdayStr,
      employee: { $in: activeEmpIds }
    });

    // Helper to calculate status aggregates for a list of logs
    const calculateCounts = (logs: any[], totalCount: number) => {
      let present = 0;
      let late = 0;
      let leave = 0;
      
      logs.forEach(log => {
        if (log.status === 'present') present++;
        else if (log.status === 'late') late++;
        else if (log.status === 'on_leave') leave++;
      });
      
      const absent = totalCount - (present + late + leave);
      
      return {
        present: present + late, // total present includes late arrivals
        late,
        leave,
        absent: absent >= 0 ? absent : 0
      };
    };

    const todayStats = calculateCounts(todayLogs, totalEmployeesCount);
    const yesterdayStats = calculateCounts(yesterdayLogs, totalEmployeesCount);

    // Calculate percentage change / trend text
    const getTrendString = (current: number, previous: number) => {
      if (previous === 0) return { text: '-- No change', type: 'neutral' };
      const diff = current - previous;
      if (diff === 0) return { text: '-- No change', type: 'neutral' };
      const percent = ((Math.abs(diff) / previous) * 100).toFixed(1);
      return {
        text: `${diff > 0 ? '↑' : '↓'} ${Math.abs(diff)} (${percent}%)`,
        type: diff > 0 ? 'up' : 'down'
      };
    };

    const stats = {
      totalEmployees: {
        value: totalEmployeesCount,
        trend: { text: '-- No change', type: 'neutral' }
      },
      present: {
        value: todayStats.present,
        trend: getTrendString(todayStats.present, yesterdayStats.present)
      },
      absent: {
        value: todayStats.absent,
        trend: getTrendString(todayStats.absent, yesterdayStats.absent)
      },
      late: {
        value: todayStats.late,
        trend: getTrendString(todayStats.late, yesterdayStats.late)
      },
      onLeave: {
        value: todayStats.leave,
        trend: getTrendString(todayStats.leave, yesterdayStats.leave)
      }
    };

    // Graph range definition
    let startRangeStr = (startDate as string) || '';
    let endRangeStr = (endDate as string) || '';

    if (!startRangeStr || !endRangeStr) {
      // Default to last 30 days
      const endD = new Date();
      const startD = new Date();
      startD.setDate(startD.getDate() - 30);
      startRangeStr = getLocalDateString(startD);
      endRangeStr = getLocalDateString(endD);
    }

    const rangeDates = getDatesRange(startRangeStr, endRangeStr);

    // Fetch all logs in the range
    const rangeLogs = await Attendance.find({
      date: { $gte: startRangeStr, $lte: endRangeStr },
      employee: { $in: activeEmpIds }
    });

    // Group logs by date
    const logsByDate: { [key: string]: any[] } = {};
    rangeLogs.forEach(log => {
      if (!logsByDate[log.date]) {
        logsByDate[log.date] = [];
      }
      logsByDate[log.date].push(log);
    });

    // Populate chart array
    const chartData = rangeDates.map(dateStr => {
      const logsForDate = logsByDate[dateStr] || [];
      const counts = calculateCounts(logsForDate, totalEmployeesCount);
      // Format date label (e.g. "May 15")
      const d = new Date(`${dateStr}T00:00:00`);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        dateStr,
        label,
        present: counts.present - counts.late, // Pure present (not late)
        late: counts.late,
        absent: counts.absent,
        onLeave: counts.leave
      };
    });

    // Summary calculation (donut chart)
    let totalPresent = 0;
    let totalLate = 0;
    let totalLeave = 0;
    let totalAbsent = 0;

    chartData.forEach(item => {
      totalPresent += item.present;
      totalLate += item.late;
      totalLeave += item.onLeave;
      totalAbsent += item.absent;
    });

    const grandTotal = totalPresent + totalLate + totalLeave + totalAbsent;
    const summaryPercentages = grandTotal > 0 ? {
      present: parseFloat(((totalPresent / grandTotal) * 100).toFixed(2)),
      late: parseFloat(((totalLate / grandTotal) * 100).toFixed(2)),
      onLeave: parseFloat(((totalLeave / grandTotal) * 100).toFixed(2)),
      absent: parseFloat(((totalAbsent / grandTotal) * 100).toFixed(2)),
      counts: {
        present: totalPresent,
        late: totalLate,
        onLeave: totalLeave,
        absent: totalAbsent,
        total: grandTotal
      }
    } : {
      present: 0,
      late: 0,
      onLeave: 0,
      absent: 0,
      counts: { present: 0, late: 0, onLeave: 0, absent: 0, total: 0 }
    };

    // Get 5 recent attendance logs
    const recentLogs = await Attendance.find({
      employee: { $in: activeEmpIds }
    })
      .populate('employee', 'name employeeId department designation avatar')
      .sort({ date: -1, checkIn: -1 })
      .limit(5);

    res.status(200).json({
      stats,
      chartData,
      summary: summaryPercentages,
      recentAttendance: recentLogs,
      todayStatus: todayStats
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error compiling dashboard statistics', error: error.message });
  }
};
