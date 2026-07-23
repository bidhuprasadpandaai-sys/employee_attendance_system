import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  employee: mongoose.Types.ObjectId;
  date: string; // "YYYY-MM-DD"
  checkIn: Date;
  checkOut?: Date;
  status: 'present' | 'absent' | 'late' | 'on_leave';
  notes?: string;
}

const AttendanceSchema: Schema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  date: { type: String, required: true, index: true }, // Format: "YYYY-MM-DD"
  checkIn: { type: Date, required: true },
  checkOut: { type: Date },
  status: { 
    type: String, 
    required: true, 
    enum: ['present', 'absent', 'late', 'on_leave'], 
    default: 'present' 
  },
  notes: { type: String }
}, {
  timestamps: true
});

// Ensure a user can only have one attendance log per day
AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);
