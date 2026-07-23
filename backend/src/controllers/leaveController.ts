import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import Leave from '../models/Leave.js';
import Attendance from '../models/Attendance.js';

// Helper to get array of dates between two dates (inclusive)
const getDatesBetween = (startStr: string, endStr: string): string[] => {
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

export const applyLeave = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'User context not found' });
      return;
    }

    const { type, startDate, endDate, reason } = req.body;

    if (!type || !startDate || !endDate || !reason) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    // Calculate days
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    if (end < start) {
      res.status(400).json({ message: 'End date cannot be before start date' });
      return;
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const leave = new Leave({
      employee: userId,
      type,
      startDate,
      endDate,
      days,
      reason,
      status: 'pending'
    });

    await leave.save();
    const populated = await leave.populate('employee', 'name employeeId department designation avatar');

    res.status(201).json({
      message: 'Leave applied successfully',
      leave: populated
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error applying for leave', error: error.message });
  }
};

export const getLeaves = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const filter: any = {};

    // Employees can only view their own leave requests
    if (req.user?.role === 'employee') {
      filter.employee = req.user.id;
    }

    const leaves = await Leave.find(filter)
      .populate('employee', 'name employeeId department designation avatar')
      .sort({ createdAt: -1 });

    res.status(200).json(leaves);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching leave requests', error: error.message });
  }
};

export const approveOrRejectLeave = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({ message: 'Invalid status. Must be approved or rejected.' });
      return;
    }

    const leave = await Leave.findById(id);
    if (!leave) {
      res.status(404).json({ message: 'Leave request not found' });
      return;
    }

    if (leave.status !== 'pending') {
      res.status(400).json({ message: `Leave request has already been ${leave.status}` });
      return;
    }

    leave.status = status;
    await leave.save();

    // If approved, create Attendance logs as 'on_leave' for those days
    if (status === 'approved') {
      const dates = getDatesBetween(leave.startDate, leave.endDate);
      const attendancePromises = dates.map(async (dateStr) => {
        // Upsert attendance record for employee on this date
        return Attendance.findOneAndUpdate(
          { employee: leave.employee, date: dateStr },
          {
            employee: leave.employee,
            date: dateStr,
            checkIn: new Date(`${dateStr}T09:00:00`), // standard check in time
            checkOut: new Date(`${dateStr}T17:00:00`), // standard check out time
            status: 'on_leave',
            notes: `Approved leave: ${leave.type}`
          },
          { upsert: true, new: true }
        );
      });

      await Promise.all(attendancePromises);
    }

    const populated = await leave.populate('employee', 'name employeeId department designation avatar');

    res.status(200).json({
      message: `Leave request ${status} successfully`,
      leave: populated
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error processing leave request', error: error.message });
  }
};
