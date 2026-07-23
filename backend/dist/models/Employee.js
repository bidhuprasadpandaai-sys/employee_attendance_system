import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
const EmployeeSchema = new Schema({
    employeeId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['admin', 'employee'], default: 'employee' },
    department: {
        type: String,
        required: true,
        enum: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance']
    },
    designation: { type: String, required: true },
    avatar: { type: String },
    joinDate: { type: Date, required: true, default: Date.now },
    status: { type: String, required: true, enum: ['active', 'inactive'], default: 'active' }
}, {
    timestamps: true
});
// Pre-save hook to hash password
EmployeeSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password || '', salt);
        next();
    }
    catch (err) {
        next(err);
    }
});
// Password compare method
EmployeeSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password || '');
};
export default mongoose.model('Employee', EmployeeSchema);
