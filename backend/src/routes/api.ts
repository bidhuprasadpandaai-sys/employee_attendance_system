import { Router } from 'express';
import { login, getProfile } from '../controllers/authController.js';
import { 
  getAllEmployees, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee 
} from '../controllers/employeeController.js';
import { 
  checkIn, 
  checkOut, 
  getAttendanceLogs, 
  getTodayUserStatus, 
  upsertManualRecord 
} from '../controllers/attendanceController.js';
import { 
  applyLeave, 
  getLeaves, 
  approveOrRejectLeave 
} from '../controllers/leaveController.js';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware.js';
import Holiday from '../models/Holiday.js';

const router = Router();

// Public routes
router.post('/auth/login', login);

// Protected routes (Requires authentication)
router.use(authenticate);

// Profile
router.get('/auth/profile', getProfile);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Attendance
router.post('/attendance/checkin', checkIn);
router.post('/attendance/checkout', checkOut);
router.get('/attendance/logs', getAttendanceLogs);
router.get('/attendance/today-status', getTodayUserStatus);

// Leave management
router.get('/leaves', getLeaves);
router.post('/leaves', applyLeave);

// Holidays (shared/view-only for employees)
router.get('/holidays', async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.status(200).json(holidays);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching holidays', error: error.message });
  }
});

// Admin-only routes
router.post('/attendance/manual', authorizeAdmin, upsertManualRecord);
router.get('/employees', getAllEmployees); // Employees listing is fine for users or admins depending on requirements, but let's let all auth users read if needed, or restrict to admin. Let's let admins CRUD. We can keep get employees readable for dashboard dropdowns.
router.post('/employees', authorizeAdmin, createEmployee);
router.put('/employees/:id', authorizeAdmin, updateEmployee);
router.delete('/employees/:id', authorizeAdmin, deleteEmployee);
router.put('/leaves/:id/status', authorizeAdmin, approveOrRejectLeave);

router.post('/holidays', authorizeAdmin, async (req, res) => {
  try {
    const { name, date, type } = req.body;
    if (!name || !date) {
       res.status(400).json({ message: 'Name and date are required' });
       return;
    }
    const holiday = new Holiday({ name, date, type: type || 'national' });
    await holiday.save();
    res.status(201).json(holiday);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating holiday', error: error.message });
  }
});

router.delete('/holidays/:id', authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await Holiday.findByIdAndDelete(id);
    res.status(200).json({ message: 'Holiday deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting holiday', error: error.message });
  }
});

export default router;
