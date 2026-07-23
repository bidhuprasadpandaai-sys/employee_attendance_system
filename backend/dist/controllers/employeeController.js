import Employee from '../models/Employee.js';
export const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find().select('-password').sort({ employeeId: 1 });
        res.status(200).json(employees);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching employees', error: error.message });
    }
};
export const createEmployee = async (req, res) => {
    try {
        const { employeeId, name, email, password, role, department, designation, status } = req.body;
        if (!employeeId || !name || !email || !role || !department || !designation) {
            res.status(400).json({ message: 'Required fields are missing' });
            return;
        }
        const existingId = await Employee.findOne({ employeeId });
        if (existingId) {
            res.status(400).json({ message: `Employee ID ${employeeId} is already taken` });
            return;
        }
        const existingEmail = await Employee.findOne({ email });
        if (existingEmail) {
            res.status(400).json({ message: `Email ${email} is already in use` });
            return;
        }
        const defaultPassword = password || 'password123';
        const newEmployee = new Employee({
            employeeId,
            name,
            email,
            password: defaultPassword,
            role,
            department,
            designation,
            status: status || 'active'
        });
        await newEmployee.save();
        // Remove password from returned document
        const employeeResponse = newEmployee.toObject();
        delete employeeResponse.password;
        res.status(201).json({
            message: 'Employee created successfully',
            employee: employeeResponse
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating employee', error: error.message });
    }
};
export const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, department, designation, status, password } = req.body;
        const employee = await Employee.findById(id);
        if (!employee) {
            res.status(404).json({ message: 'Employee not found' });
            return;
        }
        // Check email uniqueness if email is changing
        if (email && email !== employee.email) {
            const existingEmail = await Employee.findOne({ email });
            if (existingEmail) {
                res.status(400).json({ message: `Email ${email} is already in use` });
                return;
            }
            employee.email = email;
        }
        if (name)
            employee.name = name;
        if (role)
            employee.role = role;
        if (department)
            employee.department = department;
        if (designation)
            employee.designation = designation;
        if (status)
            employee.status = status;
        if (password) {
            employee.password = password; // pre-save hook will hash this
        }
        await employee.save();
        const employeeResponse = employee.toObject();
        delete employeeResponse.password;
        res.status(200).json({
            message: 'Employee updated successfully',
            employee: employeeResponse
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating employee', error: error.message });
    }
};
export const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findByIdAndDelete(id);
        if (!employee) {
            res.status(404).json({ message: 'Employee not found' });
            return;
        }
        res.status(200).json({ message: 'Employee deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting employee', error: error.message });
    }
};
