import Employee from '../models/Employee.js';
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }
        const employee = await Employee.findOne({ email });
        if (!employee) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        if (employee.status !== 'active') {
            res.status(403).json({ message: 'Account is deactivated' });
            return;
        }
        const isMatch = await employee.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        // Generate a simple token: base64 of "id:role"
        const token = Buffer.from(`${employee._id}:${employee.role}`).toString('base64');
        // Remove password from response
        const user = {
            _id: employee._id,
            employeeId: employee.employeeId,
            name: employee.name,
            email: employee.email,
            role: employee.role,
            department: employee.department,
            designation: employee.designation,
            avatar: employee.avatar,
            joinDate: employee.joinDate
        };
        res.status(200).json({
            message: 'Login successful',
            token,
            user
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
export const getProfile = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = Buffer.from(token, 'base64').toString('ascii');
        const [userId] = decoded.split(':');
        const employee = await Employee.findById(userId).select('-password');
        if (!employee) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({ user: employee });
    }
    catch (error) {
        res.status(401).json({ message: 'Unauthorized', error: error.message });
    }
};
