import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Holiday from '../models/Holiday.js';

// Get local YYYY-MM-DD string
const getLocalDateString = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const firstNames = [
  'Rohit', 'Priya', 'Amit', 'Sneha', 'Karan', 'Rahul', 'Neha', 'Vikram', 'Anjali', 'Sanjay', 
  'Pooja', 'Deepak', 'Ritu', 'Manish', 'Aarti', 'Rajesh', 'Sunita', 'Anil', 'Geeta', 'Suresh',
  'Aditya', 'Meera', 'Rohan', 'Kavita', 'Arjun', 'Divya', 'Vijay', 'Shalini', 'Ravi', 'Preeti'
];

const lastNames = [
  'Sharma', 'Mehta', 'Verma', 'Iyer', 'Singh', 'Patel', 'Joshi', 'Reddy', 'Rao', 'Nair', 
  'Gupta', 'Sen', 'Das', 'Roy', 'Bose', 'Kumar', 'Mishra', 'Pandey', 'Choudhury', 'Bhatt',
  'Saxena', 'Kapoor', 'Malhotra', 'Jha', 'Trivedi', 'Deshmukh', 'Kulkarni', 'Pillai', 'Som', 'Dutta'
];

const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'] as const;

const designations = {
  Engineering: ['Software Engineer', 'Senior Engineer', 'Tech Lead', 'QA Engineer', 'DevOps Specialist'],
  Marketing: ['Marketing Executive', 'Digital Marketer', 'SEO Specialist', 'Marketing Manager'],
  Sales: ['Sales Representative', 'Sales Executive', 'Account Manager', 'Sales Manager'],
  HR: ['HR Associate', 'Recruiter', 'HR Generalist', 'HR Manager'],
  Finance: ['Financial Analyst', 'Accountant', 'Finance Executive', 'Finance Manager']
};

const holidays = [
  { name: "New Year's Day", date: '2026-01-01', type: 'national' as const },
  { name: "Republic Day", date: '2026-01-26', type: 'national' as const },
  { name: "Holi Festival", date: '2026-03-10', type: 'restricted' as const },
  { name: "Good Friday", date: '2026-04-03', type: 'national' as const },
  { name: "Labour Day", date: '2026-05-01', type: 'national' as const },
  { name: "Independence Day", date: '2026-08-15', type: 'national' as const },
  { name: "Gandhi Jayanti", date: '2026-10-02', type: 'national' as const },
  { name: "Diwali Festival", date: '2026-11-08', type: 'national' as const },
  { name: "Christmas Day", date: '2026-12-25', type: 'national' as const }
];

const runSeeder = async () => {
  try {
    await connectDB();

    console.log('Clearing old collections...');
    await Employee.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    await Holiday.deleteMany({});
    console.log('Collections cleared.');

    // 1. Seed Holidays
    await Holiday.insertMany(holidays);
    console.log('Holidays seeded.');

    // 2. Create 256 Employees
    console.log('Creating 256 employees...');
    const employeesData = [];

    // Create 1 Admin
    employeesData.push({
      employeeId: 'EMP000',
      name: 'Admin User',
      email: 'admin@attendance.com',
      password: 'admin123', // Will be hashed by pre-save hook
      role: 'admin' as const,
      department: 'HR' as const,
      designation: 'Administrator',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
      joinDate: new Date('2024-01-01'),
      status: 'active' as const
    });

    const activeEmpList = [];

    // Generate names and ensure we avoid duplicate emails/IDs
    const usedNames = new Set<string>();

    for (let i = 1; i <= 255; i++) {
      const formattedId = `EMP${String(i).padStart(3, '0')}`;
      
      // Select name
      let fullName = '';
      do {
        const first = firstNames[Math.floor(Math.random() * firstNames.length)];
        const last = lastNames[Math.floor(Math.random() * lastNames.length)];
        fullName = `${first} ${last}`;
      } while (usedNames.has(fullName));
      usedNames.add(fullName);

      const email = `${fullName.toLowerCase().replace(/\s+/g, '.')}@attendance.com`;
      const dept = departments[Math.floor(Math.random() * departments.length)];
      const deptDesignations = designations[dept];
      const designation = deptDesignations[Math.floor(Math.random() * deptDesignations.length)];
      
      // Random avatar using UI faces placeholders
      const gender = Math.random() > 0.5 ? 'men' : 'women';
      const faceIndex = Math.floor(Math.random() * 99) + 1;
      const avatar = `https://randomuser.me/api/portraits/${gender}/${faceIndex}.jpg`;

      // Random join date within last 2 years
      const joinDate = new Date();
      joinDate.setMonth(joinDate.getMonth() - Math.floor(Math.random() * 24));

      employeesData.push({
        employeeId: formattedId,
        name: fullName,
        email,
        password: 'password123', // Default password
        role: 'employee' as const,
        department: dept,
        designation,
        avatar,
        joinDate,
        status: 'active' as const
      });
    }

    // Save employees
    const savedEmployees = [];
    for (const empData of employeesData) {
      const emp = new Employee(empData);
      const saved = await emp.save();
      savedEmployees.push(saved);
    }
    console.log(`Successfully seeded ${savedEmployees.length} employees (1 Admin + 255 Employees).`);

    // 3. Seed historical attendance logs (last 30 days)
    console.log('Generating 30 days of attendance logs. This may take a few seconds...');
    const attendanceLogs = [];
    const leavesList = [];

    const today = new Date();
    const dateRange = [];
    for (let d = 30; d >= 0; d--) {
      const day = new Date();
      day.setDate(today.getDate() - d);
      // Skip weekends for full logs, but let's seed anyway or skip
      const dayOfWeek = day.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip Sat/Sun
        dateRange.push(day);
      }
    }

    const holidaysDates = holidays.map(h => h.date);

    for (const day of dateRange) {
      const dateStr = getLocalDateString(day);
      
      // Check if it's a holiday
      if (holidaysDates.includes(dateStr)) {
        continue;
      }

      for (const emp of savedEmployees) {
        if (emp.role === 'admin') continue; // Admin attendance is optional

        const rand = Math.random();

        // 80% Present, 10% Late, 5% Leave, 5% Absent
        if (rand < 0.80) {
          // Present (8:15 AM - 8:59 AM check in)
          const checkIn = new Date(day);
          checkIn.setHours(8, Math.floor(Math.random() * 45) + 15, 0); // 8:15 to 8:59

          const checkOut = new Date(day);
          checkOut.setHours(17, Math.floor(Math.random() * 45) + 15, 0); // 17:15 to 17:59

          attendanceLogs.push({
            employee: emp._id,
            date: dateStr,
            checkIn,
            checkOut,
            status: 'present' as const
          });
        } 
        else if (rand < 0.90) {
          // Late (9:01 AM - 9:45 AM check in)
          const checkIn = new Date(day);
          checkIn.setHours(9, Math.floor(Math.random() * 45) + 1, 0); // 9:01 to 9:45

          const checkOut = new Date(day);
          checkOut.setHours(17, Math.floor(Math.random() * 45) + 15, 0);

          attendanceLogs.push({
            employee: emp._id,
            date: dateStr,
            checkIn,
            checkOut,
            status: 'late' as const
          });
        } 
        else if (rand < 0.95) {
          // Leave
          const leaveTypes = ['casual', 'sick', 'annual'] as const;
          const type = leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
          
          // Seed Attendance
          attendanceLogs.push({
            employee: emp._id,
            date: dateStr,
            checkIn: new Date(`${dateStr}T09:00:00`),
            checkOut: new Date(`${dateStr}T17:00:00`),
            status: 'on_leave' as const,
            notes: `Leave: ${type}`
          });

          // Create a matching approved Leave request
          leavesList.push({
            employee: emp._id,
            type,
            startDate: dateStr,
            endDate: dateStr,
            days: 1,
            reason: `Feeling unwell or personal work for ${type} leave.`,
            status: 'approved' as const,
            appliedDate: new Date(day)
          });
        } 
        else {
          // Absent
          attendanceLogs.push({
            employee: emp._id,
            date: dateStr,
            checkIn: new Date(`${dateStr}T09:00:00`),
            status: 'absent' as const,
            notes: 'Unexcused absence'
          });
        }
      }
    }

    console.log(`Inserting ${attendanceLogs.length} attendance records into DB...`);
    await Attendance.insertMany(attendanceLogs);
    console.log('Attendance records inserted.');

    console.log(`Inserting ${leavesList.length} leave logs...`);
    await Leave.insertMany(leavesList);

    // Also seed a few PENDING leave requests for review
    const pendingLeaves = [];
    const pendingEmps = savedEmployees.slice(1, 6); // Take some employees
    for (const emp of pendingEmps) {
      if (emp.role === 'admin') continue;
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + Math.floor(Math.random() * 5) + 2);
      const nextWeekEnd = new Date(nextWeek);
      nextWeekEnd.setDate(nextWeek.getDate() + 2);

      pendingLeaves.push({
        employee: emp._id,
        type: 'casual' as const,
        startDate: getLocalDateString(nextWeek),
        endDate: getLocalDateString(nextWeekEnd),
        days: 3,
        reason: 'Applying for family event next week.',
        status: 'pending' as const,
        appliedDate: new Date()
      });
    }
    await Leave.insertMany(pendingLeaves);
    console.log('Pending leave requests seeded.');

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

runSeeder();
