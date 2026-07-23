import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
// Helper to get local date string (YYYY-MM-DD)
const getLocalDateString = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
export const checkIn = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'User context not found' });
            return;
        }
        const now = new Date();
        const dateStr = getLocalDateString(now);
        // Check if record exists
        const existing = await Attendance.findOne({ employee: userId, date: dateStr });
        if (existing) {
            res.status(400).json({ message: 'You have already checked in today.' });
            return;
        }
        // Determine late status (Late if check-in is after 9:00 AM)
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const status = (hours > 9 || (hours === 9 && minutes > 0)) ? 'late' : 'present';
        const record = new Attendance({
            employee: userId,
            date: dateStr,
            checkIn: now,
            status
        });
        await record.save();
        const populated = await record.populate('employee', 'name employeeId department designation avatar');
        res.status(201).json({
            message: 'Checked in successfully',
            record: populated
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error checking in', error: error.message });
    }
};
export const checkOut = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'User context not found' });
            return;
        }
        const now = new Date();
        const dateStr = getLocalDateString(now);
        const record = await Attendance.findOne({ employee: userId, date: dateStr });
        if (!record) {
            res.status(400).json({ message: 'No check-in record found for today. Please check in first.' });
            return;
        }
        if (record.checkOut) {
            res.status(400).json({ message: 'You have already checked out today.' });
            return;
        }
        record.checkOut = now;
        await record.save();
        const populated = await record.populate('employee', 'name employeeId department designation avatar');
        res.status(200).json({
            message: 'Checked out successfully',
            record: populated
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error checking out', error: error.message });
    }
};
export const getAttendanceLogs = async (req, res) => {
    try {
        const { employeeId, department, status, startDate, endDate } = req.query;
        const filter = {};
        // Filter by employee ID (requires looking up Employee IDs first)
        if (employeeId) {
            const targetEmps = await Employee.find({
                employeeId: { $regex: employeeId, $options: 'i' }
            }).select('_id');
            filter.employee = { $in: targetEmps.map(e => e._id) };
        }
        // Filter by department (requires looking up employees in that department)
        if (department) {
            const targetEmps = await Employee.find({ department: department }).select('_id');
            if (filter.employee) {
                // Intersect
                const existingIds = filter.employee.$in.map(id => id.toString());
                const deptIds = targetEmps.map(e => e._id.toString());
                const intersection = existingIds.filter(id => deptIds.includes(id));
                filter.employee = { $in: intersection };
            }
            else {
                filter.employee = { $in: targetEmps.map(e => e._id) };
            }
        }
        if (status) {
            filter.status = status;
        }
        if (startDate || endDate) {
            filter.date = {};
            if (startDate)
                filter.date.$gte = startDate;
            if (endDate)
                filter.date.$lte = endDate;
        }
        // If logged in user is employee, restrict them to viewing only their own logs
        if (req.user?.role === 'employee') {
            filter.employee = req.user.id;
        }
        const logs = await Attendance.find(filter)
            .populate('employee', 'name employeeId department designation avatar')
            .sort({ date: -1, checkIn: -1 });
        res.status(200).json(logs);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching attendance logs', error: error.message });
    }
};
export const getTodayUserStatus = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'User context not found' });
            return;
        }
        const dateStr = getLocalDateString(new Date());
        const record = await Attendance.findOne({ employee: userId, date: dateStr });
        res.status(200).json({
            checkedIn: !!record,
            checkedOut: !!record?.checkOut,
            record
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching user today status', error: error.message });
    }
};
export const upsertManualRecord = async (req, res) => {
    try {
        const { employeeDbId, date, checkInTime, checkOutTime, status, notes } = req.body;
        if (!employeeDbId || !date || !status) {
            res.status(400).json({ message: 'Employee DB ID, date, and status are required' });
            return;
        }
        // Parse checkIn and checkOut as Dates
        const checkIn = checkInTime ? new Date(`${date}T${checkInTime}`) : new Date(`${date}T09:00:00`);
        const checkOut = checkOutTime ? new Date(`${date}T${checkOutTime}`) : undefined;
        const updateData = {
            employee: employeeDbId,
            date,
            checkIn,
            status,
            notes
        };
        if (checkOut) {
            updateData.checkOut = checkOut;
        }
        else {
            updateData.$unset = { checkOut: 1 };
        }
        const record = await Attendance.findOneAndUpdate({ employee: employeeDbId, date }, updateData, { new: true, upsert: true, runValidators: true });
        const populated = await record.populate('employee', 'name employeeId department designation avatar');
        res.status(200).json({
            message: 'Attendance record saved successfully',
            record: populated
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error saving attendance record', error: error.message });
    }
};
